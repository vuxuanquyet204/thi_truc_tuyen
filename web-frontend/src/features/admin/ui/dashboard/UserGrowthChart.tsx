import React from 'react'
import { ChartData } from '@/foundation/types/analytics'
import { UserGrowthData } from '@/types/dashboard'
import { TrendingUp, Users, UserPlus, Activity } from 'lucide-react'
import '@/features/admin/ui/common/styles/dashboard.scss'

interface UserGrowthChartProps {
	data: UserGrowthData[]
	chartData: ChartData
	loading?: boolean
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data, chartData, loading = false }) => {
	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit'
		})
	}

	// Tính toán các chỉ số
	const totalGrowth = data.length > 0 ? data[data.length - 1].users - data[0].users : 0
	const avgDailyGrowth = data.length > 0 ? totalGrowth / data.length : 0
	const maxUsers = data.length > 0 ? Math.max(...data.map(d => d.users)) : 0
	const minUsers = data.length > 0 ? Math.min(...data.map(d => d.users)) : 0

	if (loading) {
		return (
			<div className="chart-container">
				<div className="chart-header">
					<div className="chart-title-skeleton"></div>
					<div className="chart-subtitle-skeleton"></div>
				</div>
				<div className="chart-content-skeleton">
					<div className="chart-skeleton"></div>
				</div>
			</div>
		)
	}

	return (
		<div className="chart-container">
			<div className="chart-header">
				<div className="chart-title">
					<TrendingUp size={20} />
					Tăng trưởng người dùng
				</div>
				<div className="chart-subtitle">
					Theo dõi xu hướng tăng trưởng trong 30 ngày qua
				</div>
			</div>

			<div className="chart-content">
				{/* Chart visualization - Simplified version */}
				<div className="chart-visualization">
					<div className="chart-grid">
						{/* Y-axis labels */}
						<div className="y-axis">
							{Array.from({ length: 5 }).map((_, i) => {
								const value = maxUsers - (maxUsers - minUsers) * (i / 4)
								return (
									<div key={i} className="y-label">
										{formatNumber(value)}
									</div>
								)
							})}
						</div>

						{/* Chart area */}
						<div className="chart-area">
							{/* Grid lines */}
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="grid-line" style={{ top: `${i * 20}%` }}></div>
							))}

							{/* Data points and lines */}
							<svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
						{/* Total users line */}
							<polyline
								points={data.length > 0 ? data.map((d, i) => {
									const x = (i / (data.length - 1 || 1)) * 100
									const range = maxUsers - minUsers
									const y = range !== 0 ? 100 - ((d.users - minUsers) / range) * 100 : 50
									return `${x},${y}`
								}).join(' ') : '0,50 100,50'}
								fill="none"
								stroke="rgba(59, 130, 246, 1)"
								strokeWidth="0.5"
							/>

							{/* New users line */}
							<polyline
								points={data.length > 0 ? data.map((d, i) => {
									const x = (i / (data.length - 1 || 1)) * 100
									const maxNewUsers = Math.max(...data.map(d => d.newUsers), 1)
									const y = 100 - ((d.newUsers / maxNewUsers) * 100)
									return `${x},${y}`
								}).join(' ') : '0,50 100,50'}
								fill="none"
								stroke="rgba(16, 185, 129, 1)"
								strokeWidth="0.5"
							/>
							</svg>

							{/* Data points */}
							{data.map((d, i) => {
								const x = (i / (data.length - 1 || 1)) * 100
								const range = maxUsers - minUsers
								const y = range !== 0 ? 100 - ((d.users - minUsers) / range) * 100 : 50
								return (
									<div
										key={i}
										className="data-point"
										style={{ left: `${x}%`, top: `${y}%` }}
										title={`${formatDate(d.date)}: ${formatNumber(d.users)} người dùng`}
									></div>
								)
							})}
						</div>

						{/* X-axis labels */}
						<div className="x-axis">
							{data.filter((_, i) => i % 5 === 0).map((d, i) => (
								<div key={i} className="x-label">
									{formatDate(d.date)}
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Chart legend */}
				<div className="chart-legend">
					<div className="legend-item">
						<div className="legend-color" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
						<span>Tổng người dùng</span>
					</div>
					<div className="legend-item">
						<div className="legend-color" style={{ backgroundColor: 'rgba(16, 185, 129, 1)' }}></div>
						<span>Người dùng mới</span>
					</div>
				</div>

				{/* Chart stats */}
				<div style={{ 
					display: 'grid', 
					gridTemplateColumns: 'repeat(3, 1fr)', 
					gap: '16px',
					marginTop: '20px'
				}}>
					{/* Card 1 - Người dùng cao nhất */}
					<div style={{ 
						background: 'var(--card)',
						borderRadius: 'var(--radius-lg)',
						padding: '16px',
						boxShadow: 'var(--shadow-sm)',
						border: '1px solid var(--border)',
						position: 'relative',
						overflow: 'hidden'
					}}>
						<div style={{ 
							position: 'absolute',
							top: '0',
							right: '0',
							width: '60px',
							height: '60px',
							background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
							borderRadius: '50%',
							transform: 'translate(15px, -15px)'
						}} />
						<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', position: 'relative', zIndex: 1 }}>
							<div style={{ 
								width: '32px', 
								height: '32px', 
								borderRadius: 'var(--radius-md)', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
								color: 'white',
								flexShrink: 0
							}}>
								<Users size={16} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '2px' }}>
									{formatNumber(maxUsers)}
								</div>
								<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
									Người dùng cao nhất
								</div>
							</div>
						</div>
					</div>

					{/* Card 2 - Tăng trưởng TB/ngày */}
					<div style={{ 
						background: 'var(--card)',
						borderRadius: 'var(--radius-lg)',
						padding: '16px',
						boxShadow: 'var(--shadow-sm)',
						border: '1px solid var(--border)',
						position: 'relative',
						overflow: 'hidden'
					}}>
						<div style={{ 
							position: 'absolute',
							top: '0',
							right: '0',
							width: '60px',
							height: '60px',
							background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
							borderRadius: '50%',
							transform: 'translate(15px, -15px)'
						}} />
						<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', position: 'relative', zIndex: 1 }}>
							<div style={{ 
								width: '32px', 
								height: '32px', 
								borderRadius: 'var(--radius-md)', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
								color: 'white',
								flexShrink: 0
							}}>
								<UserPlus size={16} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '2px' }}>
									{formatNumber(Math.floor(avgDailyGrowth))}
								</div>
								<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
									Tăng trưởng TB/ngày
								</div>
							</div>
						</div>
					</div>

					{/* Card 3 - Tổng tăng trưởng */}
					<div style={{ 
						background: 'var(--card)',
						borderRadius: 'var(--radius-lg)',
						padding: '16px',
						boxShadow: 'var(--shadow-sm)',
						border: '1px solid var(--border)',
						position: 'relative',
						overflow: 'hidden'
					}}>
						<div style={{ 
							position: 'absolute',
							top: '0',
							right: '0',
							width: '60px',
							height: '60px',
							background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
							borderRadius: '50%',
							transform: 'translate(15px, -15px)'
						}} />
						<div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', position: 'relative', zIndex: 1 }}>
							<div style={{ 
								width: '32px', 
								height: '32px', 
								borderRadius: 'var(--radius-md)', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center',
								background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
								color: 'white',
								flexShrink: 0
							}}>
								<Activity size={16} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1, marginBottom: '2px' }}>
									{formatNumber(totalGrowth)}
								</div>
								<div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 500 }}>
									Tổng tăng trưởng
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default UserGrowthChart
