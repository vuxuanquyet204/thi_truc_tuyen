import React, { useState, useRef } from 'react'
import {
	Settings,
	Plus,
	Download,
	Upload,
	FileSpreadsheet,
	FileText,
	Eye,
	Edit,
	Trash2,
	Shield,
	Users,
	Activity,
	Server,
	HardDrive,
	AlertTriangle,
	CheckCircle,
	BarChart3,
	Clock
} from 'lucide-react'
import Button from '@/features/admin/ui/common/primitives/Button'
import Badge from '@/features/admin/ui/common/Badge'
import { SystemHealthWidget, AdminUsersTable, GlobalSettings, AuditLog } from '@/features/admin/ui/admin'
import { AdminDetailModal, AddAdminModal } from '@/features/admin/ui/modals/Admin'
import { useSystemAdmin } from '@/features/admin/hooks'
import {
	exportAdminsToExcel,
	importAdminsFromExcel,
	generateAdminExcelTemplate
} from '@/features/admin/utils'
import { toast } from '@/foundation/contexts/ToastContext'
import styles from '@/pages/admin/AdminPage/AdminPage.module.css'
import '@/features/admin/ui/common/styles/common.css'

export default function AdminPage(): JSX.Element {
	const {
		admins,
		systemHealth,
		settings,
		auditLogs,
		dashboard,
		alerts,
		activities,
		refreshSystemHealth,
		updateSetting,
		addSetting,
		deleteSetting,
		resetSetting,
		updateAdmin,
		deleteAdmin,
		addAdmin,
		toggleAdminStatus,
		resetAdminPassword,
		toggleTwoFactor,
		loading,
		totalAdmins
	} = useSystemAdmin()

	const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'settings' | 'audit'>('overview')
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingAdmin, setEditingAdmin] = useState<any>(null)
	const [selectedAdmin, setSelectedAdmin] = useState<any>(null)
	const [showStats, setShowStats] = useState(true)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleAddAdmin = () => {
		setEditingAdmin(null)
		setShowAddModal(true)
	}

	const handleEditAdmin = (admin: any) => {
		setEditingAdmin(admin)
		setShowAddModal(true)
	}

	const handleDeleteAdmin = (adminId: string) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa admin này?')) {
			deleteAdmin(adminId)
		}
	}

	const handleViewAdmin = (admin: any) => {
		setSelectedAdmin(admin)
	}

	const handleSaveAdmin = (adminForm: any) => {
		if (editingAdmin) {
			updateAdmin(adminForm, editingAdmin.id)
		} else {
			addAdmin(adminForm)
		}
		setShowAddModal(false)
		setEditingAdmin(null)
	}

	const handleToggleAdminStatus = (adminId: string, newStatus: any) => {
		toggleAdminStatus(adminId, newStatus)
	}

	const handleResetPassword = (adminId: string) => {
		if (window.confirm('Bạn có chắc chắn muốn đặt lại mật khẩu cho admin này?')) {
			resetAdminPassword(adminId)
			toast.success('Mật khẩu đã được đặt lại thành công!')
		}
	}

	const handleToggleTwoFactor = (adminId: string) => {
		toggleTwoFactor(adminId)
	}

	const handleExportAdmins = () => {
		try {
			const filename = `admin-users-${new Date().toISOString().split('T')[0]}.xlsx`
			exportAdminsToExcel(admins, filename)
			toast.success('Đã xuất file Excel thành công!')
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất file Excel')
		}
	}

	const handleImportAdmins = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const importedAdmins = await importAdminsFromExcel(file)
			for (const adminForm of importedAdmins) {
				addAdmin(adminForm)
			}
			toast.success(`Đã nhập thành công ${importedAdmins.length} admin`)
		} catch (error) {
			console.error('Import error:', error)
			toast.error(`Lỗi nhập file: ${error instanceof Error ? error.message : 'Unknown error'}`)
		} finally {
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleDownloadTemplate = () => {
		generateAdminExcelTemplate()
		toast.success('Đã tải template Excel thành công!')
	}

	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	const formatBytes = (bytes: number) => {
		if (bytes >= 1000000000000) return `${(bytes / 1000000000000).toFixed(1)}TB`
		if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)}GB`
		if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)}MB`
		if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)}KB`
		return `${bytes}B`
	}

	const formatPercentage = (value: number) => {
		return `${value.toFixed(1)}%`
	}

	return (
		<div className={styles['admin-page']}>
			<div className={styles['admin-header']}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
					<div>
						<div className={styles['admin-title']}>
							<Settings size={32} />
							<h1>Quản trị Hệ thống</h1>
						</div>
						<p className={styles['admin-subtitle']}>
							Quản lý admin users, cài đặt hệ thống và theo dõi audit logs
						</p>
					</div>
					<div className={styles['admin-actions']}>
						<Button
							variant="secondary"
							onClick={() => setShowStats(!showStats)}
							title="Ẩn/hiện thống kê"
							icon={<BarChart3 size={18} />}
						/>
						<Button
							variant="secondary"
							onClick={handleDownloadTemplate}
							title="Tải template Excel"
							icon={<FileText size={18} />}
						>
							Template
						</Button>
						<Button
							variant="secondary"
							onClick={handleImportAdmins}
							title="Nhập Excel"
							icon={<Upload size={18} />}
						>
							Nhập Excel
						</Button>
						<Button
							variant="secondary"
							onClick={handleExportAdmins}
							title="Xuất Excel"
							icon={<FileSpreadsheet size={18} />}
						>
							Xuất Excel
						</Button>
						<Button
							variant="primary"
							onClick={handleAddAdmin}
							icon={<Plus size={18} />}
						>
							Thêm admin
						</Button>
					</div>
				</div>

				{showStats && (
					<div style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: '16px',
						marginBottom: '24px'
					}}>
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
									<Users size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Tổng Admin
									</div>
									<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.totalAdmins}
									</div>
									<div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.activeAdmins} đang hoạt động
									</div>
								</div>
							</div>
						</div>

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
										Đăng nhập gần đây
									</div>
									<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.recentLogins}
									</div>
									<div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.failedLogins} thất bại
									</div>
								</div>
							</div>
						</div>

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
									<Shield size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										2FA Enabled
									</div>
									<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.twoFactorEnabled}
									</div>
									<div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.totalAdmins - dashboard.stats.twoFactorEnabled} chưa bật
									</div>
								</div>
							</div>
						</div>

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
										Suspended
									</div>
									<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.suspendedAdmins}
									</div>
									<div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.pendingAdmins} chờ duyệt
									</div>
								</div>
							</div>
						</div>

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
								background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
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
									background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
									color: 'white',
									flexShrink: 0
								}}>
									<Server size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										System Health
									</div>
									<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{systemHealth.overall === 'healthy' ? 'Khỏe mạnh' : 'Cảnh báo'}
									</div>
									<div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 600, marginTop: '4px' }}>
										Uptime: {formatPercentage(systemHealth.uptime.current)}
									</div>
								</div>
							</div>
						</div>

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
								background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
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
									background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
									color: 'white',
									flexShrink: 0
								}}>
									<HardDrive size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Storage Usage
									</div>
									<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{formatPercentage((systemHealth.storage.used / systemHealth.storage.total) * 100)}
									</div>
									<div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginTop: '4px' }}>
										{formatBytes(systemHealth.storage.used)} / {formatBytes(systemHealth.storage.total)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className={styles['admin-tabs']}>
				<button
					className={`${styles['admin-tab']} ${activeTab === 'overview' ? styles['active'] : ''}`}
					onClick={() => setActiveTab('overview')}
				>
					<BarChart3 size={16} />
					Tổng quan
				</button>
				<button
					className={`${styles['admin-tab']} ${activeTab === 'admins' ? styles['active'] : ''}`}
					onClick={() => setActiveTab('admins')}
				>
					<Users size={16} />
					Admin Users ({totalAdmins})
				</button>
				<button
					className={`${styles['admin-tab']} ${activeTab === 'settings' ? styles['active'] : ''}`}
					onClick={() => setActiveTab('settings')}
				>
					<Settings size={16} />
					Cài đặt ({settings.length})
				</button>
				<button
					className={`${styles['admin-tab']} ${activeTab === 'audit' ? styles['active'] : ''}`}
					onClick={() => setActiveTab('audit')}
				>
					<Activity size={16} />
					Audit Log ({auditLogs.length})
				</button>
			</div>

			<div className={styles['admin-tab-content']}>
				{activeTab === 'overview' && (
					<div className={styles['overview-content']}>
						<SystemHealthWidget
							systemHealth={systemHealth}
							onRefresh={refreshSystemHealth}
							loading={loading}
						/>

						<div className={styles['recent-activities']}>
							<h3>Hoạt động gần đây</h3>
							<div className={styles['activities-list']}>
								{activities.slice(0, 5).map((activity) => (
									<div key={activity.id} className={styles['activity-item']}>
										<div className={styles['activity-icon']}>
											<Activity size={16} />
										</div>
										<div className={styles['activity-content']}>
											<div className={styles['activity-title']}>{activity.description}</div>
											<div className={styles['activity-meta']}>
												<span>{activity.adminName}</span>
												<span>•</span>
												<span>{new Date(activity.timestamp).toLocaleString('vi-VN')}</span>
											</div>
										</div>
										<div className={styles['activity-status']}>
											<Badge variant={activity.status === 'completed' ? 'success' : 'warning'}>
												{activity.status}
											</Badge>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className={styles['critical-alerts']}>
							<h3>Cảnh báo quan trọng</h3>
							<div className={styles['alerts-list']}>
								{alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).slice(0, 3).map((alert) => (
									<div key={alert.id} className={`${styles['alert-item']} ${styles['critical']}`}>
										<div className={styles['alert-icon']}>
											<AlertTriangle size={16} />
										</div>
										<div className={styles['alert-content']}>
											<div className={styles['alert-title']}>{alert.title}</div>
											<div className={styles['alert-message']}>{alert.message}</div>
											<div className={styles['alert-meta']}>
												<span>{alert.source}</span>
												<span>•</span>
												<span>{new Date(alert.timestamp).toLocaleString('vi-VN')}</span>
											</div>
										</div>
										<div className={styles['alert-actions']}>
											<Button size="sm" variant="outline" icon={<CheckCircle size={14} />} />
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{activeTab === 'admins' && (
					<AdminUsersTable
						admins={admins}
						onEditAdmin={handleEditAdmin}
						onDeleteAdmin={handleDeleteAdmin}
						onViewAdmin={handleViewAdmin}
						onToggleStatus={handleToggleAdminStatus}
						onResetPassword={handleResetPassword}
						onToggleTwoFactor={handleToggleTwoFactor}
						loading={loading}
						emptyMessage="Không có admin nào phù hợp với bộ lọc"
					/>
				)}

				{activeTab === 'settings' && (
					<GlobalSettings
						settings={settings}
						onUpdateSetting={updateSetting}
						onResetSetting={resetSetting}
						onAddSetting={addSetting}
						onDeleteSetting={deleteSetting}
						loading={loading}
					/>
				)}

				{activeTab === 'audit' && (
					<AuditLog
						logs={auditLogs}
						onRefresh={() => {}}
						onExport={() => {}}
						loading={loading}
						emptyMessage="Không có audit log nào"
					/>
				)}
			</div>

			<AdminDetailModal
				isOpen={!!selectedAdmin}
				onClose={() => setSelectedAdmin(null)}
				admin={selectedAdmin}
			/>

			<AddAdminModal
				isOpen={showAddModal}
				onClose={() => {
					setShowAddModal(false)
					setEditingAdmin(null)
				}}
				onSave={handleSaveAdmin}
				editingAdmin={editingAdmin}
			/>

			<input
				ref={fileInputRef}
				type="file"
				accept=".xlsx,.xls"
				onChange={handleFileChange}
				style={{ display: 'none' }}
			/>
		</div>
	)
}
