import React, { useRef } from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import Button from '@/features/admin/ui/common/primitives/Button'
import { FileText, Clock, Hash, Settings, CheckSquare } from 'lucide-react'
import { toast } from '@/foundation/contexts/ToastContext'

interface AddExamModalProps {
	isOpen: boolean
	onClose: () => void
	onAddExam: (examData: Partial<any>) => void
	subjects: string[]
	types?: import('@/types/exam').EnumOption[]
	difficulties?: import('@/types/exam').EnumOption[]
}

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

const AddExamModal: React.FC<AddExamModalProps> = ({
	isOpen,
	onClose,
	onAddExam,
	subjects,
	types,
	difficulties
}) => {
	const formRef = useRef<HTMLFormElement>(null)

	const availableTypes = types && types.length > 0 ? types : DEFAULT_TYPES
	const availableDifficulties = difficulties && difficulties.length > 0 ? difficulties : DEFAULT_DIFFICULTIES

	const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		const form = formRef.current
		if (!form) return
		const formData = new FormData(form)
		const title = (formData.get('title') as string)?.trim()
		const totalQuestions = parseInt(formData.get('totalQuestions') as string, 10) || 0
		const duration = parseInt(formData.get('duration') as string, 10) || 0
		const totalPointsRaw = formData.get('totalPoints') as string | null
		const totalPointsParsed = totalPointsRaw && totalPointsRaw.trim() !== '' ? parseInt(totalPointsRaw, 10) : NaN
		const totalPoints = Number.isFinite(totalPointsParsed) ? totalPointsParsed : (totalQuestions > 0 ? totalQuestions * 10 : 0)
		const passingScoreRaw = formData.get('passingScore') as string | null
		const passingScoreParsed = passingScoreRaw && passingScoreRaw.trim() !== '' ? parseInt(passingScoreRaw, 10) : NaN
		const calculatedPassingScore = Number.isFinite(passingScoreParsed) ? passingScoreParsed : Math.floor(totalPoints * 0.5)
		const passingScore = Math.min(Math.max(calculatedPassingScore, 0), 100)
		const maxAttempts = parseInt(formData.get('maxAttempts') as string, 10) || 3

		if (!title || totalQuestions <= 0 || duration <= 0) {
			toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*) với giá trị hợp lệ')
			return
		}
		if (totalPoints <= 0) {
			toast.error('Tổng điểm phải lớn hơn 0')
			return
		}
		if (maxAttempts < 1) {
			toast.error('Số lần thi tối đa phải >= 1')
			return
		}
		if (passingScore < 0 || (totalPoints > 0 && passingScore > totalPoints)) {
			toast.error('Điểm đạt phải nằm trong khoảng từ 0 đến Tổng điểm')
			return
		}

		const examData = {
			title,
			description: (formData.get('description') as string) || '',
			subject: formData.get('subject') as string,
			type: formData.get('type') as any,
			difficulty: formData.get('difficulty') as any,
			duration,
			totalPoints,
			passingScore,
			maxAttempts,
			totalQuestions,
			assignedQuestionCount: 0,
			allowReview: formData.get('allowReview') === 'on',
			shuffleQuestions: formData.get('shuffleQuestions') === 'on',
			showResults: formData.get('showResults') === 'on',
			status: 'draft' as const,
			startDate: undefined,
			endDate: undefined,
		}

		onAddExam(examData)
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Thêm đề thi mới"
			maxWidth="700px"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Hủy
					</Button>
					<Button variant="primary" onClick={handleSubmit}>
						Thêm đề thi
					</Button>
				</>
			}
		>
			<div className="modal-content-wrapper">
				<form ref={formRef}>
					<div className="modal-modal-form-group">
						<label className="form-label">
							<FileText />
							Tiêu đề đề thi <span className="required">*</span>
						</label>
						<input 
							type="text" 
							name="title" 
							className="form-input" 
							placeholder="VD: Kiểm tra giữa kỳ - Lập trình Web" 
							required 
						/>
					</div>

				<div className="modal-form-group">
					<label className="form-label">Mô tả</label>
					<textarea 
						name="description" 
						className="form-textarea" 
						placeholder="Mô tả ngắn về đề thi..."
						rows={3}
					/>
				</div>

				<div className="modal-form-row">
					<div className="modal-form-group">
						<label className="form-label">Môn học *</label>
						<select name="subject" className="form-select" required>
							{subjects.map(s => (
								<option key={s} value={s}>{s}</option>
							))}
						</select>
					</div>

					<div className="modal-form-group">
						<label className="form-label">Loại bài thi</label>
						<select name="type" className="form-select" defaultValue={availableTypes[0]?.code || 'practice'}>
							{availableTypes.map(type => (
								<option key={type.code} value={type.code}>{type.labelVi}</option>
							))}
						</select>
					</div>
				</div>

				<div className="modal-form-row">
					<div className="modal-form-group">
						<label className="form-label">Số câu hỏi *</label>
						<input 
							type="number" 
							name="totalQuestions" 
							className="form-input" 
							placeholder="30" 
							min="1"
							required 
						/>
					</div>

					<div className="modal-form-group">
						<label className="form-label">Thời gian (phút) *</label>
						<input 
							type="number" 
							name="duration" 
							className="form-input" 
							placeholder="60" 
							min="1"
							required 
						/>
					</div>

					<div className="modal-form-group">
						<label className="form-label">Độ khó</label>
						<select name="difficulty" className="form-select" defaultValue={availableDifficulties[1]?.code || 'medium'}>
							{availableDifficulties.map(difficulty => (
								<option key={difficulty.code} value={difficulty.code}>{difficulty.labelVi}</option>
							))}
						</select>
					</div>
				</div>

				<div className="modal-form-row">
					<div className="modal-form-group">
						<label className="form-label">Tổng điểm</label>
						<input 
							type="number" 
							name="totalPoints" 
							className="form-input" 
					placeholder="Auto = Số câu × 10" 
							min="0"
						/>
					</div>

					<div className="modal-form-group">
						<label className="form-label">Điểm đạt</label>
						<input 
							type="number" 
							name="passingScore" 
							className="form-input" 
							placeholder="Auto = 50% tổng điểm" 
							min="0"
						/>
					</div>

					<div className="modal-form-group">
						<label className="form-label">Số lần thi tối đa</label>
						<input 
							type="number" 
							name="maxAttempts" 
							className="form-input" 
							defaultValue="3" 
							min="1"
						/>
					</div>
				</div>

				<div style={{ 
					display: 'flex', 
					gap: '24px', 
					padding: '16px',
					background: 'var(--muted)',
					borderRadius: 'var(--radius-md)',
					marginTop: '16px'
				}}>
					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
						<input 
							type="checkbox" 
							name="allowReview" 
							defaultChecked 
							style={{ width: '18px', height: '18px', cursor: 'pointer' }}
						/>
						<span style={{ fontSize: '14px' }}>Cho phép xem lại câu hỏi</span>
					</label>

					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
						<input 
							type="checkbox" 
							name="shuffleQuestions" 
							defaultChecked 
							style={{ width: '18px', height: '18px', cursor: 'pointer' }}
						/>
						<span style={{ fontSize: '14px' }}>Trộn câu hỏi</span>
					</label>

					<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
						<input 
							type="checkbox" 
							name="showResults" 
							defaultChecked 
							style={{ width: '18px', height: '18px', cursor: 'pointer' }}
						/>
						<span style={{ fontSize: '14px' }}>Hiển thị kết quả</span>
					</label>
				</div>

				<div style={{ 
					marginTop: '16px',
					padding: '12px',
					background: 'var(--accent)',
					color: 'var(--accent-foreground)',
					borderRadius: 'var(--radius-md)',
					fontSize: '13px'
				}}>
					<strong>💡 Lưu ý:</strong> Trường có dấu (*) là bắt buộc. Tổng điểm và Điểm đạt sẽ tự động tính nếu không nhập.
				</div>
			</form>
			</div>
		</Modal>
	)
}

export default AddExamModal
