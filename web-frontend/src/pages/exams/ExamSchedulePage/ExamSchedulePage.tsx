import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, BookOpen, Users, Search } from 'lucide-react'
import { useExamSchedule } from '@/features/exams/hooks'
import { examService } from '@/features/exams/api'
import styles from './ExamSchedulePage.module.css'

interface FilterOptions {
	timeRange: 'all' | 'today' | 'week' | 'month'
	status: 'all' | 'upcoming' | 'ongoing' | 'completed'
	searchQuery: string
}

export default function ExamSchedulePage(): JSX.Element {
	const navigate = useNavigate()
	const [filters, setFilters] = useState<FilterOptions>({
		timeRange: 'all',
		status: 'all',
		searchQuery: ''
	})
	const [submissions, setSubmissions] = useState<any[]>([])

	const { schedules, loading, error } = useExamSchedule(filters)

	useEffect(() => {
		const loadSubmissions = async () => {
			try {
				const subs = await examService.getMySubmissions()
				setSubmissions(subs)
			} catch (err) {
				console.error('Error loading submissions:', err)
			}
		}
		loadSubmissions()
	}, [])

	const handleExamClick = async (examId: string, status: string) => {
		const submission = submissions.find((s: any) => s.quizId === examId)

		const hasValidSubmittedAt = submission?.submittedAt &&
			submission.submittedAt !== null &&
			submission.submittedAt !== '' &&
			submission.submittedAt !== 'null'

		if (hasValidSubmittedAt) {
			navigate(`/exam/${examId}/result`)
		} else {
			navigate(`/exam/${examId}/pre-check`)
		}
	}

	const getStatusBadge = (exam: any) => {
		const hasValidSubmittedAt = exam.submittedAt &&
			exam.submittedAt !== null &&
			exam.submittedAt !== '' &&
			exam.submittedAt !== 'null'

		if (hasValidSubmittedAt) {
			return (
				<span className={`${styles.statusBadge} ${styles.completed}`}>
					Đã hoàn thành
				</span>
			)
		}

		const statusConfig: Record<string, { className: string; label: string }> = {
			upcoming: { className: styles.upcoming, label: 'Sắp diễn ra' },
			ongoing: { className: styles.ongoing, label: 'Đang diễn ra' },
			completed: { className: styles.default, label: 'Chưa làm' }
		}
		const config = statusConfig[exam.status] || statusConfig.upcoming

		return (
			<span className={`${styles.statusBadge} ${config.className}`}>
				{config.label}
			</span>
		)
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		const today = new Date()
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		if (date.toDateString() === today.toDateString()) {
			return `Hôm nay, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
		}
		if (date.toDateString() === tomorrow.toDateString()) {
			return `Ngày mai, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
		}

		return date.toLocaleString('vi-VN', {
			weekday: 'short',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<div className={styles.page}>
			{/* Header */}
			<div className={styles.header}>
				<h1 className={styles.title}>
					Lịch Thi
				</h1>
				<p className={styles.subtitle}>
					Quản lý và theo dõi lịch trình các kỳ thi của bạn
				</p>
			</div>

			{/* Filters */}
			<div className={styles.filtersContainer}>
				{/* Search */}
				<div className={styles.searchContainer}>
					<Search className={styles.searchIcon} />
					<input
						type="text"
						placeholder="Tìm kiếm bài thi..."
						value={filters.searchQuery}
						onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
						className={styles.searchInput}
					/>
				</div>

				{/* Filter Row - Time Range and Status */}
				<div className={styles.filterRow}>
					{/* Time Range Filter */}
					<div className={styles.filterSelect}>
						<select
							value={filters.timeRange}
							onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as any })}
						>
							<option value="all">Tất cả thời gian</option>
							<option value="today">Hôm nay</option>
							<option value="week">Tuần này</option>
							<option value="month">Tháng này</option>
						</select>
					</div>

					{/* Status Filter */}
					<div className={styles.filterSelect}>
						<select
							value={filters.status}
							onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
						>
							<option value="all">Tất cả trạng thái</option>
							<option value="upcoming">Sắp diễn ra</option>
							<option value="ongoing">Đang diễn ra</option>
							<option value="completed">Đã kết thúc</option>
						</select>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className={styles.loadingContainer}>
					<div className={styles.loadingSpinner} />
					<p className={styles.loadingText}>
						Đang tải lịch thi...
					</p>
				</div>
			)}

			{/* Error State */}
			{error && (
				<div className={styles.errorContainer}>
					{error}
				</div>
			)}

			{/* Exam Schedule List */}
			{!loading && !error && schedules.length === 0 && (
				<div className={styles.emptyState}>
					<Calendar className={styles.emptyStateIcon} />
					<p className={styles.emptyStateTitle}>
						Không có lịch thi nào
					</p>
					<p className={styles.emptyStateText}>
						Thay đổi bộ lọc hoặc kiểm tra lại sau
					</p>
				</div>
			)}

			{!loading && !error && schedules.length > 0 && (
				<div className={styles.examList}>
					{schedules.map((exam) => (
						<div
							key={exam.id}
							onClick={() => handleExamClick(exam.id, exam.status)}
							className={styles.examCard}
						>
							{/* Date Box */}
							<div className={styles.examCardHeader}>
								<div className={styles.dateBox}>
									<div className={styles.dateNumber}>
										{new Date(exam.scheduledDate || exam.startTime || '').getDate()}
									</div>
									<div className={styles.dateMonth}>
										Tháng {new Date(exam.scheduledDate || exam.startTime || '').getMonth() + 1}
									</div>
								</div>

								{/* Exam Title and Badge */}
								<div className={styles.examTitleSection}>
									<div className={styles.examTitleContainer}>
										<h3 className={styles.examTitle}>
											{exam.title}
										</h3>
										{getStatusBadge(exam)}
									</div>
								</div>
							</div>

							{/* Exam Info */}
							<div className={styles.examInfo}>
								<p className={styles.examDescription}>
									{exam.description || 'Không có mô tả'}
								</p>

								<div className={styles.examMeta}>
									<div className={styles.examMetaItem}>
										<Clock />
										<span>{formatDate(exam.scheduledDate || exam.startTime || '')}</span>
									</div>
									<div className={styles.examMetaItem}>
										<BookOpen />
										<span>{exam.questionCount || exam.questions?.length || 0} câu hỏi</span>
									</div>
									<div className={styles.examMetaItem}>
										<Clock />
										<span>{exam.duration || exam.timeLimit || 60} phút</span>
									</div>
									{exam.participantCount && (
										<div className={styles.examMetaItem}>
											<Users />
											<span>{exam.participantCount} người tham gia</span>
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
