import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Gift, User, AlertCircle, CheckCircle, Coins } from 'lucide-react';
import { grantTokens, type GrantTokenRequest } from '@/features/rewards/api/tokenRewardApi';

interface GrantTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function GrantTokenModal({
  isOpen,
  onClose,
  onSuccess
}: GrantTokenModalProps): JSX.Element | null {
  const [studentId, setStudentId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reasonCode, setReasonCode] = useState<string>('CUSTOM');
  const [relatedId, setRelatedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      setStudentId('');
      setAmount('');
      setReasonCode('CUSTOM');
      setRelatedId('');
      setResult(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = Number(amount);
    const trimmedStudentId = studentId.trim();
    
    if (!trimmedStudentId) {
      setResult({ success: false, message: 'ID học viên không hợp lệ' });
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setResult({ success: false, message: 'Số lượng token phải lớn hơn 0' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const request: GrantTokenRequest = {
        studentId: trimmedStudentId,
        amount: numAmount,
        reasonCode: reasonCode || 'CUSTOM',
        relatedId: relatedId ? relatedId.trim() : undefined
      };

      const transaction = await grantTokens(request);
      
      setResult({ 
        success: true, 
        message: `Đã cấp ${transaction?.amount ?? numAmount} token cho học viên ${transaction?.studentId ?? trimmedStudentId} thành công!` 
      });
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || 'Có lỗi xảy ra khi cấp token' 
      });
    } finally {
      setLoading(false);
    }
  };

  const reasonOptions = [
    { value: 'COURSE_COMPLETION', label: 'Hoàn thành khóa học' },
    { value: 'EXAM_PASS', label: 'Đạt kỳ thi' },
    { value: 'ASSIGNMENT_SUBMIT', label: 'Nộp bài tập' },
    { value: 'DAILY_LOGIN', label: 'Đăng nhập hàng ngày' },
    { value: 'QUIZ_PERFECT', label: 'Quiz hoàn hảo' },
    { value: 'ACHIEVEMENT', label: 'Thành tích đặc biệt' },
    { value: 'REFERRAL', label: 'Giới thiệu bạn bè' },
    { value: 'ADMIN_BONUS', label: 'Thưởng từ Admin' },
    { value: 'CUSTOM', label: 'Khác' }
  ];

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000, // Higher than header (9999)
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '16px',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: '0 0 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Gift size={24} style={{ color: 'var(--primary)' }} />
              Cấp Token cho Học viên
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
              Thưởng token cho học viên dựa trên thành tích
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              transition: 'background 0.2s',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Student ID Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--foreground)'
            }}>
              <User size={16} />
              ID Học viên
            </label>
            <input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Nhập ID học viên"
              disabled={loading || result?.success}
              min="1"
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--foreground)'
            }}>
              <Coins size={16} />
              Số lượng token
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số lượng token"
                disabled={loading || result?.success}
                min="1"
                step="1"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[10, 50, 100, 500].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(value.toString())}
                  disabled={loading || result?.success}
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: (loading || result?.success) ? 'not-allowed' : 'pointer',
                    opacity: (loading || result?.success) ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !result?.success) {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--muted)';
                    e.currentTarget.style.color = 'inherit';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Select */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--foreground)'
            }}>
              Lý do thưởng
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              disabled={loading || result?.success}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                boxSizing: 'border-box',
                cursor: (loading || result?.success) ? 'not-allowed' : 'pointer'
              }}
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Related ID Input (Optional) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--foreground)'
            }}>
              ID liên quan (tùy chọn)
            </label>
            <input
              type="text"
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
              placeholder="ID khóa học, bài thi, v.v..."
              disabled={loading || result?.success}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '15px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--muted-foreground)', 
              marginTop: '6px'
            }}>
              Ví dụ: ID khóa học, ID bài thi đã hoàn thành
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${result.success ? '#22c55e' : '#ef4444'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              {result.success ? (
                <CheckCircle size={20} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: result.success ? '#22c55e' : '#ef4444',
                  marginBottom: '4px'
                }}>
                  {result.success ? 'Cấp token thành công!' : 'Cấp token thất bại'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--foreground)' }}>
                  {result.message}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: '15px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--background)';
              }}
            >
              {result?.success ? 'Đóng' : 'Hủy'}
            </button>
            {!result?.success && (
              <button
                type="submit"
                disabled={loading || !studentId || !amount}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: (loading || !studentId || !amount) ? 'var(--muted)' : 'var(--primary)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: (loading || !studentId || !amount) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !studentId || !amount) ? 0.5 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!loading && studentId && amount) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Gift size={18} />
                    Xác nhận cấp token
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'var(--muted)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--muted-foreground)'
          }}>
            <div style={{ fontWeight: 500, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              Lưu ý khi cấp token:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Token sẽ được thêm vào ví off-chain của học viên</li>
              <li>Học viên có thể rút token về blockchain wallet</li>
              <li>Giao dịch sẽ được ghi lại trong lịch sử</li>
            </ul>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Render modal using Portal to mount it at document.body
  return createPortal(modalContent, document.body);
}

