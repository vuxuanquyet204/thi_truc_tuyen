import React, { useEffect, useState } from 'react';
import CertifyHero from '@/shared/ui/sections/CertifyHero';
import CertificationSection from '@/shared/ui/sections/CertificationSection';
import CertifyFooter from '@/shared/ui/sections/CertifyFooter';
import { certificationApiService, CertificationListItem } from '@/features/certifications/api/certificationApi';
import styles from './CertifyPage.module.css';

type CertItem = Pick<CertificationListItem, 'id' | 'title' | 'level' | 'category' | 'icon' | 'color' | 'description'>;
type CertificationSectionType = { title: string; certifications: CertItem[] };

const CertifyPage: React.FC = () => {
  const [sections, setSections] = useState<CertificationSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertifications = async () => {
      try {
        const data = await certificationApiService.getAll();
        const roleCerts = data.filter(c => c.category === 'role');
        const skillCerts = data.filter(c => c.category === 'skill');

        const builtSections: CertificationSectionType[] = [];
        if (roleCerts.length > 0) {
          builtSections.push({
            title: 'Chứng chỉ vai trò',
            certifications: roleCerts.map(c => ({
              id: c.id,
              title: c.title,
              level: c.level,
              category: c.category,
              icon: c.icon,
              color: c.color,
              description: c.description,
            })),
          });
        }
        if (skillCerts.length > 0) {
          builtSections.push({
            title: 'Chứng chỉ kỹ năng',
            certifications: skillCerts.map(c => ({
              id: c.id,
              title: c.title,
              level: c.level,
              category: c.category,
              icon: c.icon,
              color: c.color,
              description: c.description,
            })),
          });
        }
        setSections(builtSections);
      } catch (err) {
        setError('Không thể tải danh sách chứng chỉ. Vui lòng thử lại sau.');
        console.error('[CertifyPage] Failed to load certifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCertifications();
  }, []);

  const handleGetCertified = (certificationId: string) => {
    console.log(`Starting certification for: ${certificationId}`);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <CertifyHero />
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Đang tải chứng chỉ...</p>
        </div>
        <CertifyFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <CertifyHero />
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
        <CertifyFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CertifyHero />

      {sections.map((section) => (
        <CertificationSection
          key={section.title}
          section={section}
          onGetCertified={handleGetCertified}
        />
      ))}

      <CertifyFooter />
    </div>
  );
};

export default CertifyPage;
