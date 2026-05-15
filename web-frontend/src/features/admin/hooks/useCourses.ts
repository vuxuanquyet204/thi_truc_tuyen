import { useState, useMemo, useCallback, useEffect } from 'react'
import { type CourseFilters, type CourseForm, type CourseDashboard } from '@/foundation/types'
import courseApi, { type Course as ApiCourse, type CourseVisibility, type PageResponse } from '@/features/courses/api'
import { getAllUsers } from '@/features/users/api/userApi'

const initialDashboard: CourseDashboard = {
	stats: {
		totalCourses: 0,
		publishedCourses: 0,
		draftCourses: 0,
		archivedCourses: 0,
		suspendedCourses: 0
	}
}

const normalizeVisibility = (value: CourseVisibility | string): CourseVisibility => {
	switch (value) {
		case 'published':
		case 'draft':
		case 'archived':
		case 'suspended':
	case 'private':
			return value
		default:
			return 'draft'
	}
}

const buildCreatePayload = (form: CourseForm) => {
	return {
		id: form.id ?? crypto.randomUUID(),
		title: form.title.trim(),
		description: form.description.trim(),
		organizationId: form.organizationId.trim(),
		thumbnailUrl: form.thumbnailUrl.trim() || undefined,
		visibility: normalizeVisibility(form.visibility)
	}
}

const buildUpdatePayload = (form: CourseForm) => {
	return {
		title: form.title.trim() || undefined,
		description: form.description.trim() || undefined,
		thumbnailUrl: form.thumbnailUrl.trim() || undefined,
		visibility: normalizeVisibility(form.visibility)
	}
}

export default function useCourses() {
	const [dashboard, setDashboard] = useState<CourseDashboard>(initialDashboard)
	const [filters, setFilters] = useState<CourseFilters>({
		search: '',
		visibility: 'all',
		organizationId: 'all',
		sortBy: 'title',
		sortOrder: 'asc'
	})
	const [isCourseEditorOpen, setIsCourseEditorOpen] = useState(false)
	const [editingCourse, setEditingCourse] = useState<ApiCourse | null>(null)
	const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null)
	const [loading, setLoading] = useState(false)
	const [allCourses, setAllCourses] = useState<ApiCourse[]>([])
	const [instructorMap, setInstructorMap] = useState<Record<string, string>>({})

	const loadCourses = useCallback(async () => {
		setLoading(true)
		try {
			const coursesResponse = await courseApi.getAllCourses(0, 200)
			const courses = (coursesResponse.data as PageResponse<ApiCourse>).content
			setAllCourses(courses)

			const stats = courses.reduce(
				(acc, course) => {
					acc.totalCourses += 1
					switch (course.visibility) {
						case 'published':
							acc.publishedCourses += 1
							break
						case 'draft':
							acc.draftCourses += 1
							break
						case 'archived':
							acc.archivedCourses += 1
							break
						case 'suspended':
							acc.suspendedCourses += 1
							break
						default:
							break
					}
					return acc
				},
				{
					totalCourses: 0,
					publishedCourses: 0,
					draftCourses: 0,
					archivedCourses: 0,
					suspendedCourses: 0
				}
			)

			setDashboard({ stats })
		} catch (error) {
			console.error('❌ Error loading courses:', error)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadCourses()
	}, [loadCourses])

	useEffect(() => {
		if (allCourses.length === 0) return

		const ownerIds = [...new Set(allCourses.map(c => (c as any).createdBy).filter(Boolean))]
		if (ownerIds.length === 0) return

		const neededOwners = ownerIds.filter(id => !instructorMap[id])
		if (neededOwners.length === 0) return

		let mounted = true
		getAllUsers()
			.then(users => {
				if (!mounted) return
				const map: Record<string, string> = {}
				for (const user of users) {
					map[user.id] = `${user.firstName} ${user.lastName}`.trim() || user.username || user.email
				}
				setInstructorMap(prev => {
					const updated = { ...prev }
					let changed = false
					for (const id of neededOwners) {
						if (map[id] && !updated[id]) {
							updated[id] = map[id]
							changed = true
						}
					}
					return changed ? updated : prev
				})
			})
			.catch(err => console.warn('Failed to resolve instructor names:', err))

		return () => { mounted = false }
	}, [allCourses, instructorMap])

	useEffect(() => {
		const interval = setInterval(() => {
			loadCourses()
		}, 30000)

		return () => clearInterval(interval)
	}, [loadCourses])

	const filteredCourses = useMemo(() => {
		let result = [...allCourses].map(course => ({
			...course,
			instructorName: instructorMap[(course as any).createdBy] || null
		}))

		if (filters.search) {
			const query = filters.search.toLowerCase()
			result = result.filter(course =>
				(course.title || '').toLowerCase().includes(query) ||
				(course.description || '').toLowerCase().includes(query) ||
				(course.slug || '').toLowerCase().includes(query)
			)
		}

		if (filters.visibility !== 'all') {
			result = result.filter(course => course.visibility === filters.visibility)
		}

		if (filters.organizationId !== 'all') {
			result = result.filter(course => String((course as any).organizationId || '') === filters.organizationId)
		}

		result.sort((a, b) => {
			let aValue: string | number = ''
			let bValue: string | number = ''

			switch (filters.sortBy) {
				case 'createdAt':
					aValue = new Date(a.createdAt || 0).getTime()
					bValue = new Date(b.createdAt || 0).getTime()
					break
				case 'updatedAt':
					aValue = new Date(a.updatedAt || 0).getTime()
					bValue = new Date(b.updatedAt || 0).getTime()
					break
				case 'title':
			default:
					aValue = (a.title || '').toLowerCase()
					bValue = (b.title || '').toLowerCase()
			}

			if (filters.sortOrder === 'asc') {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
			}
			return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
		})

		return result
	}, [allCourses, filters, instructorMap])

	const updateFilter = useCallback((key: keyof CourseFilters, value: any) => {
		setFilters(prev => ({ ...prev, [key]: value }))
	}, [])

	const clearFilters = useCallback(() => {
		setFilters({
			search: '',
			visibility: 'all',
			organizationId: 'all',
			sortBy: 'title',
			sortOrder: 'asc'
		})
	}, [])

	const addCourse = useCallback(async (courseForm: CourseForm, thumbnailFile?: File | null) => {
		setLoading(true)
		try {
			const payload = buildCreatePayload(courseForm)
			const created = await courseApi.createCourse(payload)
			const createdId = (created.data as any)?.id
			// If user selected a thumbnail file, upload then update course with returned URL
			if (createdId && thumbnailFile && typeof (courseApi as any).uploadCourseImage === 'function') {
				try {
					const uploadRes = await (courseApi as any).uploadCourseImage(createdId, thumbnailFile)
					const url = uploadRes?.data?.url || uploadRes?.data?.imageUrl || uploadRes?.data
					if (url) {
						await courseApi.updateCourse(createdId, { thumbnailUrl: url })
					}
				} catch (e) {
					console.warn('Upload thumbnail failed, course created without thumbnail', e)
				}
			}
			await loadCourses()
		} catch (error) {
			console.error('Error adding course:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}, [loadCourses])

	const updateCourse = useCallback(async (courseId: string, courseForm: CourseForm) => {
		setLoading(true)
		try {
			const payload = buildUpdatePayload(courseForm)
			await courseApi.updateCourse(courseId, payload)
			await loadCourses()
		} catch (error) {
			console.error('Error updating course:', error)
			throw error
		} finally {
			setLoading(false)
		}
	}, [loadCourses])

	const deleteCourse = useCallback(async (courseId: string) => {
		setLoading(true)
		try {
			await courseApi.deleteCourse(courseId)
			await loadCourses()
		} catch (error: any) {
			const message = error?.message || 'Xóa khóa học thất bại. Vui lòng kiểm tra backend.'
			alert(message)
		} finally {
			setLoading(false)
		}
	}, [loadCourses])

	const toggleCourseStatus = useCallback(async (courseId: string) => {
		try {
			const course = allCourses.find(c => c.id === courseId)
			if (!course) return

			const nextVisibility: CourseVisibility = course.visibility === 'published' ? 'draft' : 'published'
			if (nextVisibility === 'published') {
				await courseApi.publishCourse(courseId)
			} else {
				await courseApi.updateCourse(courseId, { visibility: nextVisibility })
			}
			await loadCourses()
		} catch (error) {
			console.error('Error toggling course status:', error)
			throw error
		}
	}, [allCourses, loadCourses])

	const openCourseEditor = useCallback((course?: ApiCourse) => {
		setEditingCourse(course || null)
		setIsCourseEditorOpen(true)
	}, [])

	const closeCourseEditor = useCallback(() => {
		setIsCourseEditorOpen(false)
		setEditingCourse(null)
	}, [])

	const saveCourse = useCallback((courseForm: CourseForm, thumbnailFile?: File | null) => {
		if (editingCourse) {
			updateCourse(editingCourse.id, courseForm)
		} else {
			addCourse(courseForm, thumbnailFile)
		}
		closeCourseEditor()
	}, [editingCourse, addCourse, updateCourse, closeCourseEditor])

	const getCourseById = useCallback((id: string) => {
		return allCourses.find(course => course.id === id)
	}, [allCourses])

	return {
		dashboard,
		courses: filteredCourses,
		instructorMap,
		filters,
		updateFilter,
		clearFilters,
		addCourse,
		updateCourse,
		deleteCourse,
		toggleCourseStatus,
		loadCourses,
		isCourseEditorOpen,
		editingCourse,
		openCourseEditor,
		closeCourseEditor,
		saveCourse,
		selectedCourse,
		setSelectedCourse,
		loading,
		setLoading,
		getCourseById
	}
}
