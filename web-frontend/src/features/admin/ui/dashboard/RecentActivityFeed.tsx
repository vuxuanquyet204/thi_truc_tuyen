import React from 'react'
import { RecentActivity, ActivityType, ActivityStatus } from '@/types/dashboard'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
	UserPlus, 
	BookOpen, 
	Award, 
	Upload, 
	CreditCard, 
	GraduationCap, 
	Star, 
	AlertTriangle, 
	Settings,
	RefreshCw,
	Clock,
	User,
	FileText
} from 'lucide-react'
import Badge from '@/features/admin/ui/common/Badge'
import '@/features/admin/ui/common/styles/dashboard.scss'

interface RecentActivityFeedProps {
	activities: RecentActivity[]
	loading?: boolean
	onActivityClick?: (activity: RecentActivity) => void
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ 
	activities, 
	loading = false, 
	onActivityClick 
}) => {
	const getActivityIcon = (type: ActivityType) => {
		const iconSize = 16
		switch (type) {
			case 'user_registration':
				return <UserPlus size={iconSize} />
			case 'course_enrollment':
				return <BookOpen size={iconSize} />
			case 'course_completion':
				return <Award size={iconSize} />
			case 'course_published':
				return <Upload size={iconSize} />
			case 'course_updated':
				return <RefreshCw size={iconSize} />
			case 'payment_received':
				return <CreditCard size={iconSize} />
			case 'certificate_issued':
				return <GraduationCap size={iconSize} />
			case 'review_submitted':
				return <Star size={iconSize} />
			case 'system_alert':
				return <AlertTriangle size={iconSize} />
			case 'admin_action':
				return <Settings size={iconSize} />
			default:
				return <FileText size={iconSize} />
		}
	}

	const getActivityColor = (type: ActivityType) => {
		switch (type) {
			case 'user_registration':
				return '#10b981' // Green
			case 'course_enrollment':
				return '#3b82f6' // Blue
			case 'course_completion':
				return '#8b5cf6' // Purple
			case 'course_published':
				return '#06b6d4' // Cyan
			case 'course_updated':
				return '#6366f1' // Indigo
			case 'payment_received':
				return '#10b981' // Green
			case 'certificate_issued':
				return '#f59e0b' // Amber
			case 'review_submitted':
				return '#eab308' // Yellow
			case 'system_alert':
				return '#ef4444' // Red
			case 'admin_action':
				return '#6366f1' // Indigo
			default:
				return '#6b7280' // Gray
		}
	}

	const getStatusBadgeVariant = (status: ActivityStatus) => {
		switch (status) {
			case 'success': return 'success'
			case 'warning': return 'warning'
			case 'error': return 'danger'
			case 'info': return 'info'
			default: return 'secondary'
		}
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

	const formatActivityDescription = (activity: RecentActivity) => {
		let description = activity.description
		
		// Thêm thông tin metadata nếu có
		if (activity.metadata) {
			if (activity.metadata.amount && activity.metadata.tokenSymbol) {
				description += ` (${activity.metadata.amount.toLocaleString()} ${activity.metadata.tokenSymbol})`
			}
			if (activity.metadata.rating) {
				description += ` (${activity.metadata.rating} sao)`
			}
			if (activity.metadata.tokensEarned) {
				description += ` (+${activity.metadata.tokensEarned} token)`
			}
		}
		
		return description
	}

	if (loading) {
		return (
			<div className="activity-feed">
				<div className="activity-header">
					<div className="activity-title-skeleton"></div>
					<div className="activity-subtitle-skeleton"></div>
				</div>
				<div className="activity-list">
					{Array.from({ length: 5 }).map((_, index) => (
						<div key={index} className="activity-item-skeleton">
							<div className="activity-icon-skeleton"></div>
							<div className="activity-content-skeleton">
								<div className="activity-title-skeleton"></div>
								<div className="activity-description-skeleton"></div>
								<div className="activity-time-skeleton"></div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="activity-feed">
			<div className="activity-header">
				<div className="activity-title">
					<Clock size={20} />
					Hoạt động gần đây
				</div>
				<div className="activity-subtitle">
					Theo dõi các hoạt động mới nhất trong hệ thống
				</div>
			</div>

			<div className="activity-list">
				{activities.length === 0 ? (
					<div className="activity-empty">
						<FileText size={48} />
						<p>Không có hoạt động nào</p>
					</div>
				) : (
					activities.map((activity) => (
						<div
							key={activity.id}
							className={`activity-item ${onActivityClick ? 'clickable' : ''}`}
							onClick={() => onActivityClick?.(activity)}
						>
							<div className="activity-icon" style={{ backgroundColor: getActivityColor(activity.type) }}>
								{getActivityIcon(activity.type)}
							</div>

							<div className="activity-content">
								<div className="activity-header-inline">
									<div className="activity-title-text">
										{activity.title}
									</div>
									<div className="activity-time-badge">
										{formatTime(activity.timestamp)}
									</div>
								</div>

								<div className="activity-description">
									{formatActivityDescription(activity)}
								</div>

								<div className="activity-meta-row">
									{activity.user && (
										<div className="activity-meta-item">
											<User size={9} />
											<span>{activity.user}</span>
										</div>
									)}

									{activity.course && (
										<div className="activity-meta-item">
											<BookOpen size={9} />
											<span>{activity.course}</span>
										</div>
									)}

									{activity.metadata?.certificateIssued && (
										<div className="activity-meta-item activity-badge-item">
											<GraduationCap size={9} />
											<span>Chứng chỉ</span>
										</div>
									)}

									{activity.metadata?.tokensEarned && (
										<div className="activity-meta-item activity-token-item">
											+{activity.metadata.tokensEarned} token
										</div>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{activities.length > 0 && (
				<div className="activity-footer">
					<button className="btn btn-sm btn-outline">
						Xem tất cả hoạt động
					</button>
				</div>
			)}
		</div>
	)
}

export default RecentActivityFeed
