import { useState, useEffect, useCallback } from 'react'
import courseApi, { type Course, type Material, type Progress } from '@/features/courses/api'

export function useCourseDetail(courseId?: string) {
	const [course, setCourse] = useState<Course | null>(null)
	const [materials, setMaterials] = useState<Material[]>([])
	const [progress, setProgress] = useState<Progress | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const loadCourse = useCallback(async () => {
		if (!courseId) return
		setLoading(true)
		setError(null)
		try {
			const [courseData, materialsData, progressData] = await Promise.all([
				courseApi.getCourse(courseId),
				courseApi.getMaterials(courseId),
				courseApi.getProgress(courseId),
			])
			setCourse(courseData)
			setMaterials(materialsData)
			setProgress(progressData)
		} catch (err: any) {
			console.error('Error loading course:', err)
			setError(err.message || 'Không thể tải thông tin khóa học')
		} finally {
			setLoading(false)
		}
	}, [courseId])

	useEffect(() => {
		loadCourse()
	}, [loadCourse])

	return {
		course,
		materials,
		progress,
		loading,
		error,
		loadCourse,
	}
}

export function useCourseLearn(courseId?: string) {
	const [course, setCourse] = useState<Course | null>(null)
	const [materials, setMaterials] = useState<Material[]>([])
	const [progress, setProgress] = useState<Progress | null>(null)
	const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const loadCourse = useCallback(async () => {
		if (!courseId) return
		setLoading(true)
		setError(null)
		try {
			const [courseData, materialsData, progressData] = await Promise.all([
				courseApi.getCourse(courseId),
				courseApi.getMaterials(courseId),
				courseApi.getProgress(courseId),
			])
			setCourse(courseData)
			setMaterials(materialsData)
			setProgress(progressData)
		} catch (err: any) {
			console.error('Error loading course:', err)
			setError(err.message || 'Không thể tải nội dung khóa học')
		} finally {
			setLoading(false)
		}
	}, [courseId])

	const updateProgress = useCallback(
		async (materialId: string, completed: boolean) => {
			if (!courseId) return
			try {
				await courseApi.updateProgress(courseId, materialId, completed)
				if (progress) {
					const updated = materials.map((m) =>
						m.id === materialId ? { ...m, completed } : m
					)
					setMaterials(updated)
					setProgress({
						...progress,
						completedMaterials: progress.completedMaterials + (completed ? 1 : -1),
					})
				}
			} catch (err) {
				console.error('Error updating progress:', err)
			}
		},
		[courseId, progress, materials]
	)

	useEffect(() => {
		loadCourse()
	}, [loadCourse])

	return {
		course,
		materials,
		progress,
		currentMaterialIndex,
		setCurrentMaterialIndex,
		loading,
		error,
		loadCourse,
		updateProgress,
	}
}
