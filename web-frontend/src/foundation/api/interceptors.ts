/**
 * Request and response interceptors for the API client.
 *
 * These interceptors handle:
 * - Adding auth tokens to requests
 * - Handling 401 Unauthorized errors
 * - Normalizing error responses
 * - Adding request metadata (timestamps, IDs)
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, clearTokens } from './client'

/**
 * Request interceptor: add auth token and metadata
 */
export const requestInterceptor = (
	config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
	// Add auth token
	const token = getAccessToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	// Add request timestamp for debugging
	config.headers['X-Request-Time'] = new Date().toISOString()

	// Add client version
	config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0'

	return config
}

/**
 * Request interceptor error handler
 */
export const requestInterceptorError = (
	error: AxiosError
): Promise<never> => {
	return Promise.reject(error)
}

/**
 * Response success interceptor
 */
export const responseInterceptor = <T>(response: axios.AxiosResponse<T>): axios.AxiosResponse<T> => {
	// Log successful responses in development
	if (import.meta.env.DEV) {
		console.debug(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`)
	}
	return response
}

/**
 * Normalize error response format
 */
export interface NormalizedError {
	code: string
	message: string
	details?: Record<string, unknown>
	field?: string
	statusCode?: number
	url?: string
	method?: string
}

export const normalizeError = (error: AxiosError): NormalizedError => {
	if (error.response) {
		// Server responded with error status
		const data = error.response.data as Record<string, unknown> | undefined

		return {
			code: (data?.code as string) || `HTTP_${error.response.status}`,
			message:
				(data?.message as string) ||
				(data?.error as string) ||
				error.message ||
				'Server error',
			details: data?.details as Record<string, unknown>,
			field: data?.field as string | undefined,
			statusCode: error.response.status,
			url: error.config?.url,
			method: error.config?.method?.toUpperCase(),
		}
	} else if (error.request) {
		// Request made but no response (network error)
		return {
			code: 'NETWORK_ERROR',
			message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
			statusCode: 0,
			url: error.config?.url,
			method: error.config?.method?.toUpperCase(),
		}
	} else {
		// Request setup error
		return {
			code: 'CLIENT_ERROR',
			message: error.message || 'Lỗi không xác định',
			url: error.config?.url,
			method: error.config?.method?.toUpperCase(),
		}
	}
}

/**
 * Response error interceptor: handle 401, 403, 500, etc.
 */
export const responseInterceptorError = async (
	error: AxiosError
): Promise<never> => {
	const normalized = normalizeError(error)
	const status = error.response?.status
	const url = error.config?.url || ''

	// Log errors in development
	if (import.meta.env.DEV) {
		console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${status}`, normalized)
	}

	// Handle 401 - Unauthorized
	if (status === 401) {
		// Don't redirect for auth endpoints
		if (url.includes('/auth/login') || url.includes('/auth/register')) {
			return Promise.reject(normalized)
		}

		// Clear all tokens
		clearTokens()

		// Redirect to login if not already there
		const isAuthPage = window.location.pathname.includes('/auth')
		if (!isAuthPage) {
			window.location.href = '/auth'
		}
	}

	// Handle 403 - Forbidden
	if (status === 403) {
		const message =
			normalized.message ||
			'Bạn không có quyền thực hiện thao tác này.'
		normalized.message = message
	}

	// Handle 404 - Not Found
	if (status === 404) {
		const message =
			normalized.message ||
			'Tài nguyên không tìm thấy.'
		normalized.message = message
	}

	// Handle 500 - Server Error
	if (status === 500) {
		const message =
			normalized.message ||
			'Lỗi server. Vui lòng thử lại sau.'
		normalized.message = message
	}

	// Handle network errors
	if (status === undefined) {
		normalized.message =
			'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
	}

	return Promise.reject(normalized)
}

/**
 * Apply all interceptors to an axios instance
 */
export const applyInterceptors = (instance: ReturnType<typeof axios.create>): void => {
	instance.interceptors.request.use(requestInterceptor, requestInterceptorError)
	instance.interceptors.response.use(responseInterceptor, responseInterceptorError)
}
