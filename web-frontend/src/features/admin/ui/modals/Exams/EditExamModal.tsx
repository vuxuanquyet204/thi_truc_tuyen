import React, { useRef } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Button from '@/features/admin/ui/common/primitives/Button'
import { FileText, BookOpen, Clock, Hash, Target, Settings, CheckSquare, Save } from 'lucide-react'
import { toast } from '@/foundation/contexts/ToastContext'

interface EditExamModalProps {
	isOpen: boolean
	onClose: () => void
	onUpdateExam: (examData: Partial<any>) => void
	exam: any
	subjects: string[]
	types?: import('@/types/exam').EnumOption[]  // ✨ NEW: Dynamic exam types
	difficulties?: import('@/types/exam').EnumOption[]  // ✨ NEW: Dynamic difficulties
}

// Fallback options if API fails
const DEFAULT_TYPES = [
	{ code: 'practice', labelVi: 'Luyện tập' },
	{ code: 'quiz', labelVi: 'Kiểm tra' },
	{ code: 'midterm', labelVi: 'Giữa kỳ' },
	{ code: 'final', labelVi: 'Cuối kỳ' },
	{ code: 'assignment', labelVi: 'Bài tập' },
]

const DEFAULT_DIFFICULTIES = [
	{ code: 'easy', labelVi: 'Dễ' },
	{ code: 'medium', labelVi: 'Trung bình' },
	{ code: 'hard', labelVi: 'Khó' },
]

const EditExamModal: React.FC<EditExamModalProps> = ({
	isOpen,
	onClose,
	onUpdateExam,
	exam,
	subjects,
	types,
	difficulties
}) => {
	const formRef = useRef<HTMLFormElement>(null)
	const availableTypes = types && types.length > 0 ? types : DEFAULT_TYPES
	const availableDifficulties = difficulties && difficulties.length > 0 ? difficulties : DEFAULT_DIFFICULTIES

	if (!exam) return null

	const isPublished = exam.status === 'published'
	const assignedQuestionCount = exam.assignedQuestionCount ?? 0
	const isSubjectLocked = assignedQuestionCount > 0

	const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		if (isPublished) {
			toast.warning('Đề thi đã xuất bản không thể chỉnh sửa. Vui lòng gỡ xuất bản trước khi cập nhật.')
			return
		}
		const form = formRef.current
		if (!form) return
		const formData = new FormData(form)
		const subjectField = formData.get('subject')
		const subjectValue = typeof subjectField === 'string' ? subjectField : exam.subject
		const examData = {
			title: formData.get('title') as string,
			description: formData.get('description') as string,
			subject: subjectValue,
			type: formData.get('type') as any,
			totalQuestions: parseInt(formData.get('totalQuestions') as string) || 0,
			duration: parseInt(formData.get('duration') as string) || 0,
			totalPoints: parseInt(formData.get('totalPoints') as string) || 0,
			passingScore: parseInt(formData.get('passingScore') as string) || 0,
			difficulty: formData.get('difficulty') as any,
			maxAttempts: parseInt(formData.get('maxAttempts') as string) || 1,
			allowReview: formData.get('allowReview') === 'on',
			shuffleQuestions: formData.get('shuffleQuestions') === 'on',
			showResults: formData.get('showResults') === 'on'
		}

		if (examData.title && examData.subject && examData.totalQuestions && examData.duration) {
			if (!examData.totalPoints) {
				examData.totalPoints = examData.totalQuestions * 10
			}
			if (!examData.passingScore) {
				examData.passingScore = Math.floor(examData.totalPoints * 0.5)
			}
			onUpdateExam(examData)
		} else {
			toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*)')
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Chỉnh sửa đề thi"
			maxWidth="700px"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Hủy
					</Button>
					<Button variant="primary" onClick={handleSubmit} disabled={isPublished}>
						{isPublished ? 'Đã xuất bản' : 'Cập nhật'}
					</Button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				{isPublished && (
					<div
						style={{
							marginBottom: '16px',
							padding: '12px 16px',
							borderRadius: '10px',
							background: 'rgba(234, 179, 8, 0.15)',
							color: '#92400e',
							fontSize: '14px',
							fontWeight: 500,
						}}
					>
						Đề thi đã được xuất bản nên không thể chỉnh sửa. Vui lòng gỡ xuất bản trước khi cập nhật.
					</div>
				)}
				<form ref={formRef}>
					<div className="modal-form-section">
						<div className="section-title">
							<FileText />
							<h4>Thông tin cơ bản</h4>
						</div>
						
						<div className="modal-form-group">
							<label className="form-label">
								<FileText />
								Tiêu đề đề thi <span className="required">*</span>
							</label>
							<input 
								type="text" 
								name="title" 
								className="form-input" 
							disabled={isPublished}
								defaultValue={exam.title}
								placeholder="VD: Kiểm tra giữa kỳ - Lập trình Web" 
								required 
							/>
						</div>

						<div className="modal-form-group">
							<label className="form-label">
								<FileText />
								Mô tả
							</label>
							<textarea 
								name="description" 
								className="form-textarea" 
							disabled={isPublished}
								defaultValue={exam.description || ''}
								placeholder="Mô tả ngắn về đề thi..."
								rows={3}
							/>
						</div>

						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<BookOpen />
									Môn học <span className="required">*</span>
								</label>
								<select 
									name="subject" 
									className="form-select" 
						disabled={isPublished || isSubjectLocked}
									defaultValue={exam.subject}
									required
								>
									{subjects.map(s => (
										<option key={s} value={s}>{s}</option>
									))}
								</select>
				{isSubjectLocked && !isPublished && (
					<small
						style={{ color: '#a16207', fontSize: '12px', marginTop: '6px', display: 'block' }}
					>
						Không thể thay đổi môn học khi đề thi đã có câu hỏi ({assignedQuestionCount}/{exam.totalQuestions}).
					</small>
				)}
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Settings />
									Loại bài thi
								</label>
								<select 
									name="type" 
									className="form-select" 
							disabled={isPublished}
									defaultValue={exam.type}
								>
									{availableTypes.map(type => (
										<option key={type.code} value={type.code}>{type.labelVi}</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="modal-form-section">
						<div className="section-title">
							<CheckSquare />
							<h4>Cấu hình bài thi</h4>
						</div>
						
						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<CheckSquare />
									Số câu hỏi <span className="required">*</span>
								</label>
								<input 
									type="number" 
									name="totalQuestions" 
									className="form-input" 
							disabled={isPublished}
									defaultValue={exam.totalQuestions}
									placeholder="30" 
									min="1"
									required 
								/>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Clock />
									Thời gian (phút) <span className="required">*</span>
								</label>
								<input 
									type="number" 
									name="duration" 
									className="form-input" 
							disabled={isPublished}
									defaultValue={exam.duration}
									placeholder="60" 
									min="1"
									required 
								/>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Target />
									Độ khó
								</label>
								<select 
									name="difficulty" 
									className="form-select" 
							disabled={isPublished}
									defaultValue={exam.difficulty}
								>
									{availableDifficulties.map(difficulty => (
										<option key={difficulty.code} value={difficulty.code}>{difficulty.labelVi}</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="modal-form-section">
						<div className="section-title">
							<Target />
							<h4>Thiết lập điểm số</h4>
						</div>
						
						<div className="modal-form-row">
							<div className="modal-form-group">
								<label className="form-label">
									<Target />
									Tổng điểm
								</label>
								<input 
									type="number" 
									name="totalPoints" 
									className="form-input" 
							disabled={isPublished}
									defaultValue={exam.totalPoints}
								placeholder="Auto = Số câu × 10"
									min="0"
								/>
								<small>Tự động tính nếu để trống</small>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Target />
									Điểm đạt
								</label>
								<input 
									type="number" 
									name="passingScore" 
									className="form-input" 
							disabled={isPublished}
									defaultValue={exam.passingScore}
									placeholder="Auto = 50% tổng điểm" 
									min="0"
								/>
								<small>Tự động tính nếu để trống</small>
							</div>

							<div className="modal-form-group">
								<label className="form-label">
									<Hash />
									Số lần thi tối đa
								</label>
								<input 
									type="number" 
									name="maxAttempts" 
									className="form-input" 
							disabled={isPublished}
									defaultValue={exam.maxAttempts}
									min="1"
								/>
							</div>
						</div>
					</div>

					<div className="modal-form-section">
						<div className="section-title">
							<Settings />
							<h4>Tùy chọn nâng cao</h4>
						</div>
						
						<div className="modal-checkbox-group">
							<div className="checkbox-item">
								<input 
									type="checkbox" 
									name="allowReview" 
									defaultChecked={exam.allowReview}
							disabled={isPublished}
								/>
								<label>Cho phép xem lại câu hỏi</label>
							</div>

							<div className="checkbox-item">
								<input 
									type="checkbox" 
									name="shuffleQuestions" 
									defaultChecked={exam.shuffleQuestions}
							disabled={isPublished}
								/>
								<label>Trộn câu hỏi</label>
							</div>

							<div className="checkbox-item">
								<input 
									type="checkbox" 
									name="showResults" 
									defaultChecked={exam.showResults}
							disabled={isPublished}
								/>
								<label>Hiển thị kết quả</label>
							</div>
						</div>
					</div>

					<div className="modal-export-info">
						<div className="export-title">
							<Save />
							<h4>Lưu ý</h4>
						</div>
						<ul className="export-list">
							<li>Các thay đổi sẽ được lưu ngay lập tức</li>
							<li>Tổng điểm và điểm đạt sẽ tự động tính nếu để trống</li>
							{exam.status === 'ongoing' && <li>Không thể sửa đề đang thi!</li>}
						</ul>
					</div>
				</form>
			</div>
		</Modal>
	)
}

export default EditExamModal
