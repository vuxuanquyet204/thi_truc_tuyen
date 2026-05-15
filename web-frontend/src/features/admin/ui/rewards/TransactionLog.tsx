import React from 'react'
import { RewardTransaction, TransactionStatus, RewardType } from '@/types/reward'
import Badge from '@/features/admin/ui/common/Badge'
import { 
	ExternalLink, 
	Clock, 
	CheckCircle, 
	XCircle, 
	AlertTriangle,
	RefreshCw,
	Eye,
	Target,
	Zap,
	User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import '@/features/admin/ui/common/styles/table.css'

interface TransactionLogProps {
	transactions: RewardTransaction[]
	onViewDetails?: (transaction: RewardTransaction) => void
	onRetry?: (transactionId: string) => void
}

export default function TransactionLog({ 
	transactions, 
	onViewDetails,
	onRetry 
}: TransactionLogProps): JSX.Element {
	
	const getStatusIcon = (status: TransactionStatus) => {
		switch (status) {
			case 'completed': return <CheckCircle size={16} color="#10b981" />
			case 'pending': return <Clock size={16} color="#f59e0b" />
			case 'processing': return <RefreshCw size={16} color="#3b82f6" className="animate-spin" />
			case 'failed': return <XCircle size={16} color="#ef4444" />
			case 'cancelled': return <AlertTriangle size={16} color="#6b7280" />
			default: return <Clock size={16} />
		}
	}

	const getStatusBadgeVariant = (status: TransactionStatus) => {
		switch (status) {
			case 'completed': return 'success'
			case 'pending': return 'warning'
			case 'processing': return 'info'
			case 'failed': return 'danger'
			case 'cancelled': return 'secondary'
			default: return 'secondary'
		}
	}

	const getStatusLabel = (status: TransactionStatus) => {
		switch (status) {
			case 'completed': return 'Hoàn thành'
			case 'pending': return 'Đang chờ'
			case 'processing': return 'Đang xử lý'
			case 'failed': return 'Thất bại'
			case 'cancelled': return 'Đã hủy'
			default: return status
		}
	}

	const getRewardTypeIcon = (type: RewardType) => {
		switch (type) {
			case 'course_completion': return <Target size={16} />
			case 'exam_score': return <Zap size={16} />
			case 'daily_login': return <Clock size={16} />
			case 'assignment_submission': return <User size={16} />
			case 'quiz_perfect': return <Target size={16} />
			case 'streak_bonus': return <Zap size={16} />
			case 'referral': return <User size={16} />
			case 'achievement': return <Target size={16} />
			case 'custom': return <Zap size={16} />
			default: return <Target size={16} />
		}
	}

	const getRewardTypeLabel = (type: RewardType) => {
		switch (type) {
			case 'course_completion': return 'Hoàn thành khóa học'
			case 'exam_score': return 'Điểm thi'
			case 'daily_login': return 'Đăng nhập hàng ngày'
			case 'assignment_submission': return 'Nộp bài tập'
			case 'quiz_perfect': return 'Quiz hoàn hảo'
			case 'streak_bonus': return 'Bonus streak'
			case 'referral': return 'Giới thiệu'
			case 'achievement': return 'Thành tích'
			case 'custom': return 'Tùy chỉnh'
			default: return type
		}
	}

	const formatTime = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), {
				addSuffix: true,
				locale: vi
			})
		} catch {
			return timestamp
		}
	}

	const formatDateTime = (timestamp: string) => {
		try {
			return new Date(timestamp).toLocaleString('vi-VN')
		} catch {
			return timestamp
		}
	}

	if (transactions.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">📊</div>
				<div className="admin-table-empty-text">Chưa có giao dịch nào</div>
			</div>
		)
	}

	return (
		<div className="transaction-log">
			<table className="admin-table">
				<thead>
					<tr>
						<th>Người dùng</th>
						<th>Luật thưởng</th>
						<th>Loại</th>
						<th>Số token</th>
						<th>Trạng thái</th>
						<th>Thời gian</th>
						<th>Blockchain</th>
						<th>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{transactions.map(transaction => (
						<tr key={transaction.id}>
							<td>
								<div className="user-info">
									<div className="user-name">{transaction.userName || `User ${transaction.userId}`}</div>
									<div className="user-id">ID: {transaction.userId}</div>
								</div>
							</td>
							<td>
								<div className="rule-info">
									<div className="rule-name">{transaction.ruleName || 'Custom Reward'}</div>
									{transaction.ruleId && (
										<div className="rule-id">ID: {transaction.ruleId}</div>
									)}
								</div>
							</td>
							<td>
								<div className="reward-type">
									<div className="type-icon">
										{getRewardTypeIcon(transaction.type)}
									</div>
									<span>{getRewardTypeLabel(transaction.type)}</span>
								</div>
							</td>
							<td>
								<div className="token-amount">
									<span className="amount">{transaction.tokenAmount}</span>
									<span className="symbol">{transaction.tokenSymbol}</span>
								</div>
							</td>
							<td>
								<div className="transaction-status">
									<div className="status-icon">
										{getStatusIcon(transaction.status)}
									</div>
									<Badge variant={getStatusBadgeVariant(transaction.status)}>
										{getStatusLabel(transaction.status)}
									</Badge>
									{transaction.failedReason && (
										<div className="failed-reason">
											{transaction.failedReason}
										</div>
									)}
								</div>
							</td>
							<td>
								<div className="time-info">
									<div className="created-at">
										Tạo: {formatTime(transaction.createdAt)}
									</div>
									{transaction.processedAt && (
										<div className="processed-at">
											Xử lý: {formatTime(transaction.processedAt)}
										</div>
									)}
								</div>
							</td>
							<td>
								{transaction.transactionHash ? (
									<div className="blockchain-info">
										<div className="tx-hash">
											<span className="hash-label">Hash:</span>
											<span className="hash-value">
												{transaction.transactionHash.slice(0, 8)}...
											</span>
											<ExternalLink size={12} />
										</div>
										{transaction.blockNumber && (
											<div className="block-number">
												Block: #{transaction.blockNumber}
											</div>
										)}
										{transaction.gasUsed && (
											<div className="gas-used">
												Gas: {transaction.gasUsed.toLocaleString()}
											</div>
										)}
									</div>
								) : (
									<div className="no-blockchain">
										Chưa có thông tin blockchain
									</div>
								)}
							</td>
							<td>
								<div className="action-buttons">
									{onViewDetails && (
										<button
											className="btn btn-icon btn-sm btn-secondary"
											title="Xem chi tiết"
											onClick={() => onViewDetails(transaction)}
										>
											<Eye size={16} />
										</button>
									)}
									
									{transaction.status === 'failed' && onRetry && (
										<button
											className="btn btn-icon btn-sm btn-warning"
											title="Thử lại"
											onClick={() => onRetry(transaction.id)}
										>
											<RefreshCw size={16} />
										</button>
									)}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
