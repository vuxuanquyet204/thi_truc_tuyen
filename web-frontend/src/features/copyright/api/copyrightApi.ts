/**
 * Copyright API Service
 *
 * Frontend wrapper for the copyright-service backend.
 * Maps frontend expectations to actual backend endpoints.
 * Backend base: /api/copyrights
 */

import { copyrightClient } from '@/foundation/api'

// ============================================================
// Backend response shape (what copyright-service actually returns)
// ============================================================

export interface BackendCopyright {
	id: string
	filename: string
	storedFilename?: string
	hash: string
	contentHash?: string
	transactionHash?: string
	mimeType?: string
	fileSize?: number
	title?: string
	author?: string
	description?: string
	category?: string
	ownerAddress?: string
	ownerUsername?: string
	ownerEmail?: string
	tags?: string
	createdAt: string
	updatedAt: string
}

export interface BackendPagination {
	total: number
	page: number
	limit: number
	totalPages: number
}

export interface BackendListResponse {
	success: boolean
	data: BackendCopyright[]
	pagination: BackendPagination
}

export interface BackendSingleResponse {
	success: boolean
	data: BackendCopyright
}

export interface BackendVerifyResponse {
	success: boolean
	data: {
		id: string
		hash: string
		ownerAddress: string
		transactionHash?: string
		filename: string
		title?: string
		author?: string
		createdAt: string
		isOnChain: boolean
	}
}

// ============================================================
// Transform helpers - convert backend shape to frontend shape
// ============================================================

const transformCopyright = (backend: BackendCopyright): any => ({
	id: backend.id,
	title: backend.title || backend.filename || '',
	author: backend.author || '',
	description: backend.description || '',
	hash: backend.hash,
	blockchainHash: backend.transactionHash || '',
	transactionHash: backend.transactionHash || undefined,
	status: backend.transactionHash ? 'verified' : 'pending',
	registrationDate: backend.createdAt,
	createdAt: backend.createdAt,
	updatedAt: backend.updatedAt,
	metadata: {
		category: backend.category || 'other',
		keywords: [],
		language: 'vi',
		version: '1.0',
		license: 'copyright' as const,
	},
})

// ============================================================
// Error extraction helpers
// ============================================================

const extractError = (error: unknown): string => {
	if (typeof error === 'object' && error !== null && 'message' in error) {
		return String((error as { message: unknown }).message)
	}
	return 'An error occurred'
}

const extractStatus = (error: unknown): number | undefined => {
	if (typeof error === 'object' && error !== null && 'response' in error) {
		return (error as { response?: { status?: number } }).response?.status
	}
	return undefined
}

// ============================================================
// Copyright API Service
// ============================================================

export const copyrightApiService = {
	/** POST /api/copyrights/register-text - Register text content as a copyright */
	async registerTextDocument(
		content: string,
		metadata: { title?: string; author?: string; description?: string; category?: string }
	): Promise<any> {
		const response = await copyrightClient.post<any>('/register-text', {
			content,
			...metadata,
		})
		return response.data
	},

	/** POST /api/copyrights/hash/:hash/verify - Verify copyright by hash */
	async verifyDocument(documentHash: string): Promise<BackendVerifyResponse> {
		const response = await copyrightClient.post<BackendVerifyResponse>(
			`/hash/${documentHash}/verify`
		)
		return response.data
	},

	/** GET /api/copyrights/hash/:hash - Get document by hash (NOT /document/:hash) */
	async getDocument(documentHash: string): Promise<BackendCopyright> {
		const response = await copyrightClient.get<BackendCopyright>(`/hash/${documentHash}`)
		return response.data
	},

	/** GET /api/copyrights/exists/:hash - Check if document exists by hash */
	async documentExists(documentHash: string): Promise<{ exists: boolean; copyright: BackendCopyright | null }> {
		const response = await copyrightClient.get<{ exists: boolean; copyright: BackendCopyright | null }>(
			`/exists/${documentHash}`
		)
		return response.data
	},

	/** GET /api/copyrights/user/:address - Get all documents for a user */
	async getUserDocuments(
		address: string,
		page: number = 1,
		limit: number = 20
	): Promise<BackendListResponse> {
		const response = await copyrightClient.get<BackendListResponse>(`/user/${address}`, {
			params: { page, limit },
		})
		return response.data
	},

	/** GET /api/copyrights/category/:category - Get documents by category */
	async getCategoryDocuments(
		category: string,
		page: number = 1,
		limit: number = 20
	): Promise<BackendListResponse> {
		const response = await copyrightClient.get<BackendListResponse>(`/category/${category}`, {
			params: { page, limit },
		})
		return response.data
	},

	/** POST /api/copyrights/search - Search copyrights */
	async searchDocuments(
		filters: {
			filename?: string
			hash?: string
			ownerAddress?: string
			category?: string
		},
		page: number = 1,
		limit: number = 20
	): Promise<BackendListResponse> {
		const response = await copyrightClient.post<BackendListResponse>('/search', {
			...filters,
			page,
			limit,
		})
		return response.data
	},

	/** GET /api/copyrights/stats - Get copyright statistics */
	async getStatistics(): Promise<any> {
		const response = await copyrightClient.get('/stats')
		return response.data
	},

	/** GET /api/copyrights/analytics - Get analytics data */
	async getAnalytics(dateFrom?: number, dateTo?: number): Promise<any> {
		const response = await copyrightClient.get('/analytics', {
			params: { dateFrom, dateTo },
		})
		return response.data
	},

	/** PUT /api/copyrights/document/:hash - Update document metadata by hash */
	async updateDocument(
		documentHash: string,
		field: 'title' | 'description',
		value: string
	): Promise<any> {
		const response = await copyrightClient.put(`/document/${documentHash}`, {
			[field]: value,
		})
		return response.data
	},

	/** PUT /api/copyrights/document/:hash/tags - Update document tags by hash */
	async updateDocumentTags(
		documentHash: string,
		tags: string[]
	): Promise<any> {
		const response = await copyrightClient.put(`/document/${documentHash}/tags`, { tags })
		return response.data
	},

	/** DELETE /api/copyrights/document/:hash - Deactivate/delete document by hash */
	async deactivateDocument(documentHash: string): Promise<any> {
		const response = await copyrightClient.delete(`/document/${documentHash}`)
		return response.data
	},

	/** POST /api/copyrights/hash/calculate - Calculate SHA-256 hash of uploaded file */
	async calculateFileHash(file: File): Promise<{ success: boolean; hash: string }> {
		const formData = new FormData()
		formData.append('file', file)
		const response = await copyrightClient.post<{ success: boolean; hash: string }>(
			'/hash/calculate',
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return response.data
	},

	/** POST /api/copyrights/hash/text - Calculate SHA-256 hash of text content */
	async calculateTextHash(content: string): Promise<{ success: boolean; hash: string }> {
		const response = await copyrightClient.post<{ success: boolean; hash: string }>(
			'/hash/text',
			{ content }
		)
		return response.data
	},

	/** GET /api/copyrights/transactions/:address - Get transaction history for an address */
	async getTransactionHistory(
		address: string,
		page: number = 1,
		limit: number = 20
	): Promise<any> {
		const response = await copyrightClient.get(`/transactions/${address}`, {
			params: { page, limit },
		})
		return response.data
	},

	/** GET /api/copyrights/fees - Get current registration fees */
	async getTransactionFees(): Promise<any> {
		const response = await copyrightClient.get('/fees')
		return response.data
	},

	/** GET /api/copyrights/transaction/:hash/status - Get transaction status */
	async getTransactionStatus(transactionHash: string): Promise<any> {
		const response = await copyrightClient.get(`/transaction/${transactionHash}/status`)
		return response.data
	},

	/** GET /api/copyrights/contract/info - Get smart contract information */
	async getContractInfo(): Promise<any> {
		const response = await copyrightClient.get('/contract/info')
		return response.data
	},

	/** GET /api/copyrights/contract/events - Get smart contract events */
	async getContractEvents(
		eventType?: string,
		fromBlock?: number,
		toBlock?: number
	): Promise<any> {
		const response = await copyrightClient.get('/contract/events', {
			params: { eventType, fromBlock, toBlock },
		})
		return response.data
	},

	/** POST /api/copyrights/export - Export copyright data */
	async exportData(format: 'json' | 'csv', filters?: any): Promise<any> {
		if (format === 'csv') {
			const response = await copyrightClient.post('/export', { format, filters }, {
				responseType: 'blob',
			})
			return response.data
		}
		const response = await copyrightClient.post('/export', { format, filters })
		return response.data
	},

	/** POST /api/copyrights/import - Import copyright data */
	async importData(
		file: File,
		options: { validateHashes: boolean; skipExisting: boolean }
	): Promise<any> {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('options', JSON.stringify(options))
		const response = await copyrightClient.post('/import', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response.data
	},

	/** GET /api/copyrights/reports - Get copyright reports */
	async getReport(type: 'daily' | 'weekly' | 'monthly' | 'yearly', date?: string): Promise<any> {
		const response = await copyrightClient.get('/reports', {
			params: { type, date },
		})
		return response.data
	},

	/** POST /api/copyrights/notifications - Send copyright notifications */
	async sendNotification(
		type: 'email' | 'push',
		recipients: string[],
		message: string
	): Promise<any> {
		const response = await copyrightClient.post('/notifications', {
			type,
			recipients,
			message,
		})
		return response.data
	},

	/** GET /api/copyrights/ - List all copyrights (alias for getAllCopyrights) */
	async getAllCopyrights(params?: {
		page?: number
		limit?: number
		category?: string
		ownerAddress?: string
		verified?: boolean
	}): Promise<BackendListResponse> {
		const response = await copyrightClient.get<BackendListResponse>('/', { params })
		return response.data
	},

	/** GET /api/copyrights/:id - Get copyright by ID (UUID) */
	async getCopyrightById(id: string): Promise<BackendCopyright> {
		const response = await copyrightClient.get<BackendCopyright>(`/${id}`)
		return response.data
	},
}

export default copyrightApiService
