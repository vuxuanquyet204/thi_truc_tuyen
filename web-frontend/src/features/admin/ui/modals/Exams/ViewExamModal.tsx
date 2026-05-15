import React from 'react'
import Modal from '@/features/admin/ui/common/Modal'
import { FileText, BookOpen, Clock, Hash, Target, User, Settings, CheckCircle, XCircle } from 'lucide-react'

interface ViewExamModalProps {
	isOpen: boolean
	onClose: () => void
	exam: any
}

const ViewExamModal: React.FC<ViewExamModalProps> = ({
	isOpen,
	onClose,
	exam
}) => {
	if (!exam) return null

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			draft: 'Nháp',
			published: 'Đã xuất bản',
			ongoing: 'Đang diễn ra',
			ended: 'Đã kết thúc',
			archived: 'Lưu trữ'
		}
		return labels[status] || status
	}

	const getTypeLabel = (type: string) => {
		const labels: Record<string, string> = {
			practice: 'Luyện tập',
			quiz: 'Kiểm tra',
			midterm: 'Giữa kỳ',
			final: 'Cuối kỳ',
			assignment: 'Bài tập'
		}
		return labels[type] || type
	}

	const getDifficultyLabel = (difficulty: string) => {
		const labels: Record<string, string> = {
			easy: 'Dễ',
			medium: 'Trung bình',
			hard: 'Khó'
		}
		return labels[difficulty] || difficulty
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Chi tiết đề thi"
			maxWidth="700px"
		>
			<div className="modal-content-wrapper">
				{/* Exam Header Info */}
				<div className="modal-info-card">
					<div className="card-icon">
						<FileText />
					</div>
					<div className="card-title">{exam.title}</div>
					<div className="card-description">{exam.description}</div>
					<div className="card-value">
						<span className={`modal-status-badge ${exam.status === 'published' ? 'success' : exam.status === 'draft' ? 'warning' : exam.status === 'ongoing' ? 'info' : 'secondary'}`}>
							{getStatusLabel(exam.status)}
						</span>
					</div>
				</div>

				{/* Basic Information */}
				<div className="modal-detail-section">
					<div className="section-title">
						<FileText />
						<h4>Thông tin cơ bản</h4>
					</div>
					<div className="modal-info-pairs">
						<div className="modal-info-pair">
							<div className="info-label">Môn học</div>
							<div className="info-value">{exam.subject}</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Loại bài thi</div>
							<div className="info-value">{getTypeLabel(exam.type)}</div>
						</div>
					<div className="modal-info-pair">
						<div className="info-label">Câu hỏi đã gán</div>
						<div className="info-value">{exam.assignedQuestionCount}/{exam.totalQuestions} câu</div>
					</div>
						<div className="modal-info-pair">
							<div className="info-label">Thời gian</div>
							<div className="info-value">{exam.duration} phút</div>
						</div>
					</div>
				</div>

				{/* Scoring Information */}
				<div className="modal-detail-section">
					<div className="section-title">
						<Target />
						<h4>Thông tin điểm số</h4>
					</div>
					<div className="modal-info-pairs">
						<div className="modal-info-pair">
							<div className="info-label">Tổng điểm</div>
							<div className="info-value">{exam.totalPoints} điểm</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Điểm đạt</div>
							<div className="info-value">{exam.passingScore} điểm</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Độ khó</div>
							<div className="info-value">{getDifficultyLabel(exam.difficulty)}</div>
						</div>
						<div className="modal-info-pair">
							<div className="info-label">Số lần thi tối đa</div>
							<div className="info-value">{exam.maxAttempts}</div>
						</div>
					</div>
				</div>

				{/* Creator Information */}
				<div className="modal-detail-section">
					<div className="section-title">
						<User />
						<h4>Thông tin người tạo</h4>
					</div>
					<div className="modal-info-pairs">
						<div className="modal-info-pair">
							<div className="info-label">Người tạo</div>
							<div className="info-value">{exam.createdBy}</div>
						</div>
					</div>
				</div>

				{/* Settings */}
				<div className="modal-detail-section">
					<div className="section-title">
						<Settings />
						<h4>Cài đặt</h4>
					</div>
					<div className="modal-info-grid">
						<div className="modal-info-card">
							<div className="card-icon" style={{ background: exam.allowReview ? '#10b981' : '#ef4444' }}>
								{exam.allowReview ? <CheckCircle /> : <XCircle />}
							</div>
							<div className="card-title">Xem lại câu hỏi</div>
							<div className="card-value">{exam.allowReview ? 'Cho phép' : 'Không'}</div>
						</div>
						<div className="modal-info-card">
							<div className="card-icon" style={{ background: exam.shuffleQuestions ? '#10b981' : '#ef4444' }}>
								{exam.shuffleQuestions ? <CheckCircle /> : <XCircle />}
							</div>
							<div className="card-title">Trộn câu hỏi</div>
							<div className="card-value">{exam.shuffleQuestions ? 'Có' : 'Không'}</div>
						</div>
						<div className="modal-info-card">
							<div className="card-icon" style={{ background: exam.showResults ? '#10b981' : '#ef4444' }}>
								{exam.showResults ? <CheckCircle /> : <XCircle />}
							</div>
							<div className="card-title">Hiển thị kết quả</div>
							<div className="card-value">{exam.showResults ? 'Có' : 'Không'}</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default ViewExamModal
