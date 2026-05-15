import {
	Coins,
	TrendingUp,
	Users,
	Activity,
	Award,
	RefreshCw,
	BarChart3,
	Trophy,
	Target,
} from 'lucide-react'
import { useTokenManagement } from '@/features/rewards/hooks'
import '@/features/admin/ui/common/styles/tokenManagement.css'

export default function TokenManagementPage(): JSX.Element {
	const {
		stats,
		topUsers,
		rulePerformance,
		recentTransactions,
		loading,
		error,
		activeTab,
		setActiveTab,
		fetchData,
		formatNumber,
		formatDate,
	} = useTokenManagement()

	if (loading) {
		return (
			<div className="token-management-page">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Đang tải dữ liệu...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="token-management-page">
				<div className="error-state">
					<p>{error}</p>
					<button onClick={fetchData} className="btn-retry">
						Thử lại
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="token-management-page">
			<div className="page-header">
				<div className="header-content">
					<div className="header-left">
						<div className="header-icon">
							<Coins size={32} />
						</div>
						<div>
							<h1>Quản lý Token</h1>
							<p>Thống kê và giám sát hệ thống thưởng token</p>
						</div>
					</div>
					<button onClick={fetchData} className="btn-refresh">
						<RefreshCw size={20} />
						<span>Làm mới</span>
					</button>
				</div>
			</div>

			{stats && (
				<div className="stats-grid">
					<div className="stat-card primary">
						<div className="stat-icon">
							<Coins size={24} />
						</div>
						<div className="stat-content">
							<div className="stat-label">Tổng token phát hành</div>
							<div className="stat-value">{formatNumber(stats.totalTokensIssued)}</div>
						</div>
					</div>

					<div className="stat-card success">
						<div className="stat-icon">
							<TrendingUp size={24} />
						</div>
						<div className="stat-content">
							<div className="stat-label">Token đã tiêu</div>
							<div className="stat-value">{formatNumber(stats.totalTokensSpent)}</div>
						</div>
					</div>

					<div className="stat-card accent">
						<div className="stat-icon">
							<Users size={24} />
						</div>
						<div className="stat-content">
							<div className="stat-label">Người dùng</div>
							<div className="stat-value">{formatNumber(stats.totalUsers)}</div>
						</div>
					</div>

					<div className="stat-card warning">
						<div className="stat-icon">
							<Activity size={24} />
						</div>
						<div className="stat-content">
							<div className="stat-label">Giao dịch hôm nay</div>
							<div className="stat-value">{formatNumber(stats.todayTransactions)}</div>
						</div>
					</div>
				</div>
			)}

			<div className="tabs">
				<button
					className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
					onClick={() => setActiveTab('overview')}
				>
					<BarChart3 size={18} />
					<span>Tổng quan</span>
				</button>
				<button
					className={`tab ${activeTab === 'users' ? 'active' : ''}`}
					onClick={() => setActiveTab('users')}
				>
					<Trophy size={18} />
					<span>Top người dùng</span>
				</button>
				<button
					className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
					onClick={() => setActiveTab('rules')}
				>
					<Target size={18} />
					<span>Hiệu suất quy tắc</span>
				</button>
				<button
					className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
					onClick={() => setActiveTab('transactions')}
				>
					<Activity size={18} />
					<span>Giao dịch</span>
				</button>
			</div>

			<div className="tab-content">
				{activeTab === 'overview' && stats && (
					<div className="overview-grid">
						<div className="overview-card">
							<h3>Phân tích Token</h3>
							<div className="chart-placeholder">
								<div className="chart-stat">
									<span className="chart-label">Tổng phát hành</span>
									<span className="chart-value">{formatNumber(stats.totalTokensIssued)}</span>
								</div>
								<div className="chart-stat">
									<span className="chart-label">Đã tiêu</span>
									<span className="chart-value">{formatNumber(stats.totalTokensSpent)}</span>
								</div>
								<div className="chart-stat">
									<span className="chart-label">Còn lại</span>
									<span className="chart-value highlight">{formatNumber(stats.currentBalance)}</span>
								</div>
							</div>
						</div>

						<div className="overview-card">
							<h3>Hoạt động</h3>
							<div className="activity-stats">
								<div className="activity-item">
									<Award size={20} className="activity-icon earn" />
									<div>
										<div className="activity-label">Giao dịch thưởng</div>
										<div className="activity-value">{formatNumber(stats.totalEarnTransactions)}</div>
									</div>
								</div>
								<div className="activity-item">
									<TrendingUp size={20} className="activity-icon spend" />
									<div>
										<div className="activity-label">Giao dịch tiêu</div>
										<div className="activity-value">{formatNumber(stats.totalSpendTransactions)}</div>
									</div>
								</div>
								<div className="activity-item">
									<Activity size={20} className="activity-icon total" />
									<div>
										<div className="activity-label">Tổng cộng</div>
										<div className="activity-value">{formatNumber(stats.totalTransactions)}</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'users' && (
					<div className="content-card">
						<h3>Top người dùng theo số dư token</h3>
						<div className="table-container">
							<table className="data-table">
								<thead>
									<tr>
										<th>Hạng</th>
										<th>Student ID</th>
										<th>Tổng kiếm</th>
										<th>Tổng tiêu</th>
										<th>Số dư</th>
										<th>Giao dịch</th>
									</tr>
								</thead>
								<tbody>
									{topUsers.map((user, index) => (
										<tr key={user.studentId}>
											<td>
												<div className="rank-badge">
													{index + 1 === 1 && <span className="rank-medal gold">1</span>}
													{index + 1 === 2 && <span className="rank-medal silver">2</span>}
													{index + 1 === 3 && <span className="rank-medal bronze">3</span>}
													{index + 1 > 3 && <span className="rank-number">{index + 1}</span>}
												</div>
											</td>
											<td>
												<span className="user-id">{user.studentId}</span>
											</td>
											<td>
												<span className="amount earn">+{formatNumber(user.totalEarned)}</span>
											</td>
											<td>
												<span className="amount spend">-{formatNumber(user.totalSpent)}</span>
											</td>
											<td>
												<span className="amount balance">{formatNumber(user.balance)}</span>
											</td>
											<td>
												<span className="transaction-count">{formatNumber(user.transactionCount)}</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{activeTab === 'rules' && (
					<div className="content-card">
						<h3>Hiệu suất phân phối theo quy tắc</h3>
						<div className="table-container">
							<table className="data-table">
								<thead>
									<tr>
										<th>Mã quy tắc</th>
										<th>Tên quy tắc</th>
										<th>Số lần sử dụng</th>
										<th>Tổng token phân phối</th>
										<th>Trung bình/lần</th>
										<th>Tỷ lệ thành công</th>
									</tr>
								</thead>
								<tbody>
									{rulePerformance.map((rule) => (
										<tr key={rule.ruleId}>
											<td>
												<code className="rule-code">{rule.ruleId}</code>
											</td>
											<td>
												<span className="rule-name">{rule.ruleName}</span>
											</td>
											<td>
												<span className="usage-count">{formatNumber(rule.usageCount)}</span>
											</td>
											<td>
												<span className="amount total">{formatNumber(rule.totalTokensDistributed)}</span>
											</td>
											<td>
												<span className="amount average">{formatNumber(rule.averageReward)}</span>
											</td>
											<td>
												<span className="success-rate">{rule.successRate}%</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{activeTab === 'transactions' && (
					<div className="content-card">
						<h3>Giao dịch gần đây</h3>
						<div className="table-container">
							<table className="data-table">
								<thead>
									<tr>
										<th>ID</th>
										<th>Student ID</th>
										<th>Loại</th>
										<th>Số lượng</th>
										<th>Lý do</th>
										<th>Liên quan</th>
										<th>Thời gian</th>
									</tr>
								</thead>
								<tbody>
									{recentTransactions.map((tx) => {
										const txType = tx.transaction_type || tx.transactionType || 'UNKNOWN'
										const amount = tx.amount || tx.tokensAwarded || 0

										return (
											<tr key={tx.id}>
												<td>
													<span className="tx-id">{tx.id}</span>
												</td>
												<td>
													<span className="user-id">{tx.studentId}</span>
												</td>
												<td>
													<span className={`tx-type ${txType.toLowerCase()}`}>
														{txType === 'EARN' && 'Thưởng'}
														{txType === 'SPEND' && 'Tiêu'}
														{txType === 'WITHDRAW' && 'Rút'}
													</span>
												</td>
												<td>
													<span className={`amount ${txType.toLowerCase()}`}>
														{txType === 'EARN' ? '+' : '-'}
														{formatNumber(amount)}
													</span>
												</td>
												<td>
													<code className="reason-code">{tx.reasonCode || '--'}</code>
												</td>
												<td>
													<span className="related-id">{tx.relatedId || '--'}</span>
												</td>
												<td>
													<span className="tx-time">
														{formatDate(tx.awardedAt || tx.createdAt || '')}
													</span>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
