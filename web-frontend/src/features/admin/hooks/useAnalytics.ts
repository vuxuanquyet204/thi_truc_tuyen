import { useState, useEffect, useCallback } from 'react'
import {
	AnalyticsDashboard,
	KPIMetric,
	AnalyticsChart,
	TopListsWidget,
	AnalyticsFilters,
	DateRange,
	AnalyticsPeriod,
	RevenueData,
	UserGrowthData,
	CourseAnalytics,
	UserAnalytics,
	OrganizationAnalytics,
	InstructorAnalytics,
	CertificateAnalytics,
	EngagementMetrics,
	ConversionMetrics,
	GeographicData,
	DeviceAnalytics,
	TrafficSource,
	AnalyticsActivity,
	AnalyticsAlert,
	AnalyticsInsight,
	AnalyticsComparison,
	AnalyticsSegment,
	AnalyticsGoal,
	AnalyticsBenchmark
} from '@/foundation/types'


import {
	getAnalyticsOverview,
	getKpiMetrics,
	getScoreTrend,
	getTopPerformers,
	getTopCourses,
	type KpiMetricResponse,
	type AnalyticsOverviewResponse,
	type ScoreTrendPoint,
	type TopPerformerResponse,
	type TopCourseResponse
} from '@/features/analytics/api'

// Helper function to map API KPI to UI KPI
const mapKpiMetric = (apiKpi: KpiMetricResponse, index: number): KPIMetric => {
	const icons = ['DollarSign', 'Users', 'CheckCircle', 'BookOpen', 'Award', 'Star']
	const colors = [
		'var(--success)',
		'var(--primary)',
		'var(--warning)',
		'var(--info)',
		'var(--accent)',
		'var(--warning)'
	]
	
	// Parse trend string if it exists, otherwise generate mock trend
	let trend: number[] = []
	if (apiKpi.trend) {
		try {
			// Try to parse as JSON array
			if (apiKpi.trend.startsWith('[')) {
				trend = JSON.parse(apiKpi.trend)
			} else {
				// If trend is a string like "up", "down", "stable", generate trend from value
				trend = Array.from({ length: 5 }, (_, i) => apiKpi.value * (0.8 + i * 0.05))
			}
		} catch {
			// Generate trend from value
			trend = Array.from({ length: 5 }, (_, i) => apiKpi.value * (0.8 + i * 0.05))
		}
	} else {
		trend = Array.from({ length: 5 }, (_, i) => apiKpi.value * (0.8 + i * 0.05))
	}
	
	// Ensure changePercentage is a number
	const changePercentage = typeof apiKpi.changePercentage === 'number' 
		? apiKpi.changePercentage 
		: parseFloat(String(apiKpi.changePercentage || 0)) || 0
	
	return {
		id: apiKpi.id || `kpi-${index}`,
		name: apiKpi.title || `KPI ${index + 1}`,
		value: typeof apiKpi.value === 'number' ? apiKpi.value : parseFloat(String(apiKpi.value || 0)) || 0,
		unit: apiKpi.unit || '',
		change: changePercentage,
		changeType: changePercentage > 0 ? 'increase' : changePercentage < 0 ? 'decrease' : 'stable',
		period: 'tháng này',
		icon: icons[index % icons.length],
		color: colors[index % colors.length],
		description: apiKpi.title || `KPI ${index + 1}`,
		trend
	}
}

// Helper function to map overview to dashboard
const mapOverviewToDashboard = (overview: AnalyticsOverviewResponse): AnalyticsDashboard => {
	return {
		overview: {
			totalUsers: overview.totalUsers,
			totalCourses: overview.totalCourses,
			totalRevenue: 0, // Not available from API
			totalEnrollments: 0, // Not available from API
			avgCompletionRate: 0, // Not available from API
			avgRating: 0, // Not available from API
			activeUsers: overview.activeUsers,
			newUsersToday: 0 // Not available from API
		},
		kpis: [],
		charts: [],
		topLists: [],
		recentActivity: [],
		alerts: [],
		insights: []
	}
}

// Helper function to parse date from backend (LocalDate format: YYYY-MM-DD)
const parseDate = (dateStr: string): Date => {
	// Backend returns LocalDate as "YYYY-MM-DD" string
	if (dateStr.includes('T')) {
		return new Date(dateStr)
	}
	// Handle "YYYY-MM-DD" format
	const [year, month, day] = dateStr.split('-').map(Number)
	return new Date(year, month - 1, day)
}

// Helper function to map score trend to chart
const mapScoreTrendToChart = (trendData: ScoreTrendPoint[]): AnalyticsChart => {
	if (!trendData || trendData.length === 0) {
		// Return empty chart structure
		return {
			id: 'chart-score-trend',
			title: 'Xu hướng điểm số',
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Điểm trung bình',
						data: [],
						borderColor: 'rgb(102, 126, 234)',
						backgroundColor: 'rgba(102, 126, 234, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: 'Số lượng bài thi',
						data: [],
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						tension: 0.4,
						fill: true
					}
				]
			},
			period: '30 ngày qua',
			lastUpdated: new Date().toISOString(),
			description: 'Xu hướng điểm số và số lượng bài thi theo thời gian'
		}
	}
	
	const labels = trendData.map(point => {
		try {
			return parseDate(point.date).toLocaleDateString('vi-VN')
		} catch (e) {
			console.warn('Error parsing date:', point.date, e)
			return point.date
		}
	})
	const scores = trendData.map(point => point.averageScore || 0)
	const counts = trendData.map(point => point.submissionCount || 0)
	
	return {
		id: 'chart-score-trend',
		title: 'Xu hướng điểm số',
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: 'Điểm trung bình',
					data: scores,
					borderColor: 'rgb(102, 126, 234)',
					backgroundColor: 'rgba(102, 126, 234, 0.1)',
					tension: 0.4,
					fill: true
				},
				{
					label: 'Số lượng bài thi',
					data: counts,
					borderColor: 'rgb(239, 68, 68)',
					backgroundColor: 'rgba(239, 68, 68, 0.1)',
					tension: 0.4,
					fill: true
				}
			]
		},
		period: '30 ngày qua',
		lastUpdated: new Date().toISOString(),
		description: 'Xu hướng điểm số và số lượng bài thi theo thời gian'
	}
}

// Helper function to map top performers to top list
const mapTopPerformersToTopList = (performers: TopPerformerResponse[]): TopListsWidget => {
	if (!performers || performers.length === 0) {
		return {
			id: 'top-performers',
			title: 'Top người dùng xuất sắc',
			type: 'users',
			items: [],
			period: '30 ngày qua',
			lastUpdated: new Date().toISOString(),
			description: 'Danh sách người dùng có điểm số cao nhất'
		}
	}
	
	return {
		id: 'top-performers',
		title: 'Top người dùng xuất sắc',
		type: 'users',
		items: performers.map((performer, index) => ({
			id: String(performer.userId || `user-${index}`),
			name: performer.fullName || `Người dùng ${index + 1}`,
			value: performer.averageScore || 0,
			unit: 'điểm',
			change: 0,
			changeType: 'stable' as const,
			metadata: {
				attempts: performer.attempts || 0,
				rank: index + 1
			},
			subtitle: `${performer.attempts || 0} lần thi`
		})),
		period: '30 ngày qua',
		lastUpdated: new Date().toISOString(),
		description: 'Danh sách người dùng có điểm số cao nhất'
	}
}

// Helper function to map top courses to top list
const mapTopCoursesToTopList = (courses: TopCourseResponse[]): TopListsWidget => {
	if (!courses || courses.length === 0) {
		return {
			id: 'top-courses',
			title: 'Top khóa học phổ biến',
			type: 'courses',
			items: [],
			period: '30 ngày qua',
			lastUpdated: new Date().toISOString(),
			description: 'Danh sách khóa học có nhiều người đăng ký nhất'
		}
	}
	
	return {
		id: 'top-courses',
		title: 'Top khóa học phổ biến',
		type: 'courses',
		items: courses.map((course, index) => ({
			id: String(course.courseId || `course-${index}`),
			name: course.title || `Khóa học ${index + 1}`,
			value: course.enrollmentCount || 0,
			unit: 'người đăng ký',
			change: 0,
			changeType: 'stable' as const,
			metadata: {
				averageScore: course.averageScore || 0,
				rank: index + 1
			},
			subtitle: `Điểm TB: ${(course.averageScore || 0).toFixed(1)}`
		})),
		period: '30 ngày qua',
		lastUpdated: new Date().toISOString(),
		description: 'Danh sách khóa học có nhiều người đăng ký nhất'
	}
}

// Empty initial states
const emptyDashboard: AnalyticsDashboard = {
	overview: {
		totalUsers: 0,
		totalCourses: 0,
		totalRevenue: 0,
		totalEnrollments: 0,
		avgCompletionRate: 0,
		avgRating: 0,
		activeUsers: 0,
		newUsersToday: 0
	},
	kpis: [],
	charts: [],
	topLists: [],
	recentActivity: [],
	alerts: [],
	insights: []
}

export const useAnalytics = () => {
	// State management
	const [dashboard, setDashboard] = useState<AnalyticsDashboard>(emptyDashboard)
	const [kpis, setKpis] = useState<KPIMetric[]>([])
	const [charts, setCharts] = useState<AnalyticsChart[]>([])
	const [topLists, setTopLists] = useState<TopListsWidget[]>([])
	const [filters, setFilters] = useState<AnalyticsFilters>({
		dateRange: {
			start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
			end: new Date().toISOString().split('T')[0],
			label: '30 ngày qua'
		},
		period: 'last_30_days'
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	
	// Real-time data simulation
	const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false) // Disable by default to avoid too many calls
	
	// Load analytics data from API
	const loadAnalyticsData = useCallback(async () => {
		setLoading(true)
		setError(null)
		
		try {
			console.log('Loading analytics data...')
			
			// Load overview
			console.log('Fetching overview...')
			const overviewResponse = await getAnalyticsOverview()
			console.log('Overview response:', overviewResponse)
			if (overviewResponse.success && overviewResponse.data) {
				const mappedDashboard = mapOverviewToDashboard(overviewResponse.data)
				setDashboard(mappedDashboard)
				console.log('Dashboard mapped:', mappedDashboard)
			} else {
				console.warn('Overview response not successful or no data:', overviewResponse)
			}
			
			// Load KPIs
			console.log('Fetching KPIs...')
			const kpisResponse = await getKpiMetrics()
			console.log('KPIs response:', kpisResponse)
			if (kpisResponse.success && kpisResponse.data) {
				const mappedKpis = kpisResponse.data.map((kpi, index) => mapKpiMetric(kpi, index))
				console.log('Mapped KPIs:', mappedKpis)
				setKpis(mappedKpis)
				setDashboard(prev => ({
					...prev,
					kpis: mappedKpis
				}))
			} else {
				console.warn('KPIs response not successful or no data:', kpisResponse)
			}
			
			// Load score trend
			console.log('Fetching score trend...')
			const trendResponse = await getScoreTrend()
			console.log('Score trend response:', trendResponse)
			if (trendResponse.success && trendResponse.data) {
				const trendChart = mapScoreTrendToChart(trendResponse.data)
				console.log('Mapped trend chart:', trendChart)
				setCharts(prev => {
					const existing = prev.find(c => c.id === 'chart-score-trend')
					if (existing) {
						return prev.map(c => c.id === 'chart-score-trend' ? trendChart : c)
					}
					return [trendChart, ...prev]
				})
			} else {
				console.warn('Score trend response not successful or no data:', trendResponse)
			}
			
			// Load top performers
			console.log('Fetching top performers...')
			const performersResponse = await getTopPerformers(5)
			console.log('Top performers response:', performersResponse)
			if (performersResponse.success && performersResponse.data) {
				const performersList = mapTopPerformersToTopList(performersResponse.data)
				console.log('Mapped performers list:', performersList)
				setTopLists(prev => {
					const existing = prev.find(t => t.id === 'top-performers')
					if (existing) {
						return prev.map(t => t.id === 'top-performers' ? performersList : t)
					}
					return [performersList, ...prev]
				})
			} else {
				console.warn('Top performers response not successful or no data:', performersResponse)
			}
			
			// Load top courses
			console.log('Fetching top courses...')
			const coursesResponse = await getTopCourses(5)
			console.log('Top courses response:', coursesResponse)
			if (coursesResponse.success && coursesResponse.data) {
				const coursesList = mapTopCoursesToTopList(coursesResponse.data)
				console.log('Mapped courses list:', coursesList)
				setTopLists(prev => {
					const existing = prev.find(t => t.id === 'top-courses')
					if (existing) {
						return prev.map(t => t.id === 'top-courses' ? coursesList : t)
					}
					return [coursesList, ...prev]
				})
			} else {
				console.warn('Top courses response not successful or no data:', coursesResponse)
			}
			
			console.log('Analytics data loaded successfully')
		} catch (err: any) {
			console.error('Error loading analytics data:', err)
			console.error('Error details:', {
				message: err.message,
				response: err.response?.data,
				status: err.response?.status
			})
			setError(err.message || 'Không thể tải dữ liệu phân tích')
		} finally {
			setLoading(false)
		}
	}, [])
	
	// Load initial data
	useEffect(() => {
		console.log('Initial load triggered')
		loadAnalyticsData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount
	
	// Data refresh
	const refreshData = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			await loadAnalyticsData()
		} catch (err: any) {
			setError(err.message || 'Không thể làm mới dữ liệu')
		} finally {
			setLoading(false)
		}
	}, [loadAnalyticsData])
	
	// Real-time updates
	useEffect(() => {
		if (!isRealTimeEnabled) return
		
		const interval = setInterval(() => {
			// Refresh data every 30 seconds when real-time is enabled
			console.log('Real-time refresh triggered')
			loadAnalyticsData()
		}, 30000)
		
		return () => clearInterval(interval)
	}, [isRealTimeEnabled, loadAnalyticsData])
	
	// Filter functions
	const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
		setFilters(prev => ({ ...prev, ...newFilters }))
	}, [])
	
	const updateDateRange = useCallback((dateRange: DateRange) => {
		setFilters(prev => ({ ...prev, dateRange }))
	}, [])
	
	const updatePeriod = useCallback((period: AnalyticsPeriod) => {
		setFilters(prev => ({ ...prev, period }))
	}, [])
	
	// Data export functions
	const exportToExcel = useCallback(async (dataType: string) => {
		try {
			// Export available data only
			const data = {
				kpis,
				charts,
				topLists,
				dashboard
			}
			
			// In real implementation, this would generate and download Excel file
			console.log(`Exporting ${dataType} to Excel:`, data)
			
			return { success: true, message: `Đã xuất ${dataType} thành công` }
		} catch (error) {
			return { success: false, message: 'Lỗi khi xuất dữ liệu' }
		}
	}, [kpis, charts, topLists, dashboard])
	
	const exportToPDF = useCallback(async (dataType: string) => {
		try {
			// Simulate PDF export
			console.log(`Exporting ${dataType} to PDF`)
			return { success: true, message: `Đã xuất ${dataType} thành công` }
		} catch (error) {
			return { success: false, message: 'Lỗi khi xuất dữ liệu' }
		}
	}, [])
	
	// Chart functions
	const refreshChart = useCallback((chartId: string) => {
		setCharts(prev => prev.map(chart => 
			chart.id === chartId 
				? { ...chart, lastUpdated: new Date().toISOString() }
				: chart
		))
	}, [])
	
	const exportChart = useCallback((chartId: string, format: 'png' | 'jpg' | 'pdf') => {
		const chart = charts.find(c => c.id === chartId)
		if (chart) {
			console.log(`Exporting chart ${chartId} as ${format}`)
			return { success: true, message: `Đã xuất biểu đồ ${chart.title} thành công` }
		}
		return { success: false, message: 'Không tìm thấy biểu đồ' }
	}, [charts])
	
	const configureChart = useCallback((chartId: string) => {
		console.log(`Configuring chart ${chartId}`)
		return { success: true, message: 'Mở cấu hình biểu đồ' }
	}, [])
	
	const fullscreenChart = useCallback((chartId: string) => {
		console.log(`Fullscreen chart ${chartId}`)
		return { success: true, message: 'Mở biểu đồ toàn màn hình' }
	}, [])
	
	// Top lists functions
	const refreshTopList = useCallback((widgetId: string) => {
		setTopLists(prev => prev.map(widget => 
			widget.id === widgetId 
				? { ...widget, lastUpdated: new Date().toISOString() }
				: widget
		))
	}, [])
	
	const viewAllItems = useCallback((widgetId: string) => {
		const widget = topLists.find(w => w.id === widgetId)
		if (widget) {
			console.log(`Viewing all items for ${widget.title}`)
			return { success: true, message: `Mở danh sách đầy đủ ${widget.title}` }
		}
		return { success: false, message: 'Không tìm thấy widget' }
	}, [topLists])
	
	const onItemClick = useCallback((item: any) => {
		console.log('Item clicked:', item)
		return { success: true, message: `Mở chi tiết ${item.name}` }
	}, [])
	
	// Analytics functions - Return empty data as these APIs are not available
	const getRevenueData = useCallback((dateRange?: DateRange) => {
		return []
	}, [])
	
	const getUserGrowthData = useCallback((dateRange?: DateRange) => {
		return []
	}, [])
	
	const getCourseAnalytics = useCallback((filters?: Partial<AnalyticsFilters>) => {
		return []
	}, [])
	
	const getUserAnalytics = useCallback((filters?: Partial<AnalyticsFilters>) => {
		return []
	}, [])
	
	const getOrganizationAnalytics = useCallback((filters?: Partial<AnalyticsFilters>) => {
		return []
	}, [])
	
	const getInstructorAnalytics = useCallback((filters?: Partial<AnalyticsFilters>) => {
		return []
	}, [])
	
	const getCertificateAnalytics = useCallback((filters?: Partial<AnalyticsFilters>) => {
		return []
	}, [])
	
	const getGeographicData = useCallback(() => {
		return []
	}, [])
	
	const getDeviceAnalytics = useCallback(() => {
		return []
	}, [])
	
	const getTrafficSources = useCallback(() => {
		return []
	}, [])
	
	// Comparison functions
	const compareMetrics = useCallback((metric: string, currentPeriod: string, previousPeriod: string) => {
		// Mock comparison data
		const current = Math.random() * 1000
		const previous = Math.random() * 1000
		const change = current - previous
		const changePercentage = (change / previous) * 100
		
		return {
			metric,
			current,
			previous,
			change,
			changePercentage,
			trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'stable' as const,
			period: `${previousPeriod} vs ${currentPeriod}`
		}
	}, [])
	
	// Segment functions
	const createSegment = useCallback((criteria: any) => {
		console.log('Creating segment with criteria:', criteria)
		return { success: true, message: 'Đã tạo phân khúc thành công' }
	}, [])
	
	const getSegments = useCallback(() => {
		// Mock segments
		return [
			{
				id: 'segment-1',
				name: 'Người dùng tích cực',
				description: 'Người dùng hoàn thành > 5 khóa học',
				criteria: { completion: { min: 5 } },
				userCount: 1250,
				percentage: 8.1,
				avgValue: 450000,
				lastUpdated: new Date().toISOString()
			},
			{
				id: 'segment-2',
				name: 'Người dùng mới',
				description: 'Người dùng đăng ký trong 30 ngày qua',
				criteria: { joinDate: { min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() } },
				userCount: 850,
				percentage: 5.5,
				avgValue: 120000,
				lastUpdated: new Date().toISOString()
			}
		]
	}, [])
	
	// Goal functions
	const createGoal = useCallback((goal: any) => {
		console.log('Creating goal:', goal)
		return { success: true, message: 'Đã tạo mục tiêu thành công' }
	}, [])
	
	const getGoals = useCallback(() => {
		// Mock goals
		return [
			{
				id: 'goal-1',
				name: 'Tăng doanh thu 20%',
				description: 'Tăng doanh thu tháng này lên 20% so với tháng trước',
				target: 1500000000,
				current: 1250000000,
				unit: 'VND',
				deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
				status: 'on_track' as const,
				progress: 83.3,
				trend: [1000000000, 1100000000, 1200000000, 1250000000],
				lastUpdated: new Date().toISOString()
			}
		]
	}, [])
	
	// Benchmark functions
	const getBenchmarks = useCallback(() => {
		// Mock benchmarks
		return [
			{
				metric: 'completion_rate',
				industry: 'E-Learning',
				average: 65.2,
				median: 68.5,
				topQuartile: 78.3,
				ourValue: 78.5,
				percentile: 85,
				lastUpdated: new Date().toISOString()
			}
		]
	}, [])
	
	// Debug: Log state changes
	useEffect(() => {
		console.log('KPIs state updated:', kpis.length, 'items:', kpis)
	}, [kpis])
	
	useEffect(() => {
		console.log('Charts state updated:', charts.length, 'items:', charts)
	}, [charts])
	
	useEffect(() => {
		console.log('TopLists state updated:', topLists.length, 'items:', topLists)
	}, [topLists])
	
	return {
		// State
		dashboard,
		kpis,
		charts,
		topLists,
		filters,
		loading,
		error,
		isRealTimeEnabled,
		
		// Actions
		refreshData,
		updateFilters,
		updateDateRange,
		updatePeriod,
		setIsRealTimeEnabled,
		
		// Export functions
		exportToExcel,
		exportToPDF,
		
		// Chart functions
		refreshChart,
		exportChart,
		configureChart,
		fullscreenChart,
		
		// Top lists functions
		refreshTopList,
		viewAllItems,
		onItemClick,
		
		// Data getters
		getRevenueData,
		getUserGrowthData,
		getCourseAnalytics,
		getUserAnalytics,
		getOrganizationAnalytics,
		getInstructorAnalytics,
		getCertificateAnalytics,
		getGeographicData,
		getDeviceAnalytics,
		getTrafficSources,
		
		// Analytics functions
		compareMetrics,
		createSegment,
		getSegments,
		createGoal,
		getGoals,
		getBenchmarks
	}
}
