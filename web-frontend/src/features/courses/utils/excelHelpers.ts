import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { type CourseForm } from '@/foundation/types'
import { type Course as ApiCourse, type CourseVisibility } from '@/features/courses/api'

const VISIBILITY_LABELS: Record<CourseVisibility, string> = {
	draft: 'Bản nháp',
	published: 'Đã xuất bản',
	archived: 'Đã lưu trữ',
	suspended: 'Tạm dừng'
}

const parseVisibility = (value: string): CourseVisibility => {
	const normalized = (value || '').toString().trim().toLowerCase()
	const mapping: Record<string, CourseVisibility> = {
		'bản nháp': 'draft',
		'draft': 'draft',
		'đã xuất bản': 'published',
		'published': 'published',
		'đã lưu trữ': 'archived',
		'archived': 'archived',
		'tạm dừng': 'suspended',
		'suspended': 'suspended'
	}
	return mapping[normalized] ?? 'draft'
}

export const exportCoursesToExcel = (courses: ApiCourse[], filename = 'courses.xlsx') => {
	const exportData = courses.map(course => ({
		ID: course.id,
		'Tên khóa học': course.title,
		'Mô tả': course.description,
		'Organization ID': (course as any).organizationId || '',
		'Slug': course.slug,
		'Ảnh đại diện': course.thumbnailUrl || '',
		'Trạng thái': VISIBILITY_LABELS[course.visibility] ?? course.visibility,
		'Ngày tạo': course.createdAt ? new Date(course.createdAt).toLocaleString('vi-VN') : '',
		'Ngày cập nhật': course.updatedAt ? new Date(course.updatedAt).toLocaleString('vi-VN') : ''
	}))

	const workbook = XLSX.utils.book_new()
	const worksheet = XLSX.utils.json_to_sheet(exportData)
	worksheet['!cols'] = [
		{ wch: 36 },
		{ wch: 40 },
		{ wch: 60 },
		{ wch: 18 },
		{ wch: 30 },
		{ wch: 40 },
		{ wch: 20 },
		{ wch: 22 },
		{ wch: 22 }
	]

	XLSX.utils.book_append_sheet(workbook, worksheet, 'Khóa học')

	const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	saveAs(blob, filename)
}

export const importCoursesFromExcel = (file: File): Promise<CourseForm[]> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (event) => {
			try {
				const data = new Uint8Array(event.target?.result as ArrayBuffer)
				const workbook = XLSX.read(data, { type: 'array' })
				const sheetName = workbook.SheetNames[0]
				const worksheet = workbook.Sheets[sheetName]
				const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)

				const courses = jsonData.map((row, index): CourseForm => {
					const title = String(row['Tên khóa học'] || '').trim()
					const description = String(row['Mô tả'] || '').trim()
					const organizationId = String(row['Organization ID'] || '').trim()
					if (!title || !description || !organizationId) {
						throw new Error(`Dòng ${index + 2}: Thiếu thông tin bắt buộc (Tên khóa học, Mô tả, Organization ID)`)
					}

					return {
						id: typeof row['ID'] === 'string' ? row['ID'] : undefined,
						title,
						description,
						organizationId,
						thumbnailUrl: String(row['Ảnh đại diện'] || '').trim(),
						visibility: parseVisibility(String(row['Trạng thái'] || ''))
					}
				})

				resolve(courses)
			} catch (error) {
				reject(error)
			}
		}

		reader.onerror = () => reject(new Error('Lỗi đọc file Excel'))

		reader.readAsArrayBuffer(file)
	})
}

export const generateExcelTemplate = () => {
	const templateData = [{
		ID: '2f2a4c8b-7e2a-4d2d-a83c-1e6bdfa1ab21',
		'Tên khóa học': 'Nhập môn Spring Boot',
		'Mô tả': 'Khóa học giúp bạn làm quen với Spring Boot và cách xây dựng REST API cơ bản.',
		'Organization ID': 'org_001',
		'Slug': 'nhap-mon-spring-boot',
		'Ảnh đại diện': 'https://example.com/spring-boot.png',
		'Trạng thái': 'Bản nháp',
		'Ngày tạo': new Date().toLocaleString('vi-VN'),
		'Ngày cập nhật': new Date().toLocaleString('vi-VN')
	}]

	const workbook = XLSX.utils.book_new()
	const worksheet = XLSX.utils.json_to_sheet(templateData)
	worksheet['!cols'] = [
		{ wch: 36 },
		{ wch: 40 },
		{ wch: 60 },
		{ wch: 18 },
		{ wch: 30 },
		{ wch: 40 },
		{ wch: 20 },
		{ wch: 22 },
		{ wch: 22 }
	]

	XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')

	const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	saveAs(blob, 'course-template.xlsx')
}
