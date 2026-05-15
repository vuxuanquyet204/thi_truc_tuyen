import React, { useState } from 'react';
import { FAQItem as FAQItemType } from '@/types/certificationDetail';
import styles from './FAQItem.module.css';

interface FAQItemProps {
  faq: FAQItemType;
  onToggle: (id: string) => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, onToggle }) => {
  const handleToggle = () => {
    onToggle(faq.id);
  };

  return (
    <div className={styles.faqItem}>
      <button
        className={`${styles.faqQuestion} ${faq.isOpen ? styles.open : ''}`}
        onClick={handleToggle}
        aria-expanded={faq.isOpen}
        type="button"
      >
        <span className={styles.questionText}>{faq.question}</span>
        <span className={`${styles.chevron} ${faq.isOpen ? styles.rotated : ''}`}>
          ▼
        </span>
      </button>
      
      {faq.isOpen && (
        <div className={styles.faqAnswer}>
          <p className={styles.answerText}>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

export default FAQItem;
