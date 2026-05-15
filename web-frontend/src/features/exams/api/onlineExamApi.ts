/**
 * Online Exam API Service
 *
 * Connects to the Online Exam Service through the API Gateway.
 * Uses centralized onlineExamClient from foundation/api and shared proctoring client.
 */
import { onlineExamClient } from '@/foundation/api'
import { proctoringHttpClient as proctoringClient, fetchWithRetry } from '@/foundation/api/proctoringClient'

export interface QuizOption {
	id: string
	questionId: string
	content?: string
	optionText?: string
	isCorrect: boolean
}

export interface Question {
	id: string
	quizId: string
	content: string
	type: 'multiple-choice' | 'true-false' | 'essay' | 'short-answer'
	displayOrder: number
	explanation?: string
	points?: number
	options?: QuizOption[]
}

export interface Quiz {
	id: string
	courseId: string
	title: string
	description: string
	timeLimitMinutes: number
	createdAt: string
	difficulty?: 'easy' | 'medium' | 'hard'
	subject?: string
	isProctored?: boolean
	instructions?: string[]
	questions?: Question[]
}

export interface QuizSubmission {
	id: string
	quizId: string
	studentId: number
	score: number | null
	submittedAt: string | null
	answers: string | null
	status?: 'in-progress' | 'submitted'
	startedAt?: string | null
	timeSpentSeconds?: number | null
	correctAnswers?: number | null
	wrongAnswers?: number | null
	totalQuestions?: number | null
}

export interface SubmitAnswer {
	questionId: string
	selectedOptionId: string
}

export interface SubmitQuizRequest {
	answers: SubmitAnswer[]
}

export interface StartQuizResponse {
	success: boolean
	message: string
	data: {
		submissionId: string
		quizDetails: Quiz
	}
}

export interface SubmitQuizResponse {
	success: boolean
	message: string
	data: {
		submissionId: string
		score: number
		message: string
	}
}

export interface ActiveProctoredStudent {
	sessionId: string
	sessionStatus: string | null
	studentId: string | number | null
	examId: string | number | null
	examTitle: string | null
	examStatus: string | null
	examStartAt: string | null
	examEndAt: string | null
	submissionId: string | null
	startedAt: string | null
	timeSpentSeconds: number | null
	lastUpdatedAt: string | null
}

export const startQuiz = async (quizId: string): Promise<StartQuizResponse> => {
	const response = await onlineExamClient.post<StartQuizResponse>(
		`/quizzes/${quizId}/start`
	)
	return response.data
}

export const submitQuiz = async (
	submissionId: string,
	request: SubmitQuizRequest
): Promise<SubmitQuizResponse> => {
	const response = await onlineExamClient.post<SubmitQuizResponse>(
		`/submissions/${submissionId}/submit`,
		request
	)
	return response.data
}

export const getQuizDetails = async (quizId: string): Promise<Quiz> => {
	const response = await onlineExamClient.get<{ success: boolean; data: Quiz }>(
		`/quizzes/${quizId}`
	)
	return response.data.data
}

export const getSubmissionStatus = async (
	submissionId: string
): Promise<QuizSubmission> => {
	const response = await onlineExamClient.get<{
		success: boolean
		data: QuizSubmission
	}>(`/submissions/${submissionId}`)
	return response.data.data
}

export const getQuizResult = async (
	submissionId: string
): Promise<{
	submissionId: string
	examId: string
	examTitle: string
	score: number
	totalQuestions: number
	correctAnswers: number
	wrongAnswers: number
	passed: boolean
	submittedAt: string
	timeSpentSeconds?: number | null
	percentile?: number | null
	rank?: number | null
	totalSubmissions?: number | null
	questionResults?: any[]
}> => {
	const response = await onlineExamClient.get(
		`/submissions/${submissionId}/result`
	)
	return response.data.data
}

/**
 * GET /api/courses/:courseId/quizzes
 * Backend khong co khai niem course nen tra ve tat ca quizzes.
 * Frontend can loc theo courseId phia client.
 */
export const getCourseQuizzes = async (courseId: string): Promise<Quiz[]> => {
	const response = await onlineExamClient.get<{ success: boolean; data: Quiz[] }>(
		'/quizzes'
	)
	// Backend khong loc theo course - tra ve tat ca quizzes.
	// Frontend component can loc ket qua theo courseId.
	return response.data.data
}

/**
 * GET /api/courses/:courseId/my-submissions
 * Backend khong co khai niem course nen tra ve tat ca submissions.
 * Frontend can loc theo courseId phia client.
 */
export const getMyCourseSubmissions = async (
	courseId: string
): Promise<QuizSubmission[]> => {
	const response = await onlineExamClient.get<{
		success: boolean
		data: QuizSubmission[]
	}>('/my-submissions')
	// Backend khong loc theo course - tra ve tat ca submissions.
	// Frontend component can loc ket qua theo courseId.
	return response.data.data
}

export const getAllQuizzes = async (): Promise<Quiz[]> => {
	try {
		const response = await onlineExamClient.get<{
			success: boolean
			data: Quiz[]
		}>(`/quizzes`)
		return response.data.data
	} catch (error) {
		console.error('Error fetching all quizzes:', error)
		return []
	}
}

export const getMyAllSubmissions = async (): Promise<QuizSubmission[]> => {
	try {
		const response = await onlineExamClient.get<{
			success: boolean
			data: QuizSubmission[]
		}>(`/my-submissions`)
		return response.data.data
	} catch (error) {
		console.error('Error fetching my submissions:', error)
		return []
	}
}

export const getActiveProctoredStudents = async (): Promise<
	ActiveProctoredStudent[]
> => {
	try {
		const response = await fetchWithRetry(
			async () => {
				const res = await proctoringClient.get<ActiveProctoredStudent[]>('/sessions')
				return res.data
			},
			{ retries: 2, initialDelay: 1000 }
		)
		return Array.isArray(response) ? response : []
	} catch (error) {
		console.error('Error fetching active proctored students:', error)
		return []
	}
}

const onlineExamApi = {
	startQuiz,
	submitQuiz,
	getQuizDetails,
	getSubmissionStatus,
	getQuizResult,
	getCourseQuizzes,
	getMyCourseSubmissions,
	getAllQuizzes,
	getMyAllSubmissions,
	getActiveProctoredStudents,
}

export default onlineExamApi
