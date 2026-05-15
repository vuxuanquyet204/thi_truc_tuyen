import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Contest } from '@/types/contest';
import styles from './ContestCard.module.css';

interface ContestCardProps {
  contest: Contest;
  onActionClick?: (contest: Contest) => void;
}

const ContestCard: React.FC<ContestCardProps> = ({
  contest,
  onActionClick
}) => {
  const navigate = useNavigate();

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(contest);
    } else {
      // Default action - only navigate to contest detail page for "View Challenges" or "Xem thử thách"
      if (contest.actionButtonText === 'View Challenges' || contest.actionButtonText === 'Xem thử thách') {
        navigate(`/user/compete/${contest.id}`);
      } else {
        // For other buttons, show message that page is not designed yet
        console.log(`Action "${contest.actionButtonText}" clicked for contest: ${contest.id}`);
        alert(`Page for "${contest.actionButtonText}" is not designed yet.`);
      }
    }
  };

  const getTypeColor = (type: Contest['type']) => {
    switch (type) {
      case 'global':
        return 'var(--primary)'; // Blue
      case 'college':
        return 'var(--primary)'; // Purple
      case 'hiring':
        return 'var(--primary)'; // Green
      case 'practice':
        return 'var(--accent)'; // Orange
      default:
        return 'var(--muted-foreground)'; // Gray
    }
  };

  const getTypeText = (type: Contest['type']) => {
    switch (type) {
      case 'global':
        return 'Toàn cầu';
      case 'college':
        return 'Sinh viên';
      case 'hiring':
        return 'Tuyển dụng';
      case 'practice':
        return 'Luyện tập';
      default:
        return type;
    }
  };

  return (
    <div className={styles.contestCard}>
      <div className={styles.cardHeader}>
        <div className={styles.typeBadge} style={{ color: getTypeColor(contest.type) }}>
          {getTypeText(contest.type)}
        </div>
        {contest.difficulty && (
          <div className={styles.difficultyBadge}>
            {contest.difficulty === 'easy' ? 'Dễ' : contest.difficulty === 'medium' ? 'Trung bình' : contest.difficulty === 'hard' ? 'Khó' : contest.difficulty}
          </div>
        )}
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{contest.title}</h3>
        <p className={styles.description}>{contest.description}</p>
        
        {contest.tags && contest.tags.length > 0 && (
          <div className={styles.tags}>
            {contest.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
            {contest.tags.length > 3 && (
              <span className={styles.tag}>+{contest.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.cardFooter}>
        <button
          className={styles.actionButton}
          onClick={handleActionClick}
          type="button"
        >
          {contest.actionButtonText}
        </button>
      </div>
    </div>
  );
};

export default ContestCard;
