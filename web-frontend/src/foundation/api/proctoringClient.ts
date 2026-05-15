/**
 * Shared proctoring HTTP client for all features.
 * Uses shorter timeout (10s) and proper interceptors.
 * For WebSocket connections, use notificationSse.ts instead.
 */
import axios, { type AxiosInstance } from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const proctoringHttpClient: AxiosInstance = axios.create({
	baseURL: `${BASE_URL}/api/proctoring`,
	timeout: 10_000,
	headers: {
		'Content-Type': 'application/json',
	},
})

proctoringHttpClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('accessToken')
			|| localStorage.getItem('authToken')
			|| localStorage.getItem('token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error)
)

proctoringHttpClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			if (!window.location.pathname.includes('/auth')) {
				window.location.href = '/auth'
			}
		}
		return Promise.reject(error)
	}
)

export { proctoringHttpClient }

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface FetchOptions {
	retries?: number
	initialDelay?: number
}

export async function fetchWithRetry<T>(
	fetchFn: () => Promise<T>,
	options: FetchOptions = {}
): Promise<T> {
	const { retries = 2, initialDelay = 1000 } = options

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await fetchFn()
		} catch (error: any) {
			const isLastAttempt = attempt === retries
			const isTimeout =
				error.code === 'ECONNABORTED' ||
				error.message?.includes('timeout') ||
				error.code === 'ERR_CANCELED'

			if (isLastAttempt || !isTimeout) {
				throw error
			}

			const delay = initialDelay * Math.pow(2, attempt)
			await sleep(delay)
		}
	}

	throw new Error('Unreachable')
}
