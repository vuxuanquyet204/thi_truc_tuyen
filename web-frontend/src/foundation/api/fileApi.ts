/**
 * File Service API layer.
 * Wraps fileService client with typed upload methods.
 *
 * Upload goes through the API Gateway:
 *   POST /files/upload → /api/internal/files/upload (file-service)
 *   POST /files/uploadMultiple → /api/internal/files/uploadMultiple (file-service)
 *
 * IMPORTANT: Never set Content-Type header manually for multipart requests —
 * Axios must set it with the correct boundary parameter.
 */
import { fileClient } from '@/foundation/api/client'
import { FILE_ENDPOINTS } from '@/foundation/api/endpoints'

export interface FileUploadResponse {
	success: boolean
	message?: string
	data: string
}

export interface MultipleFileUploadResponse {
	success: boolean
	message?: string
	data: string[]
}

export const fileApi = {
	/**
	 * Upload a single file to Cloudinary via file-service.
	 * @param file - The File object from <input type="file">
	 * @returns URL of the uploaded file
	 */
	async uploadFile(file: File): Promise<string> {
		const formData = new FormData()
		formData.append('file', file)

		const response = await fileClient.post<FileUploadResponse>(
			FILE_ENDPOINTS.UPLOAD,
			formData
		)
		if (!response.data.success) {
			throw new Error(response.data.message || 'Upload failed')
		}
		return response.data.data
	},

	/**
	 * Upload multiple files to Cloudinary via file-service.
	 * @param files - Array of File objects
	 * @returns Array of URLs of the uploaded files
	 */
	async uploadMultiple(files: File[]): Promise<string[]> {
		const formData = new FormData()
		files.forEach((file) => {
			formData.append('files', file)
		})

		const response = await fileClient.post<MultipleFileUploadResponse>(
			FILE_ENDPOINTS.UPLOAD_MULTIPLE,
			formData
		)
		if (!response.data.success) {
			throw new Error(response.data.message || 'Upload failed')
		}
		return response.data.data
	},
}
