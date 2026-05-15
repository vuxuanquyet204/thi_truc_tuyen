import React from 'react'
import {
	Users,
	Building2,
	Calendar,
	Clock,
	BookOpen,
	Award,
	Shield,
	Link2,
	Hash,
	User,
	Mail,
	CheckCircle2,
	AlertCircle,
	FileText,
	Trophy,
	TrendingUp,
	Star
} from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'
import Badge from '@/features/admin/ui/common/Badge'
import '@/features/admin/ui/common/styles/certify.css'

interface CertificateDetailModalProps {
	isOpen: boolean
	onClose: () => void
	certificate: any
}

const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({
	isOpen,
	onClose,
	certificate
}) => {
	if (!certificate) return null

	const getStatusVariant = (status: string) => {
		const variants: Record<string, "success" | "warning" | "danger" | "secondary"> = {
			active: 'success',
			expired: 'danger',
			revoked: 'danger',
			pending: 'warning',
			suspended: 'warning'
		}
		return variants[status] || 'secondary'
	}

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			active: 'Còn hiệu lực',
			expired: 'Hết hạn',
			revoked: 'Đã thu hồi',
			pending: 'Chờ xử lý',
			suspended: 'Tạm ngưng'
		}
		return labels[status] || status
	}

	const getGradeColor = (grade: string) => {
		const colors: Record<string, string> = {
			'Xuất sắc': '#10b981',
			'Giỏi': '#3b82f6',
			'Khá': '#f59e0b',
			'Trung bình': '#6b7280'
		}
		return colors[grade] || '#6b7280'
	}

	const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date()
	const isExpiringSoon = certificate.expiresAt &&
		new Date(certificate.expiresAt) > new Date() &&
		new Date(certificate.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={certificate.certificateName || 'Chi tiết chứng chỉ'}
			maxWidth="1000px"
		>
			<div className="certificate-detail-modal-content">
				{/* Header Section */}
				<div className="cert-detail-header">
					<div className="cert-detail-icon">
						<Award size={48} />
					</div>
					<div className="cert-detail-info">
						<h2 className="cert-detail-title">{certificate.certificateName}</h2>
						<p className="cert-detail-code">
							<Hash size={14} />
							{certificate.verificationCode}
						</p>
						<div className="cert-detail-meta">
							<div className="meta-badge">
								<Badge variant={getStatusVariant(certificate.status)}>
									{getStatusLabel(certificate.status)}
								</Badge>
							</div>
							{certificate.blockchainHash && (
								<div className="meta-badge">
									<Shield size={16} className="blockchain-icon" />
									<span>Blockchain Verified</span>
								</div>
							)}
							{isExpired && (
								<div className="meta-badge">
									<AlertCircle size={16} className="expired-icon" />
									<span>Đã hết hạn</span>
								</div>
							)}
							{isExpiringSoon && (
								<div className="meta-badge">
									<Clock size={16} className="warning-icon" />
									<span>Sắp hết hạn</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="cert-detail-stats-grid">
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
							<Calendar size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-label">Ngày cấp</div>
							<div className="stat-value">{new Date(certificate.issuedAt).toLocaleDateString('vi-VN')}</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
							<Clock size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-label">Ngày hết hạn</div>
							<div className="stat-value">{new Date(certificate.expiresAt).toLocaleDateString('vi-VN')}</div>
						</div>
					</div>
					{certificate.metadata.score && (
						<div className="stat-card-mini">
							<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
								<TrendingUp size={20} />
							</div>
							<div className="stat-data">
								<div className="stat-label">Điểm số</div>
								<div className="stat-value">{certificate.metadata.score}/100</div>
							</div>
						</div>
					)}
					{certificate.metadata.grade && (
						<div className="stat-card-mini">
							<div className="stat-icon" style={{ background: `linear-gradient(135deg, ${getGradeColor(certificate.metadata.grade)} 0%, ${getGradeColor(certificate.metadata.grade)}dd 100%)` }}>
								<Star size={20} />
							</div>
							<div className="stat-data">
								<div className="stat-label">Xếp loại</div>
								<div className="stat-value">{certificate.metadata.grade}</div>
							</div>
						</div>
					)}
				</div>

				{/* Detail Sections */}
				<div className="cert-detail-sections">
					{/* Recipient Info */}
					<div className="detail-section">
						<h3>
							<User size={20} />
							Người nhận chứng chỉ
						</h3>
						<div className="recipient-card">
							<div className="recipient-avatar">
								{certificate.recipientName?.charAt(0) || 'U'}
							</div>
							<div className="recipient-details">
								<div className="recipient-name">{certificate.recipientName}</div>
								{certificate.metadata.recipientEmail && (
									<div className="recipient-email">
										<Mail size={14} />
										{certificate.metadata.recipientEmail}
									</div>
								)}
								{certificate.recipientId && (
									<div className="recipient-id">
										<Hash size={12} />
										ID: {certificate.recipientId}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Organization & Course Info */}
					<div className="detail-section">
						<h3>
							<Building2 size={20} />
							Thông tin tổ chức & Khóa học
						</h3>
						<div className="info-grid">
							<div className="info-item">
								<span className="info-label">
									<Building2 size={14} /> Tổ chức cấp
								</span>
								<span className="info-value">{certificate.organizationName}</span>
							</div>
							{certificate.courseName && (
								<div className="info-item">
									<span className="info-label">
										<BookOpen size={14} /> Khóa học
									</span>
									<span className="info-value">{certificate.courseName}</span>
								</div>
							)}
							{certificate.metadata.issuedBy && (
								<div className="info-item">
									<span className="info-label">
										<User size={14} /> Người cấp
									</span>
									<span className="info-value">{certificate.metadata.issuedBy}</span>
								</div>
							)}
							{certificate.metadata.issuedByTitle && (
								<div className="info-item">
									<span className="info-label">
										<Award size={14} /> Chức vụ
									</span>
									<span className="info-value">{certificate.metadata.issuedByTitle}</span>
								</div>
							)}
						</div>
					</div>

					{/* Verification Info */}
					<div className="detail-section">
						<h3>
							<Shield size={20} />
							Thông tin xác minh
						</h3>
						<div className="verification-card">
							<div className="verification-item">
								<span className="verification-label">
									<Hash size={14} /> Mã xác minh
								</span>
								<span className="verification-value verification-code">{certificate.verificationCode}</span>
							</div>
							{certificate.metadata.verificationUrl && (
								<div className="verification-item full-width">
									<span className="verification-label">
										<Link2 size={14} /> URL xác minh
									</span>
									<span className="verification-value">
										<a href={certificate.metadata.verificationUrl} target="_blank" rel="noopener noreferrer">
											{certificate.metadata.verificationUrl}
										</a>
									</span>
								</div>
							)}
							{certificate.blockchainHash && (
								<div className="verification-item full-width">
									<span className="verification-label">
										<Shield size={14} /> Blockchain Hash
									</span>
									<span className="verification-value blockchain-hash">
										{certificate.blockchainHash}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Performance Details */}
					{(certificate.metadata.score || certificate.metadata.grade) && (
						<div className="detail-section">
							<h3>
								<Trophy size={20} />
								Kết quả học tập
							</h3>
							<div className="performance-card">
								{certificate.metadata.score && (
									<div className="performance-item">
										<div className="performance-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
											<TrendingUp size={24} />
										</div>
										<div className="performance-details">
											<div className="performance-label">Điểm số</div>
											<div className="performance-value">{certificate.metadata.score}/100</div>
										</div>
									</div>
								)}
								{certificate.metadata.grade && (
									<div className="performance-item">
										<div className="performance-icon" style={{ background: `linear-gradient(135deg, ${getGradeColor(certificate.metadata.grade)} 0%, ${getGradeColor(certificate.metadata.grade)}dd 100%)` }}>
											<Star size={24} />
										</div>
										<div className="performance-details">
											<div className="performance-label">Xếp loại</div>
											<div className="performance-value">{certificate.metadata.grade}</div>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default CertificateDetailModal
