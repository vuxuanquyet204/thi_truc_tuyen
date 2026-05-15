import React, { useState, useRef } from 'react'
import {
	Award,
	Plus,
	RefreshCw,
	Download,
	Upload,
	FileSpreadsheet,
	FileText,
	Eye,
	Edit,
	Trash2,
	Copy,
	Users,
	Building2,
	BookOpen,
	Calendar,
	Clock,
	CheckCircle,
	AlertTriangle,
	TrendingUp,
	BarChart3,
	List,
	Grid3X3
} from 'lucide-react'
import { useCertifications } from '@/features/admin/hooks'
import { CatalogTable, IssuedTable, CertificateFormModal } from '@/features/admin/ui/certify'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import { CertificateDetailModal, TemplateDetailModal } from '@/features/admin/ui/modals'
import StatCard from '@/shared/ui/atoms/StatCard/StatCard'
import { CertificateForm, IssuedCertificate } from '@/foundation/types'
import {
	exportCertificatesToExcel,
	importCertificatesFromExcel,
	generateCertificateExcelTemplate
} from '@/features/certifications/utils'
import '@/features/admin/ui/common/styles/common.css'
import '@/pages/admin/CertifyPage/Certify.module.css'
import '@/pages/admin/CertifyPage/CertifyPage.module.css'
import '@/pages/admin/CertifyPage/CopyrightPage.module.css'
import { toast } from '@/foundation/contexts/ToastContext'

export default function CertifyPage(): JSX.Element {
	const {
		templates,
		allTemplates,
		issuedCertificates,
		allIssuedCertificates,
		dashboard,
		filters,
		updateFilter,
		clearFilters,
		addTemplate,
		updateTemplate,
		deleteTemplate,
		duplicateTemplate,
		toggleTemplateStatus,
		addIssuedCertificate,
		updateIssuedCertificate,
		deleteIssuedCertificate,
		toggleCertificateStatus,
		loading,
		totalTemplates,
		totalIssuedCertificates,
		filteredTemplatesCount,
		filteredIssuedCertificatesCount
	} = useCertifications()

	const [activeTab, setActiveTab] = useState<'catalog' | 'issued'>('catalog')
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingTemplate, setEditingTemplate] = useState<any>(null)
	const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
	const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
	const [showStats, setShowStats] = useState(true)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleAddTemplate = () => {
		setEditingTemplate(null)
		setShowAddModal(true)
	}

	const handleEditTemplate = (template: any) => {
		setEditingTemplate(template)
		setShowAddModal(true)
	}

	const handleDeleteTemplate = (templateId: string) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa mẫu chứng chỉ này?')) {
			deleteTemplate(templateId)
		}
	}

	const handleDuplicateTemplate = (template: any) => {
		duplicateTemplate(template)
		toast.success('Đã nhân bản mẫu chứng chỉ thành công!')
	}

	const handleViewTemplate = (template: any) => {
		setSelectedTemplate(template)
	}

	const handleSaveTemplate = (templateForm: any) => {
		if (editingTemplate) {
			updateTemplate(templateForm, editingTemplate.id)
		} else {
			addTemplate(templateForm)
		}
		setShowAddModal(false)
		setEditingTemplate(null)
	}

	// Certificate operations
	const handleEditCertificate = (certificate: any) => {
		setSelectedCertificate(certificate)
	}

	const handleDeleteCertificate = (certificateId: string) => {
		if (window.confirm('Bạn có chắc chắn muốn xóa chứng chỉ này?')) {
			deleteIssuedCertificate(certificateId)
		}
	}

	const handleViewCertificate = (certificate: any) => {
		setSelectedCertificate(certificate)
	}

	const handleDownloadCertificate = (certificate: any) => {
		if (certificate.downloadUrl) {
			window.open(certificate.downloadUrl, '_blank')
		} else {
			toast.warning('Chứng chỉ chưa có file để tải xuống')
		}
	}

	const handleToggleCertificateStatus = (certificateId: string, newStatus: any) => {
		toggleCertificateStatus(certificateId, newStatus)
	}

	// Excel Export Functions
	const handleExportTemplates = () => {
		try {
			const filename = `certificate-templates-${new Date().toISOString().split('T')[0]}.xlsx`
			exportCertificatesToExcel(templates, filename, 'templates')
			toast.success('Đã xuất file Excel thành công!')
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất file Excel')
		}
	}

	const handleExportCertificates = () => {
		try {
			const filename = `issued-certificates-${new Date().toISOString().split('T')[0]}.xlsx`
			exportCertificatesToExcel(issuedCertificates, filename, 'certificates')
			toast.success('Đã xuất file Excel thành công!')
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất file Excel')
		}
	}

	// Excel Import Functions
	const handleImportTemplates = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const importedData = await importCertificatesFromExcel(file, activeTab === 'catalog' ? 'templates' : 'certificates')

			if (activeTab === 'catalog') {
				// Process imported templates
				for (const templateForm of importedData as CertificateForm[]) {
					addTemplate(templateForm)
				}
				toast.success(`Đã nhập thành công ${importedData.length} mẫu chứng chỉ`)
			} else {
				// Process imported certificates
				for (const certificateData of importedData as Partial<IssuedCertificate>[]) {
					addIssuedCertificate(certificateData)
				}
				toast.success(`Đã nhập thành công ${importedData.length} chứng chỉ`)
			}
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
		generateCertificateExcelTemplate(activeTab === 'catalog' ? 'templates' : 'certificates')
		toast.success('Đã tải template Excel thành công!')
	}

	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	// Helper functions moved to modal components
	const getCategoryLabel = (category: string) => {
		const labels: Record<string, string> = {
			course_completion: 'Hoàn thành khóa học',
			skill_assessment: 'Đánh giá kỹ năng',
			professional_development: 'Phát triển chuyên môn',
			academic_achievement: 'Thành tích học thuật',
			industry_certification: 'Chứng chỉ ngành',
			soft_skills: 'Kỹ năng mềm',
			technical_skills: 'Kỹ năng kỹ thuật',
			leadership: 'Lãnh đạo',
			project_management: 'Quản lý dự án',
			other: 'Khác'
		}
		return labels[category] || category
	}

	const getLevelLabel = (level: string) => {
		const labels: Record<string, string> = {
			beginner: 'Cơ bản',
			intermediate: 'Trung cấp',
			advanced: 'Nâng cao',
			expert: 'Chuyên gia',
			master: 'Thạc sĩ'
		}
		return labels[level] || level
	}

	return (
		<div className="certify-page">
			{/* Header */}
			<div className="certify-header">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
					<div>
						<div className="certify-title">
							<Award size={32} />
							<h1>Quản lý Chứng chỉ</h1>
						</div>
						<p className="certify-subtitle">
							Quản lý mẫu chứng chỉ và theo dõi các chứng chỉ đã cấp
						</p>
					</div>

					<div className="certify-actions">
						<button
							className="btn btn-secondary"
							onClick={() => setShowStats(!showStats)}
							title="Ẩn/hiện thống kê"
						>
							<BarChart3 size={18} />
						</button>
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
							onClick={handleImportTemplates}
							title="Nhập Excel"
						>
							<Upload size={18} />
							Nhập Excel
						</button>
						<button
							className="btn btn-secondary"
							onClick={activeTab === 'catalog' ? handleExportTemplates : handleExportCertificates}
							title="Xuất Excel"
						>
							<FileSpreadsheet size={18} />
							Xuất Excel
						</button>
						<button
							className="btn btn-primary"
							onClick={handleAddTemplate}
						>
							<Plus size={18} />
							Thêm mẫu chứng chỉ
						</button>
					</div>
				</div>

				{/* Stats Overview */}
				{showStats && (
					<div style={{ 
						display: 'grid', 
						gridTemplateColumns: 'repeat(3, 1fr)', 
						gap: '16px',
						marginBottom: '24px'
					}}>
						{/* Card 1 - Tổng mẫu chứng chỉ */}
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
									<Award size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Tổng mẫu chứng chỉ
									</div>
									<div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.totalTemplates}
									</div>
									<div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.activeTemplates} đang hoạt động
									</div>
								</div>
							</div>
						</div>

						{/* Card 2 - Chứng chỉ đã cấp */}
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
									<CheckCircle size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Chứng chỉ đã cấp
									</div>
									<div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.totalIssued}
									</div>
									<div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.activeCertificates} đang hoạt động
									</div>
								</div>
							</div>
						</div>

						{/* Card 3 - Người nhận */}
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
									<Users size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Người nhận
									</div>
									<div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{formatNumber(dashboard.stats.totalRecipients)}
									</div>
									<div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.totalOrganizations} tổ chức
									</div>
								</div>
							</div>
						</div>

						{/* Card 4 - Chứng chỉ hết hạn */}
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
										Chứng chỉ hết hạn
									</div>
									<div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.expiredCertificates}
									</div>
									<div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
										{dashboard.stats.pendingCertificates} chờ duyệt
									</div>
								</div>
							</div>
						</div>

						{/* Card 5 - Danh mục phổ biến */}
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
									<TrendingUp size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Danh mục phổ biến
									</div>
									<div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{getCategoryLabel(dashboard.stats.mostPopularCategory)}
									</div>
									<div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 600, marginTop: '4px' }}>
										Cấp độ: {getLevelLabel(dashboard.stats.mostPopularLevel)}
									</div>
								</div>
							</div>
						</div>

						{/* Card 6 - Thời hạn TB */}
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
									<Clock size={20} />
								</div>
								<div style={{ flex: 1 }}>
									<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
										Thời hạn TB
									</div>
									<div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
										{dashboard.stats.averageValidityPeriod.toFixed(0)} tháng
									</div>
									<div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginTop: '4px' }}>
										Thời hạn trung bình
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Tab Navigation */}
			<div className="certify-tabs">
				<button
					className={`certify-tab ${activeTab === 'catalog' ? 'active' : ''}`}
					onClick={() => setActiveTab('catalog')}
				>
					<Award size={16} />
					Danh mục mẫu ({totalTemplates})
				</button>
				<button
					className={`certify-tab ${activeTab === 'issued' ? 'active' : ''}`}
					onClick={() => setActiveTab('issued')}
				>
					<CheckCircle size={16} />
					Chứng chỉ đã cấp ({totalIssuedCertificates})
				</button>
			</div>

			{/* Tab Content */}
			<div className="certify-tab-content">
				{activeTab === 'catalog' && (
					<CatalogTable
						templates={templates}
						onEditTemplate={handleEditTemplate}
						onDeleteTemplate={handleDeleteTemplate}
						onViewTemplate={handleViewTemplate}
						onDuplicateTemplate={handleDuplicateTemplate}
						loading={loading}
						emptyMessage="Không có mẫu chứng chỉ nào phù hợp với bộ lọc"
					/>
				)}

				{activeTab === 'issued' && (
					<IssuedTable
						certificates={issuedCertificates}
						onEditCertificate={handleEditCertificate}
						onDeleteCertificate={handleDeleteCertificate}
						onViewCertificate={handleViewCertificate}
						onDownloadCertificate={handleDownloadCertificate}
						onToggleStatus={handleToggleCertificateStatus}
						loading={loading}
						emptyMessage="Không có chứng chỉ nào phù hợp với bộ lọc"
					/>
				)}
			</div>

			{/* Template Form Modal */}
			<CertificateFormModal
				isOpen={showAddModal}
				onClose={() => {
					setShowAddModal(false)
					setEditingTemplate(null)
				}}
				onSave={handleSaveTemplate}
				editingTemplate={editingTemplate}
			/>

			{/* Template Details Modal */}
			<TemplateDetailModal
				isOpen={!!selectedTemplate}
				onClose={() => setSelectedTemplate(null)}
				template={selectedTemplate}
			/>

			{/* Certificate Details Modal */}
			<CertificateDetailModal
				isOpen={!!selectedCertificate}
				onClose={() => setSelectedCertificate(null)}
				certificate={selectedCertificate}
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
