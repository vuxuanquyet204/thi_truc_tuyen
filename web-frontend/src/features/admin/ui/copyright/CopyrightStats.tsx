import React from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Hash, 
  Database, 
  Zap, 
  Shield,
  TrendingUp,
  Users,
  Clock,
  Activity
} from 'lucide-react';
import { AdminStats, AdminDashboard } from '@/features/admin/hooks'
import styles from './CopyrightStats.module.css';

interface CopyrightStatsComponentProps {
  stats: AdminStats;
  blockchainStatus: AdminDashboard['blockchainStatus'];
  loading?: boolean;
}

export const CopyrightStatsComponent: React.FC<CopyrightStatsComponentProps> = ({
  stats,
  blockchainStatus,
  loading = false
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatETH = (eth: string) => {
    const num = parseFloat(eth);
    return `${num.toFixed(4)} ETH`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'low':
        return '#10b981'; // green
      case 'medium':
        return '#f59e0b'; // yellow
      case 'high':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getConnectionStatus = () => {
    return blockchainStatus.isConnected ? 'connected' : 'disconnected';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Đang tải thống kê...</p>
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      {/* Main Statistics */}
      <div className={styles.mainStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FileText size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatNumber(stats.totalDocuments)}</div>
            <div className={styles.statLabel}>Tổng tài liệu</div>
            <div className={styles.statChange}>+12% so với tháng trước</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatNumber(stats.totalVerified)}</div>
            <div className={styles.statLabel}>Đã xác minh</div>
            <div className={styles.statChange}>
              {((stats.totalVerified / stats.totalDocuments) * 100).toFixed(1)}% tỷ lệ xác minh
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatNumber(stats.disputedDocuments)}</div>
            <div className={styles.statLabel}>Có tranh chấp</div>
            <div className={styles.statChange}>Cần xử lý</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatNumber(stats.totalOwners)}</div>
            <div className={styles.statLabel}>Tác giả tham gia</div>
            <div className={styles.statChange}>+8 tác giả mới</div>
          </div>
        </div>
      </div>

      {/* Blockchain Status */}
      <div className={styles.blockchainStats}>
        <h3>Trạng thái Blockchain</h3>
        
        <div className={styles.blockchainGrid}>
          <div className={styles.blockchainCard}>
            <div className={styles.blockchainIcon}>
              <Database size={20} />
            </div>
            <div className={styles.blockchainContent}>
              <div className={styles.blockchainValue}>
                {formatNumber(blockchainStatus.lastBlock)}
              </div>
              <div className={styles.blockchainLabel}>Block cuối</div>
            </div>
          </div>

          <div className={styles.blockchainCard}>
            <div className={styles.blockchainIcon}>
              <Zap size={20} />
            </div>
            <div className={styles.blockchainContent}>
              <div className={styles.blockchainValue}>
                {blockchainStatus.averageGasPrice} Gwei
              </div>
              <div className={styles.blockchainLabel}>Gas price trung bình</div>
            </div>
          </div>

          <div className={styles.blockchainCard}>
            <div className={styles.blockchainIcon}>
              <Activity size={20} />
            </div>
            <div className={styles.blockchainContent}>
              <div 
                className={styles.blockchainValue}
                style={{ color: getStatusColor(blockchainStatus.networkCongestion) }}
              >
                {blockchainStatus.networkCongestion}
              </div>
              <div className={styles.blockchainLabel}>Tắc nghẽn mạng</div>
            </div>
          </div>

          <div className={styles.blockchainCard}>
            <div className={styles.blockchainIcon}>
              <Clock size={20} />
            </div>
            <div className={styles.blockchainContent}>
              <div className={styles.blockchainValue}>
                {blockchainStatus.estimatedConfirmationTime} phút
              </div>
              <div className={styles.blockchainLabel}>Thời gian xác nhận</div>
            </div>
          </div>
        </div>

        <div className={styles.connectionStatus}>
          <div className={`${styles.statusIndicator} ${getConnectionStatus()}`}>
            <div className={styles.statusDot}></div>
            <span>
              {blockchainStatus.isConnected ? 'Đã kết nối' : 'Mất kết nối'}
            </span>
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className={styles.contractInfo}>
        <h3>Thông tin Hợp đồng</h3>
        
        <div className={styles.contractGrid}>
          <div className={styles.contractCard}>
            <div className={styles.contractIcon}>
              <Hash size={20} />
            </div>
            <div className={styles.contractContent}>
              <div className={styles.contractValue}>
                {formatNumber(stats.blockchainTransactions)}
              </div>
              <div className={styles.contractLabel}>Giao dịch Blockchain</div>
            </div>
          </div>

          <div className={styles.contractCard}>
            <div className={styles.contractIcon}>
              <Shield size={20} />
            </div>
            <div className={styles.contractContent}>
              <div className={styles.contractValue}>
                {formatETH(stats.contractBalance)}
              </div>
              <div className={styles.contractLabel}>Số dư hợp đồng</div>
            </div>
          </div>

          <div className={styles.contractCard}>
            <div className={styles.contractIcon}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.contractContent}>
              <div className={styles.contractValue}>
                {stats.averageVerificationTime} ngày
              </div>
              <div className={styles.contractLabel}>Thời gian xác minh TB</div>
            </div>
          </div>

          <div className={styles.contractCard}>
            <div className={styles.contractIcon}>
              <Clock size={20} />
            </div>
            <div className={styles.contractContent}>
              <div className={styles.contractValue}>
                {formatNumber(stats.pendingVerifications)}
              </div>
              <div className={styles.contractLabel}>Chờ xác minh</div>
            </div>
          </div>
        </div>

        <div className={styles.feeInfo}>
          <div className={styles.feeItem}>
            <span className={styles.feeLabel}>Phí đăng ký:</span>
            <span className={styles.feeValue}>{formatETH(stats.registrationFee || '0.001')}</span>
          </div>
          <div className={styles.feeItem}>
            <span className={styles.feeLabel}>Phí xác minh:</span>
            <span className={styles.feeValue}>{formatETH(stats.verificationFee || '0.002')}</span>
          </div>
        </div>
      </div>

      {/* Verification Rate Chart Placeholder */}
      <div className={styles.chartSection}>
        <h3>Tỷ lệ xác minh theo thời gian</h3>
        <div className={styles.chartPlaceholder}>
          <TrendingUp size={48} />
          <p>Biểu đồ thống kê xác minh</p>
          <span>Tính năng này sẽ được phát triển trong phiên bản tiếp theo</span>
        </div>
      </div>
    </div>
  );
};