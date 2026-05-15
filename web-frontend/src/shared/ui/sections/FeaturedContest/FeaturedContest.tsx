import React from 'react';
import { FeaturedContest as FeaturedContestType } from '../../../../types/contest';
import styles from './FeaturedContest.module.css';

interface FeaturedContestProps {
  contest: FeaturedContestType;
  onActionClick?: (contest: FeaturedContestType) => void;
}

const FeaturedContest: React.FC<FeaturedContestProps> = ({
  contest,
  onActionClick
}) => {
  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(contest);
    } else {
      // Default action - in a real app, this would navigate
      console.log(`Featured contest action clicked: ${contest.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.featuredContest}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <div className={styles.username}>
              username
            </div>
            
            <h1 className={styles.title}>{contest.title}</h1>
            <p className={styles.description}>{contest.featuredDescription || contest.description}</p>
            
            <div className={styles.actionContainer}>
              <button
                className={styles.registerButton}
                onClick={handleActionClick}
                type="button"
              >
                {contest.actionButtonText}
              </button>
              
              {contest.registrationInfo && (
                <div className={styles.registrationInfo}>
                  {contest.registrationInfo}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.dateInfo}>
            {contest.startDate && (
              <div className={styles.date}>
                <span className={styles.calendarIcon}>📅</span>
                {formatDate(contest.startDate)}
              </div>
            )}
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className={styles.backgroundPattern}></div>
      </div>
    </div>
  );
};

export default FeaturedContest;
