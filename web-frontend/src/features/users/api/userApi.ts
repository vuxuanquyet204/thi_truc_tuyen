/**
 * Users API Service
 *
 * User management, profile, and CRUD operations.
 * Uses centralized identityClient from foundation/api.
 */

import { identityClient } from '@/foundation/api'

export interface UserResponse {
	id: string
	username: string
	email: string
	firstName: string
	lastName: string
	phoneNumber?: string
	avatarUrl?: string
	enabled: boolean
	accountNonExpired: boolean
	accountNonLocked: boolean
	credentialsNonExpired: boolean
	createdAt: string
	updatedAt?: string
	lastLoginAt?: string
	roles: string[]
}

export interface CreateUserRequest {
	username: string
	email: string
	password: string
	firstName: string
	lastName: string
	phoneNumber?: string
	avatarUrl?: string
	enabled?: boolean
	accountNonExpired?: boolean
	accountNonLocked?: boolean
	credentialsNonExpired?: boolean
	roleNames?: string[]
}

export interface UpdateUserRequest {
	username?: string
	email?: string
	password?: string
	firstName?: string
	lastName?: string
	phoneNumber?: string
	avatarUrl?: string
	enabled?: boolean
	accountNonExpired?: boolean
	accountNonLocked?: boolean
	credentialsNonExpired?: boolean
	roleNames?: string[]
}

export interface PageResponse<T> {
	content: T[]
	pageable: {
		pageNumber: number
		pageSize: number
		sort: { sorted: boolean; unsorted: boolean; empty: boolean }
		offset: number
		paged: boolean
		unpaged: boolean
	}
	totalElements: number
	totalPages: number
	last: boolean
	size: number
	number: number
	sort: { sorted: boolean; unsorted: boolean; empty: boolean }
	numberOfElements: number
	first: boolean
	empty: boolean
}

export interface ApiResponse<T> {
	success: boolean
	message?: string
	data?: T
	error?: unknown
}

function toSnakeCase(obj: any): any {
	if (obj === null || obj === undefined) return obj
	if (Array.isArray(obj)) return obj.map(toSnakeCase)
	if (typeof obj !== 'object') return obj

	const snakeObj: any = {}
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
			snakeObj[snakeKey] = toSnakeCase(obj[key])
		}
	}
	return snakeObj
}

export const getUsers = async (
	page = 0,
	size = 10,
	sort?: string
): Promise<ApiResponse<PageResponse<UserResponse>>> => {
	try {
		const params: any = { page, size }
		if (sort) params.sort = sort
		const response = await identityClient.get('/users', { params })
		return response.data
	} catch (error: any) {
		console.error('Error getting users:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to get users'
		)
	}
}

export const getAllUsers = async (): Promise<UserResponse[]> => {
	try {
		const response = await identityClient.get('/users', {
			params: { page: 0, size: 1000 },
		})
		const apiResponse: ApiResponse<PageResponse<UserResponse>> = response.data

		if (apiResponse.data?.content) {
			return apiResponse.data.content
		}
		if (Array.isArray(apiResponse.data)) {
			return apiResponse.data
		}
		return []
	} catch (error: any) {
		console.error('Error getting all users:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to get all users'
		)
	}
}

export const getUserById = async (
	id: number
): Promise<ApiResponse<UserResponse>> => {
	try {
		const response = await identityClient.get(`/users/${id}`)
		return response.data
	} catch (error: any) {
		console.error('Error getting user:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to get user'
		)
	}
}

export const getCurrentUser = async (): Promise<
	ApiResponse<UserResponse>
> => {
	try {
		// Backend identity-service: GET /api/v1/users/profile
		const response = await identityClient.get('/users/profile')
		return response.data
	} catch (error: any) {
		console.error('Error getting current user:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to get current user'
		)
	}
}

export const createUser = async (
	userData: CreateUserRequest
): Promise<ApiResponse<UserResponse>> => {
	try {
		const snakeCaseData = toSnakeCase(userData)
		const response = await identityClient.post('/users', snakeCaseData)
		return response.data
	} catch (error: any) {
		console.error('Error creating user:', error)

		let errorMessage = 'Failed to create user'
		const errorDetails: string[] = []

		if (error.response?.data) {
			const data = error.response.data

			if (
				data.error &&
				typeof data.error === 'object' &&
				!Array.isArray(data.error)
			) {
				Object.keys(data.error).forEach((field) => {
					if (typeof data.error[field] === 'string') {
						errorDetails.push(`${field}: ${data.error[field]}`)
					}
				})
			} else if (data.data?.fieldErrors) {
				const fieldErrors = data.data.fieldErrors
				Object.keys(fieldErrors).forEach((field) => {
					errorDetails.push(`${field}: ${fieldErrors[field]}`)
				})
			} else if (
				data.data &&
				typeof data.data === 'object' &&
				!Array.isArray(data.data)
			) {
				Object.keys(data.data).forEach((field) => {
					if (typeof data.data[field] === 'string') {
						errorDetails.push(`${field}: ${data.data[field]}`)
					}
				})
			} else if (data.errors && Array.isArray(data.errors)) {
				errorDetails.push(
					...data.errors.map((e: any) =>
						e.defaultMessage || e.message || String(e)
					)
				)
			}

			if (data.message) {
				errorMessage = data.message
			} else if (typeof data === 'string') {
				errorMessage = data
			}

			if (errorDetails.length > 0) {
				errorMessage = `${errorMessage}: ${errorDetails.join('; ')}`
			}
		}

		throw new Error(errorMessage)
	}
}

export const updateUser = async (
	id: string,
	userData: UpdateUserRequest
): Promise<ApiResponse<UserResponse>> => {
	try {
		const response = await identityClient.put(`/users/${id}`, userData)
		return response.data
	} catch (error: any) {
		console.error('Error updating user:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to update user'
		)
	}
}

export const updateCurrentUser = async (
	userData: UpdateUserRequest
): Promise<ApiResponse<UserResponse>> => {
	try {
		// Backend identity-service: PUT /api/v1/users/profile
		const response = await identityClient.put('/users/profile', userData)
		return response.data
	} catch (error: any) {
		console.error('Error updating current user:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to update user'
		)
	}
}

export const deleteUser = async (
	id: string
): Promise<ApiResponse<void>> => {
	try {
		const response = await identityClient.delete(`/users/${id}`)
		return response.data
	} catch (error: any) {
		console.error('Error deleting user:', error)
		throw new Error(
			error.response?.data?.message || 'Failed to delete user'
		)
	}
}

const userApi = {
	getUsers,
	getAllUsers,
	getUserById,
	getCurrentUser,
	createUser,
	updateUser,
	updateCurrentUser,
	deleteUser,
}

export default userApi
