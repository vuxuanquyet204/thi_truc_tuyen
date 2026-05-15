import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
	CertificateTemplate,
	IssuedCertificate,
	CertificateForm
} from '@/foundation/types'

// Export Templates to Excel
export function exportCertificatesToExcel(
	data: CertificateTemplate[] | IssuedCertificate[], 
	filename: string, 
	type: 'templates' | 'certificates'
): void {
	const workbook = XLSX.utils.book_new()

	if (type === 'templates') {
		const templates = data as CertificateTemplate[]
		
		// Templates sheet
		const templatesData = templates.map(template => ({
			'Tên chứng chỉ': template.name,
			'Mô tả': template.description,
			'Danh mục': template.category,
			'Cấp độ': template.level,
			'Thời hạn (tháng)': template.validityPeriod,
			'Người cấp': template.issuer,
			'Logo URL': template.issuerLogo,
			'Trạng thái': template.isActive ? 'Hoạt động' : 'Tạm dừng',
			'Số yêu cầu': template.requirements.length,
			'Layout': template.templateDesign.layout,
			'Màu chính': template.templateDesign.colors.primary,
			'Màu phụ': template.templateDesign.colors.secondary,
			'Màu nhấn': template.templateDesign.colors.accent,
			'Chiều rộng': template.templateDesign.dimensions.width,
			'Chiều cao': template.templateDesign.dimensions.height,
			'Đơn vị': template.templateDesign.dimensions.unit,
			'Tags': template.metadata.tags.join(', '),
			'Từ khóa': template.metadata.keywords.join(', '),
			'Ngành nghề': template.metadata.industry.join(', '),
			'Điều kiện tiên quyết': template.metadata.prerequisites.join(', '),
			'Lợi ích': template.metadata.benefits.join(', '),
			'Sự công nhận': template.metadata.recognition.join(', '),
			'Tuân thủ': template.metadata.compliance.join(', '),
			'Ngày tạo': new Date(template.createdAt).toLocaleDateString('vi-VN'),
			'Ngày cập nhật': new Date(template.updatedAt).toLocaleDateString('vi-VN')
		}))

		const templatesSheet = XLSX.utils.json_to_sheet(templatesData)
		XLSX.utils.book_append_sheet(workbook, templatesSheet, 'Mẫu chứng chỉ')

		// Requirements sheet
		const requirementsData: any[] = []
		templates.forEach(template => {
			template.requirements.forEach(req => {
				requirementsData.push({
					'Tên chứng chỉ': template.name,
					'Loại yêu cầu': req.type,
					'Mô tả': req.description,
					'Giá trị': req.value,
					'Đơn vị': req.unit,
					'Bắt buộc': req.isMandatory ? 'Có' : 'Không'
				})
			})
		})

		if (requirementsData.length > 0) {
			const requirementsSheet = XLSX.utils.json_to_sheet(requirementsData)
			XLSX.utils.book_append_sheet(workbook, requirementsSheet, 'Yêu cầu')
		}

	} else {
		const certificates = data as IssuedCertificate[]
		
		// Certificates sheet
		const certificatesData = certificates.map(certificate => ({
			'Mã chứng chỉ': certificate.id,
			'Tên chứng chỉ': certificate.certificateName,
			'Người nhận': certificate.recipientName,
			'Email': certificate.recipientEmail,
			'Tổ chức': certificate.organizationName,
			'Khóa học': certificate.courseName || 'Không có',
			'Ngày cấp': new Date(certificate.issuedAt).toLocaleDateString('vi-VN'),
			'Hết hạn': new Date(certificate.expiresAt).toLocaleDateString('vi-VN'),
			'Trạng thái': certificate.status,
			'Mã xác minh': certificate.verificationCode,
			'Blockchain Hash': certificate.blockchainHash || 'Không có',
			'Điểm số': certificate.metadata.score || 0,
			'Xếp loại': certificate.metadata.grade || 'N/A',
			'Ngày hoàn thành': new Date(certificate.metadata.completionDate).toLocaleDateString('vi-VN'),
			'Người cấp': certificate.metadata.issuedBy,
			'Chức vụ': certificate.metadata.issuedByTitle,
			'URL xác minh': certificate.metadata.verificationUrl,
			'URL tải xuống': certificate.downloadUrl || 'Không có',
			'URL xem': certificate.viewUrl || 'Không có'
		}))

		const certificatesSheet = XLSX.utils.json_to_sheet(certificatesData)
		XLSX.utils.book_append_sheet(workbook, certificatesSheet, 'Chứng chỉ đã cấp')
	}

	// Save file
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	saveAs(blob, filename)
}

// Import from Excel
export async function importCertificatesFromExcel(
	file: File, 
	type: 'templates' | 'certificates'
): Promise<CertificateForm[] | Partial<IssuedCertificate>[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		
		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer)
				const workbook = XLSX.read(data, { type: 'array' })
				
				if (type === 'templates') {
					const templatesData = importTemplatesFromWorkbook(workbook)
					resolve(templatesData)
				} else {
					const certificatesData = importCertificatesFromWorkbook(workbook)
					resolve(certificatesData)
				}
			} catch (error) {
				reject(new Error(`Lỗi đọc file Excel: ${error instanceof Error ? error.message : 'Unknown error'}`))
			}
		}
		
		reader.onerror = () => {
			reject(new Error('Lỗi đọc file'))
		}
		
		reader.readAsArrayBuffer(file)
	})
}

// Import Templates from Workbook
function importTemplatesFromWorkbook(workbook: XLSX.WorkBook): CertificateForm[] {
	const sheetName = workbook.SheetNames[0]
	const worksheet = workbook.Sheets[sheetName]
	const jsonData = XLSX.utils.sheet_to_json(worksheet)

	return jsonData.map((row: any, index: number): CertificateForm => {
		// Map category
		const mapCategory = (category: string) => {
			const categoryMap: Record<string, string> = {
				'Hoàn thành khóa học': 'course_completion',
				'Đánh giá kỹ năng': 'skill_assessment',
				'Phát triển chuyên môn': 'professional_development',
				'Thành tích học thuật': 'academic_achievement',
				'Chứng chỉ ngành': 'industry_certification',
				'Kỹ năng mềm': 'soft_skills',
				'Kỹ năng kỹ thuật': 'technical_skills',
				'Lãnh đạo': 'leadership',
				'Quản lý dự án': 'project_management',
				'Khác': 'other'
			}
			return categoryMap[category] || 'course_completion'
		}

		// Map level
		const mapLevel = (level: string) => {
			const levelMap: Record<string, string> = {
				'Cơ bản': 'beginner',
				'Trung cấp': 'intermediate',
				'Nâng cao': 'advanced',
				'Chuyên gia': 'expert',
				'Thạc sĩ': 'master'
			}
			return levelMap[level] || 'beginner'
		}

		// Map layout
		const mapLayout = (layout: string) => {
			const layoutMap: Record<string, string> = {
				'Cổ điển': 'classic',
				'Hiện đại': 'modern',
				'Tối giản': 'minimal',
				'Sáng tạo': 'creative'
			}
			return layoutMap[layout] || 'modern'
		}

		// Map unit
		const mapUnit = (unit: string) => {
			const unitMap: Record<string, string> = {
				'Pixel': 'px',
				'Millimeter': 'mm',
				'Inch': 'in'
			}
			return unitMap[unit] || 'px'
		}

		// Parse array fields
		const parseArrayField = (field: string) => {
			if (!field) return []
			return field.split(',').map(item => item.trim()).filter(item => item.length > 0)
		}

		return {
			name: row['Tên chứng chỉ'] || `Chứng chỉ ${index + 1}`,
			description: row['Mô tả'] || '',
			category: (mapCategory(row['Danh mục']) || 'course_completion') as any,
			level: (mapLevel(row['Cấp độ']) || 'beginner') as any,
			validityPeriod: parseInt(row['Thời hạn (tháng)']) || 12,
			issuer: row['Người cấp'] || 'EduPlatform',
			issuerLogo: row['Logo URL'] || '',
			requirements: [], // Will be populated from requirements sheet if available
			templateDesign: {
				layout: (mapLayout(row['Layout']) || 'modern') as any,
				colors: {
					primary: row['Màu chính'] || '#3b82f6',
					secondary: row['Màu phụ'] || '#1e40af',
					accent: row['Màu nhấn'] || '#f59e0b',
					text: '#1f2937',
					background: '#ffffff'
				},
				fonts: {
					title: 'Inter',
					subtitle: 'Inter',
					body: 'Inter',
					details: 'Inter'
				},
				elements: {
					logo: true,
					signature: true,
					seal: true,
					border: true,
					watermark: true,
					qrCode: true
				},
				dimensions: {
					width: parseInt(row['Chiều rộng']) || 800,
					height: parseInt(row['Chiều cao']) || 600,
					unit: (mapUnit(row['Đơn vị']) || 'px') as any
				}
			},
			metadata: {
				tags: parseArrayField(row['Tags']),
				keywords: parseArrayField(row['Từ khóa']),
				industry: parseArrayField(row['Ngành nghề']),
				prerequisites: parseArrayField(row['Điều kiện tiên quyết']),
				benefits: parseArrayField(row['Lợi ích']),
				recognition: parseArrayField(row['Sự công nhận']),
				compliance: parseArrayField(row['Tuân thủ'])
			},
			isActive: row['Trạng thái'] === 'Hoạt động'
		}
	})
}

// Import Certificates from Workbook
function importCertificatesFromWorkbook(workbook: XLSX.WorkBook): Partial<IssuedCertificate>[] {
	const sheetName = workbook.SheetNames[0]
	const worksheet = workbook.Sheets[sheetName]
	const jsonData = XLSX.utils.sheet_to_json(worksheet)

	return jsonData.map((row: any, index: number): Partial<IssuedCertificate> => {
		// Map status
		const mapStatus = (status: string) => {
			const statusMap: Record<string, string> = {
				'Đã cấp': 'issued',
				'Hoạt động': 'active',
				'Hết hạn': 'expired',
				'Đã thu hồi': 'revoked',
				'Chờ duyệt': 'pending',
				'Tạm dừng': 'suspended'
			}
			return statusMap[status] || 'issued'
		}

		// Parse date
		const parseDate = (dateStr: string) => {
			if (!dateStr) return new Date().toISOString()
			try {
				// Try to parse Vietnamese date format
				const dateParts = dateStr.split('/')
				if (dateParts.length === 3) {
					const day = parseInt(dateParts[0])
					const month = parseInt(dateParts[1]) - 1
					const year = parseInt(dateParts[2])
					return new Date(year, month, day).toISOString()
				}
				return new Date(dateStr).toISOString()
			} catch {
				return new Date().toISOString()
			}
		}

		return {
			certificateId: row['Mã chứng chỉ'] || `cert-${index + 1}`,
			certificateName: row['Tên chứng chỉ'] || `Chứng chỉ ${index + 1}`,
			recipientId: row['ID người nhận'] || `user-${index + 1}`,
			recipientName: row['Người nhận'] || `Học viên ${index + 1}`,
			recipientEmail: row['Email'] || `student${index + 1}@email.com`,
			organizationId: row['ID tổ chức'] || `org-${index + 1}`,
			organizationName: row['Tổ chức'] || `Tổ chức ${index + 1}`,
			courseId: row['ID khóa học'] || undefined,
			courseName: row['Khóa học'] || undefined,
			issuedAt: parseDate(row['Ngày cấp']),
			expiresAt: parseDate(row['Hết hạn']),
			status: (mapStatus(row['Trạng thái']) || 'issued') as any,
			verificationCode: row['Mã xác minh'] || `CERT-${Date.now()}-${index}`,
			blockchainHash: row['Blockchain Hash'] || undefined,
			metadata: {
				score: parseInt(row['Điểm số']) || 0,
				grade: row['Xếp loại'] || 'N/A',
				completionDate: parseDate(row['Ngày hoàn thành']),
				issuedBy: row['Người cấp'] || 'System Admin',
				issuedByTitle: row['Chức vụ'] || 'Administrator',
				verificationUrl: row['URL xác minh'] || '',
				additionalInfo: {}
			},
			downloadUrl: row['URL tải xuống'] || undefined,
			viewUrl: row['URL xem'] || undefined
		}
	})
}

// Generate Excel Template
export function generateCertificateExcelTemplate(type: 'templates' | 'certificates'): void {
	const workbook = XLSX.utils.book_new()

	if (type === 'templates') {
		// Templates template
		const templatesData = [
			{
				'Tên chứng chỉ': 'Chứng chỉ ReactJS',
				'Mô tả': 'Chứng chỉ hoàn thành khóa học ReactJS',
				'Danh mục': 'Hoàn thành khóa học',
				'Cấp độ': 'Trung cấp',
				'Thời hạn (tháng)': 24,
				'Người cấp': 'EduPlatform',
				'Logo URL': 'https://example.com/logo.png',
				'Trạng thái': 'Hoạt động',
				'Layout': 'Hiện đại',
				'Màu chính': '#3b82f6',
				'Màu phụ': '#1e40af',
				'Màu nhấn': '#f59e0b',
				'Chiều rộng': 800,
				'Chiều cao': 600,
				'Đơn vị': 'Pixel',
				'Tags': 'ReactJS, Frontend, JavaScript',
				'Từ khóa': 'react, javascript, frontend',
				'Ngành nghề': 'Technology, Software Development',
				'Điều kiện tiên quyết': 'HTML, CSS, JavaScript cơ bản',
				'Lợi ích': 'Tăng cơ hội việc làm, Nâng cao kỹ năng',
				'Sự công nhận': 'Được công nhận bởi các công ty công nghệ',
				'Tuân thủ': 'ISO 9001, IEEE Standards'
			}
		]

		const templatesSheet = XLSX.utils.json_to_sheet(templatesData)
		XLSX.utils.book_append_sheet(workbook, templatesSheet, 'Mẫu chứng chỉ')

		// Requirements template
		const requirementsData = [
			{
				'Tên chứng chỉ': 'Chứng chỉ ReactJS',
				'Loại yêu cầu': 'Hoàn thành khóa học',
				'Mô tả': 'Hoàn thành 100% nội dung khóa học',
				'Giá trị': 100,
				'Đơn vị': '%',
				'Bắt buộc': 'Có'
			},
			{
				'Tên chứng chỉ': 'Chứng chỉ ReactJS',
				'Loại yêu cầu': 'Điểm thi',
				'Mô tả': 'Đạt điểm thi cuối khóa tối thiểu 70%',
				'Giá trị': 70,
				'Đơn vị': '%',
				'Bắt buộc': 'Có'
			}
		]

		const requirementsSheet = XLSX.utils.json_to_sheet(requirementsData)
		XLSX.utils.book_append_sheet(workbook, requirementsSheet, 'Yêu cầu')

	} else {
		// Certificates template
		const certificatesData = [
			{
				'Mã chứng chỉ': 'cert-template-1',
				'Tên chứng chỉ': 'Chứng chỉ ReactJS',
				'ID người nhận': 'user-1',
				'Người nhận': 'Nguyễn Văn An',
				'Email': 'an.nguyen@email.com',
				'ID tổ chức': 'org-1',
				'Tổ chức': 'Đại học Bách Khoa Hà Nội',
				'ID khóa học': 'course-1',
				'Khóa học': 'ReactJS từ A đến Z',
				'Ngày cấp': '10/01/2024',
				'Hết hạn': '10/01/2026',
				'Trạng thái': 'Hoạt động',
				'Mã xác minh': 'CERT-2024-001-ABC123',
				'Blockchain Hash': '0x1234567890abcdef1234567890abcdef12345678',
				'Điểm số': 85,
				'Xếp loại': 'A',
				'Ngày hoàn thành': '08/01/2024',
				'Người cấp': 'Dr. Trần Thị Lan',
				'Chức vụ': 'Giảng viên Khoa CNTT',
				'URL xác minh': 'https://eduplatform.com/verify/CERT-2024-001-ABC123',
				'URL tải xuống': 'https://eduplatform.com/certificates/download/issued-cert-1',
				'URL xem': 'https://eduplatform.com/certificates/view/issued-cert-1'
			}
		]

		const certificatesSheet = XLSX.utils.json_to_sheet(certificatesData)
		XLSX.utils.book_append_sheet(workbook, certificatesSheet, 'Chứng chỉ đã cấp')
	}

	// Save template
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
	const filename = `certificate-template-${type}-${new Date().toISOString().split('T')[0]}.xlsx`
	saveAs(blob, filename)
}
