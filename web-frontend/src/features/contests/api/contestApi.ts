/**
 * Quiz / Contest API Service
 *
 * Connects to the Online Exam Service through the API Gateway.
 * Uses centralized onlineExamClient from foundation/api.
 *
 * IMPORTANT: Backend paths use:
 *   - POST /api/submissions/:submissionId/submit (NOT /quizzes/:id/submit)
 *   - GET /api/submissions/:submissionId/result (NOT /quizzes/:id/result)
 */

import { onlineExamClient } from '@/foundation/api'

export interface QuizQuestion {
	id: string
	title: string
	description: string
	difficulty: 'easy' | 'medium' | 'hard'
	tags: string[]
	maxScore: number
	successRate?: number
	status?: 'not_attempted' | 'attempted' | 'solved'
}

export interface QuizSubmission {
	submissionId: string
	score?: number
	maxScore: number
	submittedAt: string
	status: 'pending' | 'completed'
	rank?: number
	percentile?: number
}

export interface QuizDetail {
	id: string
	title: string
	description: string
	startDate?: string
	endDate?: string
	status: 'active' | 'upcoming' | 'archived'
	type?: string
	totalParticipants?: number
	currentRank?: number
	challenges: QuizQuestion[]
	difficulty?: string
	tags?: string[]
}

export const quizApiService = {
	/**
	 * GET /api/quizzes - List all available quizzes
	 */
	async getQuizzes(): Promise<QuizDetail[]> {
		const response = await onlineExamClient.get('/quizzes')
		const data = response.data
		// Backend returns { success: true, data: [...] }
		return data?.data || data || []
	},

	/**
	 * GET /api/quizzes/:quizId - Get quiz details
	 */
	async getQuizById(quizId: string): Promise<QuizDetail> {
		const response = await onlineExamClient.get(`/quizzes/${quizId}`)
		const data = response.data
		return data?.data || data
	},

	/**
	 * POST /api/quizzes/:quizId/start - Start a quiz (creates a submission)
	 * Returns: { submissionId, questions... }
	 */
	async startQuiz(
		quizId: string
	): Promise<{ submissionId: string; questions: QuizQuestion[] }> {
		const response = await onlineExamClient.post(`/quizzes/${quizId}/start`)
		const data = response.data
		// Backend: { success: true, data: { submissionId, ...quizDetails } }
		const result = data?.data || data
		return {
			submissionId: result.submissionId,
			questions: result.questions || [],
		}
	},

	/**
	 * POST /api/submissions/:submissionId/submit
	 * Submit quiz answers using submissionId (NOT quizId)
	 * Correct path: /submissions/:submissionId/submit
	 */
	async submitQuiz(
		submissionId: string,
		answers: Record<string, unknown>
	): Promise<{ score: number; maxScore: number; rank?: number }> {
		const response = await onlineExamClient.post(
			`/submissions/${submissionId}/submit`,
			{ answers }
		)
		const data = response.data
		const result = data?.data || data
		return {
			score: result.score ?? 0,
			maxScore: result.scoreRaw ?? 0,
			rank: undefined,
		}
	},

	/**
	 * GET /api/submissions/:submissionId/result
	 * Get quiz result using submissionId (NOT quizId)
	 * Correct path: /submissions/:submissionId/result
	 */
	async getQuizResult(submissionId: string): Promise<QuizSubmission> {
		const response = await onlineExamClient.get(`/submissions/${submissionId}/result`)
		const data = response.data
		const result = data?.data || data
		return {
			submissionId: result.submissionId,
			score: result.score,
			maxScore: result.totalQuestions ?? 0,
			submittedAt: result.submittedAt || new Date().toISOString(),
			status: result.submittedAt ? 'completed' : 'pending',
			percentile: result.percentile ?? undefined,
			rank: result.rank ?? undefined,
		}
	},
}
