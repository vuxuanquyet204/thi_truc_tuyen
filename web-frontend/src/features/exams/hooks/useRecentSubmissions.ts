/**
 * Recent Submissions Hook
 *
 * Fetches recent exam submissions from the online exam service.
 * Uses centralized onlineExamClient from foundation/api.
 */

import { useState, useEffect } from 'react'
import { onlineExamClient } from '@/foundation/api'

interface Submission {
	id: string
	quizId: string
	studentId: number
	score: number | null
	submittedAt: string | null
	startedAt: string | null
	timeSpentSeconds: number | null
	correctAnswers: number | null
	wrongAnswers: number | null
	totalQuestions: number | null
}

interface Quiz {
	id: string
	title: string
	timeLimit: number
}

interface RecentExam {
	id: string
	quizId: string
	title: string
	score?: number
	maxScore: number
	status: 'completed' | 'in-progress' | 'failed'
	date: string
	duration: string
	certificate?: boolean
	submittedAt?: string
	startedAt?: string
}

export function useRecentSubmissions() {
	const [exams, setExams] = useState<RecentExam[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [hasFetched, setHasFetched] = useState(false)

	useEffect(() => {
		if (!hasFetched) {
			fetchRecentSubmissions()
			setHasFetched(true)
		}
	}, [hasFetched])

	const fetchRecentSubmissions = async () => {
		try {
			setLoading(true)
			const subsResponse = await onlineExamClient.get('/my-submissions')

			if (!subsResponse.data.success) {
				throw new Error('Failed to fetch submissions')
			}

			const submissions: Submission[] = subsResponse.data.data || []

			const recentSubmissions = submissions
				.filter((sub) => sub.submittedAt || sub.startedAt)
				.sort((a, b) => {
					const dateA = new Date(
						a.submittedAt || a.startedAt || 0
					).getTime()
					const dateB = new Date(
						b.submittedAt || b.startedAt || 0
					).getTime()
					return dateB - dateA
				})
				.slice(0, 10)

			const quizIds = [...new Set(recentSubmissions.map((sub) => sub.quizId))]
			const quizDetailsPromises = quizIds.map(async (quizId) => {
				try {
					const quizResponse = await onlineExamClient.get(
						`/quizzes/${quizId}`
					)
					return quizResponse.data.success
						? quizResponse.data.data
						: null
				} catch {
					return null
				}
			})

			const quizDetails = await Promise.all(quizDetailsPromises)
			const quizMap = new Map<string, Quiz>()
			quizDetails.forEach((quiz: Quiz | null) => {
				if (quiz) {
					quizMap.set(quiz.id, quiz)
				}
			})

			const recentExams: RecentExam[] = recentSubmissions.map((sub) => {
				const quiz = quizMap.get(sub.quizId)
				const hasValidSubmittedAt =
					sub.submittedAt &&
					sub.submittedAt !== null &&
					sub.submittedAt !== '' &&
					sub.submittedAt !== 'null'

				let status: 'completed' | 'in-progress' | 'failed' = 'in-progress'
				if (hasValidSubmittedAt) {
					const percentage = sub.score || 0
					status = percentage >= 60 ? 'completed' : 'failed'
				}

				let duration = 'N/A'
				if (sub.timeSpentSeconds) {
					const minutes = Math.floor(sub.timeSpentSeconds / 60)
					duration = `${minutes} phut`
				} else if (quiz?.timeLimit) {
					duration = `${quiz.timeLimit} phut`
				}

				const dateToUse = hasValidSubmittedAt
					? sub.submittedAt
					: sub.startedAt
				const relativeDate = dateToUse
					? formatRelativeTime(dateToUse)
					: 'N/A'

				const certificate = sub.score ? sub.score >= 80 : false

				return {
					id: sub.id,
					quizId: sub.quizId,
					title: quiz?.title || 'Bai thi khong xac dinh',
					score: sub.score || undefined,
					maxScore: 100,
					status,
					date: relativeDate,
					duration,
					certificate,
					submittedAt: sub.submittedAt || undefined,
					startedAt: sub.startedAt || undefined,
				}
			})

			setExams(recentExams)
			setError(null)
		} catch (err: any) {
			console.error('Error fetching recent submissions:', err)
			setError(err.message || 'Failed to fetch recent submissions')
		} finally {
			setLoading(false)
		}
	}

	return {
		exams,
		loading,
		error,
		refetch: () => {
			setHasFetched(false)
			fetchRecentSubmissions()
		},
	}
}

function formatRelativeTime(dateString: string): string {
	const now = new Date()
	const date = new Date(dateString)
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60)
	)

	if (diffInMinutes < 1) return 'Vua xong'
	if (diffInMinutes < 60) return `${diffInMinutes} phut truoc`
	if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} gio truoc`
	return `${Math.floor(diffInMinutes / 1440)} ngay truoc`
}
