// Types cho Certification Management

// Mock certification data type - fully flexible, no required fields
export type Certification = {
	id: string
	title?: string
	name?: string
	description?: string
	level?: string
	category?: string
	icon?: string
	color?: string
	validityPeriod?: number
	issuer?: string
	issuerLogo?: string
	isActive?: boolean
	createdAt?: string
	updatedAt?: string
}
export interface CertificationSection {
	title: string
	certifications: Certification[]
}

export interface CertificateTemplate {
	id: string
	name: string
	description: string
	category: CertificateCategory
	level: CertificateLevel
	requirements: CertificateRequirement[]
	validityPeriod: number // months
	issuer: string
	issuerLogo: string
	templateDesign: TemplateDesign
	metadata: CertificateMetadata
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface IssuedCertificate {
	id: string
	certificateId: string
	certificateName: string
	recipientId: string
	recipientName: string
	recipientEmail: string
	organizationId: string
	organizationName: string
	courseId?: string
	courseName?: string
	issuedAt: string
	expiresAt: string
	status: CertificateStatus
	verificationCode: string
	blockchainHash?: string
	metadata: IssuedCertificateMetadata
	downloadUrl?: string
	viewUrl?: string
}

export type CertificateCategory =
	| 'course_completion'
	| 'skill_assessment'
	| 'professional_development'
	| 'academic_achievement'
	| 'industry_certification'
	| 'soft_skills'
	| 'technical_skills'
	| 'leadership'
	| 'project_management'
	| 'other'
	| 'role'
	| 'skill'

export type CertificateLevel =
	| 'beginner'
	| 'intermediate'
	| 'advanced'
	| 'expert'
	| 'master'
	| 'Cơ bản'
	| 'Trung cấp'
	| 'Nâng cao'
	| 'Basic'
	| 'Intermediate'
	| 'Advanced'

export type CertificateStatus = 
	| 'issued'
	| 'active'
	| 'expired'
	| 'revoked'
	| 'pending'
	| 'suspended'

export interface CertificateRequirement {
	id: string
	type: RequirementType
	description: string
	value: number
	unit: string
	isMandatory: boolean
}

export type RequirementType = 
	| 'course_completion'
	| 'exam_score'
	| 'attendance_rate'
	| 'assignment_submission'
	| 'project_completion'
	| 'time_spent'
	| 'quiz_score'
	| 'peer_review'
	| 'instructor_approval'
	| 'custom'

export interface TemplateDesign {
	layout: 'classic' | 'modern' | 'minimal' | 'creative'
	colors: {
		primary: string
		secondary: string
		accent: string
		text: string
		background: string
	}
	fonts: {
		title: string
		subtitle: string
		body: string
		details: string
	}
	elements: {
		logo: boolean
		signature: boolean
		seal: boolean
		border: boolean
		watermark: boolean
		qrCode: boolean
	}
	dimensions: {
		width: number
		height: number
		unit: 'px' | 'mm' | 'in'
	}
}

export interface CertificateMetadata {
	tags: string[]
	keywords: string[]
	industry: string[]
	prerequisites: string[]
	benefits: string[]
	recognition: string[]
	compliance: string[]
}

export interface IssuedCertificateMetadata {
	score?: number
	grade?: string
	completionDate: string
	issuedBy: string
	issuedByTitle: string
	verificationUrl: string
	additionalInfo?: Record<string, any>
}

export interface CertificateForm {
	name: string
	description: string
	category: CertificateCategory
	level: CertificateLevel
	validityPeriod: number
	issuer: string
	issuerLogo: string
	requirements: CertificateRequirement[]
	templateDesign: TemplateDesign
	metadata: CertificateMetadata
	isActive: boolean
}

export interface CertificateFilters {
	search: string
	category: CertificateCategory | 'all'
	level: CertificateLevel | 'all'
	status: CertificateStatus | 'all'
	organization: string | 'all'
	course: string | 'all'
	issuedFrom?: string
	issuedTo?: string
	expiresFrom?: string
	expiresTo?: string
	isActive: boolean | 'all'
}

export interface CertificateStats {
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
	certificatesByCategory: Array<{ category: CertificateCategory; count: number }>
	certificatesByLevel: Array<{ level: CertificateLevel; count: number }>
	certificatesByStatus: Array<{ status: CertificateStatus; count: number }>
	monthlyIssuance: Array<{ month: string; count: number }>
	topOrganizations: Array<{ organizationId: string; organizationName: string; count: number }>
	topCourses: Array<{ courseId: string; courseName: string; count: number }>
}

export interface CertificateDashboard {
	stats: CertificateStats
	recentCertificates: IssuedCertificate[]
	expiringCertificates: IssuedCertificate[]
	pendingCertificates: IssuedCertificate[]
	popularTemplates: CertificateTemplate[]
	alerts: CertificateAlert[]
}

export interface CertificateAlert {
	id: string
	type: 'expiry_warning' | 'bulk_issue' | 'template_update' | 'verification_failed' | 'system_error'
	severity: 'low' | 'medium' | 'high' | 'critical'
	title: string
	message: string
	certificateId?: string
	organizationId?: string
	timestamp: string
	resolved: boolean
	actionRequired: boolean
}

export interface CertificateActivity {
	id: string
	type: 'issued' | 'revoked' | 'renewed' | 'verified' | 'downloaded' | 'template_created' | 'template_updated'
	certificateId: string
	certificateName: string
	recipientId: string
	recipientName: string
	organizationId: string
	organizationName: string
	userId: string
	userName: string
	description: string
	timestamp: string
	metadata?: Record<string, any>
}

export interface CertificateVerification {
	id: string
	certificateId: string
	verificationCode: string
	verifiedAt: string
	verifiedBy: string
	verificationMethod: 'qr_code' | 'manual' | 'api'
	ipAddress?: string
	userAgent?: string
	isValid: boolean
	details?: string
}

export interface CertificateBulkIssue {
	id: string
	name: string
	description: string
	templateId: string
	recipients: BulkRecipient[]
	organizationId: string
	issuedBy: string
	status: 'pending' | 'processing' | 'completed' | 'failed'
	createdAt: string
	completedAt?: string
	errorMessage?: string
	metadata?: Record<string, any>
}

export interface BulkRecipient {
	recipientId: string
	recipientName: string
	recipientEmail: string
	courseId?: string
	courseName?: string
	customData?: Record<string, any>
}
