// Excel export helper cho Dashboard data

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { DashboardData, DashboardStats, DashboardUserGrowthData, CourseCategoryData, RecentActivity, TopPerformer, SystemHealth } from '@/foundation/types'

// Export Dashboard Stats to Excel
export const exportDashboardStatsToExcel = (stats: DashboardStats, filename = 'dashboard-stats.xlsx') => {
	const statsData = [
		{
			'Chỉ số': 'Tổng người dùng',
			'Giá trị': stats.totalUsers,
			'Đơn vị': 'người',
			'Tăng trưởng (%)': stats.userGrowthRate,
			'Ghi chú': `${stats.activeUsers} đang hoạt động`
		},
		{
			'Chỉ số': 'Tổng khóa học',
			'Giá trị': stats.totalCourses,
			'Đơn vị': 'khóa',
			'Tăng trưởng (%)': stats.courseGrowthRate,
			'Ghi chú': `${stats.publishedCourses} đã xuất bản`
		},
		{
			'Chỉ số': 'Tổng đăng ký',
			'Giá trị': stats.totalEnrollments,
			'Đơn vị': 'lượt',
			'Tăng trưởng (%)': stats.enrollmentGrowthRate,
			'Ghi chú': `${stats.todayEnrollments} hôm nay`
		},
		{
			'Chỉ số': 'Tổng doanh thu',
			'Giá trị': stats.totalRevenue,
			'Đơn vị': 'LEARN',
			'Tăng trưởng (%)': stats.revenueGrowthRate,
			'Ghi chú': `${stats.todayRevenue} hôm nay`
		},
		{
			'Chỉ số': 'Người dùng hoạt động',
			'Giá trị': stats.activeUsers,
			'Đơn vị': 'người',
			'Tăng trưởng (%)': stats.userGrowthRate,
			'Ghi chú': `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng số`
		},
		{
			'Chỉ số': 'Khóa học xuất bản',
			'Giá trị': stats.publishedCourses,
			'Đơn vị': 'khóa',
			'Tăng trưởng (%)': stats.courseGrowthRate,
			'Ghi chú': `${((stats.publishedCourses / stats.totalCourses) * 100).toFixed(1)}% tổng số`
		},
		{
			'Chỉ số': 'Đăng ký hôm nay',
			'Giá trị': stats.todayEnrollments,
			'Đơn vị': 'lượt',
			'Tăng trưởng (%)': stats.enrollmentGrowthRate,
			'Ghi chú': `${((stats.todayEnrollments / stats.totalEnrollments) * 100).toFixed(2)}% tổng số`
		},
		{
			'Chỉ số': 'Doanh thu hôm nay',
			'Giá trị': stats.todayRevenue,
			'Đơn vị': 'LEARN',
			'Tăng trưởng (%)': stats.revenueGrowthRate,
			'Ghi chú': `${((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(2)}% tổng số`
		}
	]

	const worksheet = XLSX.utils.json_to_sheet(statsData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Thống kê tổng quan')

	// Generate Excel file and download
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Export User Growth Data to Excel
export const exportUserGrowthToExcel = (userGrowth: DashboardUserGrowthData[], filename = 'user-growth.xlsx') => {
	const growthData = userGrowth.map(data => ({
		'Ngày': new Date(data.date).toLocaleDateString('vi-VN'),
		'Tổng người dùng': data.users,
		'Người dùng mới': data.newUsers,
		'Người dùng hoạt động': data.activeUsers,
		'Tỷ lệ hoạt động (%)': ((data.activeUsers / data.users) * 100).toFixed(2),
		'Tăng trưởng ngày (%)': data.users > 0 ? ((data.newUsers / data.users) * 100).toFixed(2) : '0.00'
	}))

	const worksheet = XLSX.utils.json_to_sheet(growthData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Tăng trưởng người dùng')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Export Course Categories to Excel
export const exportCourseCategoriesToExcel = (categories: CourseCategoryData[], filename = 'course-categories.xlsx') => {
	const categoryData = categories.map((category, index) => ({
		'Xếp hạng': index + 1,
		'Danh mục': category.category,
		'Icon': category.icon,
		'Số khóa học': category.courses,
		'Tổng đăng ký': category.enrollments,
		'Doanh thu (LEARN)': category.revenue,
		'Doanh thu trung bình/khóa': Math.round(category.revenue / category.courses),
		'Đăng ký trung bình/khóa': Math.round(category.enrollments / category.courses),
		'Tỷ lệ đăng ký (%)': ((category.enrollments / categories.reduce((sum, cat) => sum + cat.enrollments, 0)) * 100).toFixed(2),
		'Tỷ lệ doanh thu (%)': ((category.revenue / categories.reduce((sum, cat) => sum + cat.revenue, 0)) * 100).toFixed(2)
	}))

	const worksheet = XLSX.utils.json_to_sheet(categoryData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục khóa học')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Export Recent Activities to Excel
export const exportRecentActivitiesToExcel = (activities: RecentActivity[], filename = 'recent-activities.xlsx') => {
	const activityData = activities.map(activity => ({
		'ID': activity.id,
		'Loại hoạt động': getActivityTypeLabel(activity.type),
		'Tiêu đề': activity.title,
		'Mô tả': activity.description,
		'Người dùng': activity.user || '',
		'Khóa học': activity.course || '',
		'Thời gian': new Date(activity.timestamp).toLocaleString('vi-VN'),
		'Trạng thái': getActivityStatusLabel(activity.status),
		'Metadata': activity.metadata ? JSON.stringify(activity.metadata, null, 2) : '',
		'Có chứng chỉ': activity.metadata?.certificateIssued ? 'Có' : 'Không',
		'Token nhận được': activity.metadata?.tokensEarned || 0,
		'Đánh giá': activity.metadata?.rating || '',
		'Số tiền': activity.metadata?.amount || 0,
		'Loại token': activity.metadata?.tokenSymbol || ''
	}))

	const worksheet = XLSX.utils.json_to_sheet(activityData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoạt động gần đây')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Export Top Performers to Excel
export const exportTopPerformersToExcel = (performers: TopPerformer[], filename = 'top-performers.xlsx') => {
	const performerData = performers.map((performer, index) => ({
		'Xếp hạng': index + 1,
		'Tên': performer.name,
		'Loại': getPerformerTypeLabel(performer.type),
		'Giá trị': performer.value,
		'Đơn vị': performer.unit,
		'Tăng trưởng (%)': performer.growth,
		'Avatar': performer.avatar || '',
		'Học viên': performer.metadata?.students || '',
		'Khóa học': performer.metadata?.courses || '',
		'Đánh giá': performer.metadata?.rating || '',
		'Chứng chỉ': performer.metadata?.certificates || '',
		'Token': performer.metadata?.tokens || '',
		'Danh mục': performer.metadata?.category || ''
	}))

	const worksheet = XLSX.utils.json_to_sheet(performerData)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Performers')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Export System Health to Excel
export const exportSystemHealthToExcel = (systemHealth: SystemHealth, filename = 'system-health.xlsx') => {
	const healthData = [
		{
			'Chỉ số': 'Trạng thái hệ thống',
			'Giá trị': getSystemStatusLabel(systemHealth.status),
			'Uptime (%)': systemHealth.uptime,
			'Thời gian phản hồi (s)': systemHealth.responseTime,
			'Tỷ lệ lỗi (%)': systemHealth.errorRate,
			'Cập nhật cuối': new Date(systemHealth.lastUpdate).toLocaleString('vi-VN')
		}
	]

	const alertData = systemHealth.alerts.map(alert => ({
		'ID': alert.id,
		'Loại': getAlertTypeLabel(alert.type),
		'Mức độ': getAlertSeverityLabel(alert.severity),
		'Tiêu đề': alert.title,
		'Thông báo': alert.message,
		'Thời gian': new Date(alert.timestamp).toLocaleString('vi-VN'),
		'Đã giải quyết': alert.resolved ? 'Có' : 'Không'
	}))

	const workbook = XLSX.utils.book_new()
	
	// System Health sheet
	const healthWorksheet = XLSX.utils.json_to_sheet(healthData)
	XLSX.utils.book_append_sheet(workbook, healthWorksheet, 'Tình trạng hệ thống')
	
	// Alerts sheet
	const alertWorksheet = XLSX.utils.json_to_sheet(alertData)
	XLSX.utils.book_append_sheet(workbook, alertWorksheet, 'Cảnh báo hệ thống')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(data, filename)
}

// Export Complete Dashboard Data to Excel
export const exportCompleteDashboardToExcel = (data: DashboardData, filename = 'dashboard-complete.xlsx') => {
	const workbook = XLSX.utils.book_new()

	// Stats sheet
	const statsData = [
		{
			'Chỉ số': 'Tổng người dùng',
			'Giá trị': data.stats.totalUsers,
			'Tăng trưởng (%)': data.stats.userGrowthRate,
			'Ghi chú': `${data.stats.activeUsers} đang hoạt động`
		},
		{
			'Chỉ số': 'Tổng khóa học',
			'Giá trị': data.stats.totalCourses,
			'Tăng trưởng (%)': data.stats.courseGrowthRate,
			'Ghi chú': `${data.stats.publishedCourses} đã xuất bản`
		},
		{
			'Chỉ số': 'Tổng đăng ký',
			'Giá trị': data.stats.totalEnrollments,
			'Tăng trưởng (%)': data.stats.enrollmentGrowthRate,
			'Ghi chú': `${data.stats.todayEnrollments} hôm nay`
		},
		{
			'Chỉ số': 'Tổng doanh thu',
			'Giá trị': data.stats.totalRevenue,
			'Tăng trưởng (%)': data.stats.revenueGrowthRate,
			'Ghi chú': `${data.stats.todayRevenue} hôm nay`
		}
	]
	const statsWorksheet = XLSX.utils.json_to_sheet(statsData)
	XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Thống kê tổng quan')

	// User Growth sheet
	const growthData = data.userGrowth.map(item => ({
		'Ngày': new Date(item.date).toLocaleDateString('vi-VN'),
		'Tổng người dùng': item.users,
		'Người dùng mới': item.newUsers,
		'Người dùng hoạt động': item.activeUsers
	}))
	const growthWorksheet = XLSX.utils.json_to_sheet(growthData)
	XLSX.utils.book_append_sheet(workbook, growthWorksheet, 'Tăng trưởng người dùng')

	// Course Categories sheet
	const categoryData = data.courseCategories.map((cat, index) => ({
		'Xếp hạng': index + 1,
		'Danh mục': cat.category,
		'Số khóa học': cat.courses,
		'Tổng đăng ký': cat.enrollments,
		'Doanh thu (LEARN)': cat.revenue
	}))
	const categoryWorksheet = XLSX.utils.json_to_sheet(categoryData)
	XLSX.utils.book_append_sheet(workbook, categoryWorksheet, 'Danh mục khóa học')

	// Recent Activities sheet
	const activityData = data.recentActivities.map(activity => ({
		'Loại': getActivityTypeLabel(activity.type),
		'Tiêu đề': activity.title,
		'Mô tả': activity.description,
		'Thời gian': new Date(activity.timestamp).toLocaleString('vi-VN'),
		'Trạng thái': getActivityStatusLabel(activity.status)
	}))
	const activityWorksheet = XLSX.utils.json_to_sheet(activityData)
	XLSX.utils.book_append_sheet(workbook, activityWorksheet, 'Hoạt động gần đây')

	// Top Performers sheet
	const performerData = data.topPerformers.map((performer, index) => ({
		'Xếp hạng': index + 1,
		'Tên': performer.name,
		'Loại': getPerformerTypeLabel(performer.type),
		'Giá trị': performer.value,
		'Tăng trưởng (%)': performer.growth
	}))
	const performerWorksheet = XLSX.utils.json_to_sheet(performerData)
	XLSX.utils.book_append_sheet(workbook, performerWorksheet, 'Top Performers')

	// System Health sheet
	const healthData = [
		{
			'Trạng thái': getSystemStatusLabel(data.systemHealth.status),
			'Uptime (%)': data.systemHealth.uptime,
			'Thời gian phản hồi (s)': data.systemHealth.responseTime,
			'Tỷ lệ lỗi (%)': data.systemHealth.errorRate
		}
	]
	const healthWorksheet = XLSX.utils.json_to_sheet(healthData)
	XLSX.utils.book_append_sheet(workbook, healthWorksheet, 'Tình trạng hệ thống')

	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
	const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' })
	saveAs(dataBlob, filename)
}

// Helper functions for labels
const getActivityTypeLabel = (type: string) => {
	const labels: Record<string, string> = {
		'user_registration': 'Đăng ký người dùng',
		'course_enrollment': 'Đăng ký khóa học',
		'course_completion': 'Hoàn thành khóa học',
		'course_published': 'Xuất bản khóa học',
		'course_updated': 'Cập nhật khóa học',
		'payment_received': 'Nhận thanh toán',
		'certificate_issued': 'Cấp chứng chỉ',
		'review_submitted': 'Gửi đánh giá',
		'system_alert': 'Cảnh báo hệ thống',
		'admin_action': 'Hành động quản trị'
	}
	return labels[type] || type
}

const getActivityStatusLabel = (status: string) => {
	const labels: Record<string, string> = {
		'success': 'Thành công',
		'warning': 'Cảnh báo',
		'error': 'Lỗi',
		'info': 'Thông tin'
	}
	return labels[status] || status
}

const getPerformerTypeLabel = (type: string) => {
	const labels: Record<string, string> = {
		'course': 'Khóa học',
		'instructor': 'Giảng viên',
		'student': 'Học viên'
	}
	return labels[type] || type
}

const getSystemStatusLabel = (status: string) => {
	const labels: Record<string, string> = {
		'healthy': 'Hoạt động tốt',
		'warning': 'Cảnh báo',
		'critical': 'Lỗi nghiêm trọng'
	}
	return labels[status] || status
}

const getAlertTypeLabel = (type: string) => {
	const labels: Record<string, string> = {
		'performance': 'Hiệu suất',
		'security': 'Bảo mật',
		'error': 'Lỗi',
		'maintenance': 'Bảo trì'
	}
	return labels[type] || type
}

const getAlertSeverityLabel = (severity: string) => {
	const labels: Record<string, string> = {
		'low': 'Thấp',
		'medium': 'Trung bình',
		'high': 'Cao',
		'critical': 'Nghiêm trọng'
	}
	return labels[severity] || severity
}
