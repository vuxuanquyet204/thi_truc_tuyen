import React from 'react'
import { CourseCategoryData } from '@/types/dashboard'
import { ChartData } from '@/foundation/types/analytics'
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react'
import '@/features/admin/ui/common/styles/dashboard.scss'

interface CourseCategoryChartProps {
	data: CourseCategoryData[]
	chartData: ChartData
	loading?: boolean
}

const CourseCategoryChart: React.FC<CourseCategoryChartProps> = ({ data, chartData, loading = false }) => {
	const formatNumber = (num: number) => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
		return num.toString()
	}

	const formatCurrency = (amount: number) => {
		return `${(amount / 1000000).toFixed(1)}M LEARN`
	}

	// Tính toán tổng số
	const totalCourses = data.reduce((sum, item) => sum + item.courses, 0)
	const totalEnrollments = data.reduce((sum, item) => sum + item.enrollments, 0)
	const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)

	// Calculate max safely (avoid NaN when data is empty)
	const maxCourses = data.length > 0 ? Math.max(...data.map(d => d.courses)) : 0

	// Sắp xếp theo số khóa học
	const sortedData = [...data].sort((a, b) => b.courses - a.courses)

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
					<BookOpen size={20} />
					Phân bổ khóa học theo danh mục
				</div>
				<div className="chart-subtitle">
					Thống kê số lượng khóa học và hiệu suất theo từng danh mục
				</div>
			</div>

			<div className="chart-content">
				{/* Chart visualization - Bar chart */}
				<div className="chart-visualization">
					<div className="bar-chart">
						{/* Y-axis */}
						<div className="y-axis">
							{maxCourses > 0 ? Array.from({ length: 5 }).map((_, i) => {
								const value = maxCourses - (maxCourses * (i / 4))
								return (
									<div key={i} className="y-label">
										{Math.floor(value)}
									</div>
								)
							}) : <div className="y-label">0</div>}
						</div>

						{/* Chart area */}
						<div className="chart-area">
							{/* Grid lines */}
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="grid-line" style={{ top: `${i * 20}%` }}></div>
							))}

							{/* Bars */}
							<div className="bars-container">
						{sortedData.map((item, index) => {
								const maxValue = maxCourses > 0 ? maxCourses : 1
								const height = (item.courses / maxValue) * 100
								const percentage = totalCourses > 0 ? ((item.courses / totalCourses) * 100).toFixed(1) : "0.0"
									
									return (
										<div key={item.category} className="bar-group">
											<div className="bar-wrapper">
												<div
													className="bar"
													style={{
														height: `${height}%`,
														backgroundColor: item.color,
														opacity: 0.8
													}}
													title={`${item.category}: ${item.courses} khóa học (${percentage}%)`}
												></div>
											</div>
											<div className="bar-label">
												{item.icon} {item.category}
											</div>
											<div className="bar-value">
												{item.courses}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				</div>

				{/* Category details */}
				<div className="category-details">
					<div className="details-header">
						<h4>Chi tiết theo danh mục</h4>
					</div>
					<div className="details-list">
						{sortedData.map((item, index) => {
							const coursePercentage = totalCourses > 0 ? ((item.courses / totalCourses) * 100).toFixed(1) : "0.0"
							const enrollmentPercentage = totalEnrollments > 0 ? ((item.enrollments / totalEnrollments) * 100).toFixed(1) : "0.0"
							const revenuePercentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : "0.0"
							
							return (
								<div key={item.category} className="detail-item">
									<div className="detail-header">
										<div className="detail-category">
											<span className="category-icon">{item.icon}</span>
											<span className="category-name">{item.category}</span>
										</div>
										<div className="detail-rank">
											#{index + 1}
										</div>
									</div>
									<div className="detail-stats">
										<div className="stat-row">
											<div className="stat-label">
												<BookOpen size={14} />
												Khóa học:
											</div>
											<div className="stat-value">
												{item.courses} ({coursePercentage}%)
											</div>
										</div>
										<div className="stat-row">
											<div className="stat-label">
												<Users size={14} />
												Đăng ký:
											</div>
											<div className="stat-value">
												{formatNumber(item.enrollments)} ({enrollmentPercentage}%)
											</div>
										</div>
										<div className="stat-row">
											<div className="stat-label">
												<DollarSign size={14} />
												Doanh thu:
											</div>
											<div className="stat-value">
												{formatCurrency(item.revenue)} ({revenuePercentage}%)
											</div>
										</div>
									</div>
									<div className="detail-progress">
										<div className="progress-bar">
											<div
												className="progress-fill"
												style={{
													width: `${coursePercentage}%`,
													backgroundColor: item.color
												}}
											></div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{/* Summary stats */}
				<div className="summary-cards-grid">
					{/* Card 1 - Tổng khóa học */}
					<div className="summary-card">
						<div
							className="summary-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)' }}
						/>
						<div className="summary-card-content">
							<div
								className="summary-card-icon"
								style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
							>
								<BookOpen size={18} />
							</div>
							<div className="summary-card-data">
								<div className="summary-card-value">{totalCourses}</div>
								<div className="summary-card-label">Tổng khóa học</div>
							</div>
						</div>
					</div>

					{/* Card 2 - Tổng đăng ký */}
					<div className="summary-card">
						<div
							className="summary-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)' }}
						/>
						<div className="summary-card-content">
							<div
								className="summary-card-icon"
								style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
							>
								<Users size={18} />
							</div>
							<div className="summary-card-data">
								<div className="summary-card-value">{formatNumber(totalEnrollments)}</div>
								<div className="summary-card-label">Tổng đăng ký</div>
							</div>
						</div>
					</div>

					{/* Card 3 - Tổng doanh thu */}
					<div className="summary-card">
						<div
							className="summary-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)' }}
						/>
						<div className="summary-card-content">
							<div
								className="summary-card-icon"
								style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
							>
								<TrendingUp size={18} />
							</div>
							<div className="summary-card-data">
								<div className="summary-card-value">{formatCurrency(totalRevenue)}</div>
								<div className="summary-card-label">Tổng doanh thu</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default CourseCategoryChart
