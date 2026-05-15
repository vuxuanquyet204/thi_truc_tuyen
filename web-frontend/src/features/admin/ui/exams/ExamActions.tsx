import React from 'react'
import { Edit2, Trash2, Eye, Copy, Play, Upload, Archive } from 'lucide-react'
import { Exam } from '@/types/exam'

interface ExamActionsProps {
	exam: Exam
	onEdit: (exam: Exam) => void
	onDelete: (exam: Exam) => void
	onView: (exam: Exam) => void
	onDuplicate: (exam: Exam) => void
	onPublish?: (exam: Exam) => void // ✨ NEW
	onUnpublish?: (exam: Exam) => void // ✨ NEW
}

export default function ExamActions({
	exam,
	onEdit,
	onDelete,
	onView,
	onDuplicate,
	onPublish,
	onUnpublish
}: ExamActionsProps): JSX.Element {
	
	const isDraft = exam.status === 'draft'
	const isPublished = exam.status === 'published'
	const canPublish = isDraft && exam.totalQuestions > 0 && exam.assignedQuestionCount >= exam.totalQuestions
	const missingQuestions = Math.max(0, exam.totalQuestions - exam.assignedQuestionCount)
	const publishTitle = canPublish
		? 'Xuất bản đề thi'
		: exam.totalQuestions <= 0
			? 'Chưa thiết lập số câu hỏi mục tiêu cho đề thi'
			: `Còn thiếu ${missingQuestions} câu hỏi trong đề`
	
	return (
		<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
			{/* Nút xem chi tiết */}
			<button
				className="btn btn-sm btn-secondary"
				onClick={() => onView(exam)}
				title="Xem chi tiết"
			>
				<Eye size={16} />
			</button>

		{/* Nút xuất bản / Gỡ xuất bản */}
		{isDraft && onPublish && (
			<button
				className="btn btn-sm"
				onClick={() => onPublish(exam)}
				title={publishTitle}
				disabled={!canPublish}
				style={{ 
					backgroundColor: '#22c55e',
					color: 'white',
					border: 'none',
					padding: '6px 12px',
					borderRadius: '6px',
					cursor: canPublish ? 'pointer' : 'not-allowed',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					transition: 'all 0.2s',
					opacity: canPublish ? 1 : 0.5
				}}
				onMouseEnter={(e) => {
					if (!canPublish) return
					e.currentTarget.style.backgroundColor = '#16a34a'
					e.currentTarget.style.transform = 'scale(1.05)'
				}}
				onMouseLeave={(e) => {
					if (!canPublish) return
					e.currentTarget.style.backgroundColor = '#22c55e'
					e.currentTarget.style.transform = 'scale(1)'
				}}
			>
				<Upload size={16} />
			</button>
		)}
		
		{isPublished && onUnpublish && (
			<button
				className="btn btn-sm"
				onClick={() => onUnpublish(exam)}
				title="Gỡ xuất bản"
				style={{ 
					backgroundColor: '#f59e0b',
					color: 'white',
					border: 'none',
					padding: '6px 12px',
					borderRadius: '6px',
					cursor: 'pointer',
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					transition: 'all 0.2s',
					opacity: 1
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = '#d97706'
					e.currentTarget.style.transform = 'scale(1.05)'
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.backgroundColor = '#f59e0b'
					e.currentTarget.style.transform = 'scale(1)'
				}}
			>
				<Archive size={16} />
			</button>
		)}

			{/* Nút sao chép */}
			<button
				className="btn btn-sm btn-secondary"
				onClick={() => onDuplicate(exam)}
				title="Sao chép đề thi"
			>
				<Copy size={16} />
			</button>

			{/* Nút chỉnh sửa */}
			<button
				className="btn btn-sm btn-secondary"
				onClick={() => onEdit(exam)}
				title="Chỉnh sửa"
				disabled={exam.status === 'ongoing' || exam.status === 'ended'}
			>
				<Edit2 size={16} />
			</button>

			{/* Nút xóa */}
			<button
				className="btn btn-sm btn-danger"
				onClick={() => onDelete(exam)}
				title="Xóa"
				disabled={exam.status === 'ongoing'}
			>
				<Trash2 size={16} />
			</button>
		</div>
	)
}

