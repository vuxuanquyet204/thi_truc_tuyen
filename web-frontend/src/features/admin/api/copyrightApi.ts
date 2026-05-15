/**
 * Admin Copyright API Service
 *
 * Admin-level copyright document management.
 * Uses centralized copyrightClient from foundation/api.
 */

import { copyrightClient } from '@/foundation/api'

const transformDocument = (backendDoc: any): any => {
	return {
		id: backendDoc.id?.toString() || '',
		title: backendDoc.title || '',
		author: backendDoc.author || '',
		description: backendDoc.description || '',
		fileHash: backendDoc.file_hash || backendDoc.fileHash || '',
		blockchainHash: backendDoc.blockchain_hash || backendDoc.blockchainHash || '',
		status: backendDoc.status || 'pending',
		registrationDate:
			backendDoc.registration_date ||
			backendDoc.registrationDate ||
			new Date().toISOString(),
		verificationDate: backendDoc.verification_date || backendDoc.verificationDate,
		metadata: backendDoc.metadata || {},
		createdAt: backendDoc.created_at || backendDoc.createdAt || new Date().toISOString(),
		updatedAt: backendDoc.updated_at || backendDoc.updatedAt || new Date().toISOString(),
	}
}

const transformDocumentForm = (form: any): any => {
	return {
		title: form.title,
		author: form.author,
		description: form.description,
		file_hash: form.fileHash,
		metadata: form.metadata || {},
	}
}

export const copyrightApi = {
	async getAll(filters?: any) {
		try {
			const params: any = {}

			if (filters?.search) {
				params.keyword = filters.search
			}
			if (filters?.status && filters.status !== 'all') {
				params.status = filters.status
			}
			if (filters?.author) {
				params.author = filters.author
			}

			const response = await copyrightClient.get('/', { params })
			const documents = response.data.data || response.data || []
			return documents.map(transformDocument)
		} catch (error: any) {
			console.error('Error fetching documents:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to fetch documents'
			)
		}
	},

	async getById(id: string) {
		try {
			const response = await copyrightClient.get(`/${id}`)
			return transformDocument(response.data.data || response.data)
		} catch (error: any) {
			console.error('Error fetching document:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to fetch document'
			)
		}
	},

	async register(form: any) {
		try {
			const data = transformDocumentForm(form)
			const response = await copyrightClient.post('/', data)
			return {
				success: true,
				data: transformDocument(response.data.data || response.data),
				message: 'Document registered successfully',
			}
		} catch (error: any) {
			console.error('Error registering document:', error)
			return {
				success: false,
				error:
					error.response?.data?.message || 'Failed to register document',
			}
		}
	},

	async update(id: string, form: any) {
		try {
			const data = transformDocumentForm(form)
			const response = await copyrightClient.put(`/${id}`, data)
			return {
				success: true,
				data: transformDocument(response.data.data || response.data),
				message: 'Document updated successfully',
			}
		} catch (error: any) {
			console.error('Error updating document:', error)
			return {
				success: false,
				error:
					error.response?.data?.message || 'Failed to update document',
			}
		}
	},

	async delete(id: string) {
		try {
			await copyrightClient.delete(`/${id}`)
			return {
				success: true,
				message: 'Document deleted successfully',
			}
		} catch (error: any) {
			console.error('Error deleting document:', error)
			return {
				success: false,
				error:
					error.response?.data?.message || 'Failed to delete document',
			}
		}
	},

	async verify(id: string) {
		try {
			const response = await copyrightClient.post(`/${id}/verify`)
			return {
				success: true,
				verified: response.data.verified || false,
				data: response.data,
				message: 'Document verified successfully',
			}
		} catch (error: any) {
			console.error('Error verifying document:', error)
			return {
				success: false,
				verified: false,
				error:
					error.response?.data?.message || 'Failed to verify document',
			}
		}
	},

	async getStats() {
		try {
			const response = await copyrightClient.get('/stats')
			return (
				response.data.data ||
				response.data || {
					totalDocuments: 0,
					totalVerified: 0,
					disputedDocuments: 0,
					blockchainTransactions: 0,
				}
			)
		} catch (error: any) {
			console.error('Error fetching stats:', error)
			throw new Error('Failed to fetch copyright stats')
		}
	},

	async export(options: any) {
		try {
			const response = await copyrightClient.post('/export', options, {
				responseType: 'blob',
			})

			const url = window.URL.createObjectURL(new Blob([response.data]))
			const link = document.createElement('a')
			link.href = url
			link.setAttribute(
				'download',
				`copyright-documents-${Date.now()}.xlsx`
			)
			document.body.appendChild(link)
			link.click()
			link.remove()

			return {
				success: true,
				message: 'Documents exported successfully',
			}
		} catch (error: any) {
			console.error('Error exporting documents:', error)
			return {
				success: false,
				message:
					error.response?.data?.message || 'Failed to export documents',
			}
		}
	},
}

export default copyrightApi
