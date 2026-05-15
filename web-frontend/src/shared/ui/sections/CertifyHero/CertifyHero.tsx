import React from 'react';
import styles from './CertifyHero.module.css';

const CertifyHero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Nhận chứng chỉ</h1>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3 className={styles.featureTitle}>Nổi bật hơn đám đông</h3>
              <p className={styles.featureDescription}>
                Nhận chứng chỉ về kỹ năng kỹ thuật bằng cách tham gia Bài kiểm tra Chứng chỉ của chúng tôi
              </p>
            </div>
            
            <div className={styles.feature}>
              <h3 className={styles.featureTitle}>Đánh giá chuẩn hóa</h3>
              <p className={styles.featureDescription}>
                Các bài đánh giá được tổ chức dựa trên các kỹ năng cụ thể và được tuyển chọn cẩn thận dựa trên dữ liệu tuyển dụng nhiều năm từ hơn 2000+ công ty
              </p>
            </div>
            
            <div className={styles.feature}>
              <h3 className={styles.featureTitle}>Làm phong phú hồ sơ của bạn</h3>
              <p className={styles.featureDescription}>
                Sau khi vượt qua bài đánh giá thành công, bạn có thể quảng bá bản thân bằng chứng chỉ của chúng tôi với đồng nghiệp và nhà tuyển dụng
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CertifyHero;
