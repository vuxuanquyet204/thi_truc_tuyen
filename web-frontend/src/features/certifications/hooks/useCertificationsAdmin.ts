/**
 * Certificate Admin Hook
 *
 * Fetches certificate data from Certificate Service API.
 * Replaced mock data with real API calls.
 */

import { useState, useEffect, useCallback } from 'react'
import {
	CertificateTemplate,
	IssuedCertificate,
	CertificateFilters,
	CertificateDashboard,
	CertificateStatus,
} from '@/foundation/types/certification'
import {
	fetchCertificateTemplates,
	fetchIssuedCertificates,
	fetchCertificateStats,
	createCertificateTemplate,
	updateCertificateTemplate,
	deleteCertificateTemplate,
	toggleCertificateTemplateStatus,
	updateCertificateStatus,
	deleteCertificate,
	issueCertificate,
	mapTemplateToFrontend,
	mapIssuedCertificateToFrontend,
	mapStatsToFrontend,
} from '../api/certificateApi'

export default function useCertificationsAdmin() {
	const [templates, setTemplates] = useState<CertificateTemplate[]>([])
	const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([])
	const [dashboard, setDashboard] = useState<CertificateDashboard>({
		stats: {
			totalTemplates: 0,
			activeTemplates: 0,
			totalIssued: 0,
			activeCertificates: 0,
			expiredCertificates: 0,
			revokedCertificates: 0,
			pendingCertificates: 0,
			totalRecipients: 0,
			totalOrganizations: 0,
			averageValidityPeriod: 0,
			mostPopularCategory: '',
			mostPopularLevel: '',
			certificatesByCategory: [],
			certificatesByLevel: [],
			certificatesByStatus: [],
			monthlyIssuance: [],
			topOrganizations: [],
			topCourses: [],
		},
		recentCertificates: [],
		expiringCertificates: [],
		pendingCertificates: [],
		popularTemplates: [],
		alerts: [],
	})
	const [filters, setFilters] = useState<CertificateFilters>({
		search: '',
		category: 'all',
		level: 'all',
		status: 'all',
		organization: 'all',
		course: 'all',
		isActive: 'all',
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// ========== DATA LOADING ==========

	const loadTemplates = useCallback(async (category?: string, level?: string) => {
		try {
			const responses = await fetchCertificateTemplates(0, 100, category, level)
			const mapped = responses.map(mapTemplateToFrontend)
			setTemplates(mapped)
		} catch (err) {
			console.error('Error loading templates:', err)
			setError('Failed to load templates')
		}
	}, [])

	const loadIssuedCertificates = useCallback(async (search?: string, status?: string) => {
		try {
			const responses = await fetchIssuedCertificates(0, 100, search, status)
			const mapped = responses.map(mapIssuedCertificateToFrontend)
			setIssuedCertificates(mapped)
		} catch (err) {
			console.error('Error loading certificates:', err)
			setError('Failed to load certificates')
		}
	}, [])

	const loadStats = useCallback(async () => {
		try {
			const statsResponse = await fetchCertificateStats()
			if (statsResponse) {
				const mappedStats = mapStatsToFrontend(statsResponse)
				setDashboard((prev) => ({
					...prev,
					stats: mappedStats,
				}))
			}
		} catch (err) {
			console.error('Error loading stats:', err)
		}
	}, [])

	const fetchAllData = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			await Promise.all([loadTemplates(), loadIssuedCertificates(), loadStats()])
		} finally {
			setLoading(false)
		}
	}, [loadTemplates, loadIssuedCertificates, loadStats])

	useEffect(() => {
		fetchAllData()
	}, [fetchAllData])

	// ========== FILTERING ==========

	const filteredTemplates = templates.filter((template) => {
		const matchesSearch =
			!filters.search ||
			template.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
			template.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
			template.issuer?.toLowerCase().includes(filters.search.toLowerCase())

		const matchesCategory = filters.category === 'all' || template.category === filters.category
		const matchesLevel = filters.level === 'all' || template.level === filters.level
		const matchesActive =
			filters.isActive === 'all' || template.isActive === filters.isActive

		return matchesSearch && matchesCategory && matchesLevel && matchesActive
	})

	const filteredIssuedCertificates = issuedCertificates.filter((certificate) => {
		const matchesSearch =
			!filters.search ||
			certificate.recipientName?.toLowerCase().includes(filters.search.toLowerCase()) ||
			certificate.certificateName?.toLowerCase().includes(filters.search.toLowerCase()) ||
			certificate.organizationName?.toLowerCase().includes(filters.search.toLowerCase()) ||
			certificate.verificationCode?.toLowerCase().includes(filters.search.toLowerCase())

		const matchesStatus = filters.status === 'all' || certificate.status === filters.status
		const matchesOrganization =
			filters.organization === 'all' || certificate.organizationId === filters.organization
		const matchesCourse = filters.course === 'all' || certificate.courseId === filters.course

		return matchesSearch && matchesStatus && matchesOrganization && matchesCourse
	})

	// ========== TEMPLATE ACTIONS ==========

	const addTemplate = useCallback(
		async (templateForm: Partial<CertificateTemplate>) => {
			try {
				const response = await createCertificateTemplate(templateForm as never)
				if (response) {
					const mapped = mapTemplateToFrontend(response)
					setTemplates((prev) => [mapped, ...prev])
					await loadStats()
					return true
				}
				return false
			} catch (err) {
				console.error('Error creating template:', err)
				setError('Failed to create template')
				return false
			}
		},
		[loadStats]
	)

	const updateTemplate = useCallback(
		async (templateForm: Partial<CertificateTemplate>, templateId: string) => {
			try {
				const response = await updateCertificateTemplate(templateId, templateForm as never)
				if (response) {
					const mapped = mapTemplateToFrontend(response)
					setTemplates((prev) =>
						prev.map((t) => (t.id === templateId ? mapped : t))
					)
					await loadStats()
					return true
				}
				return false
			} catch (err) {
				console.error('Error updating template:', err)
				setError('Failed to update template')
				return false
			}
		},
		[loadStats]
	)

	const deleteTemplate = useCallback(
		async (templateId: string) => {
			try {
				const success = await deleteCertificateTemplate(templateId)
				if (success) {
					setTemplates((prev) => prev.filter((t) => t.id !== templateId))
					await loadStats()
					return true
				}
				return false
			} catch (err) {
				console.error('Error deleting template:', err)
				setError('Failed to delete template')
				return false
			}
		},
		[loadStats]
	)

	const duplicateTemplate = useCallback(
		async (template: CertificateTemplate) => {
			const duplicated = {
				...template,
				name: `${template.name} (Copy)`,
			}
			delete duplicated.id
			return await addTemplate(duplicated)
		},
		[addTemplate]
	)

	const toggleTemplateStatus = useCallback(
		async (templateId: string) => {
			try {
				const response = await toggleCertificateTemplateStatus(templateId)
				if (response) {
					const mapped = mapTemplateToFrontend(response)
					setTemplates((prev) =>
						prev.map((t) => (t.id === templateId ? mapped : t))
					)
					await loadStats()
					return true
				}
				return false
			} catch (err) {
				console.error('Error toggling template status:', err)
				setError('Failed to toggle template status')
				return false
			}
		},
		[loadStats]
	)

	// ========== ISSUED CERTIFICATE ACTIONS ==========

	const addIssuedCertificate = useCallback(
		async (certificateData: {
			userId: string
			profileId: string
			courseId: string
			recipientName: string
			recipientEmail?: string
		}) => {
			try {
				const response = await issueCertificate(certificateData)
				if (response) {
					const mapped = mapIssuedCertificateToFrontend(response)
					setIssuedCertificates((prev) => [mapped, ...prev])
					await loadStats()
					return true
				}
				return false
			} catch (err) {
				console.error('Error issuing certificate:', err)
				setError('Failed to issue certificate')
				return false
			}
		},
		[loadStats]
	)

	const updateIssuedCertificate = useCallback(
		async (certificateData: Partial<IssuedCertificate>, certificateId: string) => {
			try {
				if (certificateData.status) {
					const response = await updateCertificateStatus(
						certificateId,
						certificateData.status
					)
					if (response) {
						const mapped = mapIssuedCertificateToFrontend(response)
						setIssuedCertificates((prev) =>
							prev.map((c) => (c.id === certificateId ? mapped : c))
						)
						await loadStats()
						return true
					}
				}
				return false
			} catch (err) {
				console.error('Error updating certificate:', err)
				setError('Failed to update certificate')
				return false
			}
		},
		[loadStats]
	)

	const deleteIssuedCertificate = useCallback(
		async (certificateId: string) => {
			try {
				const success = await deleteCertificate(certificateId)
				if (success) {
					setIssuedCertificates((prev) =>
						prev.filter((c) => c.id !== certificateId)
					)
					await loadStats()
					return true
				}
				return false
			} catch (err) {
				console.error('Error deleting certificate:', err)
				setError('Failed to delete certificate')
				return false
			}
		},
		[loadStats]
	)

	const toggleCertificateStatus = useCallback(
		async (certificateId: string, newStatus: CertificateStatus) => {
			return await updateIssuedCertificate({ status: newStatus }, certificateId)
		},
		[updateIssuedCertificate]
	)

	// ========== FILTER ACTIONS ==========

	const updateFilter = useCallback(
		(key: keyof CertificateFilters, value: unknown) => {
			setFilters((prev) => ({ ...prev, [key]: value }))
		},
		[]
	)

	const clearFilters = useCallback(() => {
		setFilters({
			search: '',
			category: 'all',
			level: 'all',
			status: 'all',
			organization: 'all',
			course: 'all',
			isActive: 'all',
		})
	}, [])

	// ========== COMPUTED VALUES ==========

	const getMostPopularCategory = useCallback(() => {
		const categoryCount: Record<string, number> = {}
		templates.forEach((template) => {
			if (template.category) {
				categoryCount[template.category] = (categoryCount[template.category] || 0) + 1
			}
		})
		return Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'course_completion'
	}, [templates])

	const getMostPopularLevel = useCallback(() => {
		const levelCount: Record<string, number> = {}
		templates.forEach((template) => {
			if (template.level) {
				levelCount[template.level] = (levelCount[template.level] || 0) + 1
			}
		})
		return Object.entries(levelCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'beginner'
	}, [templates])

	const getCertificatesByCategory = useCallback(() => {
		return dashboard.stats.certificatesByCategory
	}, [dashboard.stats])

	const getCertificatesByLevel = useCallback(() => {
		return dashboard.stats.certificatesByLevel
	}, [dashboard.stats])

	const getCertificatesByStatus = useCallback(() => {
		return dashboard.stats.certificatesByStatus
	}, [dashboard.stats])

	const getMonthlyIssuance = useCallback(() => {
		return dashboard.stats.monthlyIssuance
	}, [dashboard.stats])

	const getTopOrganizations = useCallback(() => {
		return dashboard.stats.topOrganizations
	}, [dashboard.stats])

	const getTopCourses = useCallback(() => {
		return dashboard.stats.topCourses
	}, [dashboard.stats])

	// ========== RETURN ==========

	return {
		// Data
		templates: filteredTemplates,
		allTemplates: templates,
		issuedCertificates: filteredIssuedCertificates,
		allIssuedCertificates: issuedCertificates,
		dashboard,
		filters,
		loading,
		error,

		// Template actions
		addTemplate,
		updateTemplate,
		deleteTemplate,
		duplicateTemplate,
		toggleTemplateStatus,

		// Certificate actions
		addIssuedCertificate,
		updateIssuedCertificate,
		deleteIssuedCertificate,
		toggleCertificateStatus,

		// Filter actions
		updateFilter,
		clearFilters,

		// Computed values
		getMostPopularCategory,
		getMostPopularLevel,
		getCertificatesByCategory,
		getCertificatesByLevel,
		getCertificatesByStatus,
		getMonthlyIssuance,
		getTopOrganizations,
		getTopCourses,

		// Refresh
		refreshData: fetchAllData,

		// Counts
		totalTemplates: templates.length,
		totalIssuedCertificates: issuedCertificates.length,
		filteredTemplatesCount: filteredTemplates.length,
		filteredIssuedCertificatesCount: filteredIssuedCertificates.length,
	}
}
