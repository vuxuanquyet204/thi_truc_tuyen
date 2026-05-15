import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CertificationDetail } from '@/foundation/types/certificationDetail';
import { certificationApiService } from '@/features/certifications/api/certificationApi';
import CertificationDetailHero from '@/shared/ui/sections/CertificationDetailHero';
import FAQSection from '@/shared/ui/sections/FAQSection';
import CertifyFooter from '@/shared/ui/sections/CertifyFooter';
import styles from './CertificationDetailPage.module.css';

const CertificationDetailPage: React.FC = () => {
  const { certificationId } = useParams<{ certificationId: string }>();
  const navigate = useNavigate();
  const [certification, setCertification] = useState<CertificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertification = async () => {
      if (!certificationId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await certificationApiService.getById(certificationId);
        setCertification(data as CertificationDetail);
      } catch (err) {
        setError('Không thể tải chi tiết chứng chỉ. Vui lòng thử lại sau.');
        console.error('[CertificationDetailPage] Failed to load certification:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCertification();
  }, [certificationId]);

  const handleGetCertified = () => {
    console.log(`Starting certification test for: ${certificationId}`);
    alert(`Starting ${certification?.title} ${certification?.subtitle} certification test!`);
  };

  const handleBackToCertify = () => {
    navigate('/user/certify');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Đang tải chi tiết chứng chỉ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1 className={styles.errorTitle}>Không tìm thấy chứng chỉ</h1>
        <p className={styles.errorText}>
          Chứng chỉ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <button
          className={styles.backButton}
          onClick={handleBackToCertify}
        >
          Quay lại chứng chỉ
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Back Navigation */}
        <nav className={styles.navigation}>
          <button
            className={styles.backButton}
            onClick={handleBackToCertify}
          >
            ← Quay lại chứng chỉ
          </button>
        </nav>

        {/* Hero Section */}
        <CertificationDetailHero
          certification={certification!}
          onGetCertified={handleGetCertified}
        />

        {/* FAQ Section */}
        <FAQSection
          faqs={certification!.faqs}
          onGetCertified={handleGetCertified}
        />

        {/* Footer */}
        <CertifyFooter />
      </div>
    </div>
  );
};

export default CertificationDetailPage;
