// Registered Documents Table Component

import React, { useState } from 'react'
import {
	Search,
	Filter,
	Download,
	Eye,
	Shield,
	AlertTriangle,
	CheckCircle,
	Clock,
	FileText,
	Hash,
	ExternalLink,
	MoreVertical,
	Edit,
	Trash2,
	RefreshCw
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'
import { AdminDocument } from '@/features/admin/hooks'

interface AdminFilters {
	search?: string
	status?: string[]
	category?: string[]
	license?: string[]
	author?: string
	dateRange?: {
		start?: string
		end?: string
	}
	showDisputed?: boolean
	showVerified?: boolean
}

interface RegisteredDocsTableProps {
	documents: AdminDocument[]
	loading?: boolean
	onViewDocument: (document: AdminDocument) => void
	onVerifyDocument: (documentId: string) => void
	onEditDocument: (document: AdminDocument) => void
	onDeleteDocument: (documentId: string) => void
	onExportDocuments: (documents: AdminDocument[]) => void
	onRefresh: () => void
	filters: AdminFilters
	onFiltersChange: (filters: Partial<AdminFilters>) => void
}

export const RegisteredDocsTable: React.FC<RegisteredDocsTableProps> = ({
	documents,
	loading = false,
	onViewDocument,
	onVerifyDocument,
	onEditDocument,
	onDeleteDocument,
	onExportDocuments,
	onRefresh,
	filters,
	onFiltersChange
}) => {
	const [sortField, setSortField] = useState<keyof AdminDocument>('registrationDate')
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
	const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
	const [showFilters, setShowFilters] = useState(false)
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

	const handleSort = (field: keyof AdminDocument) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			setSortField(field)
			setSortDirection('asc')
		}
	}

	const sortedDocuments = [...documents].sort((a, b) => {
		const aValue = a[sortField]
		const bValue = b[sortField]
		
		if (typeof aValue === 'string' && typeof bValue === 'string') {
			return sortDirection === 'asc' 
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue)
		}
		
		if (typeof aValue === 'number' && typeof bValue === 'number') {
			return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
		}
		
		return 0
	})

	const handleSelectDocument = (documentId: string) => {
		setSelectedDocuments(prev => 
			prev.includes(documentId) 
				? prev.filter(id => id !== documentId)
				: [...prev, documentId]
		)
	}

	const handleSelectAll = () => {
		if (selectedDocuments.length === documents.length) {
			setSelectedDocuments([])
		} else {
			setSelectedDocuments(documents.map(doc => doc.id))
		}
	}

	const handleEditDocument = (document: AdminDocument) => {
		onEditDocument(document)
	}

	const handleDeleteDocument = (documentId: string) => {
		setDeleteConfirmId(documentId)
	}

	const confirmDelete = () => {
		if (deleteConfirmId) {
			onDeleteDocument(deleteConfirmId)
			setDeleteConfirmId(null)
		}
	}

	const cancelDelete = () => {
		setDeleteConfirmId(null)
	}

	const getStatusIcon = (status: AdminDocument['status']) => {
		switch (status) {
			case 'verified':
				return <CheckCircle className="status-icon verified" />
			case 'pending':
				return <Clock className="status-icon pending" />
			case 'disputed':
				return <AlertTriangle className="status-icon disputed" />
			case 'expired':
				return <AlertTriangle className="status-icon expired" />
			default:
				return <Shield className="status-icon registered" />
		}
	}

	const getStatusBadge = (status: AdminDocument['status']) => {
		const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger' | 'secondary' | 'info'; label: string }> = {
			verified: { variant: 'success', label: 'Đã xác minh' },
			pending: { variant: 'warning', label: 'Chờ xác minh' },
			disputed: { variant: 'danger', label: 'Có tranh chấp' },
			expired: { variant: 'secondary', label: 'Hết hạn' },
			rejected: { variant: 'danger', label: 'Bị từ chối' }
		}

		const statusInfo = statusMap[status] || { variant: 'info', label: 'Đã đăng ký' }
		return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
	}

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const truncateHash = (hash: string): string => {
		return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
	}

	return (
		<div className="registered-docs-table">
			<div className="table-header">
				<div className="table-title">
					<h3>Tài liệu đã đăng ký</h3>
					<span className="document-count">{documents.length} tài liệu</span>
				</div>
				
				<div className="table-controls">
					<div className="search-bar">
						<Search className="search-icon" />
						<input
							type="text"
							placeholder="Tìm kiếm tài liệu..."
							value={filters.search}
							onChange={(e) => onFiltersChange({ search: e.target.value })}
						/>
					</div>
					
					<button
						className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`}
						onClick={() => setShowFilters(!showFilters)}
					>
						<Filter size={16} />
						Bộ lọc
					</button>
					
					<button
						className="btn btn-secondary btn-sm"
						onClick={onRefresh}
						disabled={loading}
					>
						<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
						Làm mới
					</button>
					
					<button
						className="btn btn-primary btn-sm"
						onClick={() => onExportDocuments(selectedDocuments.length > 0 ? documents.filter(doc => selectedDocuments.includes(doc.id)) : documents)}
						disabled={selectedDocuments.length === 0 && documents.length === 0}
					>
						<Download size={16} />
						Xuất ({selectedDocuments.length || documents.length})
					</button>
				</div>
			</div>

			{/* Filters Panel */}
			{showFilters && (
				<div className="filters-panel">
					<div className="filters-grid">
						<div className="filter-group">
							<label>Trạng thái</label>
							<select
								value={filters.status}
								onChange={(e) => onFiltersChange({ status: e.target.value as any })}
							>
								<option value="all">Tất cả</option>
								<option value="verified">Đã xác minh</option>
								<option value="pending">Chờ xác minh</option>
								<option value="disputed">Có tranh chấp</option>
								<option value="registered">Đã đăng ký</option>
								<option value="expired">Hết hạn</option>
							</select>
						</div>
						
						<div className="filter-group">
							<label>Danh mục</label>
							<select
								value={filters.category}
								onChange={(e) => onFiltersChange({ category: e.target.value as any })}
							>
								<option value="all">Tất cả</option>
								<option value="academic">Học thuật</option>
								<option value="research">Nghiên cứu</option>
								<option value="textbook">Sách giáo khoa</option>
								<option value="thesis">Luận văn</option>
								<option value="article">Bài báo</option>
								<option value="presentation">Thuyết trình</option>
							</select>
						</div>
						
						<div className="filter-group">
							<label>Giấy phép</label>
							<select
								value={filters.license}
								onChange={(e) => onFiltersChange({ license: e.target.value as any })}
							>
								<option value="all">Tất cả</option>
								<option value="copyright">Bản quyền</option>
								<option value="cc-by">CC BY</option>
								<option value="cc-by-sa">CC BY-SA</option>
								<option value="cc-by-nc">CC BY-NC</option>
								<option value="public-domain">Public Domain</option>
							</select>
						</div>
						
						<div className="filter-group">
							<label>Tác giả</label>
							<input
								type="text"
								placeholder="Tìm theo tác giả..."
								value={filters.author}
								onChange={(e) => onFiltersChange({ author: e.target.value })}
							/>
						</div>
						
						<div className="filter-group">
							<label>Từ ngày</label>
							<input
								type="date"
								value={filters.dateRange?.start || ''}
								onChange={(e) => onFiltersChange({ dateRange: { ...filters.dateRange || {}, start: e.target.value } })}
							/>
						</div>

						<div className="filter-group">
							<label>Đến ngày</label>
							<input
								type="date"
								value={filters.dateRange?.end || ''}
								onChange={(e) => onFiltersChange({ dateRange: { ...filters.dateRange || {}, end: e.target.value } })}
							/>
						</div>
					</div>
					
					<div className="filter-options">
						<label className="checkbox-label">
							<input
								type="checkbox"
								checked={filters.showDisputed}
								onChange={(e) => onFiltersChange({ showDisputed: e.target.checked })}
							/>
							Chỉ hiện tài liệu có tranh chấp
						</label>
						
						<label className="checkbox-label">
							<input
								type="checkbox"
								checked={filters.showVerified}
								onChange={(e) => onFiltersChange({ showVerified: e.target.checked })}
							/>
							Chỉ hiện tài liệu đã xác minh
						</label>
					</div>
				</div>
			)}

			{/* Table */}
			<div className="table-container">
				<table className="admin-table">
					<thead>
						<tr>
							<th className="select-column">
								<input
									type="checkbox"
									checked={selectedDocuments.length === documents.length && documents.length > 0}
									onChange={handleSelectAll}
								/>
							</th>
							<th 
								className="sortable"
								onClick={() => handleSort('title')}
							>
								Tài liệu
								{sortField === 'title' && (
									<span className="sort-indicator">
										{sortDirection === 'asc' ? '↑' : '↓'}
									</span>
								)}
							</th>
							<th 
								className="sortable"
								onClick={() => handleSort('author')}
							>
								Tác giả
								{sortField === 'author' && (
									<span className="sort-indicator">
										{sortDirection === 'asc' ? '↑' : '↓'}
									</span>
								)}
							</th>
							<th 
								className="sortable"
								onClick={() => handleSort('status')}
							>
								Trạng thái
								{sortField === 'status' && (
									<span className="sort-indicator">
										{sortDirection === 'asc' ? '↑' : '↓'}
									</span>
								)}
							</th>
							<th>Danh mục</th>
							<th 
								className="sortable"
								onClick={() => handleSort('fileSize')}
							>
								Kích thước
								{sortField === 'fileSize' && (
									<span className="sort-indicator">
										{sortDirection === 'asc' ? '↑' : '↓'}
									</span>
								)}
							</th>
							<th 
								className="sortable"
								onClick={() => handleSort('registrationDate')}
							>
								Ngày đăng ký
								{sortField === 'registrationDate' && (
									<span className="sort-indicator">
										{sortDirection === 'asc' ? '↑' : '↓'}
									</span>
								)}
							</th>
							<th>Blockchain</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={9} className="loading-row">
									<div className="loading-spinner">
										<RefreshCw className="spinner" />
										<span>Đang tải dữ liệu...</span>
									</div>
								</td>
							</tr>
						) : sortedDocuments.length === 0 ? (
							<tr>
								<td colSpan={9} className="empty-row">
									<div className="empty-state">
										<FileText className="empty-icon" />
										<p>Không có tài liệu nào</p>
									</div>
								</td>
							</tr>
						) : (
							sortedDocuments.map((document) => (
								<tr key={document.id} className="document-row">
									<td className="select-column">
										<input
											type="checkbox"
											checked={selectedDocuments.includes(document.id)}
											onChange={() => handleSelectDocument(document.id)}
										/>
									</td>
									<td className="document-info">
										<div className="document-details">
											<div className="document-title">
												<FileText className="file-icon" />
												<span>{document.title}</span>
											</div>
											<div className="document-meta">
												<span className="file-type">{(document.fileType || 'PDF').toUpperCase()}</span>
												<span className="version">v{String((document.metadata as Record<string, unknown>)?.version || '1.0')}</span>
											</div>
										</div>
									</td>
									<td className="author-info">
										<div className="author-details">
											<span className="author-name">{document.author}</span>
											<span className="author-meta">{String((document.metadata as Record<string, unknown>)?.language || 'en')}</span>
										</div>
									</td>
									<td className="status-cell">
										<div className="status-info">
											{getStatusIcon(document.status)}
											{getStatusBadge(document.status)}
										</div>
									</td>
									<td className="category-cell">
										<Badge variant="secondary">
											{String((document.metadata as Record<string, unknown>)?.category || document.category)}
										</Badge>
									</td>
									<td className="size-cell">
										<span className="file-size">
											{formatFileSize(document.fileSize)}
										</span>
									</td>
									<td className="date-cell">
										<span className="registration-date">
											{formatDate(document.registrationDate)}
										</span>
									</td>
									<td className="blockchain-cell">
										<div className="blockchain-info">
											<div className="hash-info">
												<Hash className="hash-icon" />
												<span className="hash-value">
													{truncateHash(document.blockchainHash || '')}
												</span>
											</div>
											{document.transactionHash && (
												<a
													href={`https://etherscan.io/tx/${document.transactionHash}`}
													target="_blank"
													rel="noopener noreferrer"
													className="blockchain-link"
												>
													<ExternalLink className="link-icon" />
												</a>
											)}
										</div>
									</td>
									<td className="actions-cell">
										<div className="action-buttons">
											<button
												className="btn btn-secondary btn-sm"
												onClick={() => onViewDocument(document)}
												title="Xem chi tiết"
											>
												<Eye size={16} />
												Xem chi tiết
											</button>
											
											{document.status === 'pending' && (
												<button
													className="btn btn-primary btn-sm"
													onClick={() => onVerifyDocument(document.id)}
													title="Xác minh"
												>
													<CheckCircle size={16} />
													Xác minh
												</button>
											)}
											
											<button
												className="btn btn-edit btn-sm"
												onClick={() => handleEditDocument(document)}
												title="Chỉnh sửa"
											>
												<Edit size={16} />
												Chỉnh sửa
											</button>
											
											<button
												className="btn btn-delete btn-sm"
												onClick={() => handleDeleteDocument(document.id)}
												title="Xóa"
											>
												<Trash2 size={16} />
												Xóa
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="table-footer">
				<div className="pagination-info">
					<span>Hiển thị {sortedDocuments.length} trong tổng số {documents.length} tài liệu</span>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{deleteConfirmId && (
				<div className="delete-confirmation-overlay">
					<div className="delete-confirmation-dialog">
						<div className="dialog-header">
							<h3>Xác nhận xóa tài liệu</h3>
						</div>
						<div className="dialog-content">
							<p>Bạn có chắc chắn muốn xóa tài liệu này không?</p>
							<p className="warning-text">Hành động này không thể hoàn tác.</p>
						</div>
						<div className="dialog-actions">
							<button
								className="btn btn-secondary"
								onClick={cancelDelete}
							>
								Hủy
							</button>
							<button
								className="btn btn-danger"
								onClick={confirmDelete}
							>
								<Trash2 size={16} />
								Xóa
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
