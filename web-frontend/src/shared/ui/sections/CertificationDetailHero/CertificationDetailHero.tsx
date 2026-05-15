import React from 'react';
import { CertificationDetail } from '@/types/certificationDetail';
import styles from './CertificationDetailHero.module.css';

interface CertificationDetailHeroProps {
  certification: CertificationDetail;
  onGetCertified: () => void;
}

const CertificationDetailHero: React.FC<CertificationDetailHeroProps> = ({
  certification,
  onGetCertified
}) => {

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Cơ bản':
      case 'Basic':
        return 'var(--primary)';
      case 'Trung cấp':
      case 'Intermediate':
        return 'var(--accent)';
      case 'Nâng cao':
      case 'Advanced':
        return 'var(--destructive)';
      default:
        return 'var(--muted-foreground)';
    }
  };

  return (
    <div className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
        <div className={styles.textContent}>
          <h1 className={styles.title}>
              Nhận chứng chỉ
              <br />
              <span className={styles.certificationTitle}>
                {certification.title}
              </span>
              <br />
              <span className={styles.subtitle}>
                {certification.subtitle}
              </span>
            </h1>
            
            <p className={styles.description}>
              {certification.description}
            </p>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statIcon}>⏱️</span>
                <span className={styles.statText}>{certification.duration}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statIcon}>❓</span>
                <span className={styles.statText}>{certification.questions}</span>
              </div>
              <div className={styles.stat}>
                <span 
                  className={styles.levelBadge}
                  style={{ 
                    backgroundColor: getLevelColor(certification.level) + '20',
                    color: getLevelColor(certification.level)
                  }}
                >
                  {certification.level}
                </span>
              </div>
            </div>
            
            <button 
              className={styles.getCertifiedButton}
              onClick={onGetCertified}
            >
              Nhận chứng chỉ
            </button>
            
            <p className={styles.testimonial}>
              Tham gia cùng {certification.testimonialCount} lập trình viên đã được chứng chỉ
            </p>
          </div>
          
          <div className={styles.companies}>
            <p className={styles.companiesTitle}>
              Các lập trình viên có chứng chỉ {certification.title} đang làm việc tại
            </p>
            <div className={styles.logos}>
              {certification.companyLogos.map((logo, index) => (
                <div key={index} className={styles.logo}>
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationDetailHero;
