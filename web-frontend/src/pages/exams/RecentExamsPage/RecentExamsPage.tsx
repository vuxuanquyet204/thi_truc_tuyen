import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Award, ArrowRight, Calendar, FileText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentSubmissions } from '@/features/exams/hooks';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './RecentExamsPage.module.css';

export default function RecentExamsPage(): JSX.Element {
	const navigate = useNavigate();
	const { exams, loading, error, refetch } = useRecentSubmissions();

	// Filter and pagination state
	const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed' | 'in-progress'>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 5;

	// Calculate statistics
	const stats = {
		total: exams.length,
		completed: exams.filter(e => e.status === 'completed').length,
		failed: exams.filter(e => e.status === 'failed').length,
		inProgress: exams.filter(e => e.status === 'in-progress').length,
		avgScore: exams.length > 0
			? Math.round(exams.reduce((acc, e) => acc + (e.score || 0), 0) / exams.filter(e => e.score).length)
			: 0
	};

	// Filter exams based on status
	const filteredExams = useMemo(() => {
		if (filterStatus === 'all') return exams;
		return exams.filter(exam => exam.status === filterStatus);
	}, [exams, filterStatus]);

	// Pagination
	const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
	const paginatedExams = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		return filteredExams.slice(startIndex, startIndex + itemsPerPage);
	}, [filteredExams, currentPage]);

	// Reset to page 1 when filter changes
	const handleFilterChange = (status: typeof filterStatus) => {
		setFilterStatus(status);
		setCurrentPage(1);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return <CheckCircle size={20} className={styles.statusIconCompleted} />;
			case 'failed':
				return <XCircle size={20} className={styles.statusIconFailed} />;
			case 'in-progress':
				return <AlertCircle size={20} className={styles.statusIconInProgress} />;
			default:
				return <Clock size={20} className={styles.statusIconDefault} />;
		}
	};

	const getStatusBadge = (status: string) => {
		const statusTexts = {
			completed: 'Hoàn thành',
			failed: 'Chưa đạt',
			'in-progress': 'Đang làm'
		};

		const text = statusTexts[status as keyof typeof statusTexts] || 'Chưa xác định';
		const badgeClass = status === 'completed' ? styles.statusBadgeCompleted :
			status === 'failed' ? styles.statusBadgeFailed :
			status === 'in-progress' ? styles.statusBadgeInProgress : '';

		return (
			<span className={`${styles.statusBadge} ${badgeClass}`}>
				{getStatusIcon(status)}
				{text}
			</span>
		);
	};

	const handleViewResult = (examId: string, submissionId: string) => {
		navigate(`/exam/${examId}/result`);
	};

	const handleContinueExam = (examId: string) => {
		navigate(`/exam/${examId}`);
	};

	const handleViewAllExams = () => {
		navigate('/user/exam');
	};

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loadingContent}>
					<div className={styles.loadingSpinner} />
					<p className={styles.loadingText}>Đang tải bài thi gần đây...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.errorContainer}>
				<div className={styles.errorCard}>
					<AlertCircle className={styles.errorIcon} />
					<h2 className={styles.errorTitle}>Lỗi</h2>
					<p className={styles.errorMessage}>{error}</p>
					<Button onClick={refetch} variant="primary">Thử lại</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				{/* Header */}
				<div className={styles.header}>
					<h1 className={styles.title}>
						<TrendingUp />
						Bài thi gần đây
					</h1>
					<p className={styles.subtitle}>
						Xem lại các bài thi bạn đã làm và theo dõi tiến độ học tập
					</p>
				</div>

				{/* Statistics Cards */}
				<div className={styles.statsGrid}>
					<div className={`${styles.statCard} ${styles.statCardPurple}`}>
						<div className={styles.statHeader}>
							<FileText />
							<span className={styles.statLabel}>Tổng số bài</span>
						</div>
						<div className={styles.statValue}>{stats.total}</div>
					</div>

					<div className={`${styles.statCard} ${styles.statCardGreen}`}>
						<div className={styles.statHeader}>
							<CheckCircle />
							<span className={styles.statLabel}>Hoàn thành</span>
						</div>
						<div className={styles.statValue}>{stats.completed}</div>
					</div>

					<div className={`${styles.statCard} ${styles.statCardRed}`}>
						<div className={styles.statHeader}>
							<XCircle />
							<span className={styles.statLabel}>Chưa đạt</span>
						</div>
						<div className={styles.statValue}>{stats.failed}</div>
					</div>

					<div className={`${styles.statCard} ${styles.statCardOrange}`}>
						<div className={styles.statHeader}>
							<Award />
							<span className={styles.statLabel}>Điểm TB</span>
						</div>
						<div className={styles.statValue}>{stats.avgScore}</div>
					</div>
				</div>

				{/* Filter Bar */}
				{exams.length > 0 && (
					<div className={styles.filterBar}>
						<div className={styles.filterLabel}>
							<Filter />
							<span className={styles.filterLabelText}>Lọc:</span>
						</div>

						{[
							{ value: 'all', label: 'Tất cả', count: stats.total },
							{ value: 'completed', label: 'Hoàn thành', count: stats.completed },
							{ value: 'failed', label: 'Chưa đạt', count: stats.failed },
							{ value: 'in-progress', label: 'Đang làm', count: stats.inProgress }
						].map(filter => (
							<button
								key={filter.value}
								onClick={() => handleFilterChange(filter.value as typeof filterStatus)}
								className={`${styles.filterButton} ${filterStatus === filter.value ? styles.filterButtonActive : ''}`}
							>
								<span>{filter.label}</span>
								<span className={styles.filterCount}>
									{filter.count}
								</span>
							</button>
						))}
					</div>
				)}

				{/* Exams List */}
				{filteredExams.length === 0 ? (
					<div className={styles.emptyState}>
						<FileText className={styles.emptyStateIcon} />
						<h3 className={styles.emptyStateTitle}>
							{exams.length === 0 ? 'Chưa có bài thi nào' : 'Không tìm thấy bài thi'}
						</h3>
						<p className={styles.emptyStateText}>
							{exams.length === 0
								? 'Bạn chưa làm bài thi nào. Hãy bắt đầu làm bài thi đầu tiên!'
								: `Không có bài thi nào với trạng thái "${filterStatus === 'completed' ? 'Hoàn thành' : filterStatus === 'failed' ? 'Chưa đạt' : 'Đang làm'}"`
							}
						</p>
						{exams.length === 0 && (
							<Button onClick={handleViewAllExams} variant="primary">
								Xem danh sách bài thi
							</Button>
						)}
					</div>
				) : (
					<>
						<div className={styles.examsListHeader}>
							<h2 className={styles.examsListTitle}>
								Lịch sử làm bài ({filteredExams.length})
							</h2>
							<Button
								onClick={handleViewAllExams}
								variant="outline"
								className={styles.viewAllButton}
							>
								Xem tất cả bài thi <ArrowRight />
							</Button>
						</div>

						<div className={styles.examsList}>
							{paginatedExams.map((exam) => (
								<div
									key={exam.id}
									className={styles.examCard}
								>
									<div className={styles.examCardContent}>
										{/* Left: Exam Info */}
										<div className={styles.examInfo}>
											<div className={styles.examBadges}>
												{getStatusBadge(exam.status)}
												{exam.certificate && (
													<span className={styles.certificateBadge}>
														<Award />
														Đủ điều kiện nhận chứng chỉ
													</span>
												)}
											</div>

											<h3 className={styles.examTitle}>
												{exam.title}
											</h3>

											<div className={styles.examMeta}>
												<div className={styles.examMetaItem}>
													<Calendar />
													<span>{exam.date}</span>
												</div>
												<div className={styles.examMetaItem}>
													<Clock />
													<span>{exam.duration}</span>
												</div>
												{exam.score !== undefined && (
													<div className={`${styles.examMetaItem} ${styles.examScore} ${exam.status === 'completed' ? styles.examScoreCompleted : styles.examScoreFailed}`}>
														<Award />
														<span>{exam.score}/{exam.maxScore} điểm</span>
													</div>
												)}
											</div>
										</div>

										{/* Right: Actions */}
										<div className={styles.examActions}>
											{exam.status === 'in-progress' && (
												<Button
													onClick={() => handleContinueExam(exam.quizId)}
													variant="primary"
													className={styles.examActionButton}
												>
													Tiếp tục làm bài
												</Button>
											)}
											{(exam.status === 'completed' || exam.status === 'failed') && (
												<Button
													onClick={() => handleViewResult(exam.quizId, exam.id)}
													variant="secondary"
													className={styles.examActionButton}
												>
													Xem kết quả
												</Button>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className={styles.pagination}>
								<button
									onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
									disabled={currentPage === 1}
									className={styles.paginationButton}
								>
									<ChevronLeft />
									Trước
								</button>

								<div className={styles.paginationNumbers}>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
										<button
											key={page}
											onClick={() => setCurrentPage(page)}
											className={`${styles.paginationNumber} ${currentPage === page ? styles.paginationNumberActive : ''}`}
										>
											{page}
										</button>
									))}
								</div>

								<button
									onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
									disabled={currentPage === totalPages}
									className={styles.paginationButton}
								>
									Sau
									<ChevronRight />
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
