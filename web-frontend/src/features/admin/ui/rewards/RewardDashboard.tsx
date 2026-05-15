import React from 'react'
import { RewardStats, TokenInfo, UserRewardSummary, RulePerformance } from '@/types/reward'
import StatCard from '@/features/admin/ui/common/StatCard'
import { 
	TrendingUp, 
	Users, 
	Gift, 
	DollarSign,
	Award,
	Target,
	CheckCircle,
	Clock,
	AlertTriangle
} from 'lucide-react'
import '@/pages/admin/RewardPage/RewardPage.module.css'

interface RewardDashboardProps {
	stats: RewardStats
	tokenInfo: TokenInfo
	topUsers: UserRewardSummary[]
	rulePerformance: RulePerformance[]
}

export default function RewardDashboard({ 
	stats, 
	tokenInfo, 
	topUsers, 
	rulePerformance 
}: RewardDashboardProps): JSX.Element {
	
	const formatNumber = (num: number | undefined) => {
		if (num === undefined || num === null) return '0'
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'USD'
		}).format(amount)
	}

	const getSuccessRateColor = (rate: number) => {
		if (rate >= 95) return '#10b981'
		if (rate >= 90) return '#f59e0b'
		return '#ef4444'
	}

	return (
		<div className="reward-dashboard">
			{/* Stats Overview */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(4, 1fr)', 
				gap: '16px',
				marginBottom: '24px'
			}}>
				{/* Card 1 - Tổng luật thưởng */}
				<div style={{ 
					background: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					padding: '20px',
					boxShadow: 'var(--shadow-sm)',
					border: '1px solid var(--border)',
					position: 'relative',
					overflow: 'hidden'
				}}>
					<div style={{ 
						position: 'absolute',
						top: '0',
						right: '0',
						width: '80px',
						height: '80px',
						background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
						borderRadius: '50%',
						transform: 'translate(20px, -20px)'
					}} />
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 1 }}>
						<div style={{ 
							width: '40px', 
							height: '40px', 
							borderRadius: 'var(--radius-md)', 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'center',
							background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
							color: 'white',
							flexShrink: 0
						}}>
							<Target size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Tổng luật thưởng
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{stats.totalRules}
							</div>
							<div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
								{stats.activeRules} đang hoạt động
							</div>
						</div>
					</div>
				</div>

				{/* Card 2 - Giao dịch hôm nay */}
				<div style={{ 
					background: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					padding: '20px',
					boxShadow: 'var(--shadow-sm)',
					border: '1px solid var(--border)',
					position: 'relative',
					overflow: 'hidden'
				}}>
					<div style={{ 
						position: 'absolute',
						top: '0',
						right: '0',
						width: '80px',
						height: '80px',
						background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
						borderRadius: '50%',
						transform: 'translate(20px, -20px)'
					}} />
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 1 }}>
						<div style={{ 
							width: '40px', 
							height: '40px', 
							borderRadius: 'var(--radius-md)', 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'center',
							background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							color: 'white',
							flexShrink: 0
						}}>
							<TrendingUp size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Giao dịch hôm nay
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{stats.todayTransactions}
							</div>
							<div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
								{stats.totalTransactions.toLocaleString()} tổng cộng
							</div>
						</div>
					</div>
				</div>

				{/* Card 3 - Token đã phân phối */}
				<div style={{ 
					background: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					padding: '20px',
					boxShadow: 'var(--shadow-sm)',
					border: '1px solid var(--border)',
					position: 'relative',
					overflow: 'hidden'
				}}>
					<div style={{ 
						position: 'absolute',
						top: '0',
						right: '0',
						width: '80px',
						height: '80px',
						background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
						borderRadius: '50%',
						transform: 'translate(20px, -20px)'
					}} />
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 1 }}>
						<div style={{ 
							width: '40px', 
							height: '40px', 
							borderRadius: 'var(--radius-md)', 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'center',
							background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
							color: 'white',
							flexShrink: 0
						}}>
							<Gift size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Token đã phân phối
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{formatNumber(stats.totalTokensDistributed)}
							</div>
							<div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
								{formatNumber(stats.todayTokensDistributed)} hôm nay
							</div>
						</div>
					</div>
				</div>

				{/* Card 4 - Tỷ lệ thành công */}
				<div style={{ 
					background: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					padding: '20px',
					boxShadow: 'var(--shadow-sm)',
					border: '1px solid var(--border)',
					position: 'relative',
					overflow: 'hidden'
				}}>
					<div style={{ 
						position: 'absolute',
						top: '0',
						right: '0',
						width: '80px',
						height: '80px',
						background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
						borderRadius: '50%',
						transform: 'translate(20px, -20px)'
					}} />
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 1 }}>
						<div style={{ 
							width: '40px', 
							height: '40px', 
							borderRadius: 'var(--radius-md)', 
							display: 'flex', 
							alignItems: 'center', 
							justifyContent: 'center',
							background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
							color: 'white',
							flexShrink: 0
						}}>
							<CheckCircle size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Tỷ lệ thành công
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{stats.successRate}%
							</div>
							<div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
								{stats.pendingTransactions} đang chờ
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Token Info & Performance */}
			<div className="dashboard-content-grid">
				{/* Token Information */}
				<div className="token-info-card">
					<div className="card-header">
						<h3 className="card-title">
							<DollarSign size={20} />
							Thông tin Token LEARN
						</h3>
					</div>
					<div className="token-details">
						<div className="token-main-info">
							<div className="token-symbol">{tokenInfo.symbol}</div>
							<div className="token-name">{tokenInfo.name}</div>
							<div className="token-price">{formatCurrency(tokenInfo.currentPrice)}</div>
						</div>
						
						<div className="token-metrics">
							<div className="metric-row">
								<span className="metric-label">Market Cap:</span>
								<span className="metric-value">{formatCurrency(tokenInfo.marketCap)}</span>
							</div>
							<div className="metric-row">
								<span className="metric-label">Holders:</span>
								<span className="metric-value">{tokenInfo.holders.toLocaleString()}</span>
							</div>
							<div className="metric-row">
								<span className="metric-label">Reward Pool:</span>
								<span className="metric-value">{formatNumber(tokenInfo.rewardPool)} tokens</span>
							</div>
							<div className="metric-row">
								<span className="metric-label">Distributed Today:</span>
								<span className="metric-value">{formatNumber(tokenInfo.distributedToday)} tokens</span>
							</div>
						</div>
						
						<div className="token-address">
							<span className="address-label">Contract:</span>
							<span className="address-value">{tokenInfo.contractAddress}</span>
						</div>
					</div>
				</div>

				{/* Top Performing Rules */}
				<div className="reward-performance-card">
					<div className="card-header">
						<h3 className="card-title">
							<Award size={20} />
							Luật thưởng hiệu quả nhất
						</h3>
					</div>
					<div className="reward-performance-list">
						{rulePerformance.slice(0, 5).map((rule, index) => (
							<div key={rule.ruleId} className="reward-performance-item">
								<div className="performance-rank">#{index + 1}</div>
								<div className="performance-info">
									<div className="performance-name">{rule.ruleName}</div>
									<div className="performance-stats">
										<span className="stat">{rule.usageCount} lần</span>
										<span className="stat">{formatNumber(rule.totalTokensDistributed)} tokens</span>
										<span className="stat success-rate" style={{ color: getSuccessRateColor(rule.successRate) }}>
											{rule.successRate}%
										</span>
									</div>
								</div>
								<div className="performance-tokens">
									{rule.averageTokensPerUse || 0} tokens/lần
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Top Users */}
			<div className="top-users-card">
				<div className="card-header">
					<h3 className="card-title">
						<Users size={20} />
						Học sinh có nhiều token nhất
					</h3>
				</div>
				<div className="users-list">
					{topUsers.slice(0, 5).map((user, index) => (
						<div key={user.userId} className="user-item">
							<div className="user-rank">#{index + 1}</div>
							<div className="user-avatar">
								{user.userName.charAt(0)}
							</div>
							<div className="user-info">
								<div className="user-name">{user.userName}</div>
								<div className="user-stats">
									<span className="stat">Earned: {formatNumber(user.totalEarned)}</span>
									<span className="stat">Balance: {formatNumber(user.currentBalance)}</span>
									<span className="stat">Rewards: {user.rewardCount}</span>
								</div>
							</div>
							<div className="user-balance">
								<div className="balance-amount">{formatNumber(user.currentBalance)}</div>
								<div className="balance-symbol">{user.tokenSymbol}</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Transaction Status Summary */}
			<div className="transaction-status-grid">
				<div className="status-card completed">
					<div className="status-icon">
						<CheckCircle size={24} />
					</div>
					<div className="status-info">
						<div className="status-count">{stats.totalTransactions - stats.pendingTransactions - stats.failedTransactions}</div>
						<div className="status-label">Hoàn thành</div>
					</div>
				</div>
				
				<div className="status-card pending">
					<div className="status-icon">
						<Clock size={24} />
					</div>
					<div className="status-info">
						<div className="status-count">{stats.pendingTransactions}</div>
						<div className="status-label">Đang chờ</div>
					</div>
				</div>
				
				<div className="status-card failed">
					<div className="status-icon">
						<AlertTriangle size={24} />
					</div>
					<div className="status-info">
						<div className="status-count">{stats.failedTransactions}</div>
						<div className="status-label">Thất bại</div>
					</div>
				</div>
			</div>
		</div>
	)
}
