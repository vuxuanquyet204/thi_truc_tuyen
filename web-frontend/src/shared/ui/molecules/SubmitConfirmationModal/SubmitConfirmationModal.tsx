import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from '@/shared/ui/atoms/Button/Button';
import styles from './SubmitConfirmationModal.module.css';

interface SubmitConfirmationModalProps {
  isOpen: boolean;
  answeredQuestions: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  isOpen,
  answeredQuestions,
  totalQuestions,
  isSubmitting,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredQuestions;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.content}>
          <AlertCircle className={styles.icon} />
          <h2 className={styles.title}>Xác nhận nộp bài</h2>
          <p className={styles.description}>
            Bạn đã trả lời <strong>{answeredQuestions}/{totalQuestions}</strong> câu hỏi.
            {unansweredCount > 0 && (
              <span className={styles.warning}>
                Còn {unansweredCount} câu chưa trả lời!
              </span>
            )}
          </p>
          <p className={styles.confirmation}>
            Bạn có chắc chắn muốn nộp bài không?
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Tiếp tục làm bài
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài ngay'}
          </Button>
        </div>
      </div>
    </div>
  );
};

