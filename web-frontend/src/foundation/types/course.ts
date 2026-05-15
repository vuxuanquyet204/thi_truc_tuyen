// CourseVisibility defined locally to avoid cross-dependency with services/
// (API service will re-export or use this definition)
export type CourseVisibility = 'draft' | 'published' | 'archived' | 'suspended' | 'private'

export interface CourseForm {
	id?: string
	title: string
	description: string
	organizationId: string
	thumbnailUrl: string
	visibility: CourseVisibility
}

export interface CourseFilters {
	search: string
	visibility: CourseVisibility | 'all'
	organizationId: string | 'all'
	sortBy: 'title' | 'createdAt' | 'updatedAt'
	sortOrder: 'asc' | 'desc'
}

export interface CourseStats {
	totalCourses: number
	publishedCourses: number
	draftCourses: number
	archivedCourses: number
	suspendedCourses: number
}

export interface CourseDashboard {
	stats: CourseStats
}
