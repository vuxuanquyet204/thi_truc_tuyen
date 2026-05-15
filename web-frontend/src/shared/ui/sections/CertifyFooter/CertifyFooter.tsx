import React from 'react';
import styles from './CertifyFooter.module.css';

const CertifyFooter: React.FC = () => {
  const footerLinks = [
    'Blog',
    'Chấm điểm',
    'Môi trường',
    'Câu hỏi thường gặp',
    'Về chúng tôi',
    'Trợ giúp',
    'Tuyển dụng',
    'Điều khoản dịch vụ',
    'Chính sách bảo mật'
  ];

  const handleLinkClick = (link: string) => {
    console.log(`Clicked on ${link}`);
    // In a real app, these would navigate to appropriate pages
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        {footerLinks.map((link, index) => (
          <React.Fragment key={link}>
            <button
              className={styles.link}
              onClick={() => handleLinkClick(link)}
              type="button"
            >
              {link}
            </button>
            {index < footerLinks.length - 1 && (
              <span className={styles.separator}>|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
};

export default CertifyFooter;
