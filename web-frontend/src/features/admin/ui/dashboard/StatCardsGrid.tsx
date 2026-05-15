import React from 'react'
import { DashboardStats } from '@/types/dashboard'
import StatCard from '@/features/admin/ui/common/StatCard'
import { Users, BookOpen, TrendingUp, DollarSign, Activity, Award, Calendar, CreditCard } from 'lucide-react'
import '@/features/admin/ui/common/styles/dashboard.scss'

interface StatCardsGridProps {
	stats: DashboardStats
	loading?: boolean
}

const StatCardsGrid: React.FC<StatCardsGridProps> = ({ stats, loading = false }) => {
	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	const formatCurrency = (amount: number) => {
		return `${(amount / 1000000).toFixed(1)}M LEARN`
	}

	if (loading) {
		return (
			<div className="stat-cards-grid">
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className="stat-card-skeleton">
						<div className="skeleton-icon"></div>
						<div className="skeleton-content">
							<div className="skeleton-title"></div>
							<div className="skeleton-value"></div>
							<div className="skeleton-subtitle"></div>
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div style={{ 
			display: 'grid', 
			gridTemplateColumns: 'repeat(4, 1fr)', 
			gap: '16px',
			marginBottom: '32px'
		}}>
			{/* Card 1 - Tổng người dùng */}
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
							Tổng người dùng
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{formatNumber(stats.totalUsers)}
						</div>
						<div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
							{formatNumber(stats.activeUsers)} đang hoạt động
						</div>
					</div>
				</div>
			</div>

			{/* Card 2 - Tổng khóa học */}
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
						<BookOpen size={20} />
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
							Tổng khóa học
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{stats.totalCourses}
						</div>
						<div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
							{stats.publishedCourses} đã xuất bản
						</div>
					</div>
				</div>
			</div>

			{/* Card 3 - Tổng đăng ký */}
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
						<TrendingUp size={20} />
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
							Tổng đăng ký
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{formatNumber(stats.totalEnrollments)}
						</div>
						<div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '4px' }}>
							{stats.todayEnrollments} hôm nay
						</div>
					</div>
				</div>
			</div>

			{/* Card 4 - Tổng doanh thu */}
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
							{formatCurrency(stats.totalRevenue)}
						</div>
						<div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
							{formatCurrency(stats.todayRevenue)} hôm nay
						</div>
					</div>
				</div>
			</div>

			{/* Card 5 - Người dùng hoạt động */}
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
						<Activity size={20} />
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
							Người dùng hoạt động
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{formatNumber(stats.activeUsers)}
						</div>
						<div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: 600, marginTop: '4px' }}>
							{((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng số
						</div>
					</div>
				</div>
			</div>

			{/* Card 6 - Khóa học xuất bản */}
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
						<Award size={20} />
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
							Khóa học xuất bản
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{stats.publishedCourses}
						</div>
						<div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginTop: '4px' }}>
							{((stats.publishedCourses / stats.totalCourses) * 100).toFixed(1)}% tổng số
						</div>
					</div>
				</div>
			</div>

			{/* Card 7 - Đăng ký hôm nay */}
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
					background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%)',
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
						background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
						color: 'white',
						flexShrink: 0
					}}>
						<Calendar size={20} />
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
							Đăng ký hôm nay
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{stats.todayEnrollments}
						</div>
						<div style={{ fontSize: '11px', color: '#ec4899', fontWeight: 600, marginTop: '4px' }}>
							{((stats.todayEnrollments / stats.totalEnrollments) * 100).toFixed(2)}% tổng số
						</div>
					</div>
				</div>
			</div>

			{/* Card 8 - Doanh thu hôm nay */}
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
					background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
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
						background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
						color: 'white',
						flexShrink: 0
					}}>
						<CreditCard size={20} />
					</div>
					<div style={{ flex: 1 }}>
						<div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '6px', fontWeight: 500 }}>
							Doanh thu hôm nay
						</div>
						<div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1 }}>
							{formatCurrency(stats.todayRevenue)}
						</div>
						<div style={{ fontSize: '11px', color: '#a855f7', fontWeight: 600, marginTop: '4px' }}>
							{((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(2)}% tổng số
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StatCardsGrid
