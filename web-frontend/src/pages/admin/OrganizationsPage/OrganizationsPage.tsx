import React, { useState, useRef } from 'react'
import {
	Building2,
	Plus,
	RefreshCw,
	Download,
	Upload,
	FileSpreadsheet,
	Users,
	TrendingUp,
	Shield,
	CheckCircle,
	AlertTriangle,
	Globe,
	Calendar,
	DollarSign,
	BookOpen,
	GraduationCap,
	FileText,
	Mail,
	Phone
} from 'lucide-react'
import { useOrganizations } from '@/features/admin/hooks'
import { OrganizationTable, OrganizationFilterBar, OrganizationEditorModal } from '@/features/admin/ui/organizations'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import { OrganizationDetailModal } from '@/features/admin/ui/modals'
import StatCard from '@/shared/ui/atoms/StatCard/StatCard'
import {
	exportOrganizationsToExcel,
	importOrganizationsFromExcel,
	generateOrganizationExcelTemplate
} from '@/features/organizations/utils'
import '@/features/admin/ui/common/styles/common.css'
import '@/pages/admin/OrganizationsPage/Organizations.module.css'
import { toast } from '@/foundation/contexts/ToastContext'

export default function OrganizationsPage(): JSX.Element {
	const {
		organizations,
		allOrganizations,
		dashboard,
		filters,
		updateFilter,
		clearFilters,
		addOrganization,
		updateOrganization,
		deleteOrganization,
		toggleOrganizationStatus,
		toggleOrganizationVerification,
		loading,
		totalCount,
		filteredCount
	} = useOrganizations()

	const [showAddModal, setShowAddModal] = useState(false)
	const [editingOrganization, setEditingOrganization] = useState<any>(null)
	const [selectedOrganization, setSelectedOrganization] = useState<any>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleAddOrganization = () => {
		setEditingOrganization(null)
		setShowAddModal(true)
	}

	const handleEditOrganization = (organization: any) => {
		setEditingOrganization(organization)
		setShowAddModal(true)
	}

	const handleDeleteOrganization = (organizationId: string) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa tổ chức này?')) {
			deleteOrganization(organizationId)
		}
	}

	const handleToggleOrganizationStatus = (organizationId: string, newStatus: any) => {
		toggleOrganizationStatus(organizationId, newStatus)
	}

	const handleToggleOrganizationVerification = (organizationId: string, newStatus: any) => {
		toggleOrganizationVerification(organizationId, newStatus)
	}

	const handleOrganizationClick = (organization: any) => {
		setSelectedOrganization(organization)
	}

	const handleSaveOrganization = (organizationForm: any) => {
		if (editingOrganization) {
			updateOrganization(organizationForm, editingOrganization.id)
		} else {
			addOrganization(organizationForm)
		}
		setShowAddModal(false)
		setEditingOrganization(null)
	}

	// Excel Export Function
	const handleExportOrganizations = () => {
		try {
			const filename = `organizations-${new Date().toISOString().split('T')[0]}.xlsx`
			exportOrganizationsToExcel(organizations, filename)
			toast.success('Đã xuất file Excel thành công!')
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất file Excel')
		}
	}

	// Excel Import Function
	const handleImportOrganizations = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const importedOrganizations = await importOrganizationsFromExcel(file)

			// Process imported organizations
			for (const organizationForm of importedOrganizations) {
				addOrganization(organizationForm)
			}

			toast.success(`Đã nhập thành công ${importedOrganizations.length} tổ chức`)
		} catch (error) {
			console.error('Import error:', error)
			toast.error(`Lỗi nhập file: ${error instanceof Error ? error.message : 'Unknown error'}`)
		} finally {
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	// Generate Excel Template Function
	const handleDownloadTemplate = () => {
		generateOrganizationExcelTemplate()
		toast.success('Đã tải template Excel thành công!')
	}

	// Helper functions moved to modal components
	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	const formatCurrency = (amount: number, currency: string) => {
		if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)}B ${currency}`
		if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M ${currency}`
		if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K ${currency}`
		return `${amount} ${currency}`
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'var(--success)'
			case 'inactive': return 'var(--muted-foreground)'
			case 'suspended': return 'var(--danger)'
			case 'pending': return 'var(--warning)'
			case 'archived': return 'var(--secondary)'
			default: return 'var(--muted-foreground)'
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'active': return <CheckCircle size={16} />
			case 'inactive': return <Shield size={16} />
			case 'suspended': return <AlertTriangle size={16} />
			case 'pending': return <Calendar size={16} />
			case 'archived': return <Shield size={16} />
			default: return <Shield size={16} />
		}
	}

	return (
		<div style={{ padding: '24px' }}>
			{/* Header */}
			<div style={{ marginBottom: '32px' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
					<div>
						<h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>
							<Building2 size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
							Quản lý Tổ chức
						</h1>
						<p style={{ color: 'var(--muted-foreground)', margin: 0 }}>
							Quản lý và theo dõi các tổ chức sử dụng hệ thống học trực tuyến
						</p>
					</div>

					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<button
							className="btn btn-secondary"
							onClick={handleDownloadTemplate}
							title="Tải template Excel"
						>
							<FileText size={18} />
							Template
						</button>
						<button
							className="btn btn-secondary"
							onClick={handleImportOrganizations}
							title="Nhập Excel"
						>
							<Upload size={18} />
							Nhập Excel
						</button>
						<button
							className="btn btn-secondary"
							onClick={handleExportOrganizations}
							title="Xuất Excel"
						>
							<FileSpreadsheet size={18} />
							Xuất Excel
						</button>
						<button
							className="btn btn-primary"
							onClick={handleAddOrganization}
						>
							<Plus size={18} />
							Thêm tổ chức
						</button>
					</div>
				</div>

				{/* Stats Overview */}
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(3, 1fr)', 
					gap: '16px',
					marginBottom: '24px'
				}}>
					{/* Card 1 - Tổng tổ chức */}
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
								<Building2 size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
									Tổng tổ chức
								</div>
								<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
									{dashboard.stats.totalOrganizations}
								</div>
								<div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
									{dashboard.stats.activeOrganizations} đang hoạt động
								</div>
							</div>
						</div>
					</div>

					{/* Card 2 - Tổng nhân viên */}
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
								<Users size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
									Tổng nhân viên
								</div>
								<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
									{formatNumber(dashboard.stats.totalEmployees)}
								</div>
								<div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
									TB: {formatNumber(dashboard.stats.averageEmployees)}/tổ chức
								</div>
							</div>
						</div>
					</div>

					{/* Card 3 - Tổng học viên */}
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
								<GraduationCap size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
									Tổng học viên
								</div>
								<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
									{formatNumber(dashboard.stats.totalStudents)}
								</div>
								<div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
									TB: {formatNumber(dashboard.stats.averageStudents)}/tổ chức
								</div>
							</div>
						</div>
					</div>

					{/* Card 4 - Tổng khóa học */}
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
								<BookOpen size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
									Tổng khóa học
								</div>
								<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
									{dashboard.stats.totalCourses}
								</div>
								<div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 600, marginTop: '4px' }}>
									TB: {dashboard.stats.averageCourses}/tổ chức
								</div>
							</div>
						</div>
					</div>

					{/* Card 5 - Tổng doanh thu */}
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
								<DollarSign size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
									Tổng doanh thu
								</div>
								<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
									{formatCurrency(dashboard.stats.totalRevenue, 'VND')}
								</div>
								<div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
									{dashboard.stats.premiumOrganizations} tổ chức premium
								</div>
							</div>
						</div>
					</div>

					{/* Card 6 - Đã xác minh */}
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
								<CheckCircle size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
									Đã xác minh
								</div>
								<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
									{dashboard.stats.verifiedOrganizations}
								</div>
								<div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginTop: '4px' }}>
									{dashboard.stats.pendingOrganizations} chờ xác minh
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filter Bar */}
			<OrganizationFilterBar
				filters={filters}
				updateFilter={updateFilter}
				organizations={allOrganizations}
				onClearFilters={clearFilters}
			/>

			{/* Results Summary */}
			<div style={{ 
				display: 'flex', 
				justifyContent: 'space-between', 
				alignItems: 'center', 
				marginBottom: '16px',
				padding: '12px 16px',
				background: 'var(--muted)',
				borderRadius: 'var(--radius-md)',
				border: '1px solid var(--border)'
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
					<span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
						Hiển thị <strong>{filteredCount}</strong> trong tổng số <strong>{totalCount}</strong> tổ chức
					</span>
					{filters.search && (
						<Badge variant="info">
							Tìm kiếm: "{filters.search}"
						</Badge>
					)}
				</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<button
						className="btn btn-sm btn-outline"
						onClick={() => {/* TODO: Refresh data */}}
						disabled={loading}
					>
						<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
						Làm mới
					</button>
				</div>
			</div>

			{/* Content */}
			<div style={{
				background: 'var(--card)',
				borderRadius: 'var(--radius-lg)',
				padding: '24px',
				boxShadow: 'var(--shadow-sm)',
				minHeight: '500px'
			}}>
				<OrganizationTable
					organizations={organizations}
					onOrganizationClick={handleOrganizationClick}
					onEditOrganization={handleEditOrganization}
					onDeleteOrganization={handleDeleteOrganization}
					onToggleStatus={handleToggleOrganizationStatus}
					onToggleVerification={handleToggleOrganizationVerification}
					loading={loading}
					emptyMessage="Không có tổ chức nào phù hợp với bộ lọc"
				/>
			</div>

			{/* Organization Editor Modal */}
			<OrganizationEditorModal
				isOpen={showAddModal}
				onClose={() => {
					setShowAddModal(false)
					setEditingOrganization(null)
				}}
				onSave={handleSaveOrganization}
				editingOrganization={editingOrganization}
			/>

			{/* Organization Details Modal */}
			<OrganizationDetailModal
				isOpen={!!selectedOrganization}
				onClose={() => setSelectedOrganization(null)}
				organization={selectedOrganization}
			/>

			{/* Hidden file input for import */}
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
