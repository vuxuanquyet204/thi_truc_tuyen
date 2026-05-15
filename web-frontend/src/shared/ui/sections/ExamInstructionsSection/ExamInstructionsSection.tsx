import React from 'react';
import { Clock, Users, Shield, AlertTriangle, FileText } from 'lucide-react';

interface ExamInstructionsSectionProps {
  exam: {
    title: string;
    duration: number;
    totalQuestions: number;
    isProctored: boolean;
    instructions: string[];
  };
}

export const ExamInstructionsSection: React.FC<ExamInstructionsSectionProps> = ({ exam }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 'var(--space-6)',
      padding: 'var(--space-6)'
    }}>
      {/* Left Panel - Exam Info */}
      <div style={{
        background: 'transparent',
        padding: 0
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: 'var(--space-5)',
          color: 'var(--foreground)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <FileText style={{ width: '24px', height: '24px', marginRight: 'var(--space-2)', color: 'var(--primary)' }} />
          Thông tin bài thi
        </h2>

        <div style={{
          background: 'linear-gradient(135deg,rgb(0, 110, 255) 0%, #bfdbfe 100%)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 'var(--space-3)' }}>
            Thông tin bài thi:
          </h3>
          <div style={{ fontSize: '14px', color: '#1e3a8a', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 'var(--space-2)' }}>• <strong>Thời gian:</strong> {exam.duration} phút</p>
            <p style={{ marginBottom: 'var(--space-2)' }}>• <strong>Số câu hỏi:</strong> {exam.totalQuestions}</p>
            <p>• <strong>Loại:</strong> {exam.isProctored ? 'Có giám sát' : 'Không giám sát'}</p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--foreground)' }}>
            Quy định:
          </h3>
          <ul style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.8, paddingLeft: 0, listStyle: 'none' }}>
            {exam.instructions.map((instruction, index) => (
              <li key={index} style={{ marginBottom: 'var(--space-2)' }}>
                • {instruction}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel - Rules */}
      <div style={{
        background: 'transparent',
        padding: 0
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: 'var(--space-5)',
          color: 'var(--foreground)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <AlertTriangle style={{ width: '24px', height: '24px', marginRight: 'var(--space-2)', color: '#f59e0b' }} />
          Quy định thi
        </h2>

        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#92400e', marginBottom: 'var(--space-3)' }}>
            Lưu ý quan trọng:
          </h3>
          <ul style={{ fontSize: '14px', color: '#92400e', lineHeight: 1.6, paddingLeft: 0, listStyle: 'none' }}>
            <li style={{ marginBottom: 'var(--space-2)' }}>• Không được trao đổi với người khác</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>• Không được sử dụng tài liệu</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>• Sử dụng thiết bị khác</li>
            <li>• Thay đổi tab trình duyệt</li>
          </ul>
        </div>

        <div style={{
          background: 'var(--background)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 'var(--space-3)' }}>
            Trong quá trình thi:
          </h3>
          <ul style={{ fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.6, paddingLeft: 0, listStyle: 'none' }}>
            <li style={{ marginBottom: 'var(--space-2)' }}>• Luôn giữ khuôn mặt trong tầm nhìn camera</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>• Không được che camera</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>• Không được rời khỏi chỗ ngồi</li>
            <li>• Tập trung vào màn hình máy tính</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
