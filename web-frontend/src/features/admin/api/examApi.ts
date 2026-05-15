/**
 * Admin Exam API Service
 *
 * Admin-level exam management and question operations.
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

export interface EnumOption {
	code: string
	label: string
	labelVi: string
	displayOrder: number
}

export interface QuestionImportResponse {
	imported: number
	skipped: number
	errors: number
	errorDetails: string[]
	subject: string
	tags: string[]
}

export interface QuestionImportStatsResponse {
	totalQuestions: number
	totalTags: number
	questionsByTag: Record<string, number>
}

export interface DeleteQuestionsByTagResponse {
	deletedCount: number
	tag: string
	message: string
}

// ============================================================
// Exam Operations
// ============================================================

export const createExam = async (
	request: ExamCreationRequest
): Promise<Exam> => {
	try {
		const response = await examClient.post('/exams', request)
		return (response.data as any)?.data
	} catch (error: any) {
		console.error('Error creating exam:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to create exam'
		)
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

// ============================================================
// Question Operations
// ============================================================

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

// ============================================================
// Admin-Specific Operations
// ============================================================

export async function importQuestionsFromExcel(
	file: File,
	subject: string,
	tags: string
): Promise<QuestionImportResponse> {
	const formData = new FormData()
	formData.append('file', file)
	formData.append('subject', subject)
	formData.append('tags', tags || subject)
	const response = await examClient.post<QuestionImportResponse>(
		'/questions/import-excel',
		formData,
		{ headers: { 'Content-Type': 'multipart/form-data' } }
	)
	return response.data
}

export async function getImportStatistics(): Promise<
	QuestionImportStatsResponse
> {
	const response = await examClient.get<QuestionImportStatsResponse>(
		'/questions/import-stats'
	)
	return response.data
}

export async function deleteQuestionsByTag(
	tag: string
): Promise<DeleteQuestionsByTagResponse> {
	const response = await examClient.delete<DeleteQuestionsByTagResponse>(
		`/questions/by-tag/${encodeURIComponent(tag)}`
	)
	return response.data
}

export async function getAllExams(): Promise<Exam[]> {
	try {
		return await getExamSchedules()
	} catch (error) {
		console.error('Error getting all exams:', error)
		throw error
	}
}

export async function getExamStatistics() {
	try {
		const exams = await getAllExams()
		const totalExams = exams.length
		const draftExams = exams.filter((e) => e.status === 'DRAFT').length
		const scheduledExams = exams.filter((e) => e.status === 'SCHEDULED').length
		const activeExams = exams.filter((e) => e.status === 'ACTIVE').length
		const completedExams = exams.filter((e) => e.status === 'COMPLETED').length
		const cancelledExams = exams.filter((e) => e.status === 'CANCELLED').length
		return {
			totalExams,
			draftExams,
			scheduledExams,
			activeExams,
			completedExams,
			cancelledExams,
		}
	} catch (error) {
		console.error('Error getting exam statistics:', error)
		return {
			totalExams: 0,
			draftExams: 0,
			scheduledExams: 0,
			activeExams: 0,
			completedExams: 0,
			cancelledExams: 0,
		}
	}
}

export async function getUpcomingExams(days: number = 7): Promise<Exam[]> {
	try {
		const now = new Date()
		const endDate = new Date()
		endDate.setDate(endDate.getDate() + days)
		const exams = await getExamSchedules(
			now.toISOString(),
			endDate.toISOString()
		)
		return exams.filter(
			(e) => e.status === 'SCHEDULED' || e.status === 'ACTIVE'
		)
	} catch (error) {
		console.error('Error getting upcoming exams:', error)
		return []
	}
}

export async function getRecentExams(days: number = 30): Promise<Exam[]> {
	try {
		const endDate = new Date()
		const startDate = new Date()
		startDate.setDate(startDate.getDate() - days)
		const exams = await getExamSchedules(
			startDate.toISOString(),
			endDate.toISOString()
		)
		return exams.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
	} catch (error) {
		console.error('Error getting recent exams:', error)
		return []
	}
}

export async function getAllQuestions(): Promise<Question[]> {
	try {
		return await searchQuestions()
	} catch (error) {
		console.error('Error getting all questions:', error)
		return []
	}
}

export async function getAllSubjects(): Promise<string[]> {
	try {
		const response = await examClient.get<string[]>('/exams/subjects')
		return (response.data as any)?.data || []
	} catch (error) {
		console.error('Error getting subjects from API:', error)
		try {
			const questions = await searchQuestions()
			const allTags = new Set<string>()
			questions.forEach((question) => {
				if (question.tags && Array.isArray(question.tags)) {
					question.tags.forEach((tag) => allTags.add(tag))
				}
			})
			return Array.from(allTags).sort()
		} catch (fallbackError) {
			console.error('Fallback also failed:', fallbackError)
			return []
		}
	}
}

export async function getQuestionStatistics() {
	try {
		const questions = await getAllQuestions()
		const totalQuestions = questions.length
		const easyQuestions = questions.filter((q) => (q.difficulty || 0) <= 3).length
		const mediumQuestions = questions.filter(
			(q) => (q.difficulty || 0) > 3 && (q.difficulty || 0) <= 7
		).length
		const hardQuestions = questions.filter((q) => (q.difficulty || 0) > 7).length
		const singleChoiceCount = questions.filter(
			(q) => q.type === 'SINGLE_CHOICE'
		).length
		const multipleChoiceCount = questions.filter(
			(q) => q.type === 'MULTIPLE_CHOICE'
		).length
		const trueFalseCount = questions.filter(
			(q) => q.type === 'TRUE_FALSE'
		).length
		const shortAnswerCount = questions.filter(
			(q) => q.type === 'SHORT_ANSWER'
		).length
		const essayCount = questions.filter((q) => q.type === 'ESSAY').length
		return {
			totalQuestions,
			easyQuestions,
			mediumQuestions,
			hardQuestions,
			byType: {
				singleChoice: singleChoiceCount,
				multipleChoice: multipleChoiceCount,
				trueFalse: trueFalseCount,
				shortAnswer: shortAnswerCount,
				essay: essayCount,
			},
		}
	} catch (error) {
		console.error('Error getting question statistics:', error)
		return {
			totalQuestions: 0,
			easyQuestions: 0,
			mediumQuestions: 0,
			hardQuestions: 0,
			byType: {
				singleChoice: 0,
				multipleChoice: 0,
				trueFalse: 0,
				shortAnswer: 0,
				essay: 0,
			},
		}
	}
}

export async function searchExams(query: string): Promise<Exam[]> {
	try {
		const allExams = await getAllExams()
		const lowerQuery = query.toLowerCase()
		return allExams.filter(
			(exam) =>
				exam.title.toLowerCase().includes(lowerQuery) ||
				(exam.description || '').toLowerCase().includes(lowerQuery)
		)
	} catch (error) {
		console.error('Error searching exams:', error)
		return []
	}
}

export async function getExamsByStatus(status: ExamStatus): Promise<Exam[]> {
	try {
		const allExams = await getAllExams()
		return allExams.filter((exam) => exam.status === status)
	} catch (error) {
		console.error('Error getting exams by status:', error)
		return []
	}
}

export async function updateExamStatus(
	examId: string,
	status: ExamStatus
): Promise<Exam> {
	try {
		const response = await examClient.put<Exam>(`/exams/${examId}/status`, {
			status,
		})
		return (response.data as any)?.data
	} catch (error) {
		console.error('Error updating exam status:', error)
		throw error
	}
}

export async function getAllExamTypes(): Promise<EnumOption[]> {
	try {
		const response = await examClient.get<EnumOption[]>('/exams/types')
		return (response.data as any)?.data || []
	} catch (error) {
		console.error('Error getting exam types:', error)
		return [
			{ code: 'practice', label: 'Practice', labelVi: 'Luyen tap', displayOrder: 1 },
			{ code: 'quiz', label: 'Quiz', labelVi: 'Kiem tra', displayOrder: 2 },
			{ code: 'midterm', label: 'Midterm', labelVi: 'Giua ky', displayOrder: 3 },
			{ code: 'final', label: 'Final', labelVi: 'Cuoi ky', displayOrder: 4 },
			{
				code: 'assignment',
				label: 'Assignment',
				labelVi: 'Bai tap',
				displayOrder: 5,
			},
		]
	}
}

export async function getAllExamDifficulties(): Promise<EnumOption[]> {
	try {
		const response = await examClient.get<EnumOption[]>(
			'/exams/difficulties'
		)
		return (response.data as any)?.data || []
	} catch (error) {
		console.error('Error getting exam difficulties:', error)
		return [
			{ code: 'easy', label: 'Easy', labelVi: 'De', displayOrder: 1 },
			{
				code: 'medium',
				label: 'Medium',
				labelVi: 'Trung binh',
				displayOrder: 2,
			},
			{ code: 'hard', label: 'Hard', labelVi: 'Kho', displayOrder: 3 },
		]
	}
}

export async function getAllExamStatuses(): Promise<EnumOption[]> {
	try {
		const response = await examClient.get<EnumOption[]>('/exams/statuses')
		return (response.data as any)?.data || []
	} catch (error) {
		console.error('Error getting exam statuses:', error)
		return [
			{ code: 'draft', label: 'Draft', labelVi: 'Nhap', displayOrder: 1 },
			{
				code: 'published',
				label: 'Published',
				labelVi: 'Da xuat ban',
				displayOrder: 2,
			},
			{
				code: 'ongoing',
				label: 'Ongoing',
				labelVi: 'Dang dien ra',
				displayOrder: 3,
			},
			{
				code: 'ended',
				label: 'Ended',
				labelVi: 'Da ket thuc',
				displayOrder: 4,
			},
			{
				code: 'archived',
				label: 'Archived',
				labelVi: 'Luu tru',
				displayOrder: 5,
			},
		]
	}
}

export default {
	getAllExams,
	getExamStatistics,
	getUpcomingExams,
	getRecentExams,
	getAllQuestions,
	getAllSubjects,
	getQuestionStatistics,
	searchExams,
	getExamsByStatus,
	updateExamStatus,
	getAllExamTypes,
	getAllExamDifficulties,
	getAllExamStatuses,
}
