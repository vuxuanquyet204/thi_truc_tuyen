import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './ExamStatusDisplay.module.css';

interface ExamStatusDisplayProps {
  type: 'loading' | 'error';
  errorMessage?: string;
  onBack?: () => void;
}

export const ExamStatusDisplay: React.FC<ExamStatusDisplayProps> = ({
  type,
  errorMessage,
  onBack
}) => {
  if (type === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.spinner} />
          <h2 className={styles.title}>Đang tải bài thi...</h2>
          <p className={styles.description}>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.errorCard}`}>
        <AlertCircle className={styles.errorIcon} />
        <h2 className={styles.title}>Lỗi</h2>
        <p className={styles.description}>{errorMessage}</p>
        {onBack && (
          <Button onClick={onBack} variant="secondary">
            Quay lại
          </Button>
        )}
      </div>
    </div>
  );
};

