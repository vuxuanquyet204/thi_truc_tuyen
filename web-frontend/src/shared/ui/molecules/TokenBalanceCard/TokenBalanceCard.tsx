import React from 'react';
import { Coins, TrendingUp, Download, RefreshCw } from 'lucide-react';

interface TokenBalanceCardProps {
  balance: number;
  loading?: boolean;
  onWithdraw?: () => void;
  onRefresh?: () => void;
}

export default function TokenBalanceCard({ 
  balance, 
  loading = false, 
  onWithdraw, 
  onRefresh 
}: TokenBalanceCardProps): JSX.Element {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '16px',
      padding: '32px',
      color: 'white',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              opacity: 0.9
            }}>
              <Coins size={20} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Số dư Token</span>
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px'
            }}>
              {loading ? (
                <div style={{
                  width: '120px',
                  height: '48px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }} />
              ) : (
                <>
                  {balance.toLocaleString()}
                  <span style={{ fontSize: '24px', opacity: 0.8, fontWeight: 500 }}>
                    LEARN
                  </span>
                </>
              )}
            </div>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              <RefreshCw size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
              opacity: 0.9
            }}>
              <TrendingUp size={16} />
              <span style={{ fontSize: '13px' }}>Tổng nhận</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>
              {loading ? '...' : `+${balance.toLocaleString()}`}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
              opacity: 0.9
            }}>
              <Download size={16} />
              <span style={{ fontSize: '13px' }}>Đã tiêu</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>
              {loading ? '...' : '0'}
            </div>
          </div>
        </div>

        {onWithdraw && (
          <button
            onClick={onWithdraw}
            disabled={loading || balance === 0}
            style={{
              width: '100%',
              padding: '14px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#667eea',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: (loading || balance === 0) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (loading || balance === 0) ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading && balance > 0) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Download size={18} />
            Rút Token về Ví
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
