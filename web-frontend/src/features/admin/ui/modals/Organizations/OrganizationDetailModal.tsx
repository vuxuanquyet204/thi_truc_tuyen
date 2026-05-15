import React from 'react'
import {
	Building2,
	Globe,
	Calendar,
	Users,
	Mail,
	Phone,
	MapPin,
	CreditCard,
	Tag,
	FileText,
	Award,
	TrendingUp,
	GraduationCap,
	BookOpen,
	DollarSign,
	Shield,
	CheckCircle,
	XCircle
} from 'lucide-react'
import Modal from '@/features/admin/ui/common/Modal'
import Badge from '@/features/admin/ui/common/Badge'
import '@/features/admin/ui/common/styles/organizations.css'

interface OrganizationDetailModalProps {
	isOpen: boolean
	onClose: () => void
	organization: any
}

const OrganizationDetailModal: React.FC<OrganizationDetailModalProps> = ({
	isOpen,
	onClose,
	organization
}) => {
	if (!organization) return null

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

	const getTypeIcon = () => {
		const icons: Record<string, JSX.Element> = {
			university: <GraduationCap size={20} />,
			college: <BookOpen size={20} />,
			school: <Building2 size={20} />,
			training_center: <Award size={20} />,
			corporate: <Building2 size={20} />,
			ngo: <Users size={20} />,
			government: <Shield size={20} />,
			startup: <TrendingUp size={20} />,
			enterprise: <Building2 size={20} />
		}
		return icons[organization.type] || <Building2 size={20} />
	}

	const getTypeLabel = (type: string) => {
		const labels: Record<string, string> = {
			university: 'Đại học',
			college: 'Cao đẳng',
			school: 'Trường học',
			training_center: 'Trung tâm đào tạo',
			corporate: 'Doanh nghiệp',
			ngo: 'Tổ chức phi lợi nhuận',
			government: 'Cơ quan nhà nước',
			startup: 'Startup',
			enterprise: 'Tập đoàn',
			other: 'Khác'
		}
		return labels[type] || type
	}

	const getStatusVariant = (status: string) => {
		const variants: Record<string, "success" | "warning" | "danger" | "secondary"> = {
			active: 'success',
			inactive: 'secondary',
			suspended: 'warning',
			pending: 'warning',
			archived: 'secondary'
		}
		return variants[status] || 'secondary'
	}

	const getStatusLabel = (status: string) => {
		const labels: Record<string, string> = {
			active: 'Hoạt động',
			inactive: 'Không hoạt động',
			suspended: 'Tạm dừng',
			pending: 'Chờ duyệt',
			archived: 'Lưu trữ'
		}
		return labels[status] || status
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={organization.name || 'Chi tiết tổ chức'}
			maxWidth="1000px"
		>
			<div className="organization-detail-modal-content">
				{/* Header Section */}
				<div className="org-detail-header">
					<div className="org-detail-logo-wrapper">
						<img
							src={organization.logo}
							alt={organization.name}
							className="org-detail-logo"
						/>
					</div>
					<div className="org-detail-info">
						<h2 className="org-detail-title">{organization.name}</h2>
						<p className="org-detail-description">{organization.description}</p>
						<div className="org-detail-meta">
							<div className="meta-badge">
								{getTypeIcon()}
								<span>{getTypeLabel(organization.type)}</span>
							</div>
							<div className="meta-badge">
								<Badge variant={getStatusVariant(organization.status)}>
									{getStatusLabel(organization.status)}
								</Badge>
							</div>
							<div className="meta-badge">
								{organization.isVerified ? (
									<>
										<CheckCircle size={16} className="verified-icon" />
										<span>Đã xác minh</span>
									</>
								) : (
									<>
										<XCircle size={16} className="unverified-icon" />
										<span>Chưa xác minh</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="org-detail-stats-grid">
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
							<Users size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-value">{formatNumber(organization.students)}</div>
							<div className="stat-label">Học viên</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
							<BookOpen size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-value">{organization.courses}</div>
							<div className="stat-label">Khóa học</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
							<GraduationCap size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-value">{organization.instructors || formatNumber(organization.instructors)}</div>
							<div className="stat-label">Giảng viên</div>
						</div>
					</div>
					<div className="stat-card-mini">
						<div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
							<DollarSign size={20} />
						</div>
						<div className="stat-data">
							<div className="stat-value">{formatCurrency(organization.revenue, organization.currency)}</div>
							<div className="stat-label">Doanh thu</div>
						</div>
					</div>
				</div>

				{/* Detail Sections */}
				<div className="org-detail-sections">
					{/* Basic Info */}
					<div className="detail-section">
						<h3>
							<Building2 size={20} />
							Thông tin cơ bản
						</h3>
						<div className="info-grid">
							<div className="info-item">
								<span className="info-label">
									<MapPin size={14} /> Địa chỉ
								</span>
								<span className="info-value">{organization.city}, {organization.country}</span>
							</div>
							<div className="info-item">
								<span className="info-label">
									<Calendar size={14} /> Thành lập
								</span>
								<span className="info-value">{organization.foundedYear}</span>
							</div>
							<div className="info-item">
								<span className="info-label">
									<Users size={14} /> Nhân viên
								</span>
								<span className="info-value">{organization.employees} người</span>
							</div>
							<div className="info-item">
								<span className="info-label">
									<Globe size={14} /> Ngành
								</span>
								<span className="info-value">{organization.industry}</span>
							</div>
						</div>
					</div>

					{/* Contact Info */}
					<div className="detail-section">
						<h3>
							<Mail size={20} />
							Thông tin liên hệ
						</h3>
						<div className="info-grid">
							<div className="info-item">
								<span className="info-label">
									<Mail size={14} /> Email
								</span>
								<span className="info-value">{organization.email}</span>
							</div>
							<div className="info-item">
								<span className="info-label">
									<Phone size={14} /> Điện thoại
								</span>
								<span className="info-value">{organization.phone}</span>
							</div>
							<div className="info-item full-width">
								<span className="info-label">
									<Globe size={14} /> Website
								</span>
								<span className="info-value">
									<a href={organization.website} target="_blank" rel="noopener noreferrer">
										{organization.website}
									</a>
								</span>
							</div>
						</div>
					</div>

					{/* Contact Person */}
					{organization.contactPerson && (
						<div className="detail-section">
							<h3>
								<Users size={20} />
								Người liên hệ
							</h3>
							<div className="contact-person-card">
								<div className="person-header">
									<div className="person-avatar">
										{organization.contactPerson.name?.charAt(0) || 'U'}
									</div>
									<div className="person-info">
										<div className="person-name">{organization.contactPerson.name}</div>
										<div className="person-title">{organization.contactPerson.title}</div>
										<div className="person-department">{organization.contactPerson.department}</div>
									</div>
								</div>
								<div className="person-contact">
									<div className="contact-detail">
										<Mail size={14} />
										<span>{organization.contactPerson.email}</span>
									</div>
									<div className="contact-detail">
										<Phone size={14} />
										<span>{organization.contactPerson.phone}</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Subscription */}
					<div className="detail-section">
						<h3>
							<CreditCard size={20} />
							Gói đăng ký
						</h3>
						<div className="subscription-card">
							<div className="subscription-plan-name">{organization.subscriptionPlan}</div>
							<div className="subscription-details">
								<Badge variant={organization.subscriptionStatus === 'active' ? 'success' : 'danger'}>
									{organization.subscriptionStatus === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
								</Badge>
								<span className="subscription-expiry">
									Hết hạn: {new Date(organization.subscriptionExpiry).toLocaleDateString('vi-VN')}
								</span>
							</div>
						</div>
					</div>

					{/* Tags */}
					{organization.tags && organization.tags.length > 0 && (
						<div className="detail-section">
							<h3>
								<Tag size={20} />
								Tags ({organization.tags.length})
							</h3>
							<div className="tags-grid">
								{organization.tags.map((tag: string) => (
									<Badge key={tag} variant="info">{tag}</Badge>
								))}
							</div>
						</div>
					)}

					{/* Notes */}
					{organization.notes && (
						<div className="detail-section">
							<h3>
								<FileText size={20} />
								Ghi chú
							</h3>
							<p className="notes-content">{organization.notes}</p>
						</div>
					)}
				</div>
			</div>
		</Modal>
	)
}

export default OrganizationDetailModal
