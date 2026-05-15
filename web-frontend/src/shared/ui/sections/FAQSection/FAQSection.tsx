import React, { useState } from 'react';
import { FAQItem as FAQItemType } from '../../../../types/certificationDetail';
import FAQItem from '../../molecules/FAQItem';
import styles from './FAQSection.module.css';

interface FAQSectionProps {
  faqs: FAQItemType[];
  onGetCertified: () => void;
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs, onGetCertified }) => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleToggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const faqsWithState = faqs.map(faq => ({
    ...faq,
    isOpen: openFAQ === faq.id
  }));

  return (
    <div className={styles.faqSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Câu hỏi thường gặp</h2>
        
        <div className={styles.faqList}>
          {faqsWithState.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              onToggle={handleToggleFAQ}
            />
          ))}
        </div>
        
        <div className={styles.callToAction}>
          <h3 className={styles.ctaTitle}>Bạn còn chờ gì nữa?</h3>
          <button 
            className={styles.getCertifiedButton}
            onClick={onGetCertified}
          >
            Nhận chứng chỉ
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
