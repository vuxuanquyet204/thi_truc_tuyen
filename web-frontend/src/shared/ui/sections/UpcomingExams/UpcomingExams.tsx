import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, AlertCircle, CheckCircle, X, Camera, Mic, User, Shield, Info, Award } from 'lucide-react'
import styles from './UpcomingExams.module.css'

interface UpcomingExam {
	id: string
	title: string
	date: string
	time: string
	duration: string
	type: 'scheduled' | 'practice' | 'certification'
	status: 'upcoming' | 'registered' | 'ready'
	proctoring?: boolean
	isStopped?: boolean // Bài thi đã bị dừng bởi giám thị
}

interface UpcomingExamsProps {
	exams?: UpcomingExam[]
	onRegisterExam?: (examId: string) => void
	onViewExam?: (examId: string) => void
	onStartExam?: (examId: string) => void
}

export default function UpcomingExams({
	exams = [
		{
			id: 'javascript-advanced',
			title: 'JavaScript nâng cao',
			date: 'Hôm nay',
			time: '2:00 chiều',
			duration: '90 phút',
			type: 'certification',
			status: 'ready',
			proctoring: true
		},
		{
			id: 'react-fundamentals',
			title: 'Phát triển React cơ bản',
			date: 'Ngày mai',
			time: '10:00 sáng',
			duration: '60 phút',
			type: 'scheduled',
			status: 'registered',
			proctoring: true
		},
		{
			id: 'data-structures',
			title: 'Bài kiểm tra Cấu trúc dữ liệu',
			date: '15 tháng 12, 2024',
			time: '3:30 chiều',
			duration: '45 phút',
			type: 'practice',
			status: 'upcoming',
			proctoring: false
		}
	],
	onRegisterExam,
	onViewExam,
	onStartExam
}: UpcomingExamsProps): JSX.Element {
	const navigate = useNavigate()
	const [showExamDetailModal, setShowExamDetailModal] = useState(false)
	const [showRegisterModal, setShowRegisterModal] = useState(false)
	const [showPreCheckModal, setShowPreCheckModal] = useState(false)
	const [selectedExam, setSelectedExam] = useState<UpcomingExam | null>(null)
	const [checklistItems, setChecklistItems] = useState({
		webcam: false,
		microphone: false,
		identity: false,
		agreement: false
	})

	const getTypeColor = (type: string) => {
		switch (type) {
			case 'certification':
				return 'var(--accent)'
			case 'scheduled':
				return 'var(--primary)'
			case 'practice':
				return 'var(--primary)'
			default:
				return 'var(--muted-foreground)'
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'ready':
				return <CheckCircle className={styles.statusIcon} style={{ color: 'var(--primary)' }} />
			case 'registered':
				return <Clock className={styles.statusIcon} style={{ color: 'var(--primary)' }} />
			case 'upcoming':
				return <AlertCircle className={styles.statusIcon} style={{ color: 'var(--accent)' }} />
			default:
				return null
		}
	}

	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'certification':
				return 'Chứng chỉ'
			case 'scheduled':
				return 'Đã lên lịch'
			case 'practice':
				return 'Luyện tập'
			default:
				return type
		}
	}

	const handleStartExam = (examId: string) => {
		const exam = exams.find(e => e.id === examId)
		if (exam) {
			setSelectedExam(exam)
			if (exam.proctoring) {
				// Show pre-check modal for proctored exams
				setShowPreCheckModal(true)
			} else {
				// Navigate to pre-check page directly for non-proctored exams
				navigate(`/exam/${examId}/pre-check`)
				onStartExam?.(examId)
			}
		}
	}

	const handleViewExam = (examId: string) => {
		const exam = exams.find(e => e.id === examId)
		if (exam) {
			setSelectedExam(exam)
			setShowExamDetailModal(true)
			onViewExam?.(examId)
		}
	}

	const handleRegisterExam = (examId: string) => {
		const exam = exams.find(e => e.id === examId)
		if (exam) {
			setSelectedExam(exam)
			setShowRegisterModal(true)
		}
	}

	const handleConfirmRegistration = () => {
		if (selectedExam) {
			onRegisterExam?.(selectedExam.id)
			setShowRegisterModal(false)
			// Update exam status to registered (in real app, this would come from backend)
			alert('Đã đăng ký thành công!')
		}
	}

	const handleViewSchedule = () => {
		navigate('/user/exams/schedule')
	}

	const handleProceedToExam = () => {
		if (selectedExam && allChecksPassed()) {
			setShowPreCheckModal(false)
			navigate(`/exam/${selectedExam.id}/pre-check`)
			onStartExam?.(selectedExam.id)
		}
	}

	const allChecksPassed = () => {
		return Object.values(checklistItems).every(value => value === true)
	}

	const toggleChecklistItem = (key: keyof typeof checklistItems) => {
		setChecklistItems(prev => ({
			...prev,
			[key]: !prev[key]
		}))
	}

	const getActionButton = (exam: UpcomingExam) => {
		// Nếu bài thi đã bị dừng, không hiển thị nút hành động
		if (exam.isStopped) {
			return (
				<div className={`${styles.actionButton} ${styles.actionButtonStopped}`}>
					Đã bị dừng
				</div>
			)
		}
		
		switch (exam.status) {
			case 'ready':
				return (
					<button
						onClick={() => handleStartExam(exam.id)}
						className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
					>
						Bắt đầu thi
					</button>
				)
			case 'registered':
				return (
					<button
						onClick={() => handleStartExam(exam.id)}
						className={`${styles.actionButton} ${styles.actionButtonAccent}`}
					>
						Tiếp tục làm bài
					</button>
				)
			case 'upcoming':
				return (
					<button
						onClick={() => handleRegisterExam(exam.id)}
						className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
					>
						Đăng ký
					</button>
				)
			default:
				return null
		}
	}

	return (
		<>
			<div className={`card stagger-load hover-lift interactive ${styles.container}`}>
				<div className={styles.header}>
					<h3 className={styles.headerTitle}>
						<Calendar className={styles.headerIcon} />
						Bài thi sắp tới
					</h3>
					<button
						onClick={handleViewSchedule}
						className={styles.viewScheduleButton}
					>
						Xem lịch
					</button>
				</div>

				<div className={styles.examList}>
					<div className={styles.examListContainer}>
						{exams.map((exam) => (
							<div
								key={exam.id}
								className={styles.examCard}
							>
								<div className={styles.examCardHeader}>
									<div className={styles.examCardContent}>
										<div className={styles.examCardTitleRow}>
											{getStatusIcon(exam.status)}
											<h4 className={styles.examTitle}>
												{exam.title}
											</h4>
										</div>
										<div className={styles.examMeta}>
											<Calendar className={styles.examMetaIcon} />
											{exam.date} lúc {exam.time}
										</div>
										<div className={styles.examMeta}>
											<Clock className={styles.examMetaIcon} />
											{exam.duration}
											{exam.proctoring && (
												<span className={styles.proctoringBadge}>
													Giám sát
												</span>
											)}
										</div>
									</div>

									<div className={styles.examTypeBadge}>
										<span
											className={styles.typeLabel}
											style={{
												background: getTypeColor(exam.type) + '20',
												color: getTypeColor(exam.type)
											}}
										>
											{getTypeLabel(exam.type)}
										</span>
									</div>
								</div>

								<div className={styles.examCardActions}>
									{getActionButton(exam)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Exam Detail Modal */}
			{showExamDetailModal && selectedExam && (
				<div className={styles.modalOverlay} onClick={() => setShowExamDetailModal(false)}>
					<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => setShowExamDetailModal(false)}
							className={styles.modalCloseButton}
						>
							<X className={styles.modalCloseIcon} />
						</button>

						<div className={styles.modalHeader}>
							<Calendar className={styles.modalIcon} />

							<h2 className={styles.modalTitle}>
								{selectedExam.title}
							</h2>

							<span
								className={styles.modalTypeBadge}
								style={{
									background: getTypeColor(selectedExam.type) + '20',
									color: getTypeColor(selectedExam.type)
								}}
							>
								{getTypeLabel(selectedExam.type)}
							</span>

							<div className={styles.modalInfoBox}>
								<div className={styles.modalInfoItem}>
									<Calendar className={styles.modalInfoIcon} />
									<span><strong>Ngày thi:</strong> {selectedExam.date}</span>
								</div>
								<div className={styles.modalInfoItem}>
									<Clock className={styles.modalInfoIcon} />
									<span><strong>Giờ:</strong> {selectedExam.time}</span>
								</div>
								<div className={styles.modalInfoItem}>
									<Clock className={styles.modalInfoIcon} />
									<span><strong>Thời lượng:</strong> {selectedExam.duration}</span>
								</div>
								{selectedExam.proctoring && (
									<div className={styles.modalInfoItem}>
										<Shield className={`${styles.modalInfoIcon} ${styles.modalInfoIconDestructive}`} />
										<span><strong>Giám sát:</strong> Có (camera & micro)</span>
									</div>
								)}
							</div>

							<button
								onClick={() => setShowExamDetailModal(false)}
								className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
							>
								Đã hiểu
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Register Modal */}
			{showRegisterModal && selectedExam && (
				<div className={styles.modalOverlay} onClick={() => setShowRegisterModal(false)}>
					<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => setShowRegisterModal(false)}
							className={styles.modalCloseButton}
						>
							<X className={styles.modalCloseIcon} />
						</button>

						<div className={styles.modalHeader}>
							<Info className={styles.modalIcon} />

							<h2 className={styles.modalTitle}>
								Xác nhận đăng ký
							</h2>

							<p className={styles.modalDescription}>
								Bạn muốn đăng ký tham gia kỳ thi này?
							</p>

							<div className={styles.modalInfoBox}>
								<h3 className={styles.modalInfoTitle}>
									{selectedExam.title}
								</h3>
								<p className={styles.modalInfoText}>
									📅 {selectedExam.date} lúc {selectedExam.time}
								</p>
								<p className={styles.modalInfoText}>
									⏱️ {selectedExam.duration}
								</p>
								{selectedExam.proctoring && (
									<p className={`${styles.modalInfoText} ${styles.modalInfoTextDestructive}`}>
										🔒 Bài thi có giám sát
									</p>
								)}
							</div>

							<div className={styles.modalButtonGroup}>
								<button
									onClick={() => setShowRegisterModal(false)}
									className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
								>
									Hủy
								</button>
								<button
									onClick={handleConfirmRegistration}
									className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
								>
									Xác nhận
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Pre-Check Modal for Proctored Exams */}
			{showPreCheckModal && selectedExam && selectedExam.proctoring && (
				<div 
					className={styles.modalOverlay} 
					onClick={() => {
						setShowPreCheckModal(false)
						setChecklistItems({
							webcam: false,
							microphone: false,
							identity: false,
							agreement: false
						})
					}}
				>
					<div className={`${styles.modalContent} ${styles.modalContentLarge}`} onClick={(e) => e.stopPropagation()}>
						<button
							onClick={() => {
								setShowPreCheckModal(false)
								setChecklistItems({
									webcam: false,
									microphone: false,
									identity: false,
									agreement: false
								})
							}}
							className={styles.modalCloseButton}
						>
							<X className={styles.modalCloseIcon} />
						</button>

						<div className={styles.modalHeader}>
							<Shield className={styles.modalIcon} />

							<h2 className={styles.modalTitle}>
								Kiểm tra trước khi thi
							</h2>

							<p className={styles.modalDescription}>
								Bài thi này yêu cầu giám sát. Vui lòng xác nhận các mục sau:
							</p>

							<div className={styles.checklistContainer}>
								{/* Webcam Check */}
								<div
									onClick={() => toggleChecklistItem('webcam')}
									className={`${styles.checklistItem} ${checklistItems.webcam ? styles.checklistItemChecked : ''}`}
								>
									<div className={`${styles.checklistCheckbox} ${checklistItems.webcam ? styles.checklistCheckboxChecked : ''}`}>
										{checklistItems.webcam && <CheckCircle className={styles.checklistCheckIcon} />}
									</div>
									<Camera className={styles.checklistItemIcon} />
									<span className={styles.checklistItemText}>Webcam hoạt động tốt</span>
								</div>

								{/* Microphone Check */}
								<div
									onClick={() => toggleChecklistItem('microphone')}
									className={`${styles.checklistItem} ${checklistItems.microphone ? styles.checklistItemChecked : ''}`}
								>
									<div className={`${styles.checklistCheckbox} ${checklistItems.microphone ? styles.checklistCheckboxChecked : ''}`}>
										{checklistItems.microphone && <CheckCircle className={styles.checklistCheckIcon} />}
									</div>
									<Mic className={styles.checklistItemIcon} />
									<span className={styles.checklistItemText}>Microphone hoạt động tốt</span>
								</div>

								{/* Identity Check */}
								<div
									onClick={() => toggleChecklistItem('identity')}
									className={`${styles.checklistItem} ${checklistItems.identity ? styles.checklistItemChecked : ''}`}
								>
									<div className={`${styles.checklistCheckbox} ${checklistItems.identity ? styles.checklistCheckboxChecked : ''}`}>
										{checklistItems.identity && <CheckCircle className={styles.checklistCheckIcon} />}
									</div>
									<User className={styles.checklistItemIcon} />
									<span className={styles.checklistItemText}>Tôi đã chuẩn bị giấy tờ tùy thân</span>
								</div>

								{/* Agreement Check */}
								<div
									onClick={() => toggleChecklistItem('agreement')}
									className={`${styles.checklistItem} ${checklistItems.agreement ? styles.checklistItemChecked : ''}`}
								>
									<div className={`${styles.checklistCheckbox} ${checklistItems.agreement ? styles.checklistCheckboxChecked : ''}`}>
										{checklistItems.agreement && <CheckCircle className={styles.checklistCheckIcon} />}
									</div>
									<Shield className={styles.checklistItemIcon} />
									<span className={styles.checklistItemText}>Tôi đồng ý với quy định thi</span>
								</div>
							</div>

							{!allChecksPassed() && (
								<div className={styles.checklistWarning}>
									<AlertCircle className={styles.checklistWarningIcon} />
									Vui lòng hoàn thành tất cả các mục kiểm tra
								</div>
							)}

							<button
								onClick={handleProceedToExam}
								disabled={!allChecksPassed()}
								className={`${styles.checklistProceedButton} ${allChecksPassed() ? styles.checklistProceedButtonEnabled : ''}`}
							>
								Bắt đầu thi
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
