import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function ExamStoppedPage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--destructive)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        padding: 'clamp(24px, 5vw, 48px)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        <div style={{
          fontSize: 'clamp(48px, 10vw, 72px)',
          marginBottom: '24px',
          animation: 'bounce 1s ease-in-out infinite',
        }}>
          <AlertTriangle size={72} color="var(--destructive)" />
        </div>

        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 700,
          color: 'var(--destructive)',
          marginBottom: '16px',
        }}>
          Bài thi đã bị dừng
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          Bài thi của bạn đã bị dừng do phát hiện hành vi vi phạm quy chế thi.
          <br />
          Kết quả bài thi đã được ghi nhận và báo cáo cho giảng viên.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
        }}>
          <button
            onClick={() => navigate('/user/home')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Home size={18} />
            Quay về trang chủ
          </button>

          <p style={{
            fontSize: '13px',
            color: 'var(--muted-foreground)',
            marginTop: '8px',
          }}>
            Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ giảng viên để được xem xét.
          </p>
        </div>
      </div>
    </div>
  );
}
