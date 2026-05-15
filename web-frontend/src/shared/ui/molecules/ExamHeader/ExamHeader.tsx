import React from 'react';
import { Clock } from 'lucide-react';
import styles from './ExamHeader.module.css';

interface ExamHeaderProps {
  examTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  progress: number;
  timeRemaining: number;
  timeWarning: boolean;
  formatTime: (seconds: number) => string;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  examTitle,
  currentQuestionIndex,
  totalQuestions,
  answeredQuestions,
  progress,
  timeRemaining,
  timeWarning,
  formatTime
}) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerLeft}>
          <h1 className={styles.examTitle}>{examTitle}</h1>
          <div className={styles.questionBadge}>
            Câu {currentQuestionIndex + 1}/{totalQuestions}
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.progressSection}>
            <div className={styles.progressText}>
              Đã trả lời: <strong>{answeredQuestions}/{totalQuestions}</strong>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className={`${styles.timerContainer} ${timeWarning ? styles.timerWarning : ''}`}>
            <Clock className={styles.timerIcon} />
            <div className={styles.timerText}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
