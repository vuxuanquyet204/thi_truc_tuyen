import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FeaturedContest,
  ContestSection as ContestSectionType,
  Contest,
} from '@/foundation/types/contest';
import { quizApiService, QuizDetail } from '@/features/contests/api/contestApi';
import FeaturedContestComponent from '@/shared/ui/sections/FeaturedContest';
import ContestSection from '@/shared/ui/sections/ContestSection';
import Footer from '@/shared/ui/layouts/Footer';
import styles from './CompetePage.module.css';

const mockFeatured: FeaturedContest = {
  id: 'featured-default',
  title: 'Xây dựng thử thách HackerRank',
  description: 'Cơ hội tham gia mạng lưới chuyên gia độc quyền của chúng tôi',
  featuredDescription: 'Cơ hội tham gia mạng lưới chuyên gia độc quyền của chúng tôi',
  status: 'featured',
  type: 'hiring',
  startDate: '2025-10-21',
  endDate: '2025-10-21',
  registrationEndDate: '2025-10-21',
  actionButtonText: 'Đăng ký ngay',
  actionButtonLink: '/contests/featured-default',
  isRegistrationOpen: true,
  registrationInfo: 'Đăng ký mở đến ngày 21 tháng 10',
  logoUrl: '/images/hackerrank-logo.png',
};

function mapQuizToContest(quiz: QuizDetail): Contest {
  const status = quiz.status === 'active'
    ? 'active'
    : quiz.status === 'upcoming'
      ? 'upcoming'
      : 'archived';

  let actionButtonText = 'Xem thử thách';
  if (status === 'upcoming') {
    actionButtonText = 'Đăng ký ngay';
  } else if (status === 'active') {
    actionButtonText = 'Xem chi tiết';
  }

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    status,
    type: (quiz.type as Contest['type']) || 'global',
    startDate: quiz.startDate,
    endDate: quiz.endDate || 'Mở vô thời hạn',
    actionButtonText,
    actionButtonLink: `/user/compete/${quiz.id}`,
    isRegistrationOpen: status === 'active' || status === 'upcoming',
    difficulty: (quiz.difficulty as Contest['difficulty']) || 'medium',
    tags: quiz.tags,
    participants: quiz.totalParticipants,
  };
}

function mapQuizToFeaturedContest(quiz?: QuizDetail): FeaturedContest {
  if (!quiz) return mockFeatured;
  return {
    ...mapQuizToContest(quiz),
    featuredDescription: quiz.description,
    registrationInfo: quiz.startDate
      ? `Bắt đầu: ${new Date(quiz.startDate).toLocaleDateString('vi-VN')}`
      : undefined,
    logoUrl: undefined,
    backgroundImage: undefined,
  };
}

const CompetePage: React.FC = () => {
  const navigate = useNavigate();

  const [featuredContest, setFeaturedContest] = useState<FeaturedContest | null>(null);
  const [contestSections, setContestSections] = useState<ContestSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        setError(null);
        const quizzes = await quizApiService.getQuizzes();

        const featured = mapQuizToFeaturedContest(quizzes[0]);
        setFeaturedContest(featured);

        const activeQuizzes = quizzes
          .filter(q => q.status === 'active')
          .map(mapQuizToContest);

        const upcomingQuizzes = quizzes
          .filter(q => q.status === 'upcoming')
          .map(mapQuizToContest);

        const archivedQuizzes = quizzes
          .filter(q => q.status === 'archived')
          .map(mapQuizToContest);

        const collegeQuizzes = quizzes
          .filter(q => q.type === 'college')
          .map(mapQuizToContest);

        const sections: ContestSectionType[] = [
          {
            title: 'Cuộc thi đang diễn ra',
            contests: activeQuizzes,
            layout: 'list',
            showViewAll: false,
          },
          {
            title: 'Cuộc thi sắp tới',
            contests: upcomingQuizzes,
            layout: 'list',
            showViewAll: true,
            viewAllLink: '/contests/upcoming',
          },
          {
            title: 'Cuộc thi đã kết thúc',
            contests: archivedQuizzes,
            layout: 'grid',
            showViewAll: true,
            viewAllLink: '/contests/archived',
          },
          {
            title: 'Cuộc thi sinh viên',
            contests: collegeQuizzes,
            layout: 'grid',
            showViewAll: true,
            viewAllLink: '/contests/college',
          },
        ];

        setContestSections(sections);
      } catch (err) {
        console.error('[CompetePage] Failed to fetch contests:', err);
        setError('Không thể tải danh sách cuộc thi. Vui lòng thử lại sau.');
        setFeaturedContest(mockFeatured);
        setContestSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const handleContestActionClick = (contest: Contest) => {
    if (contest.actionButtonText === 'View Challenges' || contest.actionButtonText === 'Xem thử thách') {
      navigate(`/user/compete/${contest.id}`);
    } else {
      console.log(`Action "${contest.actionButtonText}" clicked for contest: ${contest.id}`);
      alert(`Trang cho "${contest.actionButtonText}" chưa được thiết kế.`);
    }
  };

  const handleViewAllClick = (_section: ContestSectionType) => {
    // View all navigation handled by viewAllLink in section data
  };

  const handleFeaturedContestClick = (_contest: FeaturedContest) => {
    console.log(`Featured contest clicked`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <p>Đang tải cuộc thi...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {featuredContest && (
          <FeaturedContestComponent
            contest={featuredContest}
            onActionClick={handleFeaturedContestClick}
          />
        )}

        {contestSections.map((section) => (
          <ContestSection
            key={section.title}
            section={section}
            onContestActionClick={handleContestActionClick}
            onViewAllClick={handleViewAllClick}
          />
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default CompetePage;
