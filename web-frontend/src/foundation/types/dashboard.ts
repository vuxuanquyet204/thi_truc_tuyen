// Types cho Dashboard tổng quan

export interface DashboardStats {
	totalUsers: number
	totalCourses: number
	totalEnrollments: number
	totalRevenue: number
	activeUsers: number
	publishedCourses: number
	todayEnrollments: number
	todayRevenue: number
	userGrowthRate: number
	courseGrowthRate: number
	enrollmentGrowthRate: number
	revenueGrowthRate: number
}

export interface DashboardUserGrowthData {
	date: string
	users: number
	newUsers: number
	activeUsers: number
}

// Alias for mock data compatibility
export type UserGrowthData = DashboardUserGrowthData

export interface CourseCategoryData {
	category: string
	courses: number
	enrollments: number
	revenue: number
	color: string
	icon: string
}

export interface RecentActivity {
	id: string
	type: ActivityType
	title: string
	description: string
	user?: string
	course?: string
	timestamp: string
	status: ActivityStatus
	metadata?: Record<string, any>
}

export type ActivityType = 
	| 'user_registration'
	| 'course_enrollment'
	| 'course_completion'
	| 'course_published'
	| 'course_updated'
	| 'payment_received'
	| 'certificate_issued'
	| 'review_submitted'
	| 'system_alert'
	| 'admin_action'

export type ActivityStatus = 'success' | 'warning' | 'error' | 'info'

export interface DashboardChartData {
	labels: string[]
	datasets: DashboardChartDataset[]
}

export interface DashboardChartDataset {
	label: string
	data: number[]
	backgroundColor?: string | string[]
	borderColor?: string | string[]
	borderWidth?: number
	fill?: boolean
	tension?: number
}

export interface TopPerformer {
	id: string
	name: string
	type: 'course' | 'instructor' | 'student'
	value: number
	unit: string
	growth: number
	avatar?: string
	metadata?: Record<string, any>
}

export interface SystemHealth {
	status: 'healthy' | 'warning' | 'critical'
	uptime: number
	responseTime: number
	errorRate: number
	lastUpdate: string
	alerts: SystemAlert[]
}

export interface SystemAlert {
	id: string
	type: 'performance' | 'security' | 'error' | 'maintenance'
	severity: 'low' | 'medium' | 'high' | 'critical'
	title: string
	message: string
	timestamp: string
	resolved: boolean
}

export interface DashboardData {
	stats: DashboardStats
	userGrowth: DashboardUserGrowthData[]
	courseCategories: CourseCategoryData[]
	recentActivities: RecentActivity[]
	topPerformers: TopPerformer[]
	systemHealth: SystemHealth
	chartData: {
		userGrowth: DashboardChartData
		courseCategories: DashboardChartData
		revenueTrend: DashboardChartData
	}
}

export interface DashboardFilters {
	timeRange: '7d' | '30d' | '90d' | '1y' | 'all'
	dateFrom?: string
	dateTo?: string
	activityType?: ActivityType | 'all'
	status?: ActivityStatus | 'all'
}

export interface DashboardSettings {
	refreshInterval: number // seconds
	autoRefresh: boolean
	showCharts: boolean
	showActivities: boolean
	showSystemHealth: boolean
	chartType: 'line' | 'bar' | 'pie' | 'doughnut'
	theme: 'light' | 'dark'
}
