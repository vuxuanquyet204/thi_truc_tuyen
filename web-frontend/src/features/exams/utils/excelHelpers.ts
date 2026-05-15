import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Exam } from '@/foundation/types'

// Export exams to Excel
export const exportExamsToExcel = (exams: Exam[], fileName = 'Danh_sach_de_thi') => {
	const data = exams.map(exam => ({
		'ID': exam.id,
		'Tiêu đề': exam.title,
		'Mô tả': exam.description || '',
		'Môn học': exam.subject,
		'Loại bài thi': exam.type === 'practice' ? 'Luyện tập' :
					   exam.type === 'quiz' ? 'Kiểm tra' :
					   exam.type === 'midterm' ? 'Giữa kỳ' :
					   exam.type === 'final' ? 'Cuối kỳ' : 'Bài tập',
		'Số câu hỏi': exam.totalQuestions,
		'Thời gian (phút)': exam.duration,
		'Tổng điểm': exam.totalPoints,
		'Điểm đạt': exam.passingScore,
		'Độ khó': exam.difficulty === 'easy' ? 'Dễ' :
				  exam.difficulty === 'medium' ? 'Trung bình' : 'Khó',
		'Trạng thái': exam.status === 'draft' ? 'Nháp' :
					  exam.status === 'published' ? 'Đã xuất bản' :
					  exam.status === 'ongoing' ? 'Đang diễn ra' :
					  exam.status === 'ended' ? 'Đã kết thúc' : 'Lưu trữ',
		'Số lần thi tối đa': exam.maxAttempts,
		'Xem lại câu hỏi': exam.allowReview ? 'Có' : 'Không',
		'Trộn câu hỏi': exam.shuffleQuestions ? 'Có' : 'Không',
		'Hiển thị kết quả': exam.showResults ? 'Có' : 'Không',
		'Người tạo': exam.createdBy,
		'Ngày tạo': new Date(exam.createdAt).toLocaleDateString('vi-VN'),
		'Ngày bắt đầu': exam.startDate ? new Date(exam.startDate).toLocaleDateString('vi-VN') : '',
		'Ngày kết thúc': exam.endDate ? new Date(exam.endDate).toLocaleDateString('vi-VN') : ''
	}))

	const ws = XLSX.utils.json_to_sheet(data)
	
	// Set column widths
	const colWidths = [
		{ wch: 10 }, // ID
		{ wch: 40 }, // Tiêu đề
		{ wch: 50 }, // Mô tả
		{ wch: 20 }, // Môn học
		{ wch: 15 }, // Loại
		{ wch: 12 }, // Số câu
		{ wch: 15 }, // Thời gian
		{ wch: 12 }, // Tổng điểm
		{ wch: 12 }, // Điểm đạt
		{ wch: 15 }, // Độ khó
		{ wch: 15 }, // Trạng thái
		{ wch: 15 }, // Max attempts
		{ wch: 15 }, // Allow review
		{ wch: 15 }, // Shuffle
		{ wch: 15 }, // Show results
		{ wch: 20 }, // Người tạo
		{ wch: 15 }, // Ngày tạo
		{ wch: 15 }, // Ngày bắt đầu
		{ wch: 15 }  // Ngày kết thúc
	]
	ws['!cols'] = colWidths

	const wb = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(wb, ws, 'Đề thi')
	const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(blob, `${fileName}.xlsx`)
}

// Import exams from Excel
export const importExamsFromExcel = (file: File): Promise<Partial<Exam>[]> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const buffer = e.target?.result
				const wb = XLSX.read(buffer, { type: 'array' })
				const wsname = wb.SheetNames[0]
				const ws = wb.Sheets[wsname]
				const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][]

				if (data.length < 2) {
					reject(new Error('File Excel không có dữ liệu hoặc thiếu header.'))
					return
				}

				const headers = data[0].map(h => String(h).trim())
				const exams: Partial<Exam>[] = []

				for (let i = 1; i < data.length; i++) {
					const row = data[i]
					const exam: Partial<Exam> = {}
					
					headers.forEach((header, index) => {
						const value = row[index]
						
						switch (header) {
							case 'Tiêu đề': 
								exam.title = String(value)
								break
							case 'Mô tả': 
								exam.description = value ? String(value) : ''
								break
							case 'Môn học': 
								exam.subject = String(value)
								break
							case 'Loại bài thi':
								if (value === 'Luyện tập') exam.type = 'practice'
								else if (value === 'Kiểm tra') exam.type = 'quiz'
								else if (value === 'Giữa kỳ') exam.type = 'midterm'
								else if (value === 'Cuối kỳ') exam.type = 'final'
								else exam.type = 'assignment'
								break
							case 'Số câu hỏi': 
								exam.totalQuestions = parseInt(String(value)) || 0
								break
							case 'Thời gian (phút)': 
								exam.duration = parseInt(String(value)) || 0
								break
							case 'Tổng điểm': 
								exam.totalPoints = parseInt(String(value)) || 0
								break
							case 'Điểm đạt': 
								exam.passingScore = parseInt(String(value)) || 0
								break
							case 'Độ khó':
								if (value === 'Dễ') exam.difficulty = 'easy'
								else if (value === 'Trung bình') exam.difficulty = 'medium'
								else exam.difficulty = 'hard'
								break
							case 'Trạng thái':
								if (value === 'Nháp') exam.status = 'draft'
								else if (value === 'Đã xuất bản') exam.status = 'published'
								else exam.status = 'draft' // Default
								break
							case 'Số lần thi tối đa': 
								exam.maxAttempts = parseInt(String(value)) || 1
								break
							case 'Xem lại câu hỏi': 
								exam.allowReview = value === 'Có'
								break
							case 'Trộn câu hỏi': 
								exam.shuffleQuestions = value === 'Có'
								break
							case 'Hiển thị kết quả': 
								exam.showResults = value === 'Có'
								break
							case 'Người tạo':
								exam.createdBy = value ? String(value) : 'Import'
								break
						}
					})

					// Validation: required fields
					if (exam.title && exam.subject && exam.totalQuestions && exam.duration) {
						// Set defaults for missing fields
						if (!exam.type) exam.type = 'practice'
						if (!exam.difficulty) exam.difficulty = 'medium'
						if (!exam.status) exam.status = 'draft'
					if (!exam.totalPoints) exam.totalPoints = exam.totalQuestions * 10
						if (!exam.passingScore) exam.passingScore = Math.floor(exam.totalPoints * 0.5)
						if (!exam.maxAttempts) exam.maxAttempts = 3
						if (exam.allowReview === undefined) exam.allowReview = true
						if (exam.shuffleQuestions === undefined) exam.shuffleQuestions = true
						if (exam.showResults === undefined) exam.showResults = true
						if (!exam.createdBy) exam.createdBy = 'Import'
						
						exams.push(exam)
					}
				}
				
				resolve(exams)
			} catch (error) {
				reject(error)
			}
		}
		reader.onerror = (error) => reject(error)
		reader.readAsArrayBuffer(file)
	})
}

// Download Excel template
export const downloadExamTemplate = () => {
	const headers = [
		'Tiêu đề',
		'Mô tả',
		'Môn học',
		'Loại bài thi',
		'Số câu hỏi',
		'Thời gian (phút)',
		'Tổng điểm',
		'Điểm đạt',
		'Độ khó',
		'Trạng thái',
		'Số lần thi tối đa',
		'Xem lại câu hỏi',
		'Trộn câu hỏi',
		'Hiển thị kết quả'
	]
	
	const sampleRow = [
		'Đề thi mẫu - Lập trình Web',
		'Đề thi kiểm tra kiến thức HTML, CSS, JavaScript',
		'Lập trình Web',
		'Kiểm tra',
		30,
		60,
		300,
		150,
		'Trung bình',
		'Nháp',
		3,
		'Có',
		'Có',
		'Có'
	]

	const data = [headers, sampleRow]
	const ws = XLSX.utils.aoa_to_sheet(data)
	
	// Set column widths
	ws['!cols'] = [
		{ wch: 40 },
		{ wch: 50 },
		{ wch: 20 },
		{ wch: 15 },
		{ wch: 12 },
		{ wch: 15 },
		{ wch: 12 },
		{ wch: 12 },
		{ wch: 15 },
		{ wch: 15 },
		{ wch: 15 },
		{ wch: 15 },
		{ wch: 15 },
		{ wch: 15 }
	]
	
	const wb = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(wb, ws, 'Mẫu đề thi')
	
	// Add instructions sheet
	const instructions = [
		['HƯỚNG DẪN NHẬP DỮ LIỆU ĐỀ THI'],
		[''],
		['1. Giữ nguyên tên các cột (dòng đầu tiên)'],
		['2. Điền dữ liệu từ dòng thứ 2 trở đi'],
		['3. Các trường bắt buộc: Tiêu đề, Môn học, Số câu hỏi, Thời gian'],
		[''],
		['GIÁ TRỊ HỢP LỆ:'],
		[''],
		['Loại bài thi:', 'Luyện tập, Kiểm tra, Giữa kỳ, Cuối kỳ, Bài tập'],
		['Độ khó:', 'Dễ, Trung bình, Khó'],
		['Trạng thái:', 'Nháp, Đã xuất bản'],
		['Yes/No fields:', 'Có hoặc Không'],
		[''],
		['LƯU Ý:'],
		['- Số câu hỏi, Thời gian, Điểm phải là số nguyên dương'],
		['- Điểm đạt không được lớn hơn Tổng điểm'],
		['- Nếu không điền Tổng điểm, hệ thống tự tính = Số câu × 10'],
		['- Nếu không điền Điểm đạt, hệ thống tự tính = 50% Tổng điểm']
	]
	
	const wsInstructions = XLSX.utils.aoa_to_sheet(instructions)
	wsInstructions['!cols'] = [{ wch: 50 }, { wch: 50 }]
	XLSX.utils.book_append_sheet(wb, wsInstructions, 'Hướng dẫn')
	
	const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
	const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(blob, 'Mau_nhap_de_thi.xlsx')
}

