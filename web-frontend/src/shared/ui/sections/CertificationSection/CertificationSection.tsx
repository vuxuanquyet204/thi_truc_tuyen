import React from 'react';
import { CertificationSection as CertificationSectionType } from '@/types/certification';
import CertificationCard from '@/shared/ui/molecules/CertificationCard/CertificationCard';
import styles from './CertificationSection.module.css';

interface CertificationSectionProps {
  section: CertificationSectionType;
  onGetCertified: (certificationId: string) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({
  section,
  onGetCertified
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{section.title}</h2>
        <div className={styles.grid}>
          {section.certifications.map((certification) => (
            <CertificationCard
              key={certification.id}
              certification={certification}
              onGetCertified={onGetCertified}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationSection;
