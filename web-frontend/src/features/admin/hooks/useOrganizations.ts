import { useState, useEffect, useCallback } from 'react'
import {
	Organization,
	OrganizationForm,
	OrganizationFilters,
	OrganizationDashboard,
	OrganizationStatus,
	OrganizationSize,
	VerificationStatus,
} from '@/foundation/types'
import organizationApi from '@/features/organizations/api'
import type { SubscriptionPlan } from '@/foundation/types/organization'

// Initial empty dashboard
const initialDashboard: OrganizationDashboard = {
	stats: {
		totalOrganizations: 0,
		activeOrganizations: 0,
		inactiveOrganizations: 0,
		pendingOrganizations: 0,
		verifiedOrganizations: 0,
		premiumOrganizations: 0,
		totalEmployees: 0,
		totalStudents: 0,
		totalCourses: 0,
		totalRevenue: 0,
		averageEmployees: 0,
		averageStudents: 0,
		averageCourses: 0,
		topIndustries: [],
		topCountries: [],
		subscriptionDistribution: [],
		sizeDistribution: [],
		monthlyGrowth: []
	},
	recentOrganizations: [],
	topOrganizations: [],
	expiringSubscriptions: [],
	verificationPending: [],
	alerts: []
}

export default function useOrganizations() {
	const [organizations, setOrganizations] = useState<Organization[]>([])
	const [dashboard, setDashboard] = useState<OrganizationDashboard>(initialDashboard)
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState<OrganizationFilters>({
		search: '',
		type: 'all',
		status: 'all',
		size: 'all',
		subscriptionPlan: 'all',
		subscriptionStatus: 'all',
		verificationStatus: 'all',
		industry: 'all',
		country: 'all',
		city: 'all',
		isActive: 'all',
		isVerified: 'all',
		isPremium: 'all',
		showAdvanced: false
	})

	// Filter organizations based on current filters
	const filteredOrganizations = organizations.filter(organization => {
		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase()
			if (!organization.name.toLowerCase().includes(searchLower) &&
				!organization.shortDescription.toLowerCase().includes(searchLower) &&
				!organization.industry.toLowerCase().includes(searchLower) &&
				!organization.city.toLowerCase().includes(searchLower) &&
				!organization.country.toLowerCase().includes(searchLower)) {
				return false
			}
		}

		// Type filter
		if (filters.type !== 'all' && organization.type !== filters.type) {
			return false
		}

		// Status filter
		if (filters.status !== 'all' && organization.status !== filters.status) {
			return false
		}

		// Size filter
		if (filters.size !== 'all' && organization.size !== filters.size) {
			return false
		}

		// Subscription plan filter
		if (filters.subscriptionPlan !== 'all' && organization.subscriptionPlan !== filters.subscriptionPlan) {
			return false
		}

		// Subscription status filter
		if (filters.subscriptionStatus !== 'all' && organization.subscriptionStatus !== filters.subscriptionStatus) {
			return false
		}

		// Verification status filter
		if (filters.verificationStatus !== 'all' && organization.verificationStatus !== filters.verificationStatus) {
			return false
		}

		// Industry filter
		if (filters.industry !== 'all' && organization.industry !== filters.industry) {
			return false
		}

		// Country filter
		if (filters.country !== 'all' && organization.country !== filters.country) {
			return false
		}

		// City filter
		if (filters.city !== 'all' && organization.city !== filters.city) {
			return false
		}

		// Active filter
		if (filters.isActive !== 'all' && organization.isActive !== filters.isActive) {
			return false
		}

		// Verified filter
		if (filters.isVerified !== 'all' && organization.isVerified !== filters.isVerified) {
			return false
		}

		// Premium filter
		if (filters.isPremium !== 'all' && organization.isPremium !== filters.isPremium) {
			return false
		}

		// Date range filters
		if (filters.createdFrom) {
			const createdDate = new Date(organization.createdAt)
			const fromDate = new Date(filters.createdFrom)
			if (createdDate < fromDate) {
				return false
			}
		}

		if (filters.createdTo) {
			const createdDate = new Date(organization.createdAt)
			const toDate = new Date(filters.createdTo)
			if (createdDate > toDate) {
				return false
			}
		}

		// Employee range filters
		if (filters.employeesFrom !== undefined && organization.employees < filters.employeesFrom) {
			return false
		}

		if (filters.employeesTo !== undefined && organization.employees > filters.employeesTo) {
			return false
		}

		// Revenue range filters
		if (filters.revenueFrom !== undefined && organization.revenue < filters.revenueFrom) {
			return false
		}

		if (filters.revenueTo !== undefined && organization.revenue > filters.revenueTo) {
			return false
		}

		return true
	})

	// Update filters
	const updateFilter = useCallback((key: keyof OrganizationFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}, [])

	// Clear all filters
	const clearFilters = useCallback(() => {
		setFilters({
			search: '',
			type: 'all',
			status: 'all',
			size: 'all',
			subscriptionPlan: 'all',
			subscriptionStatus: 'all',
			verificationStatus: 'all',
			industry: 'all',
			country: 'all',
			city: 'all',
			isActive: 'all',
			isVerified: 'all',
			isPremium: 'all',
			showAdvanced: false
		})
	}, [])

	// Fetch organizations from API
	const fetchOrganizations = useCallback(async () => {
		try {
			setLoading(true)
			const data = await organizationApi.getAll(filters)
			setOrganizations(data)
		} catch (error) {
			console.error('Error fetching organizations:', error)
		} finally {
			setLoading(false)
		}
	}, [filters])

	// Add new organization
	const addOrganization = useCallback(async (organizationForm: OrganizationForm) => {
		try {
			setLoading(true)
			const newOrganization = await organizationApi.create(organizationForm)
			setOrganizations(prev => [newOrganization, ...prev])
			updateDashboardStats()
		} catch (error) {
			console.error('Error adding organization:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}, [])

	// Update organization
	const updateOrganization = useCallback(async (organizationForm: OrganizationForm, organizationId: string) => {
		try {
			setLoading(true)
			const updated = await organizationApi.update(organizationId, organizationForm)
			setOrganizations(prev => prev.map(org => 
				org.id === organizationId ? updated : org
			))
			updateDashboardStats()
		} catch (error) {
			console.error('Error updating organization:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}, [])

	// Delete organization
	const deleteOrganization = useCallback(async (organizationId: string) => {
		try {
			setLoading(true)
			await organizationApi.delete(organizationId)
			setOrganizations(prev => prev.filter(org => org.id !== organizationId))
			updateDashboardStats()
		} catch (error) {
			console.error('Error deleting organization:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}, [])

	// Toggle organization status
	const toggleOrganizationStatus = useCallback(async (organizationId: string, newStatus: OrganizationStatus) => {
		try {
			const org = organizations.find(o => o.id === organizationId)
			if (!org) return

			const form: OrganizationForm = {
				name: org.name,
				description: org.description,
				shortDescription: org.shortDescription,
				logo: org.logo,
				website: org.website,
				email: org.email,
				phone: org.phone,
				address: org.address,
				city: org.city,
				country: org.country,
				postalCode: org.postalCode,
				type: org.type,
				status: newStatus,
				size: org.size,
				industry: org.industry,
				foundedYear: org.foundedYear,
				revenue: org.revenue,
				currency: org.currency,
				employees: org.employees,
				subscriptionPlan: org.subscriptionPlan,
				contactPerson: org.contactPerson,
				socialMedia: org.socialMedia,
				tags: org.tags,
				notes: org.notes
			}

			await updateOrganization(form, organizationId)
		} catch (error) {
			console.error('Error toggling status:', error)
			throw error
		}
	}, [organizations, updateOrganization])

	// Toggle organization verification status
	const toggleOrganizationVerification = useCallback(async (organizationId: string, newVerificationStatus: VerificationStatus) => {
		try {
			const org = organizations.find(o => o.id === organizationId)
			if (!org) return

			const form: OrganizationForm = {
				name: org.name,
				description: org.description,
				shortDescription: org.shortDescription,
				logo: org.logo,
				website: org.website,
				email: org.email,
				phone: org.phone,
				address: org.address,
				city: org.city,
				country: org.country,
				postalCode: org.postalCode,
				type: org.type,
				status: org.status,
				size: org.size,
				industry: org.industry,
				foundedYear: org.foundedYear,
				revenue: org.revenue,
				currency: org.currency,
				employees: org.employees,
				subscriptionPlan: org.subscriptionPlan,
				contactPerson: org.contactPerson,
				socialMedia: org.socialMedia,
				tags: org.tags,
				notes: org.notes
			}

			// Update verification status via API
			await organizationApi.update(organizationId, {
				...form,
				verificationStatus: newVerificationStatus,
				isVerified: newVerificationStatus === 'verified'
			} as any)

			// Refresh organizations list
			await fetchOrganizations()
		} catch (error) {
			console.error('Error toggling verification:', error)
			throw error
		}
	}, [organizations, fetchOrganizations])

	// Update dashboard stats
	const updateDashboardStats = useCallback(() => {
		const stats = {
			totalOrganizations: organizations.length,
			activeOrganizations: organizations.filter(org => org.status === 'active').length,
			inactiveOrganizations: organizations.filter(org => org.status === 'inactive').length,
			pendingOrganizations: organizations.filter(org => org.status === 'pending').length,
			verifiedOrganizations: organizations.filter(org => org.verificationStatus === 'verified').length,
			premiumOrganizations: organizations.filter(org => org.isPremium).length,
			totalEmployees: organizations.reduce((sum, org) => sum + org.employees, 0),
			totalStudents: organizations.reduce((sum, org) => sum + org.students, 0),
			totalCourses: organizations.reduce((sum, org) => sum + org.courses, 0),
			totalRevenue: organizations.reduce((sum, org) => sum + org.revenue, 0),
			averageEmployees: organizations.length > 0 ? Math.round(organizations.reduce((sum, org) => sum + org.employees, 0) / organizations.length) : 0,
			averageStudents: organizations.length > 0 ? Math.round(organizations.reduce((sum, org) => sum + org.students, 0) / organizations.length) : 0,
			averageCourses: organizations.length > 0 ? Math.round(organizations.reduce((sum, org) => sum + org.courses, 0) / organizations.length) : 0,
			topIndustries: [] as Array<{ industry: string; count: number }>,
			topCountries: [] as Array<{ country: string; count: number }>,
			subscriptionDistribution: [] as Array<{ plan: SubscriptionPlan; count: number }>,
			sizeDistribution: [] as Array<{ size: OrganizationSize; count: number }>,
			monthlyGrowth: [] as Array<{ month: string; count: number }>
		}

		// Calculate top industries
		const industryCounts: Record<string, number> = {}
		organizations.forEach(org => {
			industryCounts[org.industry] = (industryCounts[org.industry] || 0) + 1
		})
		stats.topIndustries = Object.entries(industryCounts)
			.map(([industry, count]) => ({ industry, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)

		// Calculate top countries
		const countryCounts: Record<string, number> = {}
		organizations.forEach(org => {
			countryCounts[org.country] = (countryCounts[org.country] || 0) + 1
		})
		stats.topCountries = Object.entries(countryCounts)
			.map(([country, count]) => ({ country, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5)

		// Calculate subscription distribution
		const subscriptionCounts: Record<string, number> = {
			free: 0,
			basic: 0,
			professional: 0,
			enterprise: 0,
			custom: 0
		}
		organizations.forEach(org => {
			subscriptionCounts[org.subscriptionPlan]++
		})
		stats.subscriptionDistribution = Object.entries(subscriptionCounts)
			.map(([plan, count]) => ({ plan: plan as SubscriptionPlan, count }))
			.filter(item => item.count > 0)

		// Calculate size distribution
		const sizeCounts: Record<OrganizationSize, number> = {
			startup: 0,
			small: 0,
			medium: 0,
			large: 0,
			enterprise: 0
		}
		organizations.forEach(org => {
			sizeCounts[org.size]++
		})
		stats.sizeDistribution = Object.entries(sizeCounts)
			.map(([size, count]) => ({ size: size as OrganizationSize, count }))
			.filter(item => item.count > 0)

		setDashboard(prev => ({
			...prev,
			stats
		}))
	}, [organizations])

	// Fetch organizations on mount and when filters change
	useEffect(() => {
		fetchOrganizations()
	}, [fetchOrganizations])

	// Update dashboard when organizations change
	useEffect(() => {
		updateDashboardStats()
	}, [organizations, updateDashboardStats])

	return {
		// Data
		organizations: filteredOrganizations,
		allOrganizations: organizations,
		dashboard,
		filters,
		
		// State
		loading,
		
		// Actions
		updateFilter,
		clearFilters,
		addOrganization,
		updateOrganization,
		deleteOrganization,
		toggleOrganizationStatus,
		toggleOrganizationVerification,
		
		// Computed
		totalCount: organizations.length,
		filteredCount: filteredOrganizations.length
	}
}
