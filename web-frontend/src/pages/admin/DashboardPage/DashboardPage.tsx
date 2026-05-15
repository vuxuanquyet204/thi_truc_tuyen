import React, { useState } from 'react'
import {
	BarChart3,
	RefreshCw,
	Settings,
	Filter,
	Download,
	Eye,
	EyeOff,
	Activity,
	TrendingUp,
	Users,
	BookOpen,
	DollarSign,
	AlertTriangle,
	CheckCircle,
	Clock,
	FileSpreadsheet,
	Table
} from 'lucide-react'
import { useAnalytics, useDashboard } from '@/features/admin/hooks'
import { StatCardsGrid } from '@/features/admin/ui/dashboard'
import { UserGrowthChart } from '@/features/admin/ui/dashboard'
import { CourseCategoryChart } from '@/features/admin/ui/dashboard'
import { RecentActivityFeed } from '@/features/admin/ui/dashboard'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import {
	DashboardSettingsModal,
	DashboardFiltersModal,
	DashboardExportModal,
	ActivityDetailModal
} from '@/features/admin/ui/modals'
import {
	exportCompleteDashboardToExcel,
	exportDashboardStatsToExcel,
	exportUserGrowthToExcel,
	exportCourseCategoriesToExcel,
	exportRecentActivitiesToExcel,
	exportTopPerformersToExcel,
	exportSystemHealthToExcel
} from '@/features/dashboard/utils'
import { toast } from '@/foundation/contexts/ToastContext'
import '@/features/admin/ui/common/styles/common.css'
import '@/features/admin/ui/common/styles/dashboard.scss'

export default function DashboardPage(): JSX.Element {
	const {
		data,
		stats,
		userGrowth,
		courseCategories,
		recentActivities,
		topPerformers,
		systemHealth,
		chartData,
		loading,
		filters,
		settings,
		updateFilter,
		clearFilters,
		updateSettings,
		refreshData,
		getActivitySummary
	} = useDashboard()

	const [showSettings, setShowSettings] = useState(false)
	const [showFilters, setShowFilters] = useState(false)
	const [showExportOptions, setShowExportOptions] = useState(false)
	const [selectedActivity, setSelectedActivity] = useState<any>(null)

	const handleActivityClick = (activity: any) => {
		setSelectedActivity(activity)
	}

	const handleExportData = () => {
		setShowExportOptions(true)
	}

	const handleExportComplete = () => {
		try {
			const filename = `dashboard-complete-${new Date().toISOString().split('T')[0]}.xlsx`
			exportCompleteDashboardToExcel(data, filename)
			toast.success('Đã xuất dữ liệu dashboard hoàn chỉnh thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất dữ liệu')
		}
	}

	const handleExportStats = () => {
		try {
			const filename = `dashboard-stats-${new Date().toISOString().split('T')[0]}.xlsx`
			exportDashboardStatsToExcel(stats, filename)
			toast.success('Đã xuất thống kê tổng quan thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất thống kê')
		}
	}

	const handleExportUserGrowth = () => {
		try {
			const filename = `user-growth-${new Date().toISOString().split('T')[0]}.xlsx`
			exportUserGrowthToExcel(userGrowth, filename)
			toast.success('Đã xuất dữ liệu tăng trưởng người dùng thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất dữ liệu tăng trưởng')
		}
	}

	const handleExportCategories = () => {
		try {
			const filename = `course-categories-${new Date().toISOString().split('T')[0]}.xlsx`
			exportCourseCategoriesToExcel(courseCategories, filename)
			toast.success('Đã xuất dữ liệu danh mục khóa học thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất dữ liệu danh mục')
		}
	}

	const handleExportActivities = () => {
		try {
			const filename = `recent-activities-${new Date().toISOString().split('T')[0]}.xlsx`
			exportRecentActivitiesToExcel(recentActivities, filename)
			toast.success('Đã xuất dữ liệu hoạt động gần đây thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất dữ liệu hoạt động')
		}
	}

	const handleExportPerformers = () => {
		try {
			const filename = `top-performers-${new Date().toISOString().split('T')[0]}.xlsx`
			exportTopPerformersToExcel(topPerformers, filename)
			toast.success('Đã xuất dữ liệu top performers thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất dữ liệu top performers')
		}
	}

	const handleExportSystemHealth = () => {
		try {
			const filename = `system-health-${new Date().toISOString().split('T')[0]}.xlsx`
			exportSystemHealthToExcel(systemHealth, filename)
			toast.success('Đã xuất dữ liệu tình trạng hệ thống thành công!')
			setShowExportOptions(false)
		} catch (error) {
			console.error('Export error:', error)
			toast.error('Có lỗi xảy ra khi xuất dữ liệu hệ thống')
		}
	}

	const getSystemHealthColor = (status: string) => {
		switch (status) {
			case 'healthy': return 'var(--success)'
			case 'warning': return 'var(--warning)'
			case 'critical': return 'var(--danger)'
			default: return 'var(--muted-foreground)'
		}
	}

	const getSystemHealthIcon = (status: string) => {
		switch (status) {
			case 'healthy': return <CheckCircle size={16} />
			case 'warning': return <AlertTriangle size={16} />
			case 'critical': return <AlertTriangle size={16} />
			default: return <Clock size={16} />
		}
	}

	const activitySummary = getActivitySummary()

	return (
		<div className="dashboard-container">
			{/* Header */}
			<div className="dashboard-header">
				<div className="dashboard-header-top">
					<div className="dashboard-title-section">
						<h1>
							<BarChart3 size={32} />
							Dashboard Tổng quan
						</h1>
						<p>Theo dõi hiệu suất và hoạt động của hệ thống học trực tuyến</p>
					</div>

					<div className="dashboard-actions">
						{/* System Health Indicator */}
						<div
							className="system-health-indicator"
							style={{
								borderColor: getSystemHealthColor(systemHealth.status)
							}}
						>
							<div style={{ color: getSystemHealthColor(systemHealth.status) }}>
								{getSystemHealthIcon(systemHealth.status)}
							</div>
							<div className="system-health-info">
								<h4>
									Hệ thống {systemHealth.status === 'healthy' ? 'Hoạt động tốt' :
											systemHealth.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
								</h4>
								<p>Uptime: {systemHealth.uptime}%</p>
							</div>
						</div>

						<button
							className="modal-action-button"
							onClick={() => setShowFilters(true)}
							title="Bộ lọc"
						>
							<Filter />
							Bộ lọc
						</button>
						<button
							className="modal-action-button"
							onClick={handleExportData}
							title="Xuất dữ liệu Excel"
						>
							<FileSpreadsheet />
							Xuất dữ liệu
						</button>
						<button
							className="modal-action-button"
							onClick={refreshData}
							disabled={loading}
							title="Làm mới"
						>
							<RefreshCw className={loading ? 'animate-spin' : ''} />
							Làm mới
						</button>
						<button
							className="modal-action-button"
							onClick={() => setShowSettings(true)}
							title="Cài đặt"
						>
							<Settings />
							Cài đặt
						</button>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="quick-stats-grid">
					{/* Card 1 - Hoạt động hôm nay */}
					<div className="stat-card">
						<div
							className="stat-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)' }}
						/>
						<div className="stat-card-content">
							<div
								className="stat-card-icon"
								style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
							>
								<Activity size={20} />
							</div>
							<div className="stat-card-data">
								<div className="stat-card-label">Hoạt động hôm nay</div>
								<div className="stat-card-value">{activitySummary.total}</div>
								<div className="stat-card-subtitle" style={{ color: '#3b82f6' }}>
									Tổng hoạt động
								</div>
							</div>
						</div>
					</div>

					{/* Card 2 - Uptime hệ thống */}
					<div className="stat-card">
						<div
							className="stat-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)' }}
						/>
						<div className="stat-card-content">
							<div
								className="stat-card-icon"
								style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
							>
								<CheckCircle size={20} />
							</div>
							<div className="stat-card-data">
								<div className="stat-card-label">Uptime hệ thống</div>
								<div className="stat-card-value">{systemHealth.uptime}%</div>
								<div className="stat-card-subtitle" style={{ color: '#10b981' }}>
									Thời gian hoạt động
								</div>
							</div>
						</div>
					</div>

					{/* Card 3 - Thời gian phản hồi */}
					<div className="stat-card">
						<div
							className="stat-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)' }}
						/>
						<div className="stat-card-content">
							<div
								className="stat-card-icon"
								style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
							>
								<Clock size={20} />
							</div>
							<div className="stat-card-data">
								<div className="stat-card-label">Thời gian phản hồi</div>
								<div className="stat-card-value">{systemHealth.responseTime}s</div>
								<div className="stat-card-subtitle" style={{ color: '#f59e0b' }}>
									Trung bình phản hồi
								</div>
							</div>
						</div>
					</div>

					{/* Card 4 - Tỷ lệ lỗi */}
					<div className="stat-card">
						<div
							className="stat-card-bg"
							style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)' }}
						/>
						<div className="stat-card-content">
							<div
								className="stat-card-icon"
								style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
							>
								<AlertTriangle size={20} />
							</div>
							<div className="stat-card-data">
								<div className="stat-card-label">Tỷ lệ lỗi</div>
								<div className="stat-card-value">{systemHealth.errorRate}%</div>
								<div className="stat-card-subtitle" style={{ color: '#ef4444' }}>
									Tỷ lệ lỗi hệ thống
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Stats Grid */}
			<StatCardsGrid stats={stats} loading={loading} />

			{/* Charts Section */}
			<div className="dashboard-charts-section">
				<UserGrowthChart
					data={userGrowth}
					chartData={chartData.userGrowth}
					loading={loading}
				/>
				<CourseCategoryChart
					data={courseCategories}
					chartData={chartData.courseCategories}
					loading={loading}
				/>
			</div>

			{/* Bottom Section */}
			<div className="dashboard-bottom-section">
				<RecentActivityFeed
					activities={recentActivities}
					loading={loading}
					onActivityClick={handleActivityClick}
				/>

				{/* Top Performers */}
				<div className="top-performers-card">
					<div className="top-performers-header">
						<div className="top-performers-title">
							<TrendingUp size={20} />
							Top Performers
						</div>
						<div className="top-performers-subtitle">
							Các khóa học và giảng viên xuất sắc nhất
						</div>
					</div>

					<div className="top-performers-list">
						{topPerformers.slice(0, 5).map((performer, index) => (
							<div key={performer.id} className="performer-item">
								<div className="performer-rank">
									#{index + 1}
								</div>
								{performer.avatar && (
									<img
										src={performer.avatar}
										alt={performer.name}
										className="performer-avatar"
									/>
								)}
								<div className="performer-info">
									<div className="performer-name">{performer.name}</div>
									<div className="performer-value">
										{performer.value.toLocaleString()} {performer.unit}
									</div>
								</div>
								<div className="performer-growth">
									<div className={`performer-growth-value ${performer.growth > 0 ? 'positive' : 'negative'}`}>
										{performer.growth > 0 ? '+' : ''}{performer.growth}%
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Settings Modal */}
			<DashboardSettingsModal
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
				settings={settings}
				onUpdateSettings={updateSettings as (key: string, value: any) => void}
			/>

			{/* Filters Modal */}
			<DashboardFiltersModal
				isOpen={showFilters}
				onClose={() => setShowFilters(false)}
				filters={filters}
				onUpdateFilter={updateFilter as (key: string, value: any) => void}
				onClearFilters={clearFilters}
			/>

			{/* Export Options Modal */}
			<DashboardExportModal
				isOpen={showExportOptions}
				onClose={() => setShowExportOptions(false)}
				onExportComplete={handleExportComplete}
				onExportStats={handleExportStats}
				onExportUserGrowth={handleExportUserGrowth}
				onExportCategories={handleExportCategories}
				onExportActivities={handleExportActivities}
				onExportPerformers={handleExportPerformers}
				onExportSystemHealth={handleExportSystemHealth}
			/>

			{/* Activity Detail Modal */}
			<ActivityDetailModal
				isOpen={!!selectedActivity}
				onClose={() => setSelectedActivity(null)}
				activity={selectedActivity}
			/>
		</div>
	)
}
