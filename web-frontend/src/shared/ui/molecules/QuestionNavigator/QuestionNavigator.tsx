import React, { memo, useCallback } from 'react';
import { Flag } from 'lucide-react';
import styles from './QuestionNavigator.module.css';
import { ExamQuestion } from '@/foundation/types';

interface QuestionNavigatorProps {
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  visitedQuestions: readonly number[];
  flaggedQuestions: readonly number[];
  onGoToQuestion: (index: number) => void;
}

const QuestionNavigatorComponent: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  visitedQuestions,
  flaggedQuestions,
  onGoToQuestion
}) => {
  return (
    <div className={styles.navigator}>
      <h3 className={styles.title}>Danh sách câu hỏi</h3>
      <div className={styles.questionGrid}>
        {questions.map((question, index) => {
          const isAnswered = answers[question.id];
          const isVisited = visitedQuestions.includes(index);
          const isFlagged = flaggedQuestions.includes(question.id);
          const isCurrent = index === currentQuestionIndex;

          return (
            <button
              key={question.id}
              onClick={() => onGoToQuestion(index)}
              className={`${styles.questionButton} ${
                isCurrent ? styles.current : ''
              } ${isAnswered ? styles.answered : ''} ${
                isFlagged ? styles.flagged : ''
              }`}
              aria-label={`Câu hỏi ${index + 1}${isCurrent ? ' (hiện tại)' : ''}${isAnswered ? ' (đã trả lời)' : ''}${isFlagged ? ' (đã đánh dấu)' : ''}`}
              aria-current={isCurrent ? 'true' : 'false'}
            >
              {index + 1}
              {isFlagged && (
                <Flag className={styles.flagIcon} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.legend} role="list" aria-label="Chú thích">
        <div className={styles.legendItem} role="listitem">
          <div className={`${styles.legendBox} ${styles.legendAnswered}`} />
          <span>Đã trả lời</span>
        </div>
        <div className={styles.legendItem} role="listitem">
          <div className={`${styles.legendBox} ${styles.legendNotViewed}`} />
          <span>Chưa xem</span>
        </div>
        <div className={styles.legendItem} role="listitem">
          <div className={`${styles.legendBox} ${styles.legendFlagged}`} />
          <span>Đã đánh dấu</span>
        </div>
        <div className={styles.legendItem} role="listitem">
          <div className={`${styles.legendBox} ${styles.legendCurrent}`} />
          <span>Câu hiện tại</span>
        </div>
      </div>
    </div>
  );
};

export const QuestionNavigator = memo(QuestionNavigatorComponent);
