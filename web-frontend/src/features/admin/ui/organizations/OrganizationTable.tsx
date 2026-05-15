import React from 'react'
import { Organization, OrganizationType, OrganizationStatus, OrganizationSize, SubscriptionPlan, SubscriptionStatus, VerificationStatus } from '@/types/organization'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
	Building2, 
	Users, 
	BookOpen, 
	GraduationCap, 
	Globe, 
	Mail, 
	Phone, 
	MapPin, 
	Calendar,
	TrendingUp,
	Shield,
	Star,
	AlertTriangle,
	CheckCircle,
	Clock,
	Eye,
	Edit,
	Trash2,
	MoreHorizontal
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'
import '@/features/admin/ui/common/styles/table.css'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/organizations.css'

interface OrganizationTableProps {
	organizations: Organization[]
	onOrganizationClick: (organization: Organization) => void
	onEditOrganization: (organization: Organization) => void
	onDeleteOrganization: (organizationId: string) => void
	onToggleStatus: (organizationId: string, newStatus: OrganizationStatus) => void
	onToggleVerification: (organizationId: string, newStatus: VerificationStatus) => void
	loading: boolean
	emptyMessage: string
}

const OrganizationTable: React.FC<OrganizationTableProps> = ({
	organizations,
	onOrganizationClick,
	onEditOrganization,
	onDeleteOrganization,
	onToggleStatus,
	onToggleVerification,
	loading,
	emptyMessage
}) => {
	const getTypeLabel = (type: OrganizationType) => {
		const labels: Record<OrganizationType, string> = {
			'university': 'Đại học',
			'college': 'Cao đẳng',
			'school': 'Trường học',
			'training_center': 'Trung tâm đào tạo',
			'corporate': 'Doanh nghiệp',
			'ngo': 'Tổ chức phi lợi nhuận',
			'government': 'Cơ quan nhà nước',
			'startup': 'Startup',
			'enterprise': 'Tập đoàn',
			'other': 'Khác'
		}
		return labels[type] || type
	}

	const getStatusBadgeVariant = (status: OrganizationStatus) => {
		switch (status) {
			case 'active': return 'success'
			case 'inactive': return 'secondary'
			case 'suspended': return 'danger'
			case 'pending': return 'warning'
			case 'archived': return 'secondary'
			default: return 'secondary'
		}
	}

	const getSizeLabel = (size: OrganizationSize) => {
		const labels: Record<OrganizationSize, string> = {
			'startup': '1-10',
			'small': '11-50',
			'medium': '51-200',
			'large': '201-1000',
			'enterprise': '1000+'
		}
		return labels[size] || size
	}

	const getSubscriptionPlanLabel = (plan: SubscriptionPlan) => {
		const labels: Record<SubscriptionPlan, string> = {
			'free': 'Miễn phí',
			'basic': 'Cơ bản',
			'professional': 'Chuyên nghiệp',
			'enterprise': 'Doanh nghiệp',
			'custom': 'Tùy chỉnh'
		}
		return labels[plan] || plan
	}

	const getSubscriptionStatusBadgeVariant = (status: SubscriptionStatus) => {
		switch (status) {
			case 'active': return 'success'
			case 'expired': return 'danger'
			case 'cancelled': return 'secondary'
			case 'pending': return 'warning'
			case 'trial': return 'info'
			default: return 'secondary'
		}
	}

	const getVerificationStatusIcon = (status: VerificationStatus) => {
		switch (status) {
			case 'verified': return <CheckCircle size={14} className="text-success" />
			case 'pending': return <Clock size={14} className="text-warning" />
			case 'rejected': return <AlertTriangle size={14} className="text-danger" />
			case 'not_verified': return <Shield size={14} className="text-muted" />
			default: return <Shield size={14} className="text-muted" />
		}
	}

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

	const formatTime = (timestamp: string) => {
		try {
			return formatDistanceToNow(new Date(timestamp), {
				addSuffix: true,
				locale: vi
			})
		} catch (error) {
			return 'N/A'
		}
	}

	const renderLoadingRows = () => {
		return Array.from({ length: 5 }).map((_, index) => (
			<tr key={index}>
				<td>
					<div className="organization-info-skeleton">
						<div className="skeleton-logo"></div>
						<div className="skeleton-content">
							<div className="skeleton-title"></div>
							<div className="skeleton-description"></div>
						</div>
					</div>
				</td>
				<td><div className="skeleton-text" style={{ width: '80px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '60px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '100px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '80px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '70px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '90px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '120px' }}></div></td>
				<td><div className="skeleton-text" style={{ width: '150px' }}></div></td>
			</tr>
		))
	}

	return (
		<div className="organization-table">
			<table className="admin-table">
				<thead>
					<tr>
						<th>Tổ chức</th>
						<th>Loại</th>
						<th>Quy mô</th>
						<th>Ngành</th>
						<th>Gói</th>
						<th>Trạng thái</th>
						<th>Xác minh</th>
						<th>Thông tin</th>
						<th>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{loading ? (
						renderLoadingRows()
					) : organizations.length === 0 ? (
						<tr>
							<td colSpan={9} className="admin-table-empty">
								{emptyMessage}
							</td>
						</tr>
					) : (
						organizations.map(organization => (
							<tr key={organization.id}>
								<td onClick={() => onOrganizationClick(organization)} style={{ cursor: 'pointer' }}>
									<div className="organization-info">
										<img src={organization.logo} alt={organization.name} className="organization-logo-small" />
										<div className="organization-details">
											<div className="organization-name">{organization.name}</div>
											<div className="organization-description">{organization.shortDescription}</div>
											<div className="organization-meta">
												<span className="organization-location">
													<MapPin size={12} /> {organization.city}, {organization.country}
												</span>
												<span className="organization-founded">
													<Calendar size={12} /> {organization.foundedYear}
												</span>
											</div>
										</div>
									</div>
								</td>
								<td>
									<div className="organization-type">
										<Building2 size={14} className="type-icon" />
										<span className="type-name">{getTypeLabel(organization.type)}</span>
									</div>
								</td>
								<td>
									<div className="organization-size">
										<Users size={14} />
										<span>{getSizeLabel(organization.size)}</span>
									</div>
								</td>
								<td>
									<div className="organization-industry">
										<span className="industry-name">{organization.industry}</span>
									</div>
								</td>
								<td>
									<div className="subscription-info">
										<div className="subscription-plan">{getSubscriptionPlanLabel(organization.subscriptionPlan)}</div>
										<Badge variant={getSubscriptionStatusBadgeVariant(organization.subscriptionStatus)}>
											{organization.subscriptionStatus}
										</Badge>
									</div>
								</td>
								<td>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
										<Badge variant={getStatusBadgeVariant(organization.status)}>
											{organization.status}
										</Badge>
										<div className="status-info">
											<span className="last-login">Đăng nhập: {formatTime(organization.lastLoginAt)}</span>
										</div>
									</div>
								</td>
								<td>
									<div className="verification-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
											{getVerificationStatusIcon(organization.verificationStatus)}
											<span className="verification-text">{organization.verificationStatus}</span>
										</div>
										<button
											className={`btn btn-sm btn-outline ${organization.verificationStatus === 'verified' ? 'btn-secondary' : 'btn-success'}`}
											onClick={() => onToggleVerification(organization.id, organization.verificationStatus === 'verified' ? 'not_verified' : 'verified')}
											title={organization.verificationStatus === 'verified' ? 'Hủy xác minh' : 'Xác minh'}
											style={{ padding: '4px 8px', fontSize: '12px' }}
										>
											{organization.verificationStatus === 'verified' ? 'Hủy' : 'Xác minh'}
										</button>
									</div>
								</td>
								<td>
									<div className="organization-stats">
										<div className="stat-row">
											<Users size={12} />
											<span>{formatNumber(organization.employees)} nhân viên</span>
										</div>
										<div className="stat-row">
											<GraduationCap size={12} />
											<span>{formatNumber(organization.students)} học viên</span>
										</div>
										<div className="stat-row">
											<BookOpen size={12} />
											<span>{organization.courses} khóa học</span>
										</div>
										<div className="stat-row">
											<TrendingUp size={12} />
											<span>{formatCurrency(organization.revenue, organization.currency)}</span>
										</div>
									</div>
								</td>
								<td>
									<div className="action-buttons">
										<button className="btn btn-sm btn-outline" onClick={() => onOrganizationClick(organization)} title="Xem chi tiết">
											<Eye size={16} />
										</button>
										<button className="btn btn-sm btn-outline" onClick={() => onEditOrganization(organization)} title="Chỉnh sửa">
											<Edit size={16} />
										</button>
										<button className="btn btn-sm btn-outline btn-danger" onClick={() => onDeleteOrganization(organization.id)} title="Xóa">
											<Trash2 size={16} />
										</button>
										<button
											className={`btn btn-sm btn-outline ${organization.isActive ? 'btn-secondary' : 'btn-success'}`}
											onClick={() => onToggleStatus(organization.id, organization.isActive ? 'inactive' : 'active')}
											title={organization.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
										>
											{organization.isActive ? <Shield size={16} /> : <CheckCircle size={16} />}
										</button>
									</div>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}

export default OrganizationTable
