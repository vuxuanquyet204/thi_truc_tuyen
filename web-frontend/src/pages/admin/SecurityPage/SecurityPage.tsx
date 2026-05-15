import React, { useState } from 'react'
import { 
	Shield, 
	ShieldAlert, 
	Activity, 
	AlertTriangle, 
	TrendingUp, 
	Users,
	Search,
	Filter,
	RefreshCw
} from 'lucide-react'
import { useSecurityDashboard } from '@/features/admin/hooks'
import { ModuleStatusGrid, ActivityLog } from '@/features/admin/ui/security'
import { SearchBar } from '@/features/admin/ui/common'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import { ModuleDetailModal } from '@/features/admin/ui/modals'
import '@/features/admin/ui/common/styles/FormStyles.css'
import '@/pages/admin/SecurityPage/Security.module.css'

export default function SecurityPage(): JSX.Element {
	const {
		dashboard,
		modules,
		activities,
		alerts,
		filters,
		updateFilter,
		autoRefresh,
		setAutoRefresh,
		resolveAlert,
		getUnresolvedAlerts,
		getActiveModules
	} = useSecurityDashboard()

	const [selectedModule, setSelectedModule] = useState<any>(null)
	const [isModuleDetailOpen, setIsModuleDetailOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<'modules' | 'activities' | 'alerts'>('modules')

	const unresolvedAlerts = getUnresolvedAlerts()
	const activeModules = getActiveModules()

	const handleModuleClick = (module: any) => {
		setSelectedModule(module)
		setIsModuleDetailOpen(true)
	}

	const handleResolveAlert = (alertId: string) => {
		resolveAlert(alertId)
	}

	return (
		<div style={{ padding: '24px' }}>
			{/* Header */}
			<div style={{ marginBottom: '24px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
					<div>
						<h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 8px 0' }}>
							Bảo Mật & Blockchain
						</h1>
						<p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
							Giám sát hệ thống blockchain và bảo mật thời gian thực
						</p>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<div className="realtime-indicator">
							<div className="realtime-pulse" />
							<span>Live monitoring</span>
						</div>
						
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
							<input
								type="checkbox"
								checked={autoRefresh}
								onChange={(e) => setAutoRefresh(e.target.checked)}
								style={{ width: '18px', height: '18px', cursor: 'pointer' }}
							/>
							<span style={{ fontSize: '14px' }}>Tự động làm mới</span>
						</label>
					</div>
				</div>
			</div>

			{/* Stats Overview */}
			<div style={{ 
				display: 'grid', 
				gridTemplateColumns: 'repeat(4, 1fr)', 
				gap: '16px',
				marginBottom: '24px'
			}}>
				{/* Card 1 - Module đang hoạt động */}
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
							<Shield size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Module đang hoạt động
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{dashboard.overview.activeModules}/{dashboard.overview.totalModules}
							</div>
							<div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
								{Math.round((dashboard.overview.activeModules / dashboard.overview.totalModules) * 100)}% uptime
							</div>
						</div>
					</div>
				</div>

				{/* Card 2 - Cảnh báo chưa xử lý */}
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
							<AlertTriangle size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Cảnh báo chưa xử lý
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{unresolvedAlerts.length}
							</div>
							{unresolvedAlerts.length > 0 && (
								<div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
									Cần chú ý!
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Card 3 - Tổng giao dịch */}
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
							<Activity size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Tổng giao dịch
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{dashboard.overview.totalTransactions.toLocaleString()}
							</div>
							<div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
								+{modules.reduce((sum, m) => sum + m.todayTransactions, 0)} hôm nay
							</div>
						</div>
					</div>
				</div>

				{/* Card 4 - Điểm bảo mật TB */}
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
							<TrendingUp size={20} />
						</div>
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
								Điểm bảo mật TB
							</div>
							<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
								{dashboard.overview.averageSecurityScore}
							</div>
							<div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
								/ 100
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters & Search */}
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
					placeholder="Tìm kiếm module, mô tả..."
				/>

				<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
					<button
						className={`btn ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
						onClick={() => setAutoRefresh(!autoRefresh)}
					>
						<RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
						{autoRefresh ? 'Đang làm mới' : 'Làm mới'}
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="filters-container">
				<div className="filter-group">
					<label className="filter-label">Module</label>
					<select
						className="filter-select"
						value={filters.module}
						onChange={(e) => updateFilter('module', e.target.value)}
					>
						<option value="all">Tất cả modules</option>
						<option value="anti_cheat">Camera AI + Smart Contract</option>
						<option value="copyright_protection">Document Hash + Ethereum</option>
						<option value="token_rewards">ERC-20 + Learning Ecosystem</option>
						<option value="multisig_wallet">Multi-signature + Node.js</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Trạng thái</label>
					<select
						className="filter-select"
						value={filters.status}
						onChange={(e) => updateFilter('status', e.target.value)}
					>
						<option value="all">Tất cả</option>
						<option value="active">Hoạt động</option>
						<option value="warning">Cảnh báo</option>
						<option value="error">Lỗi</option>
						<option value="maintenance">Bảo trì</option>
						<option value="offline">Offline</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Mức độ</label>
					<select
						className="filter-select"
						value={filters.severity}
						onChange={(e) => updateFilter('severity', e.target.value)}
					>
						<option value="all">Tất cả mức độ</option>
						<option value="info">Thông tin</option>
						<option value="warning">Cảnh báo</option>
						<option value="error">Lỗi</option>
						<option value="critical">Nghiêm trọng</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Thời gian</label>
					<select
						className="filter-select"
						value={filters.timeRange}
						onChange={(e) => updateFilter('timeRange', e.target.value)}
					>
						<option value="today">Hôm nay</option>
						<option value="week">Tuần này</option>
						<option value="month">Tháng này</option>
						<option value="all">Tất cả</option>
					</select>
				</div>

				<div className="filter-group">
					<label className="filter-label">Kết quả</label>
					<div style={{ 
						padding: '8px 12px',
						background: 'var(--muted)',
						borderRadius: 'var(--radius-md)',
						fontSize: '14px',
						fontWeight: 500
					}}>
						{activeTab === 'modules' && `${modules.length} modules`}
						{activeTab === 'activities' && `${activities.length} hoạt động`}
						{activeTab === 'alerts' && `${alerts.length} cảnh báo`}
					</div>
				</div>
			</div>

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
					{ id: 'modules', label: 'Modules', icon: Shield },
					{ id: 'activities', label: 'Hoạt động', icon: Activity },
					{ id: 'alerts', label: 'Cảnh báo', icon: AlertTriangle }
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
						{tab.id === 'alerts' && unresolvedAlerts.length > 0 && (
							<Badge variant="danger" style={{ fontSize: '10px', padding: '2px 6px' }}>
								{unresolvedAlerts.length}
							</Badge>
						)}
					</button>
				))}
			</div>

			{/* Content */}
			<div style={{ 
				background: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
				padding: '24px',
				boxShadow: 'var(--shadow-sm)',
				minHeight: '500px'
			}}>
				{activeTab === 'modules' && (
					<div>
						<h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
							Trạng thái Modules Blockchain
						</h2>
						<ModuleStatusGrid
							modules={modules}
							onModuleClick={handleModuleClick}
						/>
					</div>
				)}

				{activeTab === 'activities' && (
					<div>
						<h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
							Nhật ký hoạt động
						</h2>
						<ActivityLog activities={activities} />
					</div>
				)}

				{activeTab === 'alerts' && (
					<div>
						<h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
							Cảnh báo bảo mật ({alerts.length})
						</h2>
						{alerts.length === 0 ? (
							<div className="admin-table-empty">
								<div className="admin-table-empty-icon"></div>
								<div className="admin-table-empty-text">Không có cảnh báo nào</div>
							</div>
						) : (
							<div style={{ maxHeight: '600px', overflowY: 'auto' }}>
								<table className="admin-table">
									<thead>
										<tr>
											<th>Thời gian</th>
											<th>Module</th>
											<th>Loại</th>
											<th>Mô tả</th>
											<th>Mức độ</th>
											<th>Trạng thái</th>
											<th>Hành động</th>
										</tr>
									</thead>
									<tbody>
										{alerts.map(alert => (
											<tr key={alert.id} className={`alert-${alert.severity}`}>
												<td style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
													{new Date(alert.timestamp).toLocaleString('vi-VN')}
												</td>
												<td>
													<Badge variant="info" style={{ fontSize: '11px' }}>
														{alert.module}
													</Badge>
												</td>
												<td style={{ fontSize: '13px' }}>
													{alert.type.replace(/_/g, ' ')}
												</td>
												<td>
													<div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
														{alert.title}
													</div>
													<div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
														{alert.description}
													</div>
												</td>
												<td>
													<Badge variant={
														alert.severity === 'critical' ? 'danger' :
														alert.severity === 'high' ? 'danger' :
														alert.severity === 'medium' ? 'warning' : 'secondary'
													} style={{ fontSize: '11px' }}>
														{alert.severity.toUpperCase()}
													</Badge>
												</td>
												<td>
													{alert.resolved ? (
														<Badge variant="success" style={{ fontSize: '11px' }}>
															Đã xử lý
														</Badge>
													) : (
														<Badge variant="danger" style={{ fontSize: '11px' }}>
															Chưa xử lý
														</Badge>
													)}
												</td>
												<td>
													{!alert.resolved && (
														<button
															className="btn btn-sm btn-secondary"
															onClick={() => handleResolveAlert(alert.id)}
														>
															Xử lý
														</button>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Module Detail Modal */}
			<ModuleDetailModal
				isOpen={isModuleDetailOpen}
				onClose={() => {
					setIsModuleDetailOpen(false)
					setSelectedModule(null)
				}}
				module={selectedModule}
			/>
		</div>
	)
}
