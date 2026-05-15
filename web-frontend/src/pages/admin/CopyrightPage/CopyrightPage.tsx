import React, { useState } from 'react'
import {
	FileText,
	CheckCircle,
	AlertTriangle,
	Hash,
	Database,
	Zap,
	Shield,
	Eye,
	EyeOff,
	RefreshCw,
	Download,
	Settings,
	Plus,
	Info,
	BarChart3,
	TrendingUp,
	X
} from 'lucide-react'
import Card from '@/shared/ui/atoms/Card/Card'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import { DocumentRegistrar, RegisteredDocsTable, CopyrightStatsComponent } from '@/features/admin/ui/copyright'
import { useCopyright, AdminDocument, DocumentForm, ExportOptions } from '@/features/admin/hooks'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/FormStyles.css'
import '@/features/admin/ui/common/styles/AdminTable.module.css'
import '@/features/admin/ui/common/styles/copyright.scss'
import {
	RegisterDocumentModal,
	DocumentDetailModal,
	ExportModal,
	EditDocumentModal,
	SettingsModal
} from '@/features/admin/ui/modals'

export const CopyrightPage: React.FC = () => {
	const {
		documents,
		stats,
		dashboard,
		blockchainInfo,
		loading,
		error,
		filters,
		isRealTimeEnabled,
		registerDocument,
		verifyDocument,
		deleteDocument,
		updateDocument,
		exportDocuments,
		updateFilters,
		clearFilters,
		refreshData,
		setIsRealTimeEnabled,
		getDocumentById
	} = useCopyright()

	// State management
	const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'documents' | 'stats'>('overview')
	const [showRegisterModal, setShowRegisterModal] = useState(false)
	const [showDocumentModal, setShowDocumentModal] = useState(false)
	const [showEditModal, setShowEditModal] = useState(false)
	const [selectedDocument, setSelectedDocument] = useState<AdminDocument | null>(null)
	const [showExportModal, setShowExportModal] = useState(false)
	const [showSettingsModal, setShowSettingsModal] = useState(false)
	const [notifications, setNotifications] = useState<string[]>([])
	const [isExporting, setIsExporting] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)

	// Notification system
	const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
		const id = Date.now().toString()
		setNotifications(prev => [...prev, `${type.toUpperCase()}: ${message}`])
		
		// Auto remove after 5 seconds
		setTimeout(() => {
			setNotifications(prev => prev.filter(n => !n.includes(message)))
		}, 5000)
	}

	// Enhanced handlers
	const handleRegisterDocument = async (form: DocumentForm) => {
		const result = await registerDocument(form)
		if (result.success) {
			addNotification(`Đã đăng ký thành công: ${form.title}`, 'success')
			setShowRegisterModal(false)
		} else {
			addNotification(result.error || 'Đăng ký thất bại', 'error')
		}
		return result
	}

	const handleViewDocument = (document: AdminDocument) => {
		setSelectedDocument(document)
		setShowDocumentModal(true)
		addNotification(`Đã mở chi tiết: ${document.title}`, 'info')
	}

	const handleVerifyDocument = async (documentId: string) => {
		const result = await verifyDocument(documentId)
		if (result.success) {
			addNotification(result.verified ? 'Xác minh thành công' : 'Xác minh thất bại', result.verified ? 'success' : 'error')
		} else {
			addNotification('Lỗi khi xác minh', 'error')
		}
	}

	const handleEditDocument = (document: AdminDocument) => {
		setSelectedDocument(document)
		setShowEditModal(true)
		addNotification(`Đang chỉnh sửa: ${document.title}`, 'info')
	}

	const handleSaveEdit = async (documentId: string, form: DocumentForm) => {
		const result = await updateDocument(documentId, form)
		if (result.success) {
			addNotification('Cập nhật tài liệu thành công', 'success')
			setShowEditModal(false)
			setSelectedDocument(null)
		} else {
			addNotification(result.error || 'Cập nhật thất bại', 'error')
		}
		return result
	}

	const handleDeleteDocument = async (documentId: string) => {
		const result = await deleteDocument(documentId)
		if (result.success) {
			addNotification('Xóa tài liệu thành công', 'success')
		} else {
			addNotification(result.error || 'Xóa tài liệu thất bại', 'error')
		}
	}

	const handleExportDocuments = async (documentsToExport: AdminDocument[]) => {
		setIsExporting(true)
		try {
			const options: ExportOptions = {
				format: 'excel',
				includeMetadata: true,
				includeVerificationHistory: true,
				includeDisputes: true
			}
			
			const result = await exportDocuments(options)
			if (result.success) {
				addNotification(result.message || 'Xuất dữ liệu thành công', 'success')
				setShowExportModal(false)
			} else {
				addNotification(result.message || 'Xuất dữ liệu thất bại', 'error')
			}
		} catch (error) {
			addNotification('Lỗi khi xuất dữ liệu', 'error')
		} finally {
			setIsExporting(false)
		}
	}

	const handleRefreshAll = async () => {
		setIsRefreshing(true)
		try {
			await refreshData()
			addNotification('Đã làm mới dữ liệu thành công', 'success')
		} catch (error) {
			addNotification('Lỗi khi làm mới dữ liệu', 'error')
		} finally {
			setIsRefreshing(false)
		}
	}

	const handleRealTimeToggle = () => {
		setIsRealTimeEnabled(!isRealTimeEnabled)
		addNotification(
			isRealTimeEnabled ? 'Đã tắt cập nhật real-time' : 'Đã bật cập nhật real-time', 
			'info'
		)
	}

	const getTabIcon = (tab: string) => {
		const iconMap = {
			overview: BarChart3,
			register: Plus,
			documents: FileText,
			stats: TrendingUp
		}
		return iconMap[tab as keyof typeof iconMap] || BarChart3
	}

	const renderTabContent = () => {
		switch (activeTab) {
			case 'overview':
				return (
					<div className="overview-content">
						{/* Quick Stats */}
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(4, 1fr)', 
							gap: '20px',
							marginBottom: '24px'
						}}>
							{/* Card 1 - Tổng tài liệu */}
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
										<FileText size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{stats.totalDocuments.toLocaleString()}
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Tổng tài liệu
										</div>
									</div>
								</div>
							</div>

							{/* Card 2 - Đã xác minh */}
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
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{stats.totalVerified.toLocaleString()}
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Đã xác minh
										</div>
									</div>
								</div>
							</div>

							{/* Card 3 - Có tranh chấp */}
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
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{stats.disputedDocuments.toLocaleString()}
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Có tranh chấp
										</div>
									</div>
								</div>
							</div>

							{/* Card 4 - Giao dịch Blockchain */}
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
										<Hash size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{stats.blockchainTransactions?.toLocaleString() || '0'}
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Giao dịch Blockchain
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Recent Documents */}
						<Card className="recent-documents" style={{ marginBottom: '24px' }}>
							<div className="card-header">
								<h3>Tài liệu gần đây</h3>
								<button 
									className="btn btn-secondary btn-sm"
									onClick={() => setActiveTab('documents')}
								>
									Xem tất cả
								</button>
							</div>
							<div className="documents-list">
								{dashboard.recentDocuments.map((doc) => (
									<div key={doc.id} className="document-item">
										<div className="document-info">
											<FileText className="file-icon" />
											<div className="document-details">
												<div className="document-title">{doc.title}</div>
												<div className="document-meta">
													<span className="author">{doc.author}</span>
													<span className="date">
														{new Date(doc.registrationDate).toLocaleDateString('vi-VN')}
													</span>
												</div>
											</div>
										</div>
										<div className="document-status">
											<Badge variant={doc.status === 'verified' ? 'success' : doc.status === 'pending' ? 'warning' : 'danger'}>
												{doc.status === 'verified' ? 'Đã xác minh' : 
												 doc.status === 'pending' ? 'Chờ xác minh' : 'Có tranh chấp'}
											</Badge>
										</div>
									</div>
								))}
							</div>
						</Card>

						{/* Blockchain Status */}
						<div style={{ 
							display: 'grid', 
							gridTemplateColumns: 'repeat(4, 1fr)', 
							gap: '20px',
							marginBottom: '24px'
						}}>
							{/* Card 1 - Block cuối */}
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
										<Database size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{dashboard.blockchainStatus.lastBlock.toLocaleString()}
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Block cuối
										</div>
									</div>
								</div>
							</div>

							{/* Card 2 - Gas price */}
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
										<Zap size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{dashboard.blockchainStatus.averageGasPrice} Gwei
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Gas price
										</div>
									</div>
								</div>
							</div>

							{/* Card 3 - Tắc nghẽn */}
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
										<AlertTriangle size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{dashboard.blockchainStatus.networkCongestion}
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Tắc nghẽn
										</div>
									</div>
								</div>
							</div>

							{/* Card 4 - Thời gian xác nhận */}
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
										<Shield size={20} />
									</div>
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '4px' }}>
											{dashboard.blockchainStatus.estimatedConfirmationTime} phút
										</div>
										<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
											Thời gian xác nhận
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Connection Status */}
						<Card className="connection-status-card">
							<div className="card-header">
								<h3>Trạng thái kết nối</h3>
								<div className={`connection-status ${dashboard.blockchainStatus.isConnected ? 'connected' : 'disconnected'}`}>
									<div className="status-indicator"></div>
									<span>{dashboard.blockchainStatus.isConnected ? 'Đã kết nối' : 'Mất kết nối'}</span>
								</div>
							</div>
						</Card>
					</div>
				)

			case 'register':
				return (
					<div className="register-content">
						<DocumentRegistrar 
							onRegister={handleRegisterDocument}
							loading={loading}
						/>
					</div>
				)

			case 'documents':
				return (
					<div className="documents-content">
						<RegisteredDocsTable
							documents={documents}
							loading={loading}
							onViewDocument={handleViewDocument}
							onVerifyDocument={handleVerifyDocument}
							onEditDocument={handleEditDocument}
							onDeleteDocument={handleDeleteDocument}
							onExportDocuments={handleExportDocuments}
							onRefresh={handleRefreshAll}
							filters={filters}
							onFiltersChange={updateFilters}
						/>
					</div>
				)

			case 'stats':
				return (
					<div className="stats-content">
						<CopyrightStatsComponent
							stats={stats}
							blockchainStatus={dashboard.blockchainStatus}
							loading={loading}
						/>
					</div>
				)

			default:
				return null
		}
	}

	return (
		<div className="copyright-page">
			{/* Page Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>Bảo vệ bản quyền tài liệu</h1>
					<p>Đăng ký và bảo vệ tài liệu học thuật trên blockchain Ethereum</p>
				</div>
				<div className="header-actions">
					<button
						className="btn btn-secondary"
						onClick={handleRealTimeToggle}
					>
						{isRealTimeEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
						{isRealTimeEnabled ? 'Tắt' : 'Bật'} Real-time
					</button>
					<button
						className="btn btn-secondary"
						onClick={handleRefreshAll}
						disabled={isRefreshing}
					>
						<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
						{isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
					</button>
					<button
						className="btn btn-secondary"
						onClick={() => setShowExportModal(true)}
					>
						<Download className="w-4 h-4" />
						Xuất dữ liệu
					</button>
					<button
						className="btn btn-secondary"
						onClick={() => setShowSettingsModal(true)}
					>
						<Settings className="w-4 h-4" />
						Cài đặt
					</button>
					<button
						className="btn btn-primary"
						onClick={() => setShowRegisterModal(true)}
					>
						<Plus className="w-4 h-4" />
						Đăng ký mới
					</button>
				</div>
			</div>

			{/* Notifications */}
			{notifications.length > 0 && (
				<div className="notifications-container">
					{notifications.map((notification, index) => (
						<div key={index} className={`notification ${notification.includes('SUCCESS') ? 'notification-success' : notification.includes('ERROR') ? 'notification-error' : 'notification-info'}`}>
							<div className="notification-content">
								{notification.includes('SUCCESS') ? <CheckCircle className="w-4 h-4" /> : 
								 notification.includes('ERROR') ? <AlertTriangle className="w-4 h-4" /> : 
								 <Info className="w-4 h-4" />}
								<span>{notification}</span>
							</div>
							<button 
								className="notification-close"
								onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Error Display */}
			{error && (
				<div className="error-banner">
					<AlertTriangle className="w-5 h-5" />
					<span>{error}</span>
				</div>
			)}

			{/* Blockchain Connection Status */}
			{!blockchainInfo && (
				<div className="info-banner">
					<Info className="w-5 h-5" />
					<span>Chưa kết nối với blockchain. Vui lòng cài đặt MetaMask để sử dụng đầy đủ tính năng.</span>
				</div>
			)}

			{/* Navigation Tabs */}
			<div className="copyright-tabs">
				<div className="tabs-header">
					{['overview', 'register', 'documents', 'stats'].map((tab) => {
						const Icon = getTabIcon(tab)
						const tabLabels = {
							overview: 'Tổng quan',
							register: 'Đăng ký',
							documents: 'Tài liệu',
							stats: 'Thống kê'
						}
						
						return (
							<button
								key={tab}
								className={`tab-button ${activeTab === tab ? 'active' : ''}`}
								onClick={() => setActiveTab(tab as any)}
							>
								<Icon className="tab-icon" />
								{tabLabels[tab as keyof typeof tabLabels]}
							</button>
						)
					})}
				</div>
			</div>

			{/* Tab Content */}
			<div className="copyright-content">
				{renderTabContent()}
			</div>

			{/* Register Document Modal */}
			<RegisterDocumentModal
				isOpen={showRegisterModal}
				onClose={() => setShowRegisterModal(false)}
				onRegister={async (form) => {
					const result = await handleRegisterDocument(form);
					return result;
				}}
				loading={loading}
			/>

			{/* Document Detail Modal */}
			<DocumentDetailModal
				isOpen={showDocumentModal}
				onClose={() => setShowDocumentModal(false)}
				document={selectedDocument}
			/>

			{/* Export Modal */}
			<ExportModal
				isOpen={showExportModal}
				onClose={() => setShowExportModal(false)}
				onExportDocuments={async (docsToExport) => {
					await handleExportDocuments(docsToExport);
				}}
				documents={documents}
				isExporting={isExporting}
			/>

			{/* Edit Document Modal */}
			<EditDocumentModal
				isOpen={showEditModal}
				onClose={() => {
					setShowEditModal(false)
					setSelectedDocument(null)
				}}
				document={selectedDocument}
				onSave={async (documentId, form) => {
					const result = await handleSaveEdit(documentId, form);
					return result;
				}}
				loading={loading}
			/>

			{/* Settings Modal */}
			<SettingsModal
				isOpen={showSettingsModal}
				onClose={() => setShowSettingsModal(false)}
			/>
		</div>
	)
}
