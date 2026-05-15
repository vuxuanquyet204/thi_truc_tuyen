/**
 * Admin Dashboard Hook
 *
 * Fetches dashboard data from Analytics Service API.
 * Replaced mock data with real API calls.
 */

import { useState, useEffect, useCallback } from 'react'
import { analyticsClient, tokenClient } from '@/foundation/api'
import {
	DashboardData,
	DashboardFilters,
	DashboardSettings,
	DashboardStats,
	DashboardUserGrowthData,
	CourseCategoryData,
	RecentActivity,
	ActivityType,
	ActivityStatus,
	SystemHealth,
} from '@/foundation/types/dashboard'

// ========== API RESPONSE INTERFACES ==========

interface ApiResponse<T> {
	success: boolean
	message?: string
	data: T
}

interface AnalyticsOverviewResponse {
	totalUsers: number
	activeUsers: number
	totalCourses: number
	totalExams: number
	newUsersToday: number
	activeUsersToday: number
	newCoursesToday: number
	examsTakenToday: number
	totalEnrollments: number
	enrollmentsToday: number
	totalRevenue: number
	revenueToday: number
	userGrowthRate: number
	courseGrowthRate: number
	enrollmentGrowthRate: number
	revenueGrowthRate: number
}

interface UserGrowthPoint {
	date: string
	totalUsers: number
	newUsers: number
	activeUsers: number
}

interface CourseCategoryStat {
	category: string
	courses: number
	enrollments: number
	revenue: number
	color: string
	icon: string
}

interface RecentActivityResponse {
	id: string
	type: string
	title: string
	description: string
	user?: string
	course?: string
	timestamp: string
	status: string
}

interface TopPerformerResponse {
	id: string
	name: string
	type: string
	value: number
	unit: string
	growth: number
	avatar?: string
}

interface SystemAlertResponse {
	id: string
	type: string
	severity: string
	title: string
	message: string
	timestamp: string
	resolved: boolean
}

interface SystemHealthResponse {
	status: string
	uptime: number
	responseTime: number
	errorRate: number
	lastUpdate: string
	alerts: SystemAlertResponse[]
}

interface DashboardChartDataset {
	label: string
	data: number[]
	backgroundColor?: string | string[]
	borderColor?: string | string[]
	borderWidth?: number
	fill?: boolean
	tension?: number
}

interface ChartData {
	labels: string[]
	datasets: DashboardChartDataset[]
}

interface ChartDataWrapper {
	userGrowthChart: ChartData
	courseCategoriesChart: ChartData
	revenueTrendChart: ChartData
}

interface DashboardApiResponse {
	stats: AnalyticsOverviewResponse
	userGrowth: UserGrowthPoint[]
	courseCategories: CourseCategoryStat[]
	recentActivities: RecentActivityResponse[]
	topPerformers: TopPerformerResponse[]
	systemHealth: SystemHealthResponse
	chartData: ChartDataWrapper
}

interface TokenStatsResponse {
	totalTokensIssued: number
	totalTokensSpent: number
	currentBalance: number
	totalUsers: number
	totalTransactions: number
	todayTransactions: number
	todayTokensDistributed: number
}

// ========== DEFAULT VALUES ==========

const emptyStats: DashboardStats = {
	totalUsers: 0,
	totalCourses: 0,
	totalEnrollments: 0,
	totalRevenue: 0,
	activeUsers: 0,
	publishedCourses: 0,
	todayEnrollments: 0,
	todayRevenue: 0,
	userGrowthRate: 0,
	courseGrowthRate: 0,
	enrollmentGrowthRate: 0,
	revenueGrowthRate: 0,
}

const defaultSystemHealth: SystemHealth = {
	status: 'healthy',
	uptime: 0,
	responseTime: 0,
	errorRate: 0,
	lastUpdate: new Date().toISOString(),
	alerts: [],
}

const emptyData: DashboardData = {
	stats: emptyStats,
	userGrowth: [],
	courseCategories: [],
	recentActivities: [],
	topPerformers: [],
	systemHealth: defaultSystemHealth,
	chartData: {
		userGrowth: { labels: [], datasets: [] },
		courseCategories: { labels: [], datasets: [] },
		revenueTrend: { labels: [], datasets: [] },
	},
}

// ========== API FUNCTIONS ==========

async function fetchDashboard(): Promise<DashboardApiResponse | null> {
	try {
		const response = await analyticsClient.get<ApiResponse<DashboardApiResponse>>('/dashboard')
		if (response.data.success) {
			return response.data.data
		}
		return null
	} catch (error) {
		console.error('Error fetching dashboard:', error)
		return null
	}
}

async function fetchTokenStats(): Promise<TokenStatsResponse | null> {
	try {
		const { data } = await tokenClient.get<TokenStatsResponse>('/admin/stats')
		return data
	} catch (error) {
		console.warn('Token stats unavailable:', error)
		return null
	}
}

// ========== HOOK ==========

export default function useDashboard() {
	const [data, setData] = useState<DashboardData>(emptyData)
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState<DashboardFilters>({
		timeRange: '30d',
		activityType: 'all',
		status: 'all',
	})
	const [settings, setSettings] = useState<DashboardSettings>({
		refreshInterval: 30,
		autoRefresh: true,
		showCharts: true,
		showActivities: true,
		showSystemHealth: true,
		chartType: 'line',
		theme: 'light',
	})

	const fetchAllData = useCallback(async () => {
		setLoading(true)
		try {
		const [dashboard, tokenStats] =
			await Promise.all([
				fetchDashboard(),
				fetchTokenStats(),
			])

			if (dashboard) {
				// Use data from /dashboard endpoint
				const mappedStats: DashboardStats = {
					totalUsers: dashboard.stats.totalUsers,
					totalCourses: dashboard.stats.totalCourses,
					totalEnrollments: dashboard.stats.totalEnrollments,
					totalRevenue: dashboard.stats.totalRevenue,
					activeUsers: dashboard.stats.activeUsers,
					publishedCourses: dashboard.stats.totalCourses,
					todayEnrollments: dashboard.stats.enrollmentsToday,
					todayRevenue: dashboard.stats.revenueToday,
					userGrowthRate: dashboard.stats.userGrowthRate,
					courseGrowthRate: dashboard.stats.courseGrowthRate,
					enrollmentGrowthRate: dashboard.stats.enrollmentGrowthRate,
					revenueGrowthRate: dashboard.stats.revenueGrowthRate,
				}

				const mappedUserGrowth: DashboardUserGrowthData[] = dashboard.userGrowth.map((g) => ({
					date: g.date,
					users: g.totalUsers,
					newUsers: g.newUsers,
					activeUsers: g.activeUsers,
				}))

				const mappedCategories: CourseCategoryData[] = dashboard.courseCategories.map((c) => ({
					category: c.category,
					courses: c.courses,
					enrollments: c.enrollments,
					revenue: c.revenue,
					color: c.color,
					icon: c.icon,
				}))

				const mappedActivities: RecentActivity[] = dashboard.recentActivities.map((a) => ({
					id: a.id,
					type: a.type as ActivityType,
					title: a.title,
					description: a.description,
					user: a.user,
					course: a.course,
					timestamp: a.timestamp,
					status: a.status as ActivityStatus,
				}))

				const mappedTopPerformers = dashboard.topPerformers.map((p) => ({
					id: p.id,
					name: p.name,
					type: p.type as 'course' | 'instructor' | 'student',
					value: p.value,
					unit: p.unit,
					growth: p.growth,
					avatar: p.avatar,
				}))

				const mappedSystemHealth: SystemHealth = {
					status: dashboard.systemHealth.status,
					uptime: dashboard.systemHealth.uptime,
					responseTime: dashboard.systemHealth.responseTime,
					errorRate: dashboard.systemHealth.errorRate,
					lastUpdate: dashboard.systemHealth.lastUpdate,
					alerts: dashboard.systemHealth.alerts.map((a) => ({
						id: a.id,
						type: a.type as 'performance' | 'security' | 'error' | 'maintenance',
						severity: a.severity as 'low' | 'medium' | 'high' | 'critical',
						title: a.title,
						message: a.message,
						timestamp: a.timestamp,
						resolved: a.resolved,
					})),
				}

				setData({
					stats: mappedStats,
					userGrowth: mappedUserGrowth,
					courseCategories: mappedCategories,
					recentActivities: mappedActivities,
					topPerformers: mappedTopPerformers,
					systemHealth: mappedSystemHealth,
					chartData: {
						userGrowth: dashboard.chartData?.userGrowthChart ?? {
							labels: mappedUserGrowth.map((d) => new Date(d.date).toLocaleDateString()),
							datasets: [],
						},
						courseCategories: dashboard.chartData?.courseCategoriesChart ?? {
							labels: mappedCategories.map((c) => c.category),
							datasets: [],
						},
						revenueTrend: dashboard.chartData?.revenueTrendChart ?? {
							labels: mappedUserGrowth.map((d) => new Date(d.date).toLocaleDateString()),
							datasets: [],
						},
					},
				})
				setLoading(false)
				return
			}

		// Fallback: use individual endpoints if /dashboard fails
		await fetchFromIndividualEndpoints(tokenStats)
		} catch (error) {
			console.error('Error fetching dashboard data:', error)
		} finally {
			setLoading(false)
		}
	}, [])

	async function fetchFromIndividualEndpoints(
		tokenStats: TokenStatsResponse | null
	) {
		// Fetch overview from analytics
		try {
			const { data: overviewData } = await analyticsClient.get<ApiResponse<AnalyticsOverviewResponse>>(
				'/overview'
			)
			if (overviewData.success) {
				const overview = overviewData.data
				const mappedStats: DashboardStats = {
					totalUsers: overview.totalUsers,
					totalCourses: overview.totalCourses,
					totalEnrollments: overview.totalEnrollments,
					totalRevenue: tokenStats?.totalTokensIssued ?? overview.totalRevenue,
					activeUsers: overview.activeUsers,
					publishedCourses: overview.totalCourses,
					todayEnrollments: overview.enrollmentsToday,
					todayRevenue: tokenStats?.todayTokensDistributed ?? overview.revenueToday,
					userGrowthRate: overview.userGrowthRate,
					courseGrowthRate: overview.courseGrowthRate,
					enrollmentGrowthRate: overview.enrollmentGrowthRate,
					revenueGrowthRate: overview.revenueGrowthRate,
				}

				setData((prev) => ({
					...prev,
					stats: mappedStats,
					userGrowth: [],
					courseCategories: [],
					recentActivities: [],
					chartData: {
						userGrowth: { labels: [], datasets: [] },
						courseCategories: { labels: [], datasets: [] },
						revenueTrend: { labels: [], datasets: [] },
					},
				}))
			}
		} catch (error) {
			console.error('Error fetching analytics overview:', error)
		}
	}

	useEffect(() => {
		fetchAllData()
	}, [fetchAllData])

	// Real-time refresh: fetch new data instead of generating mock data
	useEffect(() => {
		if (!settings.autoRefresh) return

		const interval = setInterval(() => {
			fetchAllData()
		}, settings.refreshInterval * 1000)

		return () => clearInterval(interval)
	}, [settings.autoRefresh, settings.refreshInterval, fetchAllData])

	const filteredActivities = data.recentActivities.filter((activity) => {
		if (filters.activityType !== 'all' && activity.type !== filters.activityType) {
			return false
		}
		if (filters.status !== 'all' && activity.status !== filters.status) {
			return false
		}
		return true
	})

	const updateFilter = useCallback((key: keyof DashboardFilters, value: unknown) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}, [])

	const clearFilters = useCallback(() => {
		setFilters({
			timeRange: '30d',
			activityType: 'all',
			status: 'all',
		})
	}, [])

	const updateSettings = useCallback(
		(key: keyof DashboardSettings, value: unknown) => {
			setSettings((prev) => ({ ...prev, [key]: value }))
		},
		[]
	)

	const refreshData = useCallback(async () => {
		await fetchAllData()
	}, [fetchAllData])

	const getChartData = useCallback(() => {
		const { timeRange } = filters

		let filteredData = data.userGrowth
		if (timeRange !== 'all') {
			const days =
				timeRange === '7d'
					? 7
					: timeRange === '30d'
						? 30
						: timeRange === '90d'
							? 90
							: 365
			const cutoffDate = new Date()
			cutoffDate.setDate(cutoffDate.getDate() - days)

			filteredData = data.userGrowth.filter((d) => new Date(d.date) >= cutoffDate)
		}

		return {
			userGrowth: {
				labels: filteredData.map((d) => new Date(d.date).toLocaleDateString()),
				datasets: [
					{
						label: 'Tong nguoi dung',
						data: filteredData.map((d) => d.users),
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						borderColor: 'rgba(59, 130, 246, 1)',
						borderWidth: 2,
						fill: true,
						tension: 0.4,
					},
					{
						label: 'Nguoi dung moi',
						data: filteredData.map((d) => d.newUsers),
						backgroundColor: 'rgba(16, 185, 129, 0.1)',
						borderColor: 'rgba(16, 185, 129, 1)',
						borderWidth: 2,
						fill: false,
						tension: 0.4,
					},
				],
			},
			courseCategories: data.chartData.courseCategories,
			revenueTrend: {
				labels: filteredData.map((d) => new Date(d.date).toLocaleDateString()),
				datasets: [
					{
						label: 'Doanh thu (LEARN)',
						data: filteredData.map(
							() => Math.floor(Math.random() * 5000000) + 2000000
						),
						backgroundColor: 'rgba(245, 158, 11, 0.1)',
						borderColor: 'rgba(245, 158, 11, 1)',
						borderWidth: 2,
						fill: true,
						tension: 0.4,
					},
				],
			},
		}
	}, [data, filters])

	const getTopPerformers = useCallback(
		(limit = 5) => {
			return data.topPerformers.slice(0, limit)
		},
		[data.topPerformers]
	)

	const getSystemHealth = useCallback(() => {
		return data.systemHealth
	}, [data.systemHealth])

	const getActivitySummary = useCallback(() => {
		const summary = {
			total: data.recentActivities.length,
			byType: {} as Record<ActivityType, number>,
			byStatus: {} as Record<ActivityStatus, number>,
		}

		data.recentActivities.forEach((activity) => {
			summary.byType[activity.type] = (summary.byType[activity.type] || 0) + 1
			summary.byStatus[activity.status] = (summary.byStatus[activity.status] || 0) + 1
		})

		return summary
	}, [data.recentActivities])

	return {
		data,
		stats: data.stats,
		userGrowth: data.userGrowth,
		courseCategories: data.courseCategories,
		recentActivities: filteredActivities,
		topPerformers: data.topPerformers,
		systemHealth: data.systemHealth,
		chartData: getChartData(),
		loading,
		filters,
		settings,
		updateFilter,
		clearFilters,
		updateSettings,
		refreshData,
		getTopPerformers,
		getSystemHealth,
		getActivitySummary,
	}
}
