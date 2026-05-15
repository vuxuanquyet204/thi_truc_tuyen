import { useState, useEffect } from 'react';
import { onlineExamApi, type Quiz } from '@/features/exams/api';
import { examService } from '@/features/exams/api';
import { proctoringApi } from '@/features/proctoring/api';

interface UpcomingExam {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'scheduled' | 'practice' | 'certification';
  status: 'upcoming' | 'registered' | 'ready';
  proctoring?: boolean;
  isStopped?: boolean;
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<UpcomingExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (hasFetched) return;

    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await onlineExamApi.getAllQuizzes();
        const submissions = await examService.getMySubmissions();
        let terminatedSessions: string[] = [];
        try {
          const allSessions = await proctoringApi.getAllSessions();
          const userIdStr = localStorage.getItem('userId') || localStorage.getItem('user_id');
          const userId = userIdStr ? Number(userIdStr) : null;
          if (userId) {
            terminatedSessions = allSessions
              .filter(session =>
                session.status === 'terminated' &&
                session.userId === userId
              )
              .map(session => String(session.examId));
            if (terminatedSessions.length > 0) {
              console.log('[useQuizzes] Found terminated sessions:', terminatedSessions);
            }
          }
        } catch (err) {
          console.warn('Error fetching proctoring sessions:', err);
        }

        const transformedQuizzes = data
          .map((quiz: Quiz): UpcomingExam | null => {
            const resolveDurationMinutes = (): number => {
              const extendedQuiz = quiz as Quiz & {
                duration?: number | string | null;
                durationMinutes?: number | string | null;
                timeLimit?: number | string | null;
                examDuration?: number | string | null;
              };
              const candidates: Array<number | string | null | undefined> = [
                quiz.timeLimitMinutes,
                extendedQuiz.durationMinutes,
                extendedQuiz.duration,
                extendedQuiz.timeLimit,
                extendedQuiz.examDuration
              ];
              const firstValid = candidates.find(
                (value) => value !== undefined && value !== null && value !== ''
              );
              if (firstValid === undefined) {
                return 60;
              }
              const parsed =
                typeof firstValid === 'string'
                  ? parseInt(firstValid, 10)
                  : Number(firstValid);
              if (!Number.isFinite(parsed) || parsed <= 0) {
                return 60;
              }
              return parsed;
            };

            const submission = submissions.find((s: any) => s.quizId === quiz.id);
            const hasValidSubmittedAt = submission?.submittedAt &&
              submission.submittedAt !== null &&
              submission.submittedAt !== '' &&
              submission.submittedAt !== 'null';
            if (hasValidSubmittedAt) {
              return null;
            }
            let status: 'upcoming' | 'registered' | 'ready' = 'ready';
            if (submission) {
              status = 'registered';
            }
            const quizIdStr = String(quiz.id);
            const isStopped = terminatedSessions.includes(quizIdStr);
            if (isStopped) {
              console.log('[useQuizzes] Exam stopped:', quizIdStr, quiz.title);
            }
            return {
              id: quiz.id,
              title: quiz.title,
              date: 'Hôm nay',
              time: '2:00 chiều',
              duration: `${resolveDurationMinutes()} phút`,
              type: 'practice' as const,
              status,
              proctoring: false,
              isStopped
            };
          })
          .filter((quiz): quiz is UpcomingExam => quiz !== null) as UpcomingExam[];
        setQuizzes(transformedQuizzes);
        setError(null);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Không thể tải danh sách bài thi');
        setQuizzes([
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
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
    setHasFetched(true);
  }, [hasFetched]);

  return { quizzes, loading, error };
}
