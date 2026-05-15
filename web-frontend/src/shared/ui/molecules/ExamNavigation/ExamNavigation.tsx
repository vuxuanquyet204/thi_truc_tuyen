import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './ExamNavigation.module.css';

interface ExamNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLocked?: boolean;
}

const ExamNavigationComponent: React.FC<ExamNavigationProps> = ({
  currentQuestionIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  isLocked = false,
}) => {
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className={styles.navigation}>
      <Button
        onClick={isLocked ? () => {} : onPrevious}
        disabled={isFirstQuestion || isLocked}
        variant="secondary"
        className={styles.navButton}
        aria-label="Câu hỏi trước"
      >
        <ChevronLeft className={styles.navIcon} />
        Câu trước
      </Button>

      <Button
        onClick={isLocked ? () => {} : onSubmit}
        className={styles.submitButton}
        disabled={isLocked}
        aria-label="Nộp bài thi"
      >
        Nộp bài
      </Button>

      <Button
        onClick={isLocked ? () => {} : onNext}
        disabled={isLastQuestion || isLocked}
        className={styles.navButton}
        aria-label="Câu hỏi tiếp theo"
      >
        Câu tiếp
        <ChevronRight className={styles.navIcon} />
      </Button>
    </div>
  );
};

export const ExamNavigation = memo(ExamNavigationComponent);
