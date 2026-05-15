import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { examService } from '@/features/exams/api';
import { ExamDetails } from '@/foundation/types';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './ExamPage.module.css';

interface ExamWithStatus extends ExamDetails {
	status?: 'not-started' | 'in-progress' | 'completed';
	score?: number;
	submissionId?: string;
}

export default function ExamPage(): JSX.Element {
	const navigate = useNavigate();
	const [exams, setExams] = useState<ExamWithStatus[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hasFetched, setHasFetched] = useState(false);

	useEffect(() => {
		if (!hasFetched) {
			loadExams();
			setHasFetched(true);
		}
	}, [hasFetched]);

	const loadExams = async () => {
		try {
			setLoading(true);
			setError(null);

			const allExams = await examService.getAllExams();
			const submissions = await examService.getMySubmissions();

			const examsWithStatus: ExamWithStatus[] = allExams.map(exam => {
				const submission = submissions.find((s: any) => s.quizId === exam.id);

				if (submission) {
					const hasValidSubmittedAt = submission.submittedAt &&
						submission.submittedAt !== null &&
						submission.submittedAt !== '' &&
						submission.submittedAt !== 'null';

					if (hasValidSubmittedAt) {
						return {
							...exam,
							status: 'completed' as const,
							score: submission.score,
							submissionId: submission.id
						};
					} else {
						return {
							...exam,
							status: 'in-progress' as const,
							submissionId: submission.id
						};
					}
				}

				return {
					...exam,
					status: 'not-started' as const
				};
			});

			setExams(examsWithStatus);
		} catch (err) {
			console.error('Error loading exams:', err);
			setError('Không thể tải danh sách bài thi');
		} finally {
			setLoading(false);
		}
	};

	const handleStartExam = (examId: string) => {
		navigate(`/exam/${examId}/pre-check`);
	};

	const handleViewResult = (examId: string, submissionId: string) => {
		navigate(`/exam/${examId}/result`);
	};

	const handleContinueExam = (examId: string) => {
		navigate(`/exam/${examId}`);
	};

	const getStatusBadge = (status?: string) => {
		switch (status) {
			case 'completed':
				return (
					<span className={`${styles.statusBadge} ${styles.completed}`}>
						<CheckCircle />
						Đã hoàn thành
					</span>
				);
			case 'in-progress':
				return (
					<span className={`${styles.statusBadge} ${styles.inProgress}`}>
						<AlertCircle />
						Đang làm
					</span>
				);
			default:
				return (
					<span className={`${styles.statusBadge} ${styles.notStarted}`}>
						<Calendar />
						Chưa làm
					</span>
				);
		}
	};

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<div className={styles.loadingContent}>
					<div className={styles.spinner} />
					<p className={styles.loadingText}>Đang tải danh sách bài thi...</p>
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
					<Button onClick={loadExams} variant="primary">Thử lại</Button>
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
						Danh sách bài thi
					</h1>
					<p className={styles.subtitle}>
						Chọn bài thi để bắt đầu làm bài hoặc xem lại kết quả
					</p>
				</div>

				{/* Exams Grid */}
				{exams.length === 0 ? (
					<div className={styles.emptyState}>
						<FileText />
						<h3>Chưa có bài thi nào</h3>
						<p>
							Hiện tại chưa có bài thi nào được phân công cho bạn
						</p>
					</div>
				) : (
					<div className={styles.examsGrid}>
						{exams.map((exam) => (
							<div
								key={exam.id}
								className={styles.examCard}
							>
								{/* Status Badge */}
								<div className={styles.statusBadgeContainer}>
									{getStatusBadge(exam.status)}
								</div>

								{/* Exam Title */}
								<h3 className={styles.examTitle}>
									{exam.title}
								</h3>

								{/* Description */}
								<p className={styles.examDescription}>
									{exam.description || 'Không có mô tả'}
								</p>

								{/* Exam Info */}
								<div className={styles.examInfo}>
									<div className={styles.examInfoItem}>
										<Clock />
										<span>
											Thời gian: {exam.duration} phút
										</span>
									</div>
									<div className={styles.examInfoItem}>
										<FileText />
										<span>
											Số câu hỏi: {exam.totalQuestions}
										</span>
									</div>
									{exam.status === 'completed' && exam.score !== undefined && (
										<div className={styles.examInfoItem}>
											<CheckCircle className={styles.scoreIcon} />
											<span className={styles.score}>
												Điểm: {exam.score}/100
											</span>
										</div>
									)}
								</div>

								{/* Actions */}
								<div className={styles.examActions}>
									{exam.status === 'not-started' && (
										<Button
											onClick={() => handleStartExam(exam.id)}
											variant="primary"
										>
											Bắt đầu làm bài
										</Button>
									)}
									{exam.status === 'in-progress' && (
										<Button
											onClick={() => handleContinueExam(exam.id)}
											variant="primary"
										>
											Tiếp tục làm bài
										</Button>
									)}
									{exam.status === 'completed' && exam.submissionId && (
										<Button
											onClick={() => handleViewResult(exam.id, exam.submissionId!)}
											variant="secondary"
										>
											Xem kết quả
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
