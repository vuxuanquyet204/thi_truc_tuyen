/**
 * Certificate Admin API
 *
 * API client for Certificate Service endpoints.
 * Full URL: /course/api/v1/certificates/**
 */

import { courseClient } from '@/foundation/api'
import {
	CertificateTemplate,
	IssuedCertificate,
	CertificateStats,
	CertificateDashboard,
	CertificateStatus,
	CertificateCategory,
	CertificateLevel,
	CertificateFilters,
	CertificateForm,
	CertificateTemplate as CertTemplateType,
} from '@/foundation/types/certification'

// ========== API RESPONSE INTERFACES ==========

interface ApiResponse<T> {
	success: boolean
	message?: string
	data: T
}

interface PageResponse<T> {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

interface CertificateTemplateResponse {
	id: string
	organizationId: string
	courseId: string
	courseName: string
	name: string
	description: string
	backgroundImageUrl: string
	borderStyle: string
	logoUrl: string
	signatureUrl: string
	isDefault: boolean
	isActive: boolean
	category: string
	level: string
	validityPeriod: number
	issuer: string
	issuerLogoUrl: string
	requirements: string
	templateDesign: string
	metadata: string
	createdAt: string
	updatedAt: string
}

interface IssuedCertificateResponse {
	id: string
	templateId: string
	templateName: string
	userId: string
	recipientId: string
	recipientName: string
	recipientEmail: string
	organizationId: string
	organizationName: string
	courseId: string
	courseName: string
	certificateNumber: string
	issuedBy: string
	issuedAt: string
	expiresAt: string
	status: string
	verificationCode: string
	verificationUrl: string
	blockchainHash: string
	downloadUrl: string
	viewUrl: string
	metadata: string
	createdAt: string
	updatedAt: string
}

interface CertificateStatsResponse {
	totalTemplates: number
	activeTemplates: number
	totalIssued: number
	activeCertificates: number
	expiredCertificates: number
	revokedCertificates: number
	pendingCertificates: number
	totalRecipients: number
	totalOrganizations: number
	averageValidityPeriod: number
	mostPopularCategory: string
	mostPopularLevel: string
	certificatesByCategory: Array<{ category: string; count: number }>
	certificatesByLevel: Array<{ level: string; count: number }>
	certificatesByStatus: Array<{ status: string; count: number }>
	monthlyIssuance: Array<{ month: string; count: number }>
}

// ========== API FUNCTIONS ==========

export async function fetchCertificateTemplates(
	page = 0,
	size = 20,
	category?: string,
	level?: string
): Promise<CertificateTemplateResponse[]> {
	const params = new URLSearchParams()
	params.append('page', String(page))
	params.append('size', String(size))
	if (category) params.append('category', category)
	if (level) params.append('level', level)

	const { data } = await courseClient.get<ApiResponse<PageResponse<CertificateTemplateResponse>>>(
		`/api/v1/certificates/templates?${params}`
	)
	return data.success ? data.data.content : []
}

export async function fetchCertificateTemplateById(id: string): Promise<CertificateTemplateResponse | null> {
	try {
		const { data } = await courseClient.get<ApiResponse<CertificateTemplateResponse>>(
			`/api/v1/certificates/templates/${id}`
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function createCertificateTemplate(
	request: Partial<CertificateTemplateResponse>
): Promise<CertificateTemplateResponse | null> {
	try {
		const { data } = await courseClient.post<ApiResponse<CertificateTemplateResponse>>(
			'/api/v1/certificates/templates',
			request
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function updateCertificateTemplate(
	id: string,
	request: Partial<CertificateTemplateResponse>
): Promise<CertificateTemplateResponse | null> {
	try {
		const { data } = await courseClient.put<ApiResponse<CertificateTemplateResponse>>(
			`/api/v1/certificates/templates/${id}`,
			request
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function deleteCertificateTemplate(id: string): Promise<boolean> {
	try {
		await courseClient.delete(`/api/v1/certificates/templates/${id}`)
		return true
	} catch {
		return false
	}
}

export async function toggleCertificateTemplateStatus(id: string): Promise<CertificateTemplateResponse | null> {
	try {
		const { data } = await courseClient.patch<ApiResponse<CertificateTemplateResponse>>(
			`/api/v1/certificates/templates/${id}/toggle`
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function fetchIssuedCertificates(
	page = 0,
	size = 20,
	search?: string,
	status?: string
): Promise<IssuedCertificateResponse[]> {
	const params = new URLSearchParams()
	params.append('page', String(page))
	params.append('size', String(size))
	if (search) params.append('search', search)
	if (status) params.append('status', status)

	const { data } = await courseClient.get<ApiResponse<PageResponse<IssuedCertificateResponse>>>(
		`/api/v1/certificates/issued?${params}`
	)
	return data.success ? data.data.content : []
}

export async function fetchIssuedCertificateById(id: string): Promise<IssuedCertificateResponse | null> {
	try {
		const { data } = await courseClient.get<ApiResponse<IssuedCertificateResponse>>(
			`/api/v1/certificates/issued/${id}`
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function issueCertificate(request: {
	userId: string
	profileId: string
	courseId: string
	recipientName: string
	recipientEmail?: string
}): Promise<IssuedCertificateResponse | null> {
	try {
		const { data } = await courseClient.post<ApiResponse<IssuedCertificateResponse>>(
			'/api/v1/certificates/issued',
			request
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function updateCertificateStatus(id: string, status: string): Promise<IssuedCertificateResponse | null> {
	try {
		const { data } = await courseClient.patch<ApiResponse<IssuedCertificateResponse>>(
			`/api/v1/certificates/issued/${id}/status?status=${status}`
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function deleteCertificate(id: string): Promise<boolean> {
	try {
		await courseClient.delete(`/api/v1/certificates/issued/${id}`)
		return true
	} catch {
		return false
	}
}

export async function fetchCertificateStats(): Promise<CertificateStatsResponse | null> {
	try {
		const { data } = await courseClient.get<ApiResponse<CertificateStatsResponse>>(
			'/api/v1/certificates/stats'
		)
		return data.success ? data.data : null
	} catch {
		return null
	}
}

export async function verifyCertificate(certificateNumber: string): Promise<{
	isValid: boolean
	message: string
} | null> {
	try {
		const { data } = await courseClient.get(
			`/api/v1/certificates/verify/${certificateNumber}`
		)
		return data.success
			? { isValid: data.data.isValid, message: data.data.message }
			: null
	} catch {
		return null
	}
}

// ========== MAPPERS ==========

export function mapTemplateToFrontend(response: CertificateTemplateResponse): CertificateTemplate {
	return {
		id: response.id,
		name: response.name,
		description: response.description,
		level: response.level as CertificateLevel,
		category: response.category as CertificateCategory,
		icon: '',
		color: '',
		validityPeriod: response.validityPeriod,
		issuer: response.issuer,
		issuerLogo: response.issuerLogoUrl,
		isActive: response.isActive,
		createdAt: response.createdAt,
		updatedAt: response.updatedAt,
	}
}

export function mapIssuedCertificateToFrontend(response: IssuedCertificateResponse): IssuedCertificate {
	return {
		id: response.id,
		certificateId: response.templateId,
		certificateName: response.templateName,
		recipientId: response.recipientId,
		recipientName: response.recipientName,
		recipientEmail: response.recipientEmail,
		organizationId: response.organizationId,
		organizationName: response.organizationName,
		courseId: response.courseId,
		courseName: response.courseName,
		issuedAt: response.issuedAt,
		expiresAt: response.expiresAt,
		status: response.status as CertificateStatus,
		verificationCode: response.verificationCode,
		blockchainHash: response.blockchainHash,
		downloadUrl: response.downloadUrl,
		viewUrl: response.viewUrl,
		metadata: response.metadata ? JSON.parse(response.metadata) : {},
	}
}

export function mapStatsToFrontend(response: CertificateStatsResponse): CertificateStats {
	return {
		totalTemplates: response.totalTemplates,
		activeTemplates: response.activeTemplates,
		totalIssued: response.totalIssued,
		activeCertificates: response.activeCertificates,
		expiredCertificates: response.expiredCertificates,
		revokedCertificates: response.revokedCertificates,
		pendingCertificates: response.pendingCertificates,
		totalRecipients: response.totalRecipients,
		totalOrganizations: response.totalOrganizations,
		averageValidityPeriod: response.averageValidityPeriod,
		mostPopularCategory: response.mostPopularCategory,
		mostPopularLevel: response.mostPopularLevel,
		certificatesByCategory: response.certificatesByCategory.map((c) => ({
			category: c.category as CertificateCategory,
			count: c.count,
		})),
		certificatesByLevel: response.certificatesByLevel.map((l) => ({
			level: l.level as CertificateLevel,
			count: l.count,
		})),
		certificatesByStatus: response.certificatesByStatus.map((s) => ({
			status: s.status as CertificateStatus,
			count: s.count,
		})),
		monthlyIssuance: response.monthlyIssuance,
		topOrganizations: [],
		topCourses: [],
	}
}
