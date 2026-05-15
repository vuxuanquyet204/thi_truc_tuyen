import React from 'react';
import { InfoCardData } from '@/foundation/types/profile';
import { Edit3, Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  data: InfoCardData;
  className?: string;
  style?: React.CSSProperties;
}

export default function InfoCard({ data, className = '', style = {} }: InfoCardProps): JSX.Element {
  const getStatusIcon = () => {
    const iconClass = data.status === 'completed' 
      ? styles.statusIconCompleted 
      : data.status === 'pending' 
      ? styles.statusIconPending 
      : data.status === 'incomplete' 
      ? styles.statusIconIncomplete 
      : '';

    switch (data.status) {
      case 'completed':
        return <CheckCircle className={`${styles.statusIcon} ${iconClass}`} />;
      case 'pending':
        return <Clock className={`${styles.statusIcon} ${iconClass}`} />;
      case 'incomplete':
        return <AlertCircle className={`${styles.statusIcon} ${iconClass}`} />;
      default:
        return null;
    }
  };

  const getButtonVariantClass = () => {
    switch (data.actionButton?.variant) {
      case 'secondary':
        return styles.actionButtonSecondary;
      case 'outline':
        return styles.actionButtonOutline;
      default:
        return styles.actionButtonPrimary;
    }
  };

  return (
    <div
      className={`${styles.card} ${className}`}
      style={style}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconContainer}>
            {data.icon}
          </div>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>
              {data.title}
            </h3>
            {data.status && (
              <div className={styles.statusSection}>
                {getStatusIcon()}
                <span className={styles.statusText}>
                  {data.status}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {data.actionButton && (
          <button
            onClick={data.actionButton.onClick}
            className={`${styles.actionButton} ${getButtonVariantClass()}`}
          >
            {data.status === 'completed' ? (
              <Edit3 className={styles.actionButtonIcon} />
            ) : (
              <Plus className={styles.actionButtonIcon} />
            )}
            {data.actionButton.text}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {data.content}
      </div>

      {/* Progress Bar */}
      {data.completionPercentage !== undefined && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>
              Hoàn thành
            </span>
            <span className={styles.progressValue}>
              {data.completionPercentage}%
            </span>
          </div>
          <div className={styles.progressBarContainer}>
            <div 
              className={styles.progressBarFill}
              style={{ width: `${data.completionPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
