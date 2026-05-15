// Types cho Analytics và Reporting

export interface KPIMetric {
	id: string
	name: string
	value: number
	unit: string
	change: number
	changeType: 'increase' | 'decrease' | 'stable'
	period: string
	icon: string
	color: string
	description: string
	trend: number[]
	threshold?: {
		warning: number
		critical: number
	}
}

export interface ChartData {
	type?: ChartType
	labels: string[]
	datasets: ChartDataset[]
}

export interface ChartDataset {
	label: string
	data: number[]
	backgroundColor?: string | string[]
	borderColor?: string | string[]
	borderWidth?: number
	fill?: boolean
	tension?: number
	pointRadius?: number
	pointHoverRadius?: number
}

export interface AnalyticsChart {
	id: string
	title: string
	type: ChartType
	data: ChartData
	options?: ChartOptions
	description?: string
	period: string
	lastUpdated: string
}

export type ChartType = 
	| 'line'
	| 'bar'
	| 'doughnut'
	| 'pie'
	| 'area'
	| 'scatter'
	| 'radar'
	| 'polar'

export interface ChartOptions {
	responsive?: boolean
	maintainAspectRatio?: boolean
	plugins?: {
		legend?: {
			display?: boolean
			position?: 'top' | 'bottom' | 'left' | 'right'
		}
		title?: {
			display?: boolean
			text?: string
		}
		tooltip?: {
			enabled?: boolean
		}
	}
	scales?: {
		x?: {
			display?: boolean
			title?: {
				display?: boolean
				text?: string
			}
		}
		y?: {
			display?: boolean
			title?: {
				display?: boolean
				text?: string
			}
		}
	}
}

export interface TopListItem {
	id: string
	name: string
	value: number
	unit: string
	change: number
	changeType: 'increase' | 'decrease' | 'stable'
	metadata?: Record<string, any>
	avatar?: string
	category?: string
	subtitle?: string
}

export interface TopListsWidget {
	id: string
	title: string
	type: TopListType
	items: TopListItem[]
	period: string
	lastUpdated: string
	description?: string
	maxItems?: number
}

export type TopListType = 
	| 'courses'
	| 'users'
	| 'organizations'
	| 'instructors'
	| 'certificates'
	| 'revenue'
	| 'enrollments'
	| 'completions'

export interface DateRange {
	start: string
	end: string
	label: string
}

export interface AnalyticsFilters {
	dateRange: DateRange
	period: AnalyticsPeriod
	category?: string
	organization?: string
	course?: string
	instructor?: string
	status?: string
	metric?: string
}

export type AnalyticsPeriod = 
	| 'today'
	| 'yesterday'
	| 'last_7_days'
	| 'last_30_days'
	| 'last_90_days'
	| 'this_month'
	| 'last_month'
	| 'this_quarter'
	| 'last_quarter'
	| 'this_year'
	| 'last_year'
	| 'custom'

export interface RevenueData {
	date: string
	revenue: number
	transactions: number
	avgOrderValue: number
	refunds: number
	netRevenue: number
}

export interface UserGrowthData {
	date: string
	newUsers: number
	activeUsers: number
	totalUsers: number
	retentionRate: number
	churnRate: number
}

export interface CourseAnalytics {
	courseId: string
	courseName: string
	enrollments: number
	completions: number
	completionRate: number
	avgRating: number
	revenue: number
	views: number
	likes: number
	shares: number
	comments: number
	duration: number
	category: string
	instructor: string
	createdAt: string
	lastUpdated: string
}

export interface UserAnalytics {
	userId: string
	userName: string
	email: string
	avatar?: string
	enrollments: number
	completions: number
	completionRate: number
	avgScore: number
	timeSpent: number
	certificates: number
	lastActive: string
	joinDate: string
	organization?: string
	level: 'beginner' | 'intermediate' | 'advanced'
	preferredCategories: string[]
}

export interface OrganizationAnalytics {
	organizationId: string
	organizationName: string
	logo?: string
	totalUsers: number
	activeUsers: number
	totalCourses: number
	completedCourses: number
	totalRevenue: number
	avgCompletionRate: number
	avgRating: number
	lastActivity: string
	joinDate: string
	plan: 'free' | 'basic' | 'premium' | 'enterprise'
	industry: string
	location: string
}

export interface InstructorAnalytics {
	instructorId: string
	instructorName: string
	avatar?: string
	totalCourses: number
	totalStudents: number
	totalRevenue: number
	avgRating: number
	avgCompletionRate: number
	totalHours: number
	certificatesIssued: number
	lastCourseCreated: string
	joinDate: string
	specialization: string[]
	experience: number
}

export interface CertificateAnalytics {
	certificateId: string
	certificateName: string
	totalIssued: number
	totalActive: number
	totalExpired: number
	totalRevoked: number
	completionRate: number
	avgTimeToComplete: number
	popularityScore: number
	lastIssued: string
	createdAt: string
	category: string
	level: string
}

export interface EngagementMetrics {
	date: string
	pageViews: number
	sessions: number
	uniqueVisitors: number
	bounceRate: number
	avgSessionDuration: number
	pagesPerSession: number
	newVisitors: number
	returningVisitors: number
}

export interface ConversionMetrics {
	date: string
	visitors: number
	signups: number
	enrollments: number
	completions: number
	purchases: number
	signupRate: number
	enrollmentRate: number
	completionRate: number
	purchaseRate: number
}

export interface GeographicData {
	country: string
	countryCode: string
	users: number
	revenue: number
	courses: number
	completions: number
	percentage: number
}

export interface DeviceAnalytics {
	device: string
	users: number
	sessions: number
	avgSessionDuration: number
	bounceRate: number
	percentage: number
}

export interface TrafficSource {
	source: string
	users: number
	sessions: number
	revenue: number
	conversionRate: number
	percentage: number
}

export interface AnalyticsDashboard {
	overview: {
		totalUsers: number
		totalCourses: number
		totalRevenue: number
		totalEnrollments: number
		avgCompletionRate: number
		avgRating: number
		activeUsers: number
		newUsersToday: number
	}
	kpis: KPIMetric[]
	charts: AnalyticsChart[]
	topLists: TopListsWidget[]
	recentActivity: AnalyticsActivity[]
	alerts: AnalyticsAlert[]
	insights: AnalyticsInsight[]
}

export interface AnalyticsActivity {
	id: string
	type: ActivityType
	title: string
	description: string
	timestamp: string
	userId?: string
	userName?: string
	avatar?: string
	metadata?: Record<string, any>
	impact: 'low' | 'medium' | 'high'
}

export type ActivityType = 
	| 'user_signup'
	| 'course_enrollment'
	| 'course_completion'
	| 'certificate_issued'
	| 'payment_received'
	| 'course_created'
	| 'user_login'
	| 'review_submitted'
	| 'organization_joined'
	| 'instructor_joined'

export interface AnalyticsAlert {
	id: string
	type: AnalyticsAlertType
	severity: 'low' | 'medium' | 'high' | 'critical'
	title: string
	message: string
	timestamp: string
	resolved: boolean
	metadata?: Record<string, any>
}

export type AnalyticsAlertType =
	| 'low_enrollment'
	| 'high_churn'
	| 'revenue_drop'
	| 'completion_rate_low'
	| 'system_error'
	| 'unusual_activity'
	| 'capacity_warning'
	| 'security_breach'

export interface AnalyticsInsight {
	id: string
	type: InsightType
	title: string
	description: string
	confidence: number
	impact: 'low' | 'medium' | 'high'
	actionable: boolean
	recommendations?: string[]
	timestamp: string
	metadata?: Record<string, any>
}

export type InsightType = 
	| 'trend_analysis'
	| 'anomaly_detection'
	| 'correlation_analysis'
	| 'predictive_analysis'
	| 'segmentation_analysis'
	| 'performance_analysis'
	| 'user_behavior'
	| 'content_analysis'

export interface ReportConfig {
	id: string
	name: string
	description: string
	type: ReportType
	frequency: ReportFrequency
	recipients: string[]
	metrics: string[]
	filters: AnalyticsFilters
	format: 'pdf' | 'excel' | 'csv' | 'json'
	enabled: boolean
	lastGenerated?: string
	nextGeneration?: string
	createdAt: string
	updatedAt: string
}

export type ReportType = 
	| 'daily_summary'
	| 'weekly_summary'
	| 'monthly_summary'
	| 'quarterly_summary'
	| 'yearly_summary'
	| 'custom_report'
	| 'executive_dashboard'
	| 'operational_report'

export type ReportFrequency = 
	| 'daily'
	| 'weekly'
	| 'monthly'
	| 'quarterly'
	| 'yearly'
	| 'on_demand'

export interface AnalyticsExport {
	id: string
	name: string
	type: 'chart' | 'table' | 'report'
	data: any
	format: 'png' | 'jpg' | 'pdf' | 'excel' | 'csv' | 'json'
	timestamp: string
	downloadUrl?: string
	size?: number
}

export interface AnalyticsComparison {
	metric: string
	current: number
	previous: number
	change: number
	changePercentage: number
	trend: 'up' | 'down' | 'stable'
	period: string
}

export interface AnalyticsSegment {
	id: string
	name: string
	description: string
	criteria: SegmentCriteria
	userCount: number
	percentage: number
	avgValue: number
	lastUpdated: string
}

export interface SegmentCriteria {
	age?: {
		min?: number
		max?: number
	}
	location?: string[]
	behavior?: string[]
	engagement?: {
		min?: number
		max?: number
	}
	completion?: {
		min?: number
		max?: number
	}
	revenue?: {
		min?: number
		max?: number
	}
}

export interface AnalyticsGoal {
	id: string
	name: string
	description: string
	target: number
	current: number
	unit: string
	deadline: string
	status: 'on_track' | 'behind' | 'ahead' | 'completed' | 'failed'
	progress: number
	trend: number[]
	lastUpdated: string
}

export interface AnalyticsBenchmark {
	metric: string
	industry: string
	average: number
	median: number
	topQuartile: number
	ourValue: number
	percentile: number
	lastUpdated: string
}
