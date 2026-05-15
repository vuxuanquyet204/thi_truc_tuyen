import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trophy, Award, Clock, CheckCircle, XCircle, Target, TrendingUp, Calendar, ArrowLeft, FileText, BarChart3 } from 'lucide-react';
import Button from '@/shared/ui/atoms/Button/Button';
import { RootState } from '@/foundation/store';
import { examService } from '@/features/exams/api';
import styles from './ExamResultPage.module.css';

interface ExamResultData {
  examId: string;
  examTitle?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  passed: boolean;
  submittedAt: string;
  percentile: number;
}

export default function ExamResultPage(): JSX.Element {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ExamResultData | null>(null);

  // Fetch result from API
  const fetchResultFromAPI = async () => {
    if (!examId) {
      setError('Thiếu thông tin bài thi');
      return;
    }

    try {
      const submissionIdFromUrl = searchParams.get('submissionId');

      let submissionId: string;

      if (submissionIdFromUrl) {
        submissionId = submissionIdFromUrl;
      } else {
        const submissions = await examService.getMySubmissions();
        const submission = submissions.find((s: any) => s.quizId === examId);

        if (!submission || !submission.submittedAt) {
          navigate(`/exam/${examId}/detail`, { replace: true });
          return;
        }

        submissionId = submission.id;
      }

      const apiResult = await examService.getExamResult(submissionId);

      const percentile = apiResult.percentile ?? (
        apiResult.score >= 90 ? 95 :
        apiResult.score >= 80 ? 85 :
        apiResult.score >= 70 ? 75 :
        apiResult.score >= 60 ? 60 : 40
      );

      const wrongAnswers = apiResult.wrongAnswers ?? (apiResult.totalQuestions - apiResult.correctAnswers);

      setResult({
        examId: apiResult.examId,
        examTitle: apiResult.quizTitle || apiResult.examTitle,
        score: apiResult.score,
        totalQuestions: apiResult.totalQuestions,
        correctAnswers: apiResult.correctAnswers,
        wrongAnswers,
        timeSpent: apiResult.timeSpent || 0,
        passed: apiResult.passed,
        submittedAt: apiResult.submittedAt,
        percentile
      });
    } catch (err: any) {
      console.error('Error fetching exam result:', err);
      if (err.response?.status === 404) {
        navigate(`/exam/${examId}/detail`, { replace: true });
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải kết quả bài thi';
        setError(errorMessage);
      }
    }
  };

  useEffect(() => {
    const loadResult = async () => {
      setLoading(true);
      setError(null);
      await fetchResultFromAPI();
      setLoading(false);
    };

    loadResult();
  }, [examId, searchParams]);

  const handleGoToDashboard = () => {
    navigate('/user/home');
  };

  const handleViewAnswers = () => {
    const submissionIdFromUrl = searchParams.get('submissionId');
    if (submissionIdFromUrl) {
      navigate(`/exam/${examId}/detail?submissionId=${submissionIdFromUrl}`);
    } else {
      navigate(`/exam/${examId}/detail`);
    }
  };

  const handleRetakeExam = () => {
    navigate(`/exam/${examId}/pre-check`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner} />
          <h2 className={styles.loadingTitle}>
            Đang tải kết quả...
          </h2>
          <p className={styles.loadingText}>
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <XCircle className={styles.errorIcon} />
          <h2 className={styles.errorTitle}>Lỗi</h2>
          <p className={styles.errorMessage}>{error}</p>
          <Button onClick={handleGoToDashboard} variant="secondary">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const scoreColor = result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444';
  const scoreBg = result.score >= 80 ? '#d1fae5' : result.score >= 60 ? '#fef3c7' : '#fee2e2';
  const circleProgress = (result.score / 100) * 251;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Kết quả bài thi
          </h1>
          <p className={styles.subtitle}>
            {result.examTitle || 'Bài thi'}
          </p>
        </div>

        {/* Main Result Card */}
        <div className={styles.mainResultCard}>
          {result.passed && (
            <div className={styles.backgroundPattern} />
          )}

          <div className={styles.contentWrapper}>
            {/* Score Circle with Animation */}
            <div className={styles.scoreCircleContainer}>
              <svg
                className={styles.scoreCircle}
                style={{
                  filter: result.passed ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.3))' : 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.3))'
                }}
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="var(--muted)"
                  strokeWidth="6"
                  fill="none"
                  opacity="0.2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={scoreColor}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${circleProgress} 251`}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dasharray 1s ease-out'
                  }}
                />
              </svg>

              <div className={styles.scoreCircleContent}>
                <div
                  className={styles.scoreValue}
                  style={{ color: scoreColor }}
                >
                  {result.score}%
                </div>
                <div className={styles.scoreLabel}>
                  Điểm số
                </div>
              </div>
            </div>

            {/* Result Status Badge */}
            <div className={`${styles.statusBadge} ${result.passed ? styles.passed : styles.failed}`}>
              {result.passed ? (
                <>
                  <Trophy />
                  ĐẠT
                </>
              ) : (
                <>
                  <XCircle />
                  KHÔNG ĐẠT
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.correct}`}>
                <CheckCircle />
                <div className={styles.statValue}>
                  {result.correctAnswers}
                </div>
                <div className={styles.statLabel}>
                  Câu Đúng
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.wrong}`}>
                <XCircle />
                <div className={styles.statValue}>
                  {result.wrongAnswers || result.totalQuestions - result.correctAnswers}
                </div>
                <div className={styles.statLabel}>
                  Câu sai
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.total}`}>
                <Target />
                <div className={styles.statValue}>
                  {result.totalQuestions}
                </div>
                <div className={styles.statLabel}>
                  Tổng câu hỏi
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.time}`}>
                <Clock />
                <div className={styles.statValue}>
                  {result.timeSpent}
                </div>
                <div className={styles.statLabel}>
                  Phút
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <Button
                onClick={handleGoToDashboard}
                variant="secondary"
                className={styles.actionButton}
              >
                <ArrowLeft />
                Về trang chủ
              </Button>

              <Button
                onClick={handleViewAnswers}
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'white'
                }}
                className={styles.actionButton}
              >
                <FileText />
                Xem chi tiết
              </Button>

              {!result.passed && (
                <Button
                  onClick={handleRetakeExam}
                  style={{
                    background: 'var(--gradient-accent)',
                    color: 'white'
                  }}
                  className={styles.actionButton}
                >
                  Thi lại
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Grid */}
        <div className={styles.infoGrid}>
          {/* Left Card - Exam Info */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              <BarChart3 />
              Thông tin bài thi
            </h3>

            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <div className={styles.infoItemLeft}>
                  <Clock />
                  <span className={styles.infoItemLabel}>Thời gian làm bài:</span>
                </div>
                <span className={styles.infoItemValue}>
                  {result.timeSpent} phút
                </span>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLeft}>
                  <Calendar />
                  <span className={styles.infoItemLabel}>Thời gian nộp:</span>
                </div>
                <span className={styles.infoItemValue}>
                  {new Date(result.submittedAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className={styles.infoItem}>
                <div className={styles.infoItemLeft}>
                  <TrendingUp />
                  <span className={styles.infoItemLabel}>Xếp hạng:</span>
                </div>
                <span className={styles.infoItemValue}>
                  Top {result.percentile}%
                </span>
              </div>

              <div
                className={`${styles.infoItem} ${styles.status}`}
                style={{
                  background: scoreBg,
                  border: `1px solid ${scoreColor}`
                }}
              >
                <div className={styles.infoItemLeft}>
                  {result.passed ? (
                    <CheckCircle style={{ color: scoreColor }} />
                  ) : (
                    <XCircle style={{ color: scoreColor }} />
                  )}
                  <span className={styles.infoItemLabel} style={{ color: scoreColor }}>
                    Trạng thái:
                  </span>
                </div>
                <span className={styles.infoItemValue} style={{ color: scoreColor }}>
                  {result.passed ? 'Đã hoàn thành' : 'Chưa đạt yêu cầu'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Card - Next Steps */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoCardTitle}>
              <Award />
              Tiếp theo
            </h3>

            {result.passed ? (
              <div>
                <div className={`${styles.messageCard} ${styles.success}`}>
                  <p className={styles.messageTitle}>
                    Chúc mừng! Bạn đã vượt qua bài thi.
                  </p>
                  <p className={styles.messageText}>
                    Kết quả tuyệt vời! Tiếp tục phát huy nhé.
                  </p>
                </div>

                <div className={styles.suggestionsCard}>
                  <h4 className={styles.suggestionsTitle}>
                    Gợi ý tiếp theo:
                  </h4>
                  <ul className={styles.suggestionsList}>
                    <li>Xem lại đáp án để cải thiện</li>
                    <li>Tải chứng chỉ của bạn</li>
                    <li>Thi thử các bài nâng cao hơn</li>
                    <li>Chia sẻ thành tích với bạn bè</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <div className={`${styles.messageCard} ${styles.error}`}>
                  <p className={styles.messageTitle}>
                    Đừng nản lòng!
                  </p>
                  <p className={styles.messageText}>
                    Bạn cần đạt ít nhất 70% để vượt qua. Hãy ôn tập và thử lại.
                  </p>
                </div>

                <div className={styles.suggestionsCard}>
                  <h4 className={styles.suggestionsTitle}>
                    Hãy thử:
                  </h4>
                  <ul className={styles.suggestionsList}>
                    <li>Xem lại đáp án để hiểu rõ hơn</li>
                    <li>Ôn tập lại kiến thức cần thiết</li>
                    <li>Làm bài tập thêm</li>
                    <li>Thử lại sau khi đã chuẩn bị kỹ</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className={styles.performanceCard}>
          <h3 className={styles.performanceTitle}>
            <TrendingUp />
            Chi tiết kết quả
          </h3>

          <div className={styles.performanceGrid}>
            <div className={styles.performanceItem}>
              <div className={`${styles.performanceValue} ${styles.accuracy}`}>
                {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
              </div>
              <div className={styles.performanceLabel}>
                Độ chính xác
              </div>
            </div>

            <div className={styles.performanceItem}>
              <div className={`${styles.performanceValue} ${styles.speed}`}>
                {(result.timeSpent / result.totalQuestions).toFixed(1)}
              </div>
              <div className={styles.performanceLabel}>
                Phút/câu
              </div>
            </div>

            <div className={styles.performanceItem}>
              <div className={`${styles.performanceValue} ${styles.rank}`}>
                {result.percentile}%
              </div>
              <div className={styles.performanceLabel}>
                Xếp hạng
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
