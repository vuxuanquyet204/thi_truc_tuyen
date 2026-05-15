/**
 * Exam API Service
 *
 * Admin exam management and question operations.
 * Uses centralized examClient from foundation/api.
 */

import { examClient } from '@/foundation/api'

export type ExamStatus =
	| 'DRAFT'
	| 'SCHEDULED'
	| 'PUBLISHED'
	| 'ACTIVE'
	| 'COMPLETED'
	| 'CANCELLED'
export type QuestionType =
	| 'SINGLE_CHOICE'
	| 'MULTIPLE_CHOICE'
	| 'TRUE_FALSE'
	| 'SHORT_ANSWER'
	| 'ESSAY'

export interface Exam {
	id: string
	orgId: string
	title: string
	description?: string
	startAt?: string
	endAt?: string
	durationMinutes?: number
	passScore?: number
	maxAttempts?: number
	totalQuestions?: number
	assignedQuestionCount?: number
	createdBy: string
	status: ExamStatus
	createdAt: string
	tags?: string[]
}

export interface EnumOption {
	code: string
	label: string
	labelVi: string
	description?: string
	displayOrder?: number
}

export interface ExamCreationRequest {
	orgId: string
	title: string
	description?: string
	startAt?: string
	endAt?: string
	durationMinutes?: number
	passScore?: number
	maxAttempts?: number
	totalQuestions?: number
	createdBy: string
	tags?: string[]
}

export interface ExamConfigRequest {
	durationMinutes?: number
	passScore?: number
	maxAttempts?: number
}

export interface ExamUpdateRequest {
	title?: string
	description?: string
	startAt?: string
	endAt?: string
	durationMinutes?: number
	passScore?: number
	maxAttempts?: number
	totalQuestions?: number
	tags?: string[]
}

export interface ExamScheduleRequest {
	startAt: string
	endAt: string
	studentIds: string[]
}

export interface Question {
	id: string
	type: QuestionType
	content: string
	difficulty?: number
	explanation?: string
	score?: number
	text?: string
	tags?: string[]
	createdAt: string
	updatedAt?: string
}

export interface QuestionCreationRequest {
	type: QuestionType
	content: string
	difficulty?: number
	explanation?: string
	score?: number
	text?: string
	tags?: string[]
}

export interface QuestionSearchRequest {
	tags?: string[]
	minDifficulty?: number
	maxDifficulty?: number
}

export interface GenerateQuestionsRequest {
	count: number
	tags?: string[]
	minDifficulty?: number
	maxDifficulty?: number
}

export interface GeneratedQuestionsResponse {
	questionIds: string[]
}

export interface ExamRegistration {
	id: string
	examId: string
	studentId: string
	status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
	registeredAt: string
}

export const createExam = async (request: ExamCreationRequest): Promise<Exam> => {
	try {
		const response = await examClient.post('/exams', request)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error creating exam:', error)
		throw new Error(error.response?.data?.message || 'Failed to create exam')
	}
}

export const getExamById = async (examId: string): Promise<Exam> => {
	try {
		const response = await examClient.get(`/exams/${examId}`)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error getting exam:', error)
		throw new Error(error.response?.data?.message || 'Failed to get exam')
	}
}

export const updateExamConfig = async (
	examId: string,
	config: ExamConfigRequest
): Promise<Exam> => {
	try {
		const response = await examClient.put(`/exams/${examId}/config`, config)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error updating exam config:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to update exam config'
		)
	}
}

export const updateExam = async (
	examId: string,
	request: ExamUpdateRequest
): Promise<Exam> => {
	try {
		const response = await examClient.put(`/exams/${examId}`, request)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error updating exam:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to update exam'
		)
	}
}

export const deleteExam = async (examId: string): Promise<void> => {
	try {
		await examClient.delete(`/exams/${examId}`)
	} catch (error: any) {
		const status = error?.response?.status
		const serverMessage =
			error?.response?.data?.message ||
			error?.response?.data?.error ||
			error?.response?.data
		const msg = serverMessage
			? `Failed to delete exam (${status}): ${serverMessage}`
			: `Failed to delete exam (${status || 'unknown'})`
		console.error('Error deleting exam:', { status, serverMessage })
		throw new Error(msg)
	}
}

export const scheduleExam = async (
	examId: string,
	scheduleRequest: ExamScheduleRequest
): Promise<Exam> => {
	try {
		const response = await examClient.post(
			`/exams/${examId}/schedule`,
			scheduleRequest
		)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error scheduling exam:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to schedule exam'
		)
	}
}

export const generateExamQuestions = async (
	examId: string,
	request: GenerateQuestionsRequest
): Promise<GeneratedQuestionsResponse> => {
	try {
		const response = await examClient.post(
			`/exams/${examId}/generate-questions`,
			request
		)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error generating questions:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to generate questions'
		)
	}
}

export const getExamSchedules = async (
	startDate?: string,
	endDate?: string
): Promise<Exam[]> => {
	try {
		const params: any = {}
		if (startDate) params.start = startDate
		if (endDate) params.end = endDate
		const response = await examClient.get('/exams/schedules', { params })
		return (response.data as any)?.data || []
	} catch (error: any) {
		console.error('Error getting exam schedules:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to get exam schedules'
		)
	}
}

export const createQuestion = async (
	request: QuestionCreationRequest
): Promise<Question> => {
	try {
		const response = await examClient.post('/questions', request)
		return response.data
	} catch (error: any) {
		console.error('Error creating question:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to create question'
		)
	}
}

export const deleteQuestion = async (questionId: string): Promise<void> => {
	try {
		await examClient.delete(`/questions/${questionId}`)
	} catch (error: any) {
		console.error('Error deleting question:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to delete question'
		)
	}
}

export const searchQuestions = async (
	request?: QuestionSearchRequest
): Promise<Question[]> => {
	try {
		const params: any = {}
		if (request?.tags && request.tags.length > 0) {
			params.tags = request.tags
		}
		if (request?.minDifficulty !== undefined) {
			params.minDifficulty = request.minDifficulty
		}
		if (request?.maxDifficulty !== undefined) {
			params.maxDifficulty = request.maxDifficulty
		}
		const response = await examClient.get('/questions', { params })
		return response.data
	} catch (error: any) {
		console.error('Error searching questions:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to search questions'
		)
	}
}

export const generateRandomQuestions = async (
	count: number = 10,
	filter?: QuestionSearchRequest
): Promise<GeneratedQuestionsResponse> => {
	try {
		const response = await examClient.post('/questions/generate', filter, {
			params: { count },
		})
		return response.data
	} catch (error: any) {
		console.error('Error generating random questions:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to generate random questions'
		)
	}
}

const examApi = {
	createExam,
	getExamById,
	updateExamConfig,
	updateExam,
	deleteExam,
	scheduleExam,
	generateExamQuestions,
	getExamSchedules,
	createQuestion,
	deleteQuestion,
	searchQuestions,
	generateRandomQuestions,
}

export { examClient }

export default examApi
