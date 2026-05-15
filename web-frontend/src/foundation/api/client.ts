/**
 * Centralized Axios client for all API calls.
 *
 * ARCHITECTURE DECISION:
 * Each service has a dedicated pre-configured axios instance with
 * consistent interceptors, error handling, and base URL configuration.
 * Individual feature API files import from this module instead of creating
 * their own axios instances.
 *
 * Usage:
 *   import { courseClient, tokenClient, copyrightClient } from '@/foundation/api/client'
 *   const response = await courseClient.get('/courses')
 *
 * Token keys: Uses 'accessToken' as primary, 'authToken'/'token' as fallbacks.
 * Auth errors (401) automatically clear tokens and redirect to /auth.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Token keys used across the application.
 * NOTE: There's currently inconsistency — some use 'accessToken', some 'authToken', some 'token'.
 * We normalize to 'accessToken' as the primary key.
 */
export const TOKEN_KEYS = {
	PRIMARY: 'accessToken',
	ALTERNATIVES: ['authToken', 'token'] as const,
} as const

export const getAccessToken = (): string | null => {
	for (const key of [TOKEN_KEYS.PRIMARY, ...TOKEN_KEYS.ALTERNATIVES]) {
		const token = localStorage.getItem(key)
		if (token) return token
	}
	return null
}

export const clearTokens = (): void => {
	localStorage.removeItem('accessToken')
	localStorage.removeItem('refreshToken')
	localStorage.removeItem('authToken')
	localStorage.removeItem('token')
	localStorage.removeItem('user')
}

export const isAuthenticated = (): boolean => {
	return getAccessToken() !== null
}

/**
 * Create a configured axios instance.
 * @param baseURL - Override base URL (defaults to VITE_API_BASE_URL)
 * @param includeAuth - Whether to include auth interceptor (default: true)
 */
export const createApiClient = (
	baseURL?: string,
	includeAuth = true
) => {
	const instance = axios.create({
		baseURL: baseURL || BASE_URL,
		timeout: 30_000,
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (includeAuth) {
		instance.interceptors.request.use(
			(config) => {
				const token = getAccessToken()
				if (token) {
					config.headers.Authorization = `Bearer ${token}`
				}
				return config
			},
			(error) => Promise.reject(error)
		)
	}

	instance.interceptors.response.use(
		(response) => response,
		(error) => {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status
				const originalRequest = error.config

				if (status === 401 && originalRequest) {
					clearTokens()
					if (!window.location.pathname.includes('/auth')) {
						window.location.href = '/auth'
					}
				}
			}
			return Promise.reject(error)
		}
	)

	return instance
}

/**
 * Normalize Axios error to a consistent shape.
 */
export const normalizeApiError = (error: unknown): { code: string; message: string; status?: number } => {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as Record<string, unknown> | undefined
		return {
			code: (data?.code as string) || `HTTP_${error.response?.status}`,
			message:
				(data?.message as string) ||
				(data?.error as string) ||
				error.message ||
				'Server error',
			status: error.response?.status,
		}
	}
	if (error instanceof Error) {
		return { code: 'CLIENT_ERROR', message: error.message }
	}
	return { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred' }
}

// ============================================================
// PRE-CONFIGURED SERVICE CLIENTS
// Each client targets a specific backend microservice.
// ============================================================

/**
 * Default API client — generic requests without service prefix.
 */
export const apiClient = createApiClient()

/**
 * Identity Service client (Auth, Users, Roles).
 * Base: /identity/api/v1
 * Routes: /auth/*, /users/*
 */
export const identityClient = createApiClient(`${BASE_URL}/identity/api/v1`)

/**
 * Course Service client.
 * Base: /course/api/v1
 * Routes: /courses/*, /quizzes/*, /materials/*, /progress/*, /rewards/*
 */
export const courseClient = createApiClient(`${BASE_URL}/course/api/v1`)

/**
 * Exam Service client (Admin exam management).
 * Base: /exam/api/v1
 * Routes: /exams/*, /questions/*
 */
export const examClient = createApiClient(`${BASE_URL}/exam/api/v1`)

/**
 * Online Exam Service client.
 * Base: /api/exam
 * Routes: /api/exam/*
 */
export const onlineExamClient = createApiClient(`${BASE_URL}/api/exam`)

/**
 * Token Reward Service client.
 * Base: /api/tokens
 * Routes: /grant, /spend, /withdraw, /balance/*, /history/*, /wallets/*, /admin/*, /gifts/*
 */
export const tokenClient = createApiClient(`${BASE_URL}/api/tokens`)

/**
 * Copyright Service client.
 * Base: /api/copyrights
 * Routes: /register, /stats, /analytics, /search, /check-*, /blockchain/*
 */
export const copyrightClient = createApiClient(`${BASE_URL}/api/copyrights`)

/**
 * Multisig Service client.
 * Base: /api/v1/multisig
 * Routes: /multisig/wallets/*, /multisig/transactions/*
 */
export const multisigClient = createApiClient(`${BASE_URL}/api/v1/multisig`)

/**
 * Proctoring Service client.
 * Base: /api/proctoring
 * Routes: /sessions/*, /screenshots, /monitor
 */
export const proctoringClient = createApiClient(`${BASE_URL}/api/proctoring`)

/**
 * Organization Service client.
 * Base: /api/organization
 * Routes: /organizations/*
 */
export const organizationClient = createApiClient(`${BASE_URL}/api/organization`)

/**
 * Analytics Service client.
 * Base: /analytics
 * Routes: /overview, /kpis, /score-trend, /top-performers, /exam-results/*
 */
export const analyticsClient = createApiClient(`${BASE_URL}/analytics`)

/**
 * Notification Service client.
 * Base: /api/v1/notifications
 * Routes: GET / (paginated), /unread-count, /:id/read, /read-all, /:id, /send
 */
export const notificationClient = createApiClient(`${BASE_URL}/api/v1/notifications`)

/**
 * File Service client.
 * Base: /files
 * Routes: /upload, /uploadMultiple (multipart/form-data)
 * IMPORTANT: Use the upload methods from fileApi.ts instead of calling this client directly.
 * Multipart uploads must NOT set Content-Type header — Axios sets it with boundary.
 */
export const fileClient = createApiClient(`${BASE_URL}/files`, false)

/**
 * Generic API v1 client (for services that don't have a dedicated client).
 * Base: /api/v1
 */
export const genericClient = createApiClient(`${BASE_URL}/api/v1`)

/**
 * Leaderboard Service client.
 * Base: /api/leaderboard
 * Routes: / (paginated), /top, /:userId, /submit, /:userId (PUT)
 */
export const leaderboardClient = createApiClient(`${BASE_URL}/api/leaderboard`)

export default apiClient
