import React from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar, Hash } from 'lucide-react';

interface TokenHistoryItem {
  id: number | string;
  studentId: number;
  amount: number;
  type: 'grant' | 'spend' | 'withdraw';
  reasonCode?: string;
  relatedId?: number | string;
  createdAt: string;
  transaction_type: 'EARN' | 'SPEND';
}

interface TokenHistoryTableProps {
  history: TokenHistoryItem[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function TokenHistoryTable({
  history,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onPrevious,
  onNext
}: TokenHistoryTableProps): JSX.Element {

  const getReasonLabel = (reasonCode?: string) => {
    const reasons: Record<string, string> = {
      'COURSE_COMPLETION': 'Hoàn thành khóa học',
      'EXAM_PASS': 'Đạt kỳ thi',
      'ASSIGNMENT_SUBMIT': 'Nộp bài tập',
      'DAILY_LOGIN': 'Đăng nhập hàng ngày',
      'QUIZ_PERFECT': 'Quiz hoàn hảo',
      'WITHDRAW': 'Rút token',
      'WITHDRAW_FAILED_REFUND': 'Hoàn tiền (Rút thất bại)',
      'SPEND': 'Tiêu token',
      'PURCHASE': 'Mua sắm',
      'CUSTOM': 'Khác'
    };
    return reasons[reasonCode || 'CUSTOM'] || reasonCode || 'Không rõ';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && history.length === 0) {
    return (
      <div style={{
        background: 'var(--card)',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--muted)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>Đang tải lịch sử...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && history.length === 0) {
    return (
      <div style={{
        background: 'var(--card)',
        borderRadius: '12px',
        padding: '48px 24px',
        border: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'var(--muted)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Calendar size={32} style={{ color: 'var(--muted-foreground)' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          Chưa có giao dịch nào
        </h3>
        <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
          Lịch sử giao dịch của bạn sẽ hiển thị ở đây
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
      overflow: 'hidden'
    }}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ID
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Loại
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Số lượng
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Lý do
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Thời gian
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => {
              const isEarn = item.transaction_type === 'EARN';
              
              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: index < history.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--muted)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Hash size={14} style={{ color: 'var(--muted-foreground)' }} />
                      <span style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>
                        {String(item.id).padStart(6, '0')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      background: isEarn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: isEarn ? '#22c55e' : '#ef4444',
                      fontSize: '13px',
                      fontWeight: 500
                    }}>
                      {isEarn ? (
                        <>
                          <ArrowDownRight size={14} />
                          Nhận
                        </>
                      ) : (
                        <>
                          <ArrowUpRight size={14} />
                          Tiêu
                        </>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: isEarn ? '#22c55e' : '#ef4444'
                    }}>
                      {isEarn ? '+' : '-'}{item.amount.toLocaleString()} LEARN
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '14px' }}>
                      {getReasonLabel(item.reasonCode)}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                      {formatDate(item.createdAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'var(--muted)'
        }}>
          <div style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>
            Hiển thị <strong>{((currentPage - 1) * 10) + 1}</strong> - <strong>{Math.min(currentPage * 10, totalItems)}</strong> trong tổng số <strong>{totalItems}</strong> giao dịch
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onPrevious}
              disabled={currentPage === 1 || loading}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--card)',
                color: 'var(--foreground)',
                cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer',
                opacity: (currentPage === 1 || loading) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1 && !loading) {
                  e.currentTarget.style.background = 'var(--muted)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card)';
              }}
            >
              <ChevronLeft size={16} />
              Trước
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage = page === 1 || 
                                page === totalPages || 
                                (page >= currentPage - 1 && page <= currentPage + 1);
                
                if (!showPage) {
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} style={{ padding: '8px 4px', color: 'var(--muted-foreground)' }}>...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      background: page === currentPage ? 'var(--primary)' : 'var(--card)',
                      color: page === currentPage ? 'white' : 'var(--foreground)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: page === currentPage ? 600 : 400,
                      minWidth: '40px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (page !== currentPage && !loading) {
                        e.currentTarget.style.background = 'var(--muted)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== currentPage) {
                        e.currentTarget.style.background = 'var(--card)';
                      }
                    }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onNext}
              disabled={currentPage === totalPages || loading}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--card)',
                color: 'var(--foreground)',
                cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer',
                opacity: (currentPage === totalPages || loading) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages && !loading) {
                  e.currentTarget.style.background = 'var(--muted)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card)';
              }}
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

