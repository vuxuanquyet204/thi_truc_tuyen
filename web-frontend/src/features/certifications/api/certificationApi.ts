/**
 * Certification API Service
 *
 * Maps to Certificate endpoints in course-service.
 * Course-service base: /course/api/v1
 * Certificate routes: /certificates/templates, /certificates/templates/{id}, etc.
 */

import { courseClient } from '@/foundation/api'

// ============================================================
// Types - match CertificateTemplateResponse from course-service
// ============================================================

export interface CertificationFAQ {
	id: string
	question: string
	answer: string
}

export interface CertificationDetailResponse {
	id: string
	title: string
	subtitle?: string
	description: string
	duration: string
	questions: string
	level: string
	category: string
	icon: string
	color: string
	benefits: string[]
	requirements: string[]
	topics: string[]
	faqs: CertificationFAQ[]
	companyLogos?: string[]
	testimonialCount?: string
}

export interface CertificationListItem {
	id: string
	title: string
	description: string
	level: string
	category: string
	icon: string
	color: string
	duration: string
	questions: string
	benefits: string[]
	requirements: string[]
	topics: string[]
}

// ============================================================
// Internal API types (mirror Spring ApiResponse<Page<T>>)
// ============================================================

interface SpringPageResponse<T> {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
	first: boolean
	last: boolean
}

interface ApiResponse<T> {
	success: boolean
	message: string
	data: T
}

// ============================================================
// Map backend CertificateTemplateResponse → CertificationListItem
// ============================================================

interface BackendTemplateResponse {
	id: string
	organizationId?: string
	courseId?: string
	courseName?: string
	name: string
	description?: string
	backgroundImageUrl?: string
	borderStyle?: string
	logoUrl?: string
	signatureUrl?: string
	isDefault?: boolean
	isActive?: boolean
	category?: string
	level?: string
	validityPeriod?: number
	issuer?: string
	issuerLogoUrl?: string
	requirements?: string
	templateDesign?: string
	metadata?: string
	createdAt?: string
	updatedAt?: string
}

const mapToCertificationListItem = (t: BackendTemplateResponse): CertificationListItem => {
	return {
		id: t.id,
		title: t.name ?? '',
		description: t.description ?? '',
		level: t.level ?? 'BEGINNER',
		category: t.category ?? 'skill',
		icon: t.logoUrl ?? 'certificate',
		color: '#4F46E5',
		duration: t.validityPeriod ? `${t.validityPeriod} months` : '12 months',
		questions: '0',
		benefits: [],
		requirements: t.requirements ? [t.requirements] : [],
		topics: [],
	}
}

// ============================================================
// API Methods
// ============================================================

export const certificationApiService = {

	/**
	 * Fetch all public certificate templates (for public CertifyPage).
	 * GET /course/api/v1/certificates/templates/public
	 */
	async getAll(): Promise<CertificationListItem[]> {
		const response = await courseClient.get<ApiResponse<SpringPageResponse<BackendTemplateResponse>>>(
			'/certificates/templates/public',
			{ params: { page: 0, size: 100 } }
		)
		const nested = response.data.data as unknown as SpringPageResponse<BackendTemplateResponse>
		if (!Array.isArray(nested?.content)) {
			throw new Error('Invalid response from certificate service')
		}
		return nested.content.map(mapToCertificationListItem)
	},

	/**
	 * Fetch a single public certificate template.
	 * GET /course/api/v1/certificates/templates/public/{id}
	 */
	async getById(id: string): Promise<CertificationDetailResponse> {
		const response = await courseClient.get<ApiResponse<BackendTemplateResponse>>(
			`/certificates/templates/public/${id}`
		)
		const t = response.data.data as unknown as BackendTemplateResponse
		return {
			id: t.id,
			title: t.name ?? '',
			subtitle: t.courseName ?? undefined,
			description: t.description ?? '',
			duration: t.validityPeriod ? `${t.validityPeriod} months` : '12 months',
			questions: '0',
			level: t.level ?? 'BEGINNER',
			category: t.category ?? 'skill',
			icon: t.logoUrl ?? 'certificate',
			color: '#4F46E5',
			benefits: [],
			requirements: t.requirements ? [t.requirements] : [],
			topics: [],
			faqs: [],
			companyLogos: undefined,
			testimonialCount: undefined,
		}
	},
}

export default certificationApiService
