/**
 * Copyright Service
 *
 * Copyright document management through the API Gateway.
 * Uses centralized copyrightClient from foundation/api.
 */

import { copyrightClient } from '@/foundation/api'
import type {
	DocumentMetadata,
	RegistrationResult,
	VerificationResult,
} from './blockchainCopyrightService'

export const copyrightApi = copyrightClient

class CopyrightService {
	async registerDocument(
		fileOrFormData: File | FormData,
		metadata?: DocumentMetadata
	): Promise<any> {
		let formData: FormData
		if (fileOrFormData instanceof FormData) {
			formData = fileOrFormData
		} else {
			formData = new FormData()
			formData.append('file', fileOrFormData)
			if (metadata) {
				formData.append('metadata', JSON.stringify(metadata))
			}
		}
		const response = await copyrightApi.post('/', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response.data
	}

	async getBlockchainStatus(): Promise<any> {
		const response = await copyrightApi.get('/blockchain/status')
		return response.data
	}

	async getAllCopyrights(): Promise<any> {
		const response = await copyrightApi.get('/')
		return response.data
	}

	async getCopyrightById(id: string): Promise<any> {
		const response = await copyrightApi.get(`/${id}`)
		return response.data
	}

	async updateCopyright(
		id: string,
		updates: Partial<DocumentMetadata>
	): Promise<any> {
		const response = await copyrightApi.put(`/${id}`, updates)
		return response.data
	}

	async deleteCopyright(id: string): Promise<any> {
		const response = await copyrightApi.delete(`/${id}`)
		return response.data
	}

	async checkSimilarity(formData: FormData): Promise<any> {
		const response = await copyrightApi.post('/check-similarity', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response.data
	}

	async searchDocuments(query: string): Promise<any> {
		const response = await copyrightApi.get('/search', {
			params: { filename: query },
		})
		return response.data
	}

	async healthCheck(): Promise<{ status: string }> {
		const response = await copyrightApi.get('/health')
		return response.data
	}

	async getStatistics(): Promise<any> {
		const response = await copyrightApi.get('/stats')
		return response.data
	}

	async getAnalytics(): Promise<any> {
		const response = await copyrightApi.get('/analytics')
		return response.data
	}

	async getDocumentsByOwner(
		ownerAddress: string,
		params?: { page?: number; limit?: number }
	): Promise<any> {
		const response = await copyrightApi.get(`/owner/${ownerAddress}`, { params })
		return response.data
	}

	async getRecentDocuments(limit?: number): Promise<any> {
		const response = await copyrightApi.get('/recent', { params: { limit } })
		return response.data
	}

	async getAllDocuments(params?: {
		page?: number
		limit?: number
		category?: string
		ownerAddress?: string
		verified?: boolean
		sortBy?: string
		sortOrder?: 'ASC' | 'DESC'
	}): Promise<any> {
		const response = await copyrightApi.get('/', { params })
		return response.data
	}

	async connectWallet(): Promise<boolean> {
		return false
	}
}

export const copyrightService = new CopyrightService()
export default copyrightService
