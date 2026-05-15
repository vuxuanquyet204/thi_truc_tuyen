import React from 'react'
import Badge from '@/features/admin/ui/common/Badge'
import ExamActions from './ExamActions'
import { Exam } from '@/types/exam'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Clock, FileText, Award } from 'lucide-react'

interface ExamTableRowProps {
	exam: Exam
	onEdit: (exam: Exam) => void
	onDelete: (exam: Exam) => void
	onView: (exam: Exam) => void
	onDuplicate: (exam: Exam) => void
	onPublish?: (exam: Exam) => void // ✨ NEW
	onUnpublish?: (exam: Exam) => void // ✨ NEW
}

export default function ExamTableRow({
	exam,
	onEdit,
	onDelete,
	onView,
	onDuplicate,
	onPublish,
	onUnpublish
}: ExamTableRowProps): JSX.Element {
	
	const getDifficultyBadgeVariant = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'success'
			case 'medium': return 'warning'
			case 'hard': return 'danger'
			default: return 'secondary'
		}
	}

	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case 'published': return 'success'
			case 'ongoing': return 'info'
			case 'draft': return 'secondary'
			case 'ended': return 'warning'
			case 'archived': return 'secondary'
			default: return 'secondary'
		}
	}

	const getTypeBadgeVariant = (type: string) => {
		switch (type) {
			case 'final': return 'danger'
			case 'midterm': return 'warning'
			case 'quiz': return 'info'
			case 'assignment': return 'success'
			default: return 'secondary'
		}
	}

	const getDifficultyLabel = (difficulty: string) => {
		switch (difficulty) {
			case 'easy': return 'Dễ'
			case 'medium': return 'Trung bình'
			case 'hard': return 'Khó'
			default: return difficulty
		}
	}

	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'draft': return 'Nháp'
			case 'published': return 'Đã xuất bản'
			case 'ongoing': return 'Đang diễn ra'
			case 'ended': return 'Đã kết thúc'
			case 'archived': return 'Lưu trữ'
			default: return status
		}
	}

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'practice': return 'Luyện tập'
			case 'quiz': return 'Kiểm tra'
			case 'midterm': return 'Giữa kỳ'
			case 'final': return 'Cuối kỳ'
			case 'assignment': return 'Bài tập'
			default: return type
		}
	}

	const formatTime = (dateString?: string) => {
		if (!dateString) return '-'
		
		try {
			return formatDistanceToNow(new Date(dateString), { 
				addSuffix: true, 
				locale: vi 
			})
		} catch {
			return dateString
		}
	}

	// ✨ Visual feedback: different style for draft vs published
	const isDraft = exam.status === 'draft'
	const isPublished = exam.status === 'published'
	
	return (
		<tr style={{ 
			opacity: isDraft ? 0.7 : 1,
			background: isPublished ? 'var(--success-bg, rgba(34, 197, 94, 0.05))' : 'transparent'
		}}>
			<td>
				<div>
					<div style={{ 
						fontWeight: 500, 
						marginBottom: '4px',
						display: 'flex',
						alignItems: 'center',
						gap: '8px'
					}}>
						{exam.title}
						{isDraft && (
							<span style={{
								fontSize: '11px',
								padding: '2px 6px',
								borderRadius: '4px',
								background: 'var(--muted)',
								color: 'var(--muted-foreground)',
								fontWeight: 600
							}}>
								NHÁP
							</span>
						)}
						{isPublished && (
							<span style={{
								fontSize: '11px',
								padding: '2px 6px',
								borderRadius: '4px',
								background: 'var(--success)',
								color: 'white',
								fontWeight: 600
							}}>
								CÔNG KHAI
							</span>
						)}
					</div>
					<div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
						{exam.subject}
					</div>
				</div>
			</td>
			<td>
				<Badge variant={getTypeBadgeVariant(exam.type)}>
					{getTypeLabel(exam.type)}
				</Badge>
			</td>
			<td>
		<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
			<FileText size={14} />
			{exam.assignedQuestionCount}/{exam.totalQuestions} câu
			{exam.assignedQuestionCount < exam.totalQuestions && (
				<span style={{
					fontSize: '11px',
					padding: '2px 6px',
					borderRadius: '999px',
					background: 'rgba(250, 204, 21, 0.2)',
					color: '#92400e',
					fontWeight: 600
				}}>
					Thiếu {Math.max(exam.totalQuestions - exam.assignedQuestionCount, 0)}
				</span>
			)}
		</div>
			</td>
			<td>
				<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
					<Clock size={14} />
					{exam.duration} phút
				</div>
			</td>
			<td>
				<div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
					<Award size={14} />
					{exam.totalPoints} điểm
				</div>
			</td>
			<td>
				<Badge variant={getDifficultyBadgeVariant(exam.difficulty)}>
					{getDifficultyLabel(exam.difficulty)}
				</Badge>
			</td>
			<td>
				<Badge variant={getStatusBadgeVariant(exam.status)}>
					{getStatusLabel(exam.status)}
				</Badge>
			</td>
			<td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
				{formatTime(exam.createdAt)}
			</td>
			<td>
				<ExamActions
					exam={exam}
					onEdit={onEdit}
					onDelete={onDelete}
					onView={onView}
					onDuplicate={onDuplicate}
					onPublish={onPublish} // ✨ NEW
					onUnpublish={onUnpublish} // ✨ NEW
				/>
			</td>
		</tr>
	)
}

