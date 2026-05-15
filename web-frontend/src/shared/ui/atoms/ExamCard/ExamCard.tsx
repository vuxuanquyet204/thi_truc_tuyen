import React from 'react'
import { Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import styles from './ExamCard.module.css'

interface RecentExam {
	id: string
	title: string
	score?: number
	maxScore: number
	status: 'completed' | 'in-progress' | 'failed'
	date: string
	duration: string
	certificate?: boolean
}

interface ExamCardProps {
	exam: RecentExam
	onViewExam?: (examId: string) => void
	onRetakeExam?: (examId: string) => void
}

export default function ExamCard({ exam, onViewExam, onRetakeExam }: ExamCardProps): JSX.Element {
	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return <CheckCircle className={styles.statusIcon} style={{ color: 'var(--primary)' }} />
			case 'in-progress':
				return <Clock className={styles.statusIcon} style={{ color: 'var(--primary)' }} />
			case 'failed':
				return <AlertCircle className={styles.statusIcon} style={{ color: 'var(--destructive)' }} />
			default:
				return null
		}
	}

	const getScoreColor = (score?: number, maxScore: number = 100) => {
		if (!score) return 'var(--muted-foreground)'
		const percentage = (score / maxScore) * 100
		if (percentage >= 80) return 'var(--primary)'
		if (percentage >= 60) return 'var(--accent)'
		return 'var(--destructive)'
	}

	return (
		<div className={styles.card}>
			<div className={styles.content}>
				<div className={styles.contentLeft}>
					<div className={styles.header}>
						{getStatusIcon(exam.status)}
						<h4 className={styles.title}>
							{exam.title}
						</h4>
					</div>
					
					<div className={styles.meta}>
						<Clock className={styles.metaIcon} />
						{exam.date}
					</div>

					{exam.score !== undefined && (
						<div className={styles.scoreSection}>
							<span className={styles.scoreLabel}>
								Điểm
							</span>
							<span 
								className={styles.scoreValue}
								style={{ color: getScoreColor(exam.score, exam.maxScore) }}
							>
								{exam.score}/{exam.maxScore}
							</span>
						</div>
					)}

					{exam.certificate && (
						<div className={styles.certificateBadge}>
							<span className={styles.certificateLabel}>
								Có chứng chỉ
							</span>
						</div>
					)}
				</div>

				<div className={styles.contentRight}>
					<button
						onClick={() => onViewExam?.(exam.id)}
						className={styles.viewButton}
						title="Xem chi tiết"
					>
						<Eye className={styles.viewButtonIcon} />
					</button>

					{exam.status === 'completed' && exam.score && exam.score < 70 && (
						<button
							onClick={() => onRetakeExam?.(exam.id)}
							className={styles.retakeButton}
						>
							Thi lại
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
