import React, { useState } from 'react'
import {
	Gift,
	Plus,
	Search,
	Filter,
	BarChart3,
	List,
	Activity,
	Settings,
	RefreshCw,
	Coins,
	AlertTriangle
} from 'lucide-react'
import { useRewards } from '@/features/admin/hooks'
import {
	RewardDashboard,
	RewardRulesTable,
	TransactionLog,
	RuleEditorModal,
	GrantTokenModal
} from '@/features/admin/ui/rewards'
import { SearchBar } from '@/features/admin/ui/common'
import { TransactionDetailModal } from '@/features/admin/ui/modals'
import '@/features/admin/ui/common/styles/common.css'
import '@/pages/admin/RewardPage/RewardPage.module.css'

export default function RewardPage(): JSX.Element {
	const {
		dashboard,
		rules,
		transactions,
		filters,
		loading,
		error,
		updateFilter,
		addRule,
		updateRule,
		deleteRule,
		toggleRuleStatus,
		duplicateRule,
		retryTransaction,
		isRuleEditorOpen,
		editingRule,
		openRuleEditor,
		closeRuleEditor,
		saveRule,
		activeTab,
		setActiveTab,
		selectedTransaction,
		setSelectedTransaction,
		loadTokenData
	} = useRewards()

	const [isGrantTokenModalOpen, setIsGrantTokenModalOpen] = useState(false)

	const handleAddRule = () => {
		openRuleEditor()
	}

	const handleOpenGrantToken = () => {
		setIsGrantTokenModalOpen(true)
	}

	const handleCloseGrantToken = () => {
		setIsGrantTokenModalOpen(false)
	}

	const handleGrantTokenSuccess = () => {
		loadTokenData() // Refresh data after granting tokens
	}

	const handleEditRule = (rule: any) => {
		openRuleEditor(rule)
	}

	const handleDeleteRule = (ruleId: string) => {
		if (confirm('Bạn có chắc chắn muốn xóa luật thưởng này?')) {
			deleteRule(ruleId)
		}
	}

	const handleToggleRuleStatus = (ruleId: string) => {
		toggleRuleStatus(ruleId)
	}

	const handleDuplicateRule = (rule: any) => {
		duplicateRule(rule)
	}

	const handleViewRuleDetails = (rule: any) => {
		// Could open a detail modal here
		console.log('View rule details:', rule)
	}

	const handleViewTransactionDetails = (transaction: any) => {
		setSelectedTransaction(transaction)
	}

	const handleRetryTransaction = (transactionId: string) => {
		retryTransaction(transactionId)
	}

	const getTabIcon = (tab: string) => {
		switch (tab) {
			case 'dashboard': return <BarChart3 size={18} />
			case 'rules': return <List size={18} />
			case 'transactions': return <Activity size={18} />
			default: return <BarChart3 size={18} />
		}
	}

	const getTabLabel = (tab: string) => {
		switch (tab) {
			case 'dashboard': return 'Tổng quan'
			case 'rules': return 'Luật thưởng'
			case 'transactions': return 'Giao dịch'
			default: return tab
		}
	}

	return (
		<div style={{ padding: '24px' }}>
			{/* Loading State */}
			{loading && (
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '400px',
					gap: '16px'
				}}>
					<div style={{
						width: '48px',
						height: '48px',
						border: '4px solid var(--muted)',
						borderTop: '4px solid var(--primary)',
						borderRadius: '50%',
						animation: 'spin 1s linear infinite'
					}} />
					<p style={{ color: 'var(--muted-foreground)' }}>Đang tải dữ liệu...</p>
				</div>
			)}

			{/* Error State */}
			{error && !loading && (
				<div style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					minHeight: '400px',
					gap: '16px',
					padding: '32px',
					background: 'var(--card)',
					borderRadius: 'var(--radius-lg)',
					border: '1px solid var(--destructive)'
				}}>
					<AlertTriangle size={48} color="var(--destructive)" />
					<h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--destructive)' }}>Lỗi tải dữ liệu</h3>
					<p style={{ color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '400px' }}>{error}</p>
					<button className="btn btn-primary" onClick={() => loadTokenData()}>
						<RefreshCw size={16} />
						Thử lại
					</button>
				</div>
			)}

			{/* Header */}
			{!loading && !error && (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
					<div>
						<h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>
							Hệ thống thưởng Token
						</h1>
						<p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
							Quản lý luật thưởng ERC-20 và theo dõi giao dịch token cho học sinh
						</p>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<button
							className="btn btn-secondary"
							onClick={handleOpenGrantToken}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '8px'
							}}
						>
							<Coins size={18} />
							Cấp Token
						</button>
						<button
							className="btn btn-primary"
							onClick={handleAddRule}
						>
							<Plus size={18} />
							Thêm luật thưởng
						</button>
					</div>
				</div>
			)}

			{/* Tab Navigation */}
			<div style={{ 
				display: 'flex', 
				gap: '4px',
				marginBottom: '24px',
				background: 'var(--muted)',
				padding: '4px',
				borderRadius: 'var(--radius-md)',
				width: 'fit-content'
			}}>
				{[
					{ id: 'dashboard', label: 'Tổng quan', icon: BarChart3 },
					{ id: 'rules', label: 'Luật thưởng', icon: List },
					{ id: 'transactions', label: 'Giao dịch', icon: Activity }
				].map(tab => (
					<button
						key={tab.id}
						className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
						onClick={() => setActiveTab(tab.id as any)}
						style={{ 
							display: 'flex', 
							alignItems: 'center', 
							gap: '8px',
							padding: '8px 16px'
						}}
					>
						<tab.icon size={16} />
						{tab.label}
						{tab.id === 'rules' && (
							<span style={{ 
								fontSize: '12px', 
								background: 'var(--primary)', 
								color: 'white', 
								padding: '2px 6px', 
								borderRadius: '10px',
								marginLeft: '4px'
							}}>
								{rules.length}
							</span>
						)}
						{tab.id === 'transactions' && (
							<span style={{ 
								fontSize: '12px', 
								background: 'var(--primary)', 
								color: 'white', 
								padding: '2px 6px', 
								borderRadius: '10px',
								marginLeft: '4px'
							}}>
								{transactions.length}
							</span>
						)}
					</button>
				))}
			</div>

			{/* Filters & Search */}
			{(activeTab === 'rules' || activeTab === 'transactions') && (
				<div style={{ 
					display: 'flex', 
					justifyContent: 'space-between', 
					alignItems: 'center',
					marginBottom: '24px',
					gap: '16px',
					flexWrap: 'wrap'
				}}>
					<SearchBar
						value={filters.search}
						onChange={(value) => updateFilter('search', value)}
						placeholder="Tìm kiếm luật thưởng, giao dịch..."
					/>

					<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
						<button
							className="btn btn-secondary"
							onClick={() => window.location.reload()}
						>
							<RefreshCw size={18} />
							Làm mới
						</button>
					</div>
				</div>
			)}

			{/* Filters */}
			{(activeTab === 'rules' || activeTab === 'transactions') && (
				<div className="filters-container">
					{activeTab === 'rules' && (
						<div className="filter-group">
							<label className="filter-label">Loại thưởng</label>
							<select
								className="filter-select"
								value={filters.ruleType}
								onChange={(e) => updateFilter('ruleType', e.target.value)}
							>
								<option value="all">Tất cả loại</option>
								<option value="course_completion">Hoàn thành khóa học</option>
								<option value="exam_score">Điểm thi</option>
								<option value="daily_login">Đăng nhập hàng ngày</option>
								<option value="assignment_submission">Nộp bài tập</option>
								<option value="quiz_perfect">Quiz hoàn hảo</option>
								<option value="streak_bonus">Bonus streak</option>
								<option value="referral">Giới thiệu</option>
								<option value="achievement">Thành tích</option>
								<option value="custom">Tùy chỉnh</option>
							</select>
						</div>
					)}

					{activeTab === 'transactions' && (
						<>
							<div className="filter-group">
								<label className="filter-label">Trạng thái</label>
								<select
									className="filter-select"
									value={filters.status}
									onChange={(e) => updateFilter('status', e.target.value)}
								>
									<option value="all">Tất cả trạng thái</option>
									<option value="completed">Hoàn thành</option>
									<option value="pending">Đang chờ</option>
									<option value="processing">Đang xử lý</option>
									<option value="failed">Thất bại</option>
									<option value="cancelled">Đã hủy</option>
								</select>
							</div>

							<div className="filter-group">
								<label className="filter-label">Thời gian</label>
								<select
									className="filter-select"
									value={filters.dateRange}
									onChange={(e) => updateFilter('dateRange', e.target.value)}
								>
									<option value="today">Hôm nay</option>
									<option value="week">Tuần này</option>
									<option value="month">Tháng này</option>
									<option value="year">Năm này</option>
									<option value="all">Tất cả</option>
								</select>
							</div>

							<div className="filter-group">
								<label className="filter-label">Token</label>
								<select
									className="filter-select"
									value={filters.tokenSymbol}
									onChange={(e) => updateFilter('tokenSymbol', e.target.value)}
								>
									<option value="all">Tất cả token</option>
									<option value="LEARN">LEARN</option>
									<option value="CERT">CERT</option>
								</select>
							</div>
						</>
					)}

					<div className="filter-group">
						<label className="filter-label">Kết quả</label>
						<div style={{ 
							padding: '8px 12px',
							background: 'var(--muted)',
							borderRadius: 'var(--radius-md)',
							fontSize: '14px',
							fontWeight: 500
						}}>
							{activeTab === 'rules' && `${rules.length} luật thưởng`}
							{activeTab === 'transactions' && `${transactions.length} giao dịch`}
						</div>
					</div>
				</div>
			)}

			{/* Content */}
			<div style={{ 
				background: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
				padding: '24px',
				boxShadow: 'var(--shadow-sm)',
				minHeight: '500px'
			}}>
				{activeTab === 'dashboard' && (
					<RewardDashboard
						stats={dashboard.stats}
						tokenInfo={dashboard.tokenInfo}
						topUsers={dashboard.topUsers}
						rulePerformance={dashboard.rulePerformance}
					/>
				)}

				{activeTab === 'rules' && (
					<div>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
							<h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
								Quản lý luật thưởng ({rules.length})
							</h2>
							<button
								className="btn btn-primary"
								onClick={handleAddRule}
							>
								<Plus size={16} />
								Thêm luật mới
							</button>
						</div>
						<RewardRulesTable
							rules={rules}
							onEdit={handleEditRule}
							onDelete={handleDeleteRule}
							onToggleStatus={handleToggleRuleStatus}
							onDuplicate={handleDuplicateRule}
							onViewDetails={handleViewRuleDetails}
						/>
					</div>
				)}

				{activeTab === 'transactions' && (
					<div>
						<h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
							Nhật ký giao dịch ({transactions.length})
						</h2>
						<TransactionLog
							transactions={transactions}
							onViewDetails={handleViewTransactionDetails}
							onRetry={handleRetryTransaction}
						/>
					</div>
				)}
			</div>

			{/* Rule Editor Modal */}
			<RuleEditorModal
				isOpen={isRuleEditorOpen}
				onClose={closeRuleEditor}
				onSave={saveRule}
				editingRule={editingRule}
				title={editingRule ? 'Chỉnh sửa luật thưởng' : 'Thêm luật thưởng mới'}
			/>

			{/* Transaction Details Modal */}
			<TransactionDetailModal
				isOpen={!!selectedTransaction}
				onClose={() => setSelectedTransaction(null)}
				transaction={selectedTransaction}
			/>

			{/* Grant Token Modal */}
			<GrantTokenModal
				isOpen={isGrantTokenModalOpen}
				onClose={handleCloseGrantToken}
				onSuccess={handleGrantTokenSuccess}
			/>
		</div>
	)
}
