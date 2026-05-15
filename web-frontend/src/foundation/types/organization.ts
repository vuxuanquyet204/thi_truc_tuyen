// Types cho Organization Management

export interface Organization {
	id: string
	name: string
	description: string
	shortDescription: string
	logo: string
	website: string
	email: string
	phone: string
	address: string
	city: string
	country: string
	postalCode: string
	type: OrganizationType
	status: OrganizationStatus
	size: OrganizationSize
	industry: string
	foundedYear: number
	revenue: number
	currency: string
	employees: number
	departments: number
	courses: number
	students: number
	instructors: number
	admins: number
	subscriptionPlan: SubscriptionPlan
	subscriptionStatus: SubscriptionStatus
	subscriptionExpiry: string
	features: OrganizationFeature[]
	tags: string[]
	contactPerson: ContactPerson
	socialMedia: SocialMedia
	settings: OrganizationSettings
	createdAt: string
	updatedAt: string
	lastLoginAt: string
	isActive: boolean
	isVerified: boolean
	isPremium: boolean
	verificationStatus: VerificationStatus
	notes: string
}

export type OrganizationType = 
	| 'university'
	| 'college'
	| 'school'
	| 'training_center'
	| 'corporate'
	| 'ngo'
	| 'government'
	| 'startup'
	| 'enterprise'
	| 'other'

export type OrganizationStatus = 
	| 'active'
	| 'inactive'
	| 'suspended'
	| 'pending'
	| 'archived'

export type OrganizationSize = 
	| 'startup' // 1-10 employees
	| 'small' // 11-50 employees
	| 'medium' // 51-200 employees
	| 'large' // 201-1000 employees
	| 'enterprise' // 1000+ employees

export type SubscriptionPlan = 
	| 'free'
	| 'basic'
	| 'professional'
	| 'enterprise'
	| 'custom'

export type SubscriptionStatus = 
	| 'active'
	| 'expired'
	| 'cancelled'
	| 'pending'
	| 'trial'

export type VerificationStatus = 
	| 'verified'
	| 'pending'
	| 'rejected'
	| 'not_verified'

export interface OrganizationFeature {
	id: string
	name: string
	description: string
	enabled: boolean
	limit?: number
	used?: number
	category: 'learning' | 'management' | 'analytics' | 'integration' | 'security'
}

export interface ContactPerson {
	name: string
	title: string
	email: string
	phone: string
	department: string
	isPrimary: boolean
}

export interface SocialMedia {
	website?: string
	facebook?: string
	twitter?: string
	linkedin?: string
	youtube?: string
	instagram?: string
}

export interface OrganizationSettings {
	timezone: string
	language: string
	dateFormat: string
	currency: string
	notifications: NotificationSettings
	privacy: PrivacySettings
	learning: LearningSettings
	security: SecuritySettings
}

export interface NotificationSettings {
	email: boolean
	sms: boolean
	push: boolean
	marketing: boolean
	updates: boolean
	security: boolean
}

export interface PrivacySettings {
	dataSharing: boolean
	analytics: boolean
	marketing: boolean
	thirdParty: boolean
}

export interface LearningSettings {
	certificates: boolean
	badges: boolean
	gamification: boolean
	socialLearning: boolean
	offlineMode: boolean
}

export interface SecuritySettings {
	twoFactor: boolean
	sso: boolean
	passwordPolicy: boolean
	sessionTimeout: number
	ipWhitelist: boolean
}

export interface OrganizationForm {
	name: string
	description: string
	shortDescription: string
	logo: string
	website: string
	email: string
	phone: string
	address: string
	city: string
	country: string
	postalCode: string
	type: OrganizationType
	status: OrganizationStatus
	size: OrganizationSize
	industry: string
	foundedYear: number
	revenue: number
	currency: string
	employees: number
	subscriptionPlan: SubscriptionPlan
	contactPerson: ContactPerson
	socialMedia: SocialMedia
	tags: string[]
	notes: string
}

export interface OrganizationFilters {
	search: string
	type: OrganizationType | 'all'
	status: OrganizationStatus | 'all'
	size: OrganizationSize | 'all'
	subscriptionPlan: SubscriptionPlan | 'all'
	subscriptionStatus: SubscriptionStatus | 'all'
	verificationStatus: VerificationStatus | 'all'
	industry: string | 'all'
	country: string | 'all'
	city: string | 'all'
	isActive: boolean | 'all'
	isVerified: boolean | 'all'
	isPremium: boolean | 'all'
	createdFrom?: string
	createdTo?: string
	employeesFrom?: number
	employeesTo?: number
	revenueFrom?: number
	revenueTo?: number
	showAdvanced?: boolean
}

export interface OrganizationStats {
	totalOrganizations: number
	activeOrganizations: number
	inactiveOrganizations: number
	pendingOrganizations: number
	verifiedOrganizations: number
	premiumOrganizations: number
	totalEmployees: number
	totalStudents: number
	totalCourses: number
	totalRevenue: number
	averageEmployees: number
	averageStudents: number
	averageCourses: number
	topIndustries: Array<{ industry: string; count: number }>
	topCountries: Array<{ country: string; count: number }>
	subscriptionDistribution: Array<{ plan: SubscriptionPlan; count: number }>
	sizeDistribution: Array<{ size: OrganizationSize; count: number }>
	monthlyGrowth: Array<{ month: string; count: number }>
}

export interface OrganizationDashboard {
	stats: OrganizationStats
	recentOrganizations: Organization[]
	topOrganizations: Organization[]
	expiringSubscriptions: Organization[]
	verificationPending: Organization[]
	alerts: OrganizationAlert[]
}

export interface OrganizationAlert {
	id: string
	type: 'subscription_expiry' | 'verification_pending' | 'inactive_user' | 'security_issue' | 'payment_failed'
	severity: 'low' | 'medium' | 'high' | 'critical'
	title: string
	message: string
	organizationId: string
	organizationName: string
	timestamp: string
	resolved: boolean
	actionRequired: boolean
}

export interface OrganizationActivity {
	id: string
	type: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'verified' | 'subscription_changed' | 'user_added' | 'user_removed'
	organizationId: string
	organizationName: string
	userId: string
	userName: string
	description: string
	timestamp: string
	metadata?: Record<string, any>
}
