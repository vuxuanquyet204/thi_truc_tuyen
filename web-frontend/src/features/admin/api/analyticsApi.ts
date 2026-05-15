/**
 * Admin Analytics API Service
 *
 * Analytics dashboard data for admin panel.
 * Uses centralized analyticsClient from foundation/api.
 */

import { analyticsClient } from '@/foundation/api'

export interface ApiResponse<T> {
	success: boolean
	message: string
	data: T
}

export interface AnalyticsOverviewResponse {
	totalUsers: number
	activeUsers: number
	totalCourses: number
	totalExams: number
	totalExamSubmissions: number
	averageScore: number
}

export interface KpiMetricResponse {
	id: string
	title: string
	value: number
	unit: string
	changePercentage: number
	trend: string
}

export interface ScoreTrendPoint {
	date: string
	averageScore: number
	submissionCount: number
}

export interface TopPerformerResponse {
	userId: string
	fullName: string
	averageScore: number
	attempts: number
}

export interface TopCourseResponse {
	courseId: string
	title: string
	enrollmentCount: number
	averageScore: number
}

export interface ExamResultResponse {
	id: number
	examId: string
	submissionId: string
	userId: string
	score: number
	createdAt: string
}

export interface CheatingStatsResponse {
	examId: string
	totalSubmissions: number
	suspiciousEventsCount: number
	eventTypeDistribution: Record<string, number>
	cheatingRiskScore: number
}

export interface RecommendationResponse {
	courseId: number
	courseTitle: string
	reason: string
	confidenceScore: number
}

export interface DashboardResponse {
	userId: string
	userRole: string
	generalStats: Record<string, any>
	recentExamResults: ExamResultResponse[]
	recommendations: RecommendationResponse[]
}

const extractError = (error: unknown): string => {
	if (typeof error === 'object' && error !== null && 'message' in error) {
		return String((error as { message: unknown }).message)
	}
	return 'An error occurred'
}

export async function getAnalyticsOverview(): Promise<
	ApiResponse<AnalyticsOverviewResponse>
> {
	try {
		const response = await analyticsClient.get<ApiResponse<AnalyticsOverviewResponse>>(
			'/overview'
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching analytics overview:', error)
		throw new Error(
			extractError(error) || 'Failed to fetch analytics overview'
		)
	}
}

export async function getKpiMetrics(): Promise<
	ApiResponse<KpiMetricResponse[]>
> {
	try {
		const response = await analyticsClient.get<ApiResponse<KpiMetricResponse[]>>(
			'/kpis'
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching KPI metrics:', error)
		throw new Error(extractError(error) || 'Failed to fetch KPI metrics')
	}
}

export async function getScoreTrend(): Promise<
	ApiResponse<ScoreTrendPoint[]>
> {
	try {
		const response = await analyticsClient.get<ApiResponse<ScoreTrendPoint[]>>(
			'/score-trend'
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching score trend:', error)
		throw new Error(extractError(error) || 'Failed to fetch score trend')
	}
}

export async function getTopPerformers(
	limit: number = 5
): Promise<ApiResponse<TopPerformerResponse[]>> {
	try {
		const response = await analyticsClient.get<ApiResponse<TopPerformerResponse[]>>(
			'/top-performers',
			{ params: { limit } }
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching top performers:', error)
		throw new Error(extractError(error) || 'Failed to fetch top performers')
	}
}

export async function getTopCourses(
	limit: number = 5
): Promise<ApiResponse<TopCourseResponse[]>> {
	try {
		const response = await analyticsClient.get<ApiResponse<TopCourseResponse[]>>(
			'/top-courses',
			{ params: { limit } }
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching top courses:', error)
		throw new Error(extractError(error) || 'Failed to fetch top courses')
	}
}

export async function getExamResults(
	examId?: string,
	userId?: string
): Promise<ApiResponse<ExamResultResponse[]>> {
	try {
		const params: Record<string, string> = {}
		if (examId) params.examId = examId
		if (userId) params.userId = userId

		const response = await analyticsClient.get<ApiResponse<ExamResultResponse[]>>(
			'/exam-results',
			{ params }
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching exam results:', error)
		throw new Error(extractError(error) || 'Failed to fetch exam results')
	}
}

export async function getCheatingStats(
	examId: string
): Promise<ApiResponse<CheatingStatsResponse>> {
	try {
		const response = await analyticsClient.get<ApiResponse<CheatingStatsResponse>>(
			'/cheating-stats',
			{ params: { examId } }
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching cheating stats:', error)
		throw new Error(extractError(error) || 'Failed to fetch cheating stats')
	}
}

export async function getDashboardData(
	userId: string
): Promise<ApiResponse<DashboardResponse>> {
	try {
		const response = await analyticsClient.get<ApiResponse<DashboardResponse>>(
			'/dashboards',
			{ params: { userId } }
		)
		return response.data
	} catch (error: any) {
		console.error('Error fetching dashboard data:', error)
		throw new Error(extractError(error) || 'Failed to fetch dashboard data')
	}
}

export async function getRecommendations(
	userId: string
): Promise<ApiResponse<RecommendationResponse[]>> {
	try {
		const response = await analyticsClient.get<
			ApiResponse<RecommendationResponse[]>
		>('/recommendations', { params: { userId } })
		return response.data
	} catch (error: any) {
		console.error('Error fetching recommendations:', error)
		throw new Error(
			extractError(error) || 'Failed to fetch recommendations'
		)
	}
}

export const adminAnalyticsApi = {
	getAnalyticsOverview,
	getKpiMetrics,
	getScoreTrend,
	getTopPerformers,
	getTopCourses,
	getExamResults,
	getCheatingStats,
	getDashboardData,
	getRecommendations,
}

export default adminAnalyticsApi
