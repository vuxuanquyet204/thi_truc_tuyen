import React, { useState } from 'react'
import { X, CheckCircle, Award, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ExamCard from '../../atoms/ExamCard'
import { useRecentSubmissions } from '@/features/exams/hooks'
import styles from './RecentExams.module.css'

interface RecentExam {
	id: string
	quizId?: string
	title: string
	score?: number
	maxScore: number
	status: 'completed' | 'in-progress' | 'failed'
	date: string
	duration: string
	certificate?: boolean
	submittedAt?: string
}

interface RecentExamsProps {
	onViewExam?: (examId: string) => void
	onRetakeExam?: (examId: string) => void
}

export default function RecentExams({
	onViewExam,
	onRetakeExam
}: RecentExamsProps): JSX.Element {
	const navigate = useNavigate()
	const { exams, loading, error } = useRecentSubmissions()
	const [showExamDetailModal, setShowExamDetailModal] = useState(false)
	const [showCertificateModal, setShowCertificateModal] = useState(false)
	const [selectedExam, setSelectedExam] = useState<RecentExam | null>(null)

	const handleViewExam = (submissionId: string) => {
		const exam = exams.find(e => e.id === submissionId)
		if (exam) {
			setSelectedExam(exam)
			if (exam.status === 'in-progress') {
				// Navigate to continue exam (use quizId, not submissionId)
				navigate(`/exam/${exam.quizId || submissionId}/take`)
			} else {
				// Navigate to result page for completed exams (use quizId)
				navigate(`/exam/${exam.quizId || submissionId}/result`)
			}
			onViewExam?.(submissionId)
		}
	}

	const handleRetakeExam = (submissionId: string) => {
		const exam = exams.find(e => e.id === submissionId)
		if (exam) {
			// Navigate to quiz detail page to retake (use quizId)
			navigate(`/exam/${exam.quizId || submissionId}/pre-check`)
			onRetakeExam?.(submissionId)
		}
	}

	const handleViewAllExams = () => {
		navigate('/user/exams/recent')
	}

	const handleViewCertificate = () => {
		setShowExamDetailModal(false)
		setShowCertificateModal(true)
	}

	const getScoreColor = (score?: number, maxScore: number = 100) => {
		if (!score) return 'var(--muted-foreground)'
		const percentage = (score / maxScore) * 100
		if (percentage >= 80) return 'var(--primary)'
		if (percentage >= 60) return 'var(--accent)'
		return 'var(--destructive)'
	}

	const getPerformanceMessage = (score?: number, maxScore: number = 100) => {
		if (!score) return ''
		const percentage = (score / maxScore) * 100
		if (percentage >= 90) return 'Xuất sắc!'
		if (percentage >= 80) return 'Rất tốt!'
		if (percentage >= 70) return 'Tốt!'
		if (percentage >= 60) return 'Đạt yêu cầu'
		return 'Cần cải thiện'
	}

	return (
		<>
			<div className={`card stagger-load hover-lift interactive ${styles.container}`}>
				<div className={styles.header}>
					<h3 className={styles.title}>
						Bài thi gần đây
					</h3>
					<button
						onClick={handleViewAllExams}
						className={styles.viewAllButton}
					>
						Xem tất cả
					</button>
				</div>

				<div className={styles.examList}>
					{loading ? (
						<div className={`${styles.stateContainer} ${styles.stateTextMuted}`}>
							<div className={styles.stateContent}>
								<Clock className={`${styles.stateIcon} ${styles.stateIconLoading}`} />
								<p className={styles.stateText}>Đang tải bài thi gần đây...</p>
							</div>
						</div>
					) : error ? (
						<div className={`${styles.stateContainer} ${styles.stateTextError}`}>
							<div className={styles.stateContent}>
								<AlertCircle className={styles.stateIcon} />
								<p className={styles.stateText}>Lỗi tải dữ liệu</p>
								<p className={styles.stateTextSecondary}>{error}</p>
							</div>
						</div>
					) : exams.length === 0 ? (
						<div className={`${styles.stateContainer} ${styles.stateTextMuted}`}>
							<div className={styles.stateContent}>
								<AlertCircle className={`${styles.stateIcon} ${styles.stateIconLoading}`} />
								<p className={styles.stateText}>Chưa có bài thi nào</p>
								<p className={styles.stateTextSecondary}>Hãy bắt đầu làm bài thi đầu tiên!</p>
							</div>
						</div>
					) : (
						<div className={styles.examListContainer}>
							{exams.map((exam) => (
								<ExamCard
									key={exam.id}
									exam={exam}
									onViewExam={handleViewExam}
									onRetakeExam={handleRetakeExam}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Exam Detail Modal */}
			{showExamDetailModal && selectedExam && selectedExam.status !== 'in-progress' && (
				<div className={styles.modalOverlay} onClick={() => setShowExamDetailModal(false)}>
					<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => setShowExamDetailModal(false)}
							className={styles.modalCloseButton}
						>
							<X className={styles.modalCloseIcon} />
						</button>

						<div className={styles.modalHeader}>
							{/* Score Circle */}
							<div 
								className={styles.scoreCircle}
								style={{
									background: `linear-gradient(135deg, ${getScoreColor(selectedExam.score, selectedExam.maxScore)}, var(--accent))`
								}}
							>
								<span className={styles.scoreValue}>
									{selectedExam.score}
								</span>
								<span className={styles.scoreMax}>
									/{selectedExam.maxScore}
								</span>
							</div>

							<h2 className={styles.modalTitle}>
								{selectedExam.title}
							</h2>

							<p 
								className={styles.modalPerformance}
								style={{
									color: getScoreColor(selectedExam.score, selectedExam.maxScore)
								}}
							>
								{getPerformanceMessage(selectedExam.score, selectedExam.maxScore)}
							</p>

							{/* Stats Grid */}
							<div className={styles.statsGrid}>
								<div className={styles.statCard}>
									<div className={styles.statHeader}>
										<Clock className={styles.statIcon} />
										<span className={styles.statLabel}>
											Thời gian
										</span>
									</div>
									<p className={styles.statValue}>
										{selectedExam.duration}
									</p>
								</div>

								<div className={styles.statCard}>
									<div className={styles.statHeader}>
										<TrendingUp className={styles.statIcon} />
										<span className={styles.statLabel}>
											Tỷ lệ đạt
										</span>
									</div>
									<p className={styles.statValue}>
										{selectedExam.score ? Math.round((selectedExam.score / selectedExam.maxScore) * 100) : 0}%
									</p>
								</div>

								<div className={styles.statCard}>
									<div className={styles.statHeader}>
										<CheckCircle className={styles.statIcon} />
										<span className={styles.statLabel}>
											Trạng thái
										</span>
									</div>
									<p className={styles.statValue}>
										{selectedExam.status === 'completed' ? 'Hoàn thành' : 'Không đạt'}
									</p>
								</div>

								<div className={styles.statCard}>
									<div className={styles.statHeader}>
										<Award className={styles.statIcon} />
										<span className={styles.statLabel}>
											Chứng chỉ
										</span>
									</div>
									<p className={styles.statValue}>
										{selectedExam.certificate ? 'Có' : 'Không'}
									</p>
								</div>
							</div>

							{/* Action Buttons */}
							<div className={styles.actionButtons}>
								{selectedExam.certificate && (
									<button
										onClick={handleViewCertificate}
										className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
									>
										<Award className={styles.actionButtonIcon} />
										Xem chứng chỉ
									</button>
								)}

								{selectedExam.score && selectedExam.score < 70 && (
									<button
										onClick={() => {
											setShowExamDetailModal(false)
											handleRetakeExam(selectedExam.id)
										}}
										className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
									>
										Thi lại
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Certificate Modal */}
			{showCertificateModal && selectedExam && selectedExam.certificate && (
				<div className={`${styles.modalOverlay} ${styles.modalOverlayCertificate}`} onClick={() => setShowCertificateModal(false)}>
					<div className={`${styles.modalContent} ${styles.modalContentCertificate}`} onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => setShowCertificateModal(false)}
							className={styles.modalCloseButton}
						>
							<X className={styles.modalCloseIcon} />
						</button>

						{/* Certificate Design */}
						<div className={styles.certificateContainer}>
							{/* Decorative corners */}
							<div className={`${styles.certificateCorner} ${styles.certificateCornerTopLeft}`} />
							<div className={`${styles.certificateCorner} ${styles.certificateCornerTopRight}`} />
							<div className={`${styles.certificateCorner} ${styles.certificateCornerBottomLeft}`} />
							<div className={`${styles.certificateCorner} ${styles.certificateCornerBottomRight}`} />

							<div className={styles.certificateContent}>
								<Award className={styles.certificateIcon} />

								<h2 className={styles.certificateTitle}>
									Chứng chỉ Hoàn thành
								</h2>

								<p className={styles.certificateSubtitle}>
									Chứng nhận rằng bạn đã hoàn thành xuất sắc
								</p>

								<h3 className={styles.certificateExamTitle}>
									{selectedExam.title}
								</h3>

								<div className={styles.certificateScore}>
									<p className={styles.certificateScoreText}>
										Điểm số: {selectedExam.score}/{selectedExam.maxScore}
									</p>
								</div>

								<p className={styles.certificateDate}>
									Ngày hoàn thành: {selectedExam.date}
								</p>
							</div>
						</div>

						<button
							onClick={() => setShowCertificateModal(false)}
							className={styles.certificateDownloadButton}
						>
							Tải xuống chứng chỉ
						</button>
					</div>
				</div>
			)}
		</>
	)
}
