// Auth API - uses foundation/identityClient for all requests.
// Login/Register calls go to Identity Service through the API Gateway.

import { identityClient } from '@/foundation/api'
import type { NormalizedError } from '@/foundation/api'

// NOTE: identityClient already has auth interceptors (Bearer token, 401 handling).
// Each function here uses identityClient which is pre-configured with:
//   baseURL: VITE_API_BASE_URL/identity/api/v1
//   timeout: 30s
//   auth header injection
//   401 redirect

// ==================== Types ====================

export interface LoginCredentials {
	usernameOrEmail: string
	password: string
}

export interface RegisterCredentials {
	username: string
	email: string
	password: string
	firstName: string
	lastName: string
	phoneNumber?: string
}

export interface AuthResponse {
	success: boolean
	data?: {
		user: {
			id: number | string
			email: string
			firstName: string
			lastName: string
			roles?: string[]
			avatarUrl?: string
		}
		accessToken: string
		refreshToken?: string
	}
	message?: string
	error?: string
}

export interface ChangePasswordRequest {
	currentPassword: string
	newPassword: string
}

// ==================== API Functions ====================

/**
 * Login with email/username and password.
 * POST /identity/api/v1/auth/login
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
	try {
		const response = await identityClient.post<AuthResponse>('/auth/login', {
			usernameOrEmail: credentials.usernameOrEmail,
			password: credentials.password,
		})
		return response.data
	} catch (error: unknown) {
		const normalized = error as NormalizedError
		const message =
			(error as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
			normalized.message ||
			'Login failed'
		throw new Error(message)
	}
}

/**
 * Register a new user account.
 * POST /identity/api/v1/auth/register
 */
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
	try {
		const response = await identityClient.post<AuthResponse>('/auth/register', credentials)
		return response.data
	} catch (error: unknown) {
		const normalized = error as NormalizedError
		const message =
			(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
			normalized.message ||
			'Registration failed'
		throw new Error(message)
	}
}

/**
 * Change user password.
 * POST /identity/api/v1/users/change-password
 */
export const changePassword = async (request: ChangePasswordRequest): Promise<void> => {
	try {
		await identityClient.post('/users/change-password', {
			currentPassword: request.currentPassword,
			newPassword: request.newPassword,
		})
	} catch (error: unknown) {
		const normalized = error as NormalizedError
		throw new Error(normalized.message || 'Failed to change password')
	}
}

/**
 * Get current user profile.
 * GET /identity/api/v1/users/profile
 */
export const getUserProfile = async (): Promise<AuthResponse['data']['user']> => {
	try {
		const response = await identityClient.get<{ success: boolean; data?: AuthResponse['data']['user'] }>(
			'/users/profile'
		)
		if (response.data?.success && response.data?.data) {
			return response.data.data
		}
		throw new Error('Failed to fetch user profile')
	} catch (error: unknown) {
		const normalized = error as NormalizedError
		throw new Error(normalized.message || 'Failed to fetch user profile')
	}
}

/**
 * Initiate Google OAuth login.
 * Redirects to the OAuth provider.
 */
export const initiateGoogleLogin = (): void => {
	const googleAuthUrl = `${import.meta.env.VITE_API_BASE_URL || ''}/identity/oauth2/authorization/google`
	window.location.href = googleAuthUrl
}

/**
 * Handle OAuth callback.
 * GET /identity/api/v1/auth/oauth2/callback
 */
export const handleOAuthCallback = async (code: string, state?: string): Promise<AuthResponse> => {
	try {
		const response = await identityClient.get<AuthResponse>('/auth/oauth2/callback', {
			params: { code, ...(state && { state }) },
		})
		return response.data
	} catch (error: unknown) {
		const normalized = error as NormalizedError
		throw new Error(normalized.message || 'OAuth authentication failed')
	}
}

/**
 * Refresh the access token.
 * POST /identity/api/v1/auth/refresh
 */
export const refreshToken = async (refreshTokenValue: string): Promise<AuthResponse> => {
	try {
		const response = await identityClient.post<AuthResponse>('/auth/refresh', {
			refreshToken: refreshTokenValue,
		})
		return response.data
	} catch (error: unknown) {
		const normalized = error as NormalizedError
		throw new Error(normalized.message || 'Token refresh failed')
	}
}

/**
 * Logout the current user.
 * POST /identity/api/v1/auth/logout
 */
export const logout = async (): Promise<void> => {
	try {
		await identityClient.post('/auth/logout')
	} catch {
		// Ignore logout errors — clear local state regardless
	}
}
