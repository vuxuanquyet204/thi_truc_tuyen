import React from 'react';
import { CheckCircle, FileText, Video } from 'lucide-react';
import styles from './ExamProgressIndicator.module.css';

interface ExamProgressIndicatorProps {
  currentStep: 'loading' | 'instructions' | 'camera-check' | 'ready';
}

export const ExamProgressIndicator: React.FC<ExamProgressIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { key: 'instructions', label: 'Hướng dẫn', icon: FileText },
    { key: 'camera-check', label: 'Kiểm tra camera', icon: Video },
    { key: 'ready', label: 'Sẵn sàng', icon: CheckCircle }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.stepsContainer}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = ['instructions', 'camera-check', 'ready'].indexOf(currentStep) > index;
          
          return (
            <React.Fragment key={step.key}>
              <div className={styles.step}>
                <div className={`${styles.stepIcon} ${isActive ? styles.active : isCompleted ? styles.completed : styles.pending}`}>
                  <Icon />
                </div>
                <div className={styles.stepContent}>
                  <h3 className={`${styles.stepTitle} ${isActive ? styles.active : isCompleted ? styles.completed : styles.pending}`}>
                    {step.label}
                  </h3>
                  <p className={styles.stepSubtext}>
                    {isActive ? 'Đang thực hiện...' : isCompleted ? 'Hoàn thành' : 'Chờ thực hiện'}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.connector} ${isCompleted ? styles.completed : styles.pending}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
