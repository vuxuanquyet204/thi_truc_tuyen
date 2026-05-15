import React, { useState } from 'react';
import { ContestDetail } from '@/types/contestDetail';
import styles from './ContestSidebar.module.css';

interface ContestSidebarProps {
  contest: ContestDetail;
  onLeaderboardClick?: () => void;
  onCompareProgressClick?: () => void;
  onReviewSubmissionsClick?: () => void;
  onMessageSend?: (message: string) => void;
}

const ContestSidebar: React.FC<ContestSidebarProps> = ({
  contest,
  onLeaderboardClick,
  onCompareProgressClick,
  onReviewSubmissionsClick,
  onMessageSend
}) => {
  const [message, setMessage] = useState('');

  const handleLeaderboardClick = () => {
    if (onLeaderboardClick) {
      onLeaderboardClick();
    }
  };

  const handleCompareProgressClick = () => {
    if (onCompareProgressClick) {
      onCompareProgressClick();
    }
  };

  const handleReviewSubmissionsClick = () => {
    if (onReviewSubmissionsClick) {
      onReviewSubmissionsClick();
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && onMessageSend) {
      onMessageSend(message.trim());
      setMessage('');
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className={styles.sidebar}>
      {/* Social Media Icons */}
      <div className={styles.socialIcons}>
        <a href="#" className={styles.socialIcon} title="Share on Facebook">
          f
        </a>
        <a href="#" className={styles.socialIcon} title="Share on Twitter">
          🐦
        </a>
        <a href="#" className={styles.socialIcon} title="Share on LinkedIn">
          in
        </a>
      </div>

      {/* Current Rank */}
      <div className={styles.rankSection}>
        <h3 className={styles.rankTitle}>Xếp hạng hiện tại:</h3>
        <p className={styles.rankValue}>
          {contest.currentRank ? `#${contest.currentRank}` : 'Chưa có'}
        </p>
        {contest.totalParticipants && (
          <p className={styles.totalParticipants}>
            trên {contest.totalParticipants.toLocaleString()} người tham gia
          </p>
        )}
      </div>

      {/* Rating Update Message */}
      {contest.ratingUpdateMessage && (
        <div className={styles.ratingMessage}>
          <p className={styles.ratingText}>{contest.ratingUpdateMessage}</p>
        </div>
      )}

      {/* Action Links */}
      <div className={styles.actionLinks}>
        <button
          className={styles.actionLink}
          onClick={handleLeaderboardClick}
          type="button"
        >
          <span className={styles.actionIcon}>🏆</span>
          Bảng xếp hạng
        </button>
        
        <button
          className={styles.actionLink}
          onClick={handleCompareProgressClick}
          type="button"
        >
          <span className={styles.actionIcon}>📊</span>
          So sánh tiến độ
        </button>
        
        <button
          className={styles.actionLink}
          onClick={handleReviewSubmissionsClick}
          type="button"
        >
          <span className={styles.actionIcon}>📋</span>
          Xem bài nộp
        </button>
      </div>

      {/* Message Center */}
      <div className={styles.messageCenter}>
        <h4 className={styles.messageTitle}>Trung tâm tin nhắn</h4>
        <form onSubmit={handleMessageSubmit} className={styles.messageForm}>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Nhập tin nhắn của bạn..."
            className={styles.messageInput}
          />
          <button
            type="submit"
            className={styles.messageButton}
            disabled={!message.trim()}
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContestSidebar;
