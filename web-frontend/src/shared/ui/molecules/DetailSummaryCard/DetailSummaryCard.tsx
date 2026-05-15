import React from 'react';
import styles from './DetailSummaryCard.module.css';

interface DetailSummaryCardProps {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  timeSpent: number;
}

export const DetailSummaryCard: React.FC<DetailSummaryCardProps> = ({
  correctAnswers,
  totalQuestions,
  score,
  timeSpent
}) => {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryItem}>
        <div className={styles.summaryValue} style={{ color: '#10b981' }}>
          {correctAnswers}/{totalQuestions}
        </div>
        <div className={styles.summaryLabel}>Câu đúng</div>
      </div>

      <div className={styles.divider} />

      <div className={styles.summaryItem}>
        <div className={styles.summaryValue} style={{ color: '#3b82f6' }}>
          {score}%
        </div>
        <div className={styles.summaryLabel}>Điểm số</div>
      </div>

      <div className={styles.divider} />

      <div className={styles.summaryItem}>
        <div className={styles.summaryValue} style={{ color: '#f59e0b' }}>
          {timeSpent}
        </div>
        <div className={styles.summaryLabel}>Phút</div>
      </div>
    </div>
  );
};

export default DetailSummaryCard;
