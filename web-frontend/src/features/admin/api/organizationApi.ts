/**
 * Admin Organization API Service
 *
 * Organization management for admin panel.
 * Uses centralized organizationClient from foundation/api.
 */

import { organizationClient } from '@/foundation/api'
import type {
	Organization,
	OrganizationForm,
	OrganizationFilters,
	OrganizationStats,
} from '@/foundation/types/organization'

const transformOrganization = (backendOrg: any): Organization => ({
	id: backendOrg.id?.toString() || '',
	name: backendOrg.name || '',
	description: backendOrg.description || '',
	shortDescription: backendOrg.shortDescription || backendOrg.short_description || '',
	logo: backendOrg.logo || backendOrg.imageUrl || '',
	website: backendOrg.website || '',
	email: backendOrg.email || '',
	phone: backendOrg.phone || '',
	address: backendOrg.address || '',
	city: backendOrg.city || '',
	country: backendOrg.country || 'Viet Nam',
	postalCode: backendOrg.postalCode || backendOrg.postal_code || '',
	type: (backendOrg.orgType || backendOrg.org_type || 'other') as any,
	status: (backendOrg.status || 'active') as any,
	size: (backendOrg.orgSize || backendOrg.org_size || 'small') as any,
	industry: backendOrg.industry || '',
	foundedYear:
		backendOrg.foundedYear ||
		backendOrg.founded_year ||
		new Date().getFullYear(),
	revenue: backendOrg.revenue || 0,
	currency: backendOrg.currency || 'VND',
	employees: backendOrg.employees || 0,
	departments: backendOrg.departments || 0,
	courses: 0,
	students: 0,
	instructors: 0,
	admins: 0,
	subscriptionPlan: (backendOrg.subscriptionPlan ||
		backendOrg.subscription_plan ||
		backendOrg.package ||
		'free') as any,
	subscriptionStatus: (backendOrg.subscriptionStatus ||
		backendOrg.subscription_status ||
		'active') as any,
	subscriptionExpiry:
		backendOrg.subscriptionExpiry ||
		backendOrg.subscription_expiry ||
		new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
	features: [],
	tags: backendOrg.tags || [],
	contactPerson:
		backendOrg.contactPerson ||
		backendOrg.contact_person || {
			name: '',
			title: '',
			email: backendOrg.email || '',
			phone: backendOrg.phone || '',
			department: '',
			isPrimary: true,
		},
	socialMedia: backendOrg.socialMedia || backendOrg.social_media || {},
	settings: backendOrg.settings || {
		timezone: 'Asia/Ho_Chi_Minh',
		language: 'vi',
		dateFormat: 'DD/MM/YYYY',
		currency: 'VND',
		notifications: {
			email: true,
			sms: false,
			push: true,
			marketing: false,
			updates: true,
			security: false,
		},
		privacy: {
			dataSharing: false,
			analytics: true,
			marketing: false,
			thirdParty: false,
		},
		learning: {
			certificates: true,
			badges: false,
			gamification: false,
			socialLearning: false,
			offlineMode: false,
		},
		security: {
			twoFactor: false,
			sso: false,
			passwordPolicy: true,
			sessionTimeout: 480,
			ipWhitelist: false,
		},
	},
	createdAt: backendOrg.createdAt || backendOrg.created_at || new Date().toISOString(),
	updatedAt: backendOrg.updatedAt || backendOrg.updated_at || new Date().toISOString(),
	lastLoginAt:
		backendOrg.lastLoginAt ||
		backendOrg.last_login_at ||
		new Date().toISOString(),
	isActive:
		backendOrg.isActive !== undefined
			? backendOrg.isActive
			: backendOrg.is_active !== undefined
				? backendOrg.is_active
				: true,
	isVerified:
		backendOrg.isVerified !== undefined
			? backendOrg.isVerified
			: backendOrg.is_verified !== undefined
				? backendOrg.is_verified
				: false,
	isPremium:
		backendOrg.isPremium !== undefined
			? backendOrg.isPremium
			: backendOrg.is_premium !== undefined
				? backendOrg.is_premium
				: false,
	verificationStatus:
		(backendOrg.verificationStatus ||
			backendOrg.verification_status ||
			'not_verified') as any,
	notes: backendOrg.notes || '',
})

const transformOrganizationForm = (
	form: any,
	isUpdate = false
): any => {
	const data: any = {
		name: form.name,
		description: form.description,
		short_description: form.shortDescription,
		logo: form.logo,
		website: form.website,
		email: form.email,
		phone: form.phone,
		address: form.address,
		city: form.city,
		country: form.country,
		postal_code: form.postalCode,
		org_type: form.type,
		status: form.status,
		org_size: form.size,
		industry: form.industry,
		founded_year: form.foundedYear,
		revenue: form.revenue,
		currency: form.currency,
		employees: form.employees,
		subscription_plan: form.subscriptionPlan,
		tags: form.tags,
		contact_person: form.contactPerson,
		social_media: form.socialMedia,
		notes: form.notes,
	}

	if (form.verificationStatus !== undefined)
		data.verification_status = form.verificationStatus
	if (form.isVerified !== undefined)
		data.is_verified = form.isVerified
	if (!isUpdate) data.owner_id = 1

	return data
}

export const organizationApi = {
	async getAll(filters?: OrganizationFilters): Promise<Organization[]> {
		try {
			const params: any = {}
			if (filters?.search) params.keyword = filters.search
			if (filters?.type && filters.type !== 'all')
				params.orgType = filters.type
			if (filters?.status && filters.status !== 'all')
				params.status = filters.status
			if (filters?.industry && filters.industry !== 'all')
				params.industry = filters.industry

			const response = await organizationClient.get('/', { params })
			const organizations = response.data.data || []
			return organizations.map(transformOrganization)
		} catch (error: any) {
			console.error('Error fetching organizations:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to fetch organizations'
			)
		}
	},

	async getById(id: string): Promise<Organization> {
		try {
			const response = await organizationClient.get(`/${id}`)
			return transformOrganization(response.data.data)
		} catch (error: any) {
			console.error('Error fetching organization:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to fetch organization'
			)
		}
	},

	async create(form: OrganizationForm): Promise<Organization> {
		try {
			const data = transformOrganizationForm(form, false)
			const response = await organizationClient.post('/', data)
			return transformOrganization(response.data.data)
		} catch (error: any) {
			console.error('Error creating organization:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to create organization'
			)
		}
	},

	async update(
		id: string,
		form: OrganizationForm
	): Promise<Organization> {
		try {
			const data = transformOrganizationForm(form, true)
			const response = await organizationClient.put(`/${id}`, data)
			return transformOrganization(response.data.data)
		} catch (error: any) {
			console.error('Error updating organization:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to update organization'
			)
		}
	},

	async delete(id: string): Promise<void> {
		try {
			await organizationClient.delete(`/${id}`)
		} catch (error: any) {
			console.error('Error deleting organization:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to delete organization'
			)
		}
	},

	async getMembers(orgId: string): Promise<any[]> {
		try {
			const response = await organizationClient.get(`/${orgId}/members`)
			return response.data.data || []
		} catch (error: any) {
			console.error('Error fetching members:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to fetch members'
			)
		}
	},

	async addMember(
		orgId: string,
		userId: string,
		role: string
	): Promise<any> {
		try {
			const response = await organizationClient.post(`/${orgId}/members`, {
				userId,
				role,
			})
			return response.data.data
		} catch (error: any) {
			console.error('Error adding member:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to add member'
			)
		}
	},

	async updateMember(
		orgId: string,
		userId: string,
		updates: any
	): Promise<any> {
		try {
			const response = await organizationClient.patch(
				`/${orgId}/members/${userId}`,
				updates
			)
			return response.data.data
		} catch (error: any) {
			console.error('Error updating member:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to update member'
			)
		}
	},

	async deleteMember(orgId: string, userId: string): Promise<void> {
		try {
			await organizationClient.delete(`/${orgId}/members/${userId}`)
		} catch (error: any) {
			console.error('Error deleting member:', error)
			throw new Error(
				error.response?.data?.message || 'Failed to delete member'
			)
		}
	},

	async getStats(): Promise<OrganizationStats> {
		try {
			const organizations = await this.getAll()
			const stats: OrganizationStats = {
				totalOrganizations: organizations.length,
				activeOrganizations: organizations.filter((o) => o.status === 'active')
					.length,
				inactiveOrganizations: organizations.filter(
					(o) => o.status === 'inactive'
				).length,
				pendingOrganizations: organizations.filter(
					(o) => o.status === 'pending'
				).length,
				verifiedOrganizations: organizations.filter((o) => o.isVerified)
					.length,
				premiumOrganizations: organizations.filter((o) => o.isPremium)
					.length,
				totalEmployees: organizations.reduce((sum, o) => sum + o.employees, 0),
				totalStudents: organizations.reduce((sum, o) => sum + o.students, 0),
				totalCourses: organizations.reduce((sum, o) => sum + o.courses, 0),
				totalRevenue: organizations.reduce((sum, o) => sum + o.revenue, 0),
				averageEmployees:
					organizations.length > 0
						? Math.round(
								organizations.reduce((sum, o) => sum + o.employees, 0) /
									organizations.length
							)
						: 0,
				averageStudents:
					organizations.length > 0
						? Math.round(
								organizations.reduce((sum, o) => sum + o.students, 0) /
									organizations.length
							)
						: 0,
				averageCourses:
					organizations.length > 0
						? Math.round(
								organizations.reduce((sum, o) => sum + o.courses, 0) /
									organizations.length
							)
						: 0,
				topIndustries: [],
				topCountries: [],
				subscriptionDistribution: [],
				sizeDistribution: [],
				monthlyGrowth: [],
			}
			return stats
		} catch (error: any) {
			console.error('Error fetching stats:', error)
			throw new Error('Failed to fetch organization stats')
		}
	},
}

export default organizationApi
