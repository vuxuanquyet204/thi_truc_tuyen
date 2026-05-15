import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import styles from './AnswerOption.module.css';

interface AnswerOptionProps {
  option: string;
  isYourAnswer: boolean;
  isCorrectAnswer: boolean;
  hasUserAnswered: boolean;
}

export const AnswerOption: React.FC<AnswerOptionProps> = ({
  option,
  isYourAnswer,
  isCorrectAnswer,
  hasUserAnswered
}) => {
  // Không highlight gì cả nếu user chưa chọn đáp án
  if (!hasUserAnswered) {
    return (
      <div className={styles.option}>
        <span className={styles.optionText}>{option}</span>
      </div>
    );
  }

  // Highlight đáp án đúng (màu xanh)
  if (isCorrectAnswer) {
    return (
      <div className={`${styles.option} ${styles.correct}`}>
        <CheckCircle className={styles.icon} />
        <span className={styles.optionText}>{option}</span>
      </div>
    );
  }

  // Highlight đáp án sai của user (màu đỏ)
  if (isYourAnswer && !isCorrectAnswer) {
    return (
      <div className={`${styles.option} ${styles.incorrect}`}>
        <XCircle className={styles.icon} />
        <span className={styles.optionText}>{option}</span>
      </div>
    );
  }

  // Các đáp án khác không được highlight
  return (
    <div className={styles.option}>
      <span className={styles.optionText}>{option}</span>
    </div>
  );
};
