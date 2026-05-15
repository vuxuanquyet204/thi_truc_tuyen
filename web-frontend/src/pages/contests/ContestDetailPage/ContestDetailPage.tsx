import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ContestDetail,
  Challenge,
  ChallengeDifficulty,
} from '@/foundation/types/contestDetail';
import { quizApiService, QuizDetail, QuizQuestion } from '@/features/contests/api/contestApi';
import ContestDetailHero from '@/shared/ui/sections/ContestDetailHero';
import ChallengeCard from '@/shared/ui/molecules/ChallengeCard/ChallengeCard';
import ContestSidebar from '@/shared/ui/molecules/ContestSidebar';
import Footer from '@/shared/ui/layouts/Footer';
import styles from './ContestDetailPage.module.css';

function mapDifficulty(difficulty?: string): ChallengeDifficulty {
  switch (difficulty) {
    case 'easy':
    case 'Easy':
    case 'Dễ':
      return 'Dễ';
    case 'medium':
    case 'Medium':
    case 'Trung bình':
      return 'Trung bình';
    case 'hard':
    case 'Hard':
    case 'Khó':
      return 'Khó';
    default:
      return 'Trung bình';
  }
}

function mapQuizQuestion(q: QuizQuestion): Challenge {
  return {
    id: q.id,
    title: q.title,
    description: q.description || '',
    successRate: q.successRate ?? 0,
    maxScore: q.maxScore,
    difficulty: mapDifficulty(q.difficulty),
    status: (q.status as Challenge['status']) || 'not_attempted',
    tags: q.tags,
  };
}

function mapQuizDetailToContestDetail(quiz: QuizDetail): ContestDetail {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    startDate: quiz.startDate || '',
    endDate: quiz.endDate || '',
    status: quiz.status,
    challenges: quiz.challenges.map(mapQuizQuestion),
    totalParticipants: quiz.totalParticipants,
    currentRank: quiz.currentRank,
    ratingUpdateMessage: 'Xếp hạng sẽ được cập nhật sớm, vui lòng đợi!',
  };
}

const ContestDetailPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();

  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contestId) {
      setError('Không tìm thấy ID cuộc thi.');
      setLoading(false);
      return;
    }

    const fetchContest = async () => {
      try {
        setLoading(true);
        setError(null);
        const quiz = await quizApiService.getQuizById(contestId);
        const contestData = mapQuizDetailToContestDetail(quiz);
        setContest(contestData);
      } catch (err) {
        console.error(`[ContestDetailPage] Failed to fetch contest ${contestId}:`, err);
        setError('Không thể tải thông tin cuộc thi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchContest();
  }, [contestId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <p>Đang tải thông tin cuộc thi...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className={styles.errorPage}>
        <div className={styles.container}>
          <h1>Không tìm thấy cuộc thi</h1>
          <p>{error || 'Cuộc thi bạn đang tìm kiếm không tồn tại.'}</p>
          <button
            className={styles.backButton}
            onClick={() => navigate('/user/compete')}
            type="button"
          >
            Quay lại cuộc thi
          </button>
        </div>
      </div>
    );
  }

  const handleSolveChallenge = (challenge: Challenge) => {
    console.log(`Solve challenge clicked: ${challenge.id}`);
  };

  const handleDiscussionClick = (challenge: Challenge) => {
    console.log(`Discussion clicked for challenge: ${challenge.id}`);
  };

  const handleLeaderboardClick = (challenge: Challenge) => {
    console.log(`Leaderboard clicked for challenge: ${challenge.id}`);
  };

  const handleSubmissionsClick = (challenge: Challenge) => {
    console.log(`Submissions clicked for challenge: ${challenge.id}`);
  };

  const handleDetailsClick = () => {
    console.log(`Details clicked for contest: ${contest.id}`);
  };

  const handleSidebarLeaderboardClick = () => {
    console.log(`Sidebar leaderboard clicked for contest: ${contest.id}`);
  };

  const handleCompareProgressClick = () => {
    console.log(`Compare progress clicked for contest: ${contest.id}`);
  };

  const handleReviewSubmissionsClick = () => {
    console.log(`Review submissions clicked for contest: ${contest.id}`);
  };

  const handleMessageSend = (message: string) => {
    console.log(`Message sent: ${message} for contest: ${contest.id}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ContestDetailHero
          contest={contest}
          onDetailsClick={handleDetailsClick}
        />

        <div className={styles.content}>
          <div className={styles.mainContent}>
            <div className={styles.challengesSection}>
              {contest.challenges.length > 0 ? (
                contest.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onSolveClick={handleSolveChallenge}
                    onDiscussionClick={handleDiscussionClick}
                    onLeaderboardClick={handleLeaderboardClick}
                    onSubmissionsClick={handleSubmissionsClick}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <h3>Không có thử thách nào</h3>
                  <p>Cuộc thi này chưa có thử thách nào.</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebar}>
            <ContestSidebar
              contest={contest}
              onLeaderboardClick={handleSidebarLeaderboardClick}
              onCompareProgressClick={handleCompareProgressClick}
              onReviewSubmissionsClick={handleReviewSubmissionsClick}
              onMessageSend={handleMessageSend}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContestDetailPage;
