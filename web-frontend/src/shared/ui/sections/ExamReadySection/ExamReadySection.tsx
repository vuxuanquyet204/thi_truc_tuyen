import React from 'react';
import { CheckCircle, Clock, Users, Shield } from 'lucide-react';

interface ExamReadySectionProps {
  exam: {
    title: string;
    duration: number;
    totalQuestions: number;
    isProctored: boolean;
  };
}

export const ExamReadySection: React.FC<ExamReadySectionProps> = ({ exam }) => {
  return (
    <div style={{
      padding: 'var(--space-10)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Success Icon */}
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto var(--space-6)',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
      }}>
        <CheckCircle style={{ width: '40px', height: '40px', color: 'white' }} />
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--foreground)',
        marginBottom: 'var(--space-4)',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Sẵn sàng bắt đầu!
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '16px',
        color: 'var(--muted-foreground)',
        marginBottom: 'var(--space-8)',
        lineHeight: 1.6
      }}>
        Tất cả các bước kiểm tra đã hoàn thành. Bạn có thể bắt đầu làm bài thi ngay bây giờ.
      </p>

      {/* Exam Summary */}
      <div style={{
        background: 'linear-gradient(135deg, var(--background) 0%, var(--card) 100%)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        marginBottom: 'var(--space-8)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--foreground)',
          marginBottom: 'var(--space-4)'
        }}>
          Tóm tắt bài thi
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-2)'
            }}>
              <Clock style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
              {exam.duration} phút
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
              Thời gian
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-2)'
            }}>
              <Users style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
              {exam.totalQuestions} câu
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
              Số câu hỏi
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: exam.isProctored 
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-2)'
            }}>
              <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
              {exam.isProctored ? 'Có giám sát' : 'Không giám sát'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
              Loại thi
            </p>
          </div>
        </div>
      </div>

      {/* Final Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #93c5fd'
      }}>
        <p style={{
          fontSize: '14px',
          color: '#1e40af',
          margin: 0,
          fontWeight: 500
        }}>
          💡 <strong>Lưu ý:</strong> Sau khi bắt đầu, bạn sẽ không thể dừng lại giữa chừng. 
          Hãy đảm bảo bạn đã sẵn sàng hoàn toàn.
        </p>
      </div>
    </div>
  );
};
