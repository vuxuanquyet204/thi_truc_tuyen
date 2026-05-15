import { useState, useEffect } from 'react';
import { getAllQuizzes, getMyAllSubmissions } from '@/features/exams/api';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  timeLimitMinutes?: number;
  duration?: number;
  questions?: any[];
  questionCount?: number;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  participantCount?: number;
  hasSubmission?: boolean;
  submittedAt?: string;
}

interface FilterOptions {
  timeRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'upcoming' | 'ongoing' | 'completed';
  searchQuery: string;
}

export function useExamSchedule(filters: FilterOptions) {
  const [schedules, setSchedules] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched || filters.timeRange !== 'all' || filters.status !== 'all' || filters.searchQuery !== '') {
      fetchSchedules();
      setHasFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.timeRange, filters.status, filters.searchQuery]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      let quizzes = await getAllQuizzes();

      let submissions: any[] = [];
      try {
        submissions = await getMyAllSubmissions();
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }

      quizzes = quizzes.map((quiz: Quiz, index: number) => {
        const now = new Date();

        const submission = submissions.find((s: any) => s.quizId === quiz.id);

        let status: 'upcoming' | 'ongoing' | 'completed' = 'ongoing';

        const hasValidSubmittedAt = submission?.submittedAt &&
          submission.submittedAt !== null &&
          submission.submittedAt !== '' &&
          submission.submittedAt !== 'null';

        if (hasValidSubmittedAt) {
          status = 'completed';
        } else if (submission) {
          status = 'ongoing';
        } else {
          status = 'ongoing';
        }

        const scheduledDate = quiz.scheduledDate || new Date().toISOString();

        return {
          ...quiz,
          scheduledDate,
          startTime: scheduledDate,
          status,
          questionCount: quiz.questions?.length || 0,
          duration: quiz.timeLimit || quiz.timeLimitMinutes || 60,
          participantCount: quiz.participantCount || 0,
          hasSubmission: !!submission,
          submittedAt: submission?.submittedAt
        };
      });

      let filtered = quizzes;

      if (filters.status !== 'all') {
        filtered = filtered.filter((q: Quiz) => q.status === filters.status);
      }

      if (filters.timeRange !== 'all') {
        const now = new Date();
        filtered = filtered.filter((q: Quiz) => {
          const examDate = new Date(q.scheduledDate || q.startTime || '');

          switch (filters.timeRange) {
            case 'today':
              return examDate.toDateString() === now.toDateString();
            case 'week':
              const weekFromNow = new Date(now);
              weekFromNow.setDate(weekFromNow.getDate() + 7);
              return examDate >= now && examDate <= weekFromNow;
            case 'month':
              const monthFromNow = new Date(now);
              monthFromNow.setMonth(monthFromNow.getMonth() + 1);
              return examDate >= now && examDate <= monthFromNow;
            default:
              return true;
          }
        });
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter((q: Quiz) =>
          q.title?.toLowerCase().includes(query) ||
          q.description?.toLowerCase().includes(query)
        );
      }

      filtered.sort((a: Quiz, b: Quiz) => {
        const dateA = new Date(a.scheduledDate || a.startTime || '');
        const dateB = new Date(b.scheduledDate || b.startTime || '');
        return dateA.getTime() - dateB.getTime();
      });

      setSchedules(filtered);
    } catch (err: any) {
      console.error('Error fetching exam schedules:', err);
      setError(err.message || 'Khong the tai lich thi');
    } finally {
      setLoading(false);
    }
  };

  return { schedules, loading, error, refetch: fetchSchedules };
}
