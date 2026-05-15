import React from 'react'
import { 
	IssuedCertificate, 
	CertificateStatus 
} from '@/types/certification'
import { 
	Edit, 
	Trash2, 
	Eye, 
	Download, 
	ExternalLink,
	MoreHorizontal,
	Calendar,
	Clock,
	User,
	Building2,
	BookOpen,
	CheckCircle,
	XCircle,
	AlertTriangle,
	Pause,
	Play
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'

interface IssuedTableProps {
	certificates: IssuedCertificate[]
	onEditCertificate: (certificate: IssuedCertificate) => void
	onDeleteCertificate: (certificateId: string) => void
	onViewCertificate: (certificate: IssuedCertificate) => void
	onDownloadCertificate: (certificate: IssuedCertificate) => void
	onToggleStatus: (certificateId: string, newStatus: CertificateStatus) => void
	loading?: boolean
	emptyMessage?: string
}

export default function IssuedTable({
	certificates,
	onEditCertificate,
	onDeleteCertificate,
	onViewCertificate,
	onDownloadCertificate,
	onToggleStatus,
	loading = false,
	emptyMessage = 'Không có chứng chỉ nào được cấp'
}: IssuedTableProps): JSX.Element {
	const getStatusLabel = (status: CertificateStatus) => {
		const labels: Record<CertificateStatus, string> = {
			issued: 'Đã cấp',
			active: 'Hoạt động',
			expired: 'Hết hạn',
			revoked: 'Đã thu hồi',
			pending: 'Chờ duyệt',
			suspended: 'Tạm dừng'
		}
		return labels[status] || status
	}

	const getStatusColor = (status: CertificateStatus) => {
		const colors: Record<CertificateStatus, string> = {
			issued: 'var(--info)',
			active: 'var(--success)',
			expired: 'var(--warning)',
			revoked: 'var(--danger)',
			pending: 'var(--secondary)',
			suspended: 'var(--muted-foreground)'
		}
		return colors[status] || 'var(--muted-foreground)'
	}

	const getStatusIcon = (status: CertificateStatus) => {
		switch (status) {
			case 'active':
				return <CheckCircle size={14} />
			case 'expired':
				return <XCircle size={14} />
			case 'revoked':
				return <AlertTriangle size={14} />
			case 'pending':
				return <Clock size={14} />
			case 'suspended':
				return <Pause size={14} />
			default:
				return <CheckCircle size={14} />
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		})
	}

	const isExpiringSoon = (expiresAt: string) => {
		const expiryDate = new Date(expiresAt)
		const now = new Date()
		const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
		return daysUntilExpiry <= 30 && daysUntilExpiry > 0
	}

	const isExpired = (expiresAt: string) => {
		return new Date(expiresAt) < new Date()
	}

	if (loading) {
		return (
			<div className="admin-table-loading">
				<div className="loading-spinner"></div>
				<p>Đang tải danh sách chứng chỉ...</p>
			</div>
		)
	}

	if (certificates.length === 0) {
		return (
			<div className="admin-table-empty">
				<CheckCircle size={48} />
				<h3>Chưa có chứng chỉ nào</h3>
				<p>{emptyMessage}</p>
			</div>
		)
	}

	return (
		<div className="admin-table-container">
			<table className="admin-table">
				<thead>
					<tr>
						<th className="sortable">Người nhận</th>
						<th className="sortable">Chứng chỉ</th>
						<th className="sortable">Tổ chức</th>
						<th className="sortable">Khóa học</th>
						<th className="sortable">Ngày cấp</th>
						<th className="sortable">Hết hạn</th>
						<th className="sortable">Trạng thái</th>
						<th className="sortable">Điểm số</th>
						<th className="actions">Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{certificates.map((certificate) => (
						<tr key={certificate.id}>
							<td>
								<div className="recipient-info">
									<div className="recipient-name">{certificate.recipientName}</div>
									<div className="recipient-email">{certificate.recipientEmail}</div>
									<div className="recipient-id">
										<User size={14} />
										{certificate.recipientId}
									</div>
								</div>
							</td>
							<td>
								<div className="certificate-info">
									<div className="certificate-name">{certificate.certificateName}</div>
									<div className="certificate-code">
										Mã: {certificate.verificationCode}
									</div>
									{certificate.blockchainHash && (
										<div className="blockchain-info">
											<ExternalLink size={14} />
											Blockchain verified
										</div>
									)}
								</div>
							</td>
							<td>
								<div className="organization-info">
									<div className="organization-name">
										<Building2 size={14} />
										{certificate.organizationName}
									</div>
									<div className="organization-id">
										ID: {certificate.organizationId}
									</div>
								</div>
							</td>
							<td>
								{certificate.courseName ? (
									<div className="course-info">
										<div className="course-name">
											<BookOpen size={14} />
											{certificate.courseName}
										</div>
										<div className="course-id">
											ID: {certificate.courseId}
										</div>
									</div>
								) : (
									<span className="no-course">Không có khóa học</span>
								)}
							</td>
							<td>
								<div className="date-info">
									<div className="issued-date">
										<Calendar size={14} />
										{formatDate(certificate.issuedAt)}
									</div>
									<div className="issued-time">
										{new Date(certificate.issuedAt).toLocaleTimeString('vi-VN')}
									</div>
								</div>
							</td>
							<td>
								<div className="expiry-info">
									<div className={`expiry-date ${isExpired(certificate.expiresAt) ? 'expired' : isExpiringSoon(certificate.expiresAt) ? 'expiring-soon' : ''}`}>
										<Clock size={14} />
										{formatDate(certificate.expiresAt)}
									</div>
									{isExpiringSoon(certificate.expiresAt) && !isExpired(certificate.expiresAt) && (
										<div className="expiry-warning">
											Sắp hết hạn
										</div>
									)}
									{isExpired(certificate.expiresAt) && (
										<div className="expiry-expired">
											Đã hết hạn
										</div>
									)}
								</div>
							</td>
							<td>
								<div className="status-info">
									<Badge 
										variant="secondary" 
										style={{ backgroundColor: getStatusColor(certificate.status) }}
									>
										{getStatusIcon(certificate.status)}
										{getStatusLabel(certificate.status)}
									</Badge>
								</div>
							</td>
							<td>
								<div className="score-info">
									{certificate.metadata.score ? (
										<div className="score-details">
											<div className="score-value">
												{certificate.metadata.score}/100
											</div>
											<div className="score-grade">
												{certificate.metadata.grade}
											</div>
										</div>
									) : (
										<span className="no-score">Chưa có điểm</span>
									)}
								</div>
							</td>
							<td>
								<div className="table-actions">
									<button
										className="btn btn-sm btn-outline"
										onClick={() => onViewCertificate(certificate)}
										title="Xem chứng chỉ"
									>
										<Eye size={16} />
									</button>
									<button
										className="btn btn-sm btn-outline"
										onClick={() => onDownloadCertificate(certificate)}
										title="Tải xuống"
									>
										<Download size={16} />
									</button>
									<button
										className="btn btn-sm btn-outline"
										onClick={() => onEditCertificate(certificate)}
										title="Chỉnh sửa"
									>
										<Edit size={16} />
									</button>
									{certificate.status === 'active' ? (
										<button
											className="btn btn-sm btn-outline btn-warning"
											onClick={() => onToggleStatus(certificate.id, 'suspended')}
											title="Tạm dừng"
										>
											<Pause size={16} />
										</button>
									) : certificate.status === 'suspended' ? (
										<button
											className="btn btn-sm btn-outline btn-success"
											onClick={() => onToggleStatus(certificate.id, 'active')}
											title="Kích hoạt"
										>
											<Play size={16} />
										</button>
									) : null}
									<button
										className="btn btn-sm btn-outline btn-danger"
										onClick={() => onDeleteCertificate(certificate.id)}
										title="Xóa"
									>
										<Trash2 size={16} />
									</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
