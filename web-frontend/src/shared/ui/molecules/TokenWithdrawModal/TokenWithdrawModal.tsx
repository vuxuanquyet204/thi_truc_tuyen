import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

interface TokenWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onWithdraw: (amount: number, toAddress: string) => Promise<{ success: boolean; message: string; txHash?: string }>;
}

export default function TokenWithdrawModal({
  isOpen,
  onClose,
  currentBalance,
  onWithdraw
}: TokenWithdrawModalProps): JSX.Element | null {
  const [amount, setAmount] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; txHash?: string } | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setToAddress('');
      setResult(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setResult({ success: false, message: 'Số lượng token không hợp lệ' });
      return;
    }

    if (numAmount > currentBalance) {
      setResult({ success: false, message: 'Số dư không đủ' });
      return;
    }

    if (!toAddress || !toAddress.startsWith('0x')) {
      setResult({ success: false, message: 'Địa chỉ ví không hợp lệ (phải bắt đầu bằng 0x)' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await onWithdraw(numAmount, toAddress);
      setResult(response);
      
      if (response.success) {
        // Auto close after 3 seconds on success
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || 'Có lỗi xảy ra khi rút token' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    setAmount(currentBalance.toString());
  };

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
          maxWidth: '500px',
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
              <Wallet size={24} style={{ color: 'var(--primary)' }} />
              Rút Token về Ví
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>
              Chuyển token từ ví nội bộ sang blockchain
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
          {/* Balance Info */}
          <div style={{
            background: 'var(--muted)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              Số dư hiện tại
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>
              {currentBalance.toLocaleString()} <span style={{ fontSize: '16px', opacity: 0.8 }}>LEARN</span>
            </div>
          </div>

          {/* Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--foreground)'
            }}>
              Số lượng token
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Nhập số lượng token muốn rút"
                disabled={loading || result?.success}
                min="1"
                max={currentBalance}
                step="1"
                required
                style={{
                  width: '100%',
                  padding: '12px 80px 12px 12px',
                  fontSize: '15px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleMaxAmount}
                disabled={loading || result?.success}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (loading || result?.success) ? 'not-allowed' : 'pointer',
                  opacity: (loading || result?.success) ? 0.5 : 1
                }}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Address Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: 'var(--foreground)'
            }}>
              Địa chỉ ví nhận (Ethereum)
            </label>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="0x..."
              disabled={loading || result?.success}
              required
              pattern="^0x[a-fA-F0-9]{40}$"
              title="Địa chỉ Ethereum hợp lệ (bắt đầu bằng 0x và có 42 ký tự)"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ 
              fontSize: '12px', 
              color: 'var(--muted-foreground)', 
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle size={14} />
              Vui lòng kiểm tra kỹ địa chỉ ví trước khi rút
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
                  {result.success ? 'Rút token thành công!' : 'Rút token thất bại'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--foreground)', marginBottom: result.txHash ? '8px' : 0 }}>
                  {result.message}
                </div>
                {result.txHash && (
                  <a
                    href={`http://localhost:7545/tx/${result.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      color: '#22c55e',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontFamily: 'monospace'
                    }}
                  >
                    Xem giao dịch: {result.txHash.substring(0, 10)}...{result.txHash.substring(result.txHash.length - 8)}
                    <ExternalLink size={12} />
                  </a>
                )}
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
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || result?.success || !amount || !toAddress}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: (loading || result?.success || !amount || !toAddress) ? 'var(--muted)' : 'var(--primary)',
                color: 'white',
                fontSize: '15px',
                fontWeight: 600,
                cursor: (loading || result?.success || !amount || !toAddress) ? 'not-allowed' : 'pointer',
                opacity: (loading || result?.success || !amount || !toAddress) ? 0.5 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading && !result?.success && amount && toAddress) {
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
              ) : result?.success ? (
                <>
                  <CheckCircle size={18} />
                  Thành công
                </>
              ) : (
                'Xác nhận rút'
              )}
            </button>
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
            <div style={{ fontWeight: 500, marginBottom: '8px' }}>Lưu ý:</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Token sẽ được chuyển đến địa chỉ ví Ethereum bạn nhập</li>
              <li>Giao dịch không thể hoàn tác sau khi xác nhận</li>
              <li>Phí gas sẽ được tính vào giao dịch</li>
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
