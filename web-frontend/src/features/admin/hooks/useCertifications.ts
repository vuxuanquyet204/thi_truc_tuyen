import { useState, useEffect, useCallback } from 'react'
import {
	CertificateTemplate,
	IssuedCertificate,
	CertificateForm,
	CertificateFilters,
	CertificateDashboard,
	CertificateStatus,
	CertificateStats,
} from '@/foundation/types'
import { copyrightService } from '@/features/copyright/api/copyrightService'
import type { Document } from '@/foundation/types/copyright'

// Map backend Document to CertificateTemplate
function mapDocumentToTemplate(doc: Document): CertificateTemplate {
	return {
		id: doc.id,
		name: doc.title,
		description: doc.description,
		category: mapDocCategoryToCert(doc.metadata?.category ?? 'thesis'),
		level: 'beginner' as const,
		requirements: [],
		validityPeriod: 12,
		issuer: doc.author,
		issuerLogo: '',
		templateDesign: {
			layout: 'modern',
			colors: {
				primary: '#4F46E5',
				secondary: '#10B981',
				accent: '#F59E0B',
				text: '#111827',
				background: '#FFFFFF',
			},
			fonts: {
				title: 'Roboto',
				subtitle: 'Roboto',
				body: 'Open Sans',
				details: 'Open Sans',
			},
			elements: {
				logo: true,
				signature: true,
				seal: true,
				border: true,
				watermark: false,
				qrCode: true,
			},
			dimensions: { width: 800, height: 600, unit: 'px' },
		},
		metadata: {
			tags: doc.keywords ?? [],
			keywords: doc.keywords ?? [],
			industry: [],
			prerequisites: [],
			benefits: [],
			recognition: [],
			compliance: [],
		},
		isActive: doc.status === 'verified',
		createdAt: doc.registrationDate,
		updatedAt: doc.lastModified,
	}
}

// Map backend Document to IssuedCertificate
function mapDocumentToCertificate(doc: Document): IssuedCertificate {
	return {
		id: doc.id,
		certificateId: doc.id,
		certificateName: doc.title,
		recipientId: '',
		recipientName: doc.author,
		recipientEmail: '',
		organizationId: '',
		organizationName: '',
		issuedAt: doc.registrationDate,
		expiresAt: doc.metadata?.license ?? 'N/A',
		status: mapDocStatusToCert(doc.status),
		verificationCode: doc.hash,
		blockchainHash: doc.blockchainHash,
		metadata: {
			completionDate: doc.registrationDate,
			issuedBy: 'System',
			issuedByTitle: 'Administrator',
			verificationUrl: '',
			additionalInfo: {
				fileType: doc.fileType,
				fileSize: doc.fileSize,
				keywords: doc.keywords,
			},
		},
	}
}

function mapDocCategoryToCert(
	cat: 'academic' | 'research' | 'textbook' | 'thesis' | 'article' | 'presentation'
): CertificateTemplate['category'] {
	const map: Record<string, CertificateTemplate['category']> = {
		thesis: 'academic_achievement',
		research: 'research' as any,
		textbook: 'technical_skills',
		academic: 'academic_achievement',
		article: 'professional_development',
		presentation: 'soft_skills',
	}
	return map[cat] ?? 'other'
}

function mapDocStatusToCert(status: Document['status']): CertificateStatus {
	const map: Record<string, CertificateStatus> = {
		registered: 'issued',
		pending: 'pending',
		verified: 'active',
		disputed: 'suspended',
		expired: 'expired',
	}
	return map[status] ?? 'issued'
}

// Default empty dashboard
function getDefaultDashboard(): CertificateDashboard {
	return {
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
			mostPopularCategory: 'course_completion',
			mostPopularLevel: 'beginner',
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
	}
}

// Derive stats from current documents
function deriveStats(documents: Document[], templates: CertificateTemplate[], issued: IssuedCertificate[]): CertificateStats {
	const stats: CertificateStats = {
		totalTemplates: templates.length,
		activeTemplates: templates.filter(t => t.isActive).length,
		totalIssued: documents.length,
		activeCertificates: documents.filter(d => d.status === 'verified').length,
		expiredCertificates: documents.filter(d => d.status === 'expired').length,
		revokedCertificates: documents.filter(d => d.status === 'disputed').length,
		pendingCertificates: documents.filter(d => d.status === 'pending').length,
		totalRecipients: new Set(documents.map(d => d.author)).size,
		totalOrganizations: 0,
		averageValidityPeriod: templates.reduce((sum, t) => sum + t.validityPeriod, 0) / templates.length || 0,
		mostPopularCategory: getMostPopularCategory(templates),
		mostPopularLevel: getMostPopularLevel(templates),
		certificatesByCategory: getCertificatesByCategory(templates),
		certificatesByLevel: getCertificatesByLevel(templates),
		certificatesByStatus: getCertificatesByStatus(documents),
		monthlyIssuance: getMonthlyIssuance(documents),
		topOrganizations: [],
		topCourses: [],
	}
	return stats
}

function getMostPopularCategory(templates: CertificateTemplate[]): string {
	const categoryCount: Record<string, number> = {}
	templates.forEach(template => {
		categoryCount[template.category] = (categoryCount[template.category] || 0) + 1
	})
	return Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'course_completion'
}

function getMostPopularLevel(templates: CertificateTemplate[]): string {
	const levelCount: Record<string, number> = {}
	templates.forEach(template => {
		levelCount[template.level] = (levelCount[template.level] || 0) + 1
	})
	return Object.entries(levelCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'beginner'
}

function getCertificatesByCategory(templates: CertificateTemplate[]) {
	const categoryCount: Record<string, number> = {}
	templates.forEach(template => {
		categoryCount[template.category] = (categoryCount[template.category] || 0) + 1
	})
	return Object.entries(categoryCount).map(([category, count]) => ({
		category: category as CertificateTemplate['category'],
		count,
	}))
}

function getCertificatesByLevel(templates: CertificateTemplate[]) {
	const levelCount: Record<string, number> = {}
	templates.forEach(template => {
		levelCount[template.level] = (levelCount[template.level] || 0) + 1
	})
	return Object.entries(levelCount).map(([level, count]) => ({
		level: level as CertificateTemplate['level'],
		count,
	}))
}

function getCertificatesByStatus(documents: Document[]) {
	const statusCount: Record<string, number> = {}
	documents.forEach(doc => {
		statusCount[doc.status] = (statusCount[doc.status] || 0) + 1
	})
	return Object.entries(statusCount).map(([status, count]) => ({
		status: mapDocStatusToCert(status as Document['status']),
		count,
	}))
}

function getMonthlyIssuance(documents: Document[]) {
	const monthlyCount: Record<string, number> = {}
	documents.forEach(doc => {
		const month = new Date(doc.registrationDate).toISOString().slice(0, 7)
		monthlyCount[month] = (monthlyCount[month] || 0) + 1
	})
	return Object.entries(monthlyCount)
		.map(([month, count]) => ({ month, count }))
		.sort((a, b) => a.month.localeCompare(b.month))
}

const IS_DEV = import.meta.env.DEV

export default function useCertifications() {
	const [documents, setDocuments] = useState<Document[]>([])
	const [templates, setTemplates] = useState<CertificateTemplate[]>([])
	const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([])
	const [dashboard, setDashboard] = useState<CertificateDashboard>(getDefaultDashboard())
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
	const [dataLoaded, setDataLoaded] = useState(false)

	// ─── Fetch data from API ───
	const fetchData = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const [docsRes, statsRes] = await Promise.allSettled([
				copyrightService.getAllDocuments({ limit: 100 }),
				copyrightService.getStatistics(),
			])

			let docs: Document[] = []
			if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
				docs = docsRes.value.data
				setDocuments(docs)
			}

			// Build templates and issued certificates from documents
			const mappedTemplates = docs.map(mapDocumentToTemplate)
			const mappedCertificates = docs.map(mapDocumentToCertificate)
			setTemplates(mappedTemplates)
			setIssuedCertificates(mappedCertificates)

			// Build dashboard from API stats or derived
			let stats: CertificateStats = getDefaultDashboard().stats
			if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
				const s = statsRes.value.data
				stats = {
					totalTemplates: mappedTemplates.length,
					activeTemplates: mappedTemplates.filter(t => t.isActive).length,
					totalIssued: docs.length,
					activeCertificates: s.verifiedDocuments ?? s.totalDocuments ?? 0,
					expiredCertificates: 0,
					revokedCertificates: s.disputedDocuments ?? 0,
					pendingCertificates: s.pendingVerification ?? 0,
					totalRecipients: new Set(docs.map(d => d.author)).size,
					totalOrganizations: 0,
					averageValidityPeriod: mappedTemplates.reduce((sum, t) => sum + t.validityPeriod, 0) / mappedTemplates.length || 0,
					mostPopularCategory: getMostPopularCategory(mappedTemplates),
					mostPopularLevel: getMostPopularLevel(mappedTemplates),
					certificatesByCategory: getCertificatesByCategory(mappedTemplates),
					certificatesByLevel: getCertificatesByLevel(mappedTemplates),
					certificatesByStatus: getCertificatesByStatus(documents),
					monthlyIssuance: getMonthlyIssuance(documents),
					topOrganizations: [],
					topCourses: [],
				}
			} else {
				stats = deriveStats(docs, mappedTemplates, mappedCertificates)
			}

			// Recent documents as recent certificates
			const recentDocsRes = await Promise.allSettled([
				copyrightService.getRecentDocuments(5),
			])
			let recentCertificates: IssuedCertificate[] = []
			if (recentDocsRes[0].status === 'fulfilled' && recentDocsRes[0].value?.data) {
				recentCertificates = recentDocsRes[0].value.data.map(mapDocumentToCertificate)
			} else {
				recentCertificates = mappedCertificates.slice(0, 5)
			}

			setDashboard({
				stats,
				recentCertificates,
				expiringCertificates: [],
				pendingCertificates: mappedCertificates.filter(c => c.status === 'pending').slice(0, 5),
				popularTemplates: mappedTemplates.filter(t => t.isActive).slice(0, 5),
				alerts: [],
			})

			setDataLoaded(true)
		} catch (err) {
			console.error('[useCertifications] Failed to fetch data:', err)
			setError(err instanceof Error ? err.message : 'Failed to load data')
		} finally {
			setLoading(false)
		}
	}, [])

	// Fetch on mount
	useEffect(() => {
		fetchData()
	}, [fetchData])

	// ─── CRUD Operations ───
	// NOTE: Backend copyright service does not have endpoints for create/update/delete certificate templates.
	// These operations are kept locally. When backend adds the endpoints, replace with API calls.

	const addTemplate = useCallback((templateForm: CertificateForm) => {
		const newTemplate: CertificateTemplate = {
			id: `cert-template-${Date.now()}`,
			...templateForm,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		setTemplates(prev => [newTemplate, ...prev])
	}, [])

	const updateTemplate = useCallback((templateForm: CertificateForm, templateId: string) => {
		setTemplates(prev => prev.map(template =>
			template.id === templateId
				? { ...template, ...templateForm, updatedAt: new Date().toISOString() }
				: template
		))
	}, [])

	const deleteTemplate = useCallback((templateId: string) => {
		setTemplates(prev => prev.filter(template => template.id !== templateId))
	}, [])

	const duplicateTemplate = useCallback((template: CertificateTemplate) => {
		const duplicatedTemplate: CertificateTemplate = {
			...template,
			id: `cert-template-${Date.now()}`,
			name: `${template.name} (Bản sao)`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}
		setTemplates(prev => [duplicatedTemplate, ...prev])
	}, [])

	const toggleTemplateStatus = useCallback((templateId: string) => {
		setTemplates(prev => prev.map(template =>
			template.id === templateId
				? { ...template, isActive: !template.isActive, updatedAt: new Date().toISOString() }
				: template
		))
	}, [])

	const addIssuedCertificate = useCallback((certificateData: Partial<IssuedCertificate>) => {
		const newCertificate: IssuedCertificate = {
			id: `issued-cert-${Date.now()}`,
			certificateId: certificateData.certificateId || '',
			certificateName: certificateData.certificateName || '',
			recipientId: certificateData.recipientId || '',
			recipientName: certificateData.recipientName || '',
			recipientEmail: certificateData.recipientEmail || '',
			organizationId: certificateData.organizationId || '',
			organizationName: certificateData.organizationName || '',
			courseId: certificateData.courseId,
			courseName: certificateData.courseName,
			issuedAt: new Date().toISOString(),
			expiresAt: certificateData.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
			status: 'issued' as CertificateStatus,
			verificationCode: `CERT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
			blockchainHash: certificateData.blockchainHash,
			metadata: certificateData.metadata || {
				score: 0,
				grade: 'N/A',
				completionDate: new Date().toISOString(),
				issuedBy: 'System Admin',
				issuedByTitle: 'Administrator',
				verificationUrl: '',
				additionalInfo: {},
			},
			downloadUrl: certificateData.downloadUrl,
			viewUrl: certificateData.viewUrl,
		}
		setIssuedCertificates(prev => [newCertificate, ...prev])
	}, [])

	const updateIssuedCertificate = useCallback((certificateData: Partial<IssuedCertificate>, certificateId: string) => {
		setIssuedCertificates(prev => prev.map(certificate =>
			certificate.id === certificateId
				? { ...certificate, ...certificateData }
				: certificate
		))
	}, [])

	const deleteIssuedCertificate = useCallback((certificateId: string) => {
		setIssuedCertificates(prev => prev.filter(certificate => certificate.id !== certificateId))
	}, [])

	const toggleCertificateStatus = useCallback((certificateId: string, newStatus: CertificateStatus) => {
		setIssuedCertificates(prev => prev.map(certificate =>
			certificate.id === certificateId
				? { ...certificate, status: newStatus }
				: certificate
		))
	}, [])

	// ─── Filter operations ───
	const updateFilter = useCallback((key: keyof CertificateFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}, [])

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

	// ─── Filtered data ───
	const filteredTemplates = templates.filter(template => {
		const matchesSearch = !filters.search ||
			template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
			template.description.toLowerCase().includes(filters.search.toLowerCase()) ||
			template.issuer.toLowerCase().includes(filters.search.toLowerCase())

		const matchesCategory = filters.category === 'all' || template.category === filters.category
		const matchesLevel = filters.level === 'all' || template.level === filters.level
		const matchesActive = filters.isActive === 'all' || template.isActive === filters.isActive

		return matchesSearch && matchesCategory && matchesLevel && matchesActive
	})

	const filteredIssuedCertificates = issuedCertificates.filter(certificate => {
		const matchesSearch = !filters.search ||
			certificate.recipientName.toLowerCase().includes(filters.search.toLowerCase()) ||
			certificate.certificateName.toLowerCase().includes(filters.search.toLowerCase()) ||
			certificate.organizationName.toLowerCase().includes(filters.search.toLowerCase()) ||
			certificate.verificationCode.toLowerCase().includes(filters.search.toLowerCase())

		const matchesStatus = filters.status === 'all' || certificate.status === filters.status
		const matchesOrganization = filters.organization === 'all' || certificate.organizationId === filters.organization
		const matchesCourse = filters.course === 'all' || certificate.courseId === filters.course

		return matchesSearch && matchesStatus && matchesOrganization && matchesCourse
	})

	// ─── Real-time data simulation ───
	// Only in dev mode and when data has loaded successfully
	useEffect(() => {
		if (!dataLoaded || !IS_DEV) return

		const interval = setInterval(() => {
			if (Math.random() < 0.1) {
				const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
				if (randomTemplate) {
					const newCertificate = {
						certificateId: randomTemplate.id,
						certificateName: randomTemplate.name,
						recipientId: `user-${Date.now()}`,
						recipientName: `Học viên ${Math.floor(Math.random() * 1000)}`,
						recipientEmail: `student${Math.floor(Math.random() * 1000)}@email.com`,
						organizationId: `org-${Math.floor(Math.random() * 5) + 1}`,
						organizationName: `Tổ chức ${Math.floor(Math.random() * 5) + 1}`,
						courseId: `course-${Math.floor(Math.random() * 10) + 1}`,
						courseName: `Khóa học ${Math.floor(Math.random() * 10) + 1}`,
						expiresAt: new Date(Date.now() + randomTemplate.validityPeriod * 30 * 24 * 60 * 60 * 1000).toISOString(),
						status: 'issued' as CertificateStatus,
						blockchainHash: `0x${Math.random().toString(16).substr(2, 40)}`,
						metadata: {
							score: Math.floor(Math.random() * 40) + 60,
							grade: ['A', 'B+', 'B', 'C+', 'C'][Math.floor(Math.random() * 5)],
							completionDate: new Date().toISOString(),
							issuedBy: 'System Auto',
							issuedByTitle: 'Auto Issuer',
							verificationUrl: `https://eduplatform.com/verify/CERT-${Date.now()}`,
							additionalInfo: {},
						},
					}
					addIssuedCertificate(newCertificate)
				}
			}
		}, 5000)

		return () => clearInterval(interval)
	}, [dataLoaded, templates, addIssuedCertificate])

	return {
		// Data
		templates: filteredTemplates,
		allTemplates: templates,
		issuedCertificates: filteredIssuedCertificates,
		allIssuedCertificates: issuedCertificates,
		dashboard,
		filters,

		// Template operations
		addTemplate,
		updateTemplate,
		deleteTemplate,
		duplicateTemplate,
		toggleTemplateStatus,

		// Certificate operations
		addIssuedCertificate,
		updateIssuedCertificate,
		deleteIssuedCertificate,
		toggleCertificateStatus,

		// Filter operations
		updateFilter,
		clearFilters,

		// State
		loading,
		error,
		totalTemplates: templates.length,
		totalIssuedCertificates: issuedCertificates.length,
		filteredTemplatesCount: filteredTemplates.length,
		filteredIssuedCertificatesCount: filteredIssuedCertificates.length,
		refetch: fetchData,
	}
}
