import React from 'react'
import { type Course as ApiCourse } from '@/features/courses/api/courseApi'
import CourseCard from './CourseCard'

interface CourseGridProps {
	courses: ApiCourse[]
	onCourseClick?: (course: ApiCourse) => void
	onEditCourse?: (course: ApiCourse) => void
	onDeleteCourse?: (courseId: string) => void
	onToggleStatus?: (courseId: string) => void
	loading?: boolean
	emptyMessage?: string
}

export default function CourseGrid({ 
	courses, 
	onCourseClick,
	onEditCourse,
	onDeleteCourse,
	onToggleStatus,
	loading = false,
	emptyMessage = "Không có khóa học nào"
}: CourseGridProps): JSX.Element {
	
	if (loading) {
		return (
			<div className="course-grid-loading">
				<div className="loading-skeleton">
					{Array.from({ length: 6 }).map((_, index) => (
						<div key={index} className="course-card-skeleton">
							<div className="skeleton-thumbnail"></div>
							<div className="skeleton-content">
								<div className="skeleton-title"></div>
								<div className="skeleton-description"></div>
								<div className="skeleton-meta">
									<div className="skeleton-badge"></div>
									<div className="skeleton-price"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	if (courses.length === 0) {
		return (
			<div className="course-grid-empty">
				<div className="empty-icon">📚</div>
				<div className="empty-text">{emptyMessage}</div>
				<div className="empty-subtext">
					Hãy thêm khóa học mới hoặc điều chỉnh bộ lọc để xem kết quả
				</div>
			</div>
		)
	}

	return (
		<div className="course-grid">
			{courses.map(course => (
				<CourseCard
					key={course.id}
					course={course}
					onClick={onCourseClick}
					onEdit={onEditCourse}
					onDelete={onDeleteCourse}
					onToggleStatus={onToggleStatus}
				/>
			))}
		</div>
	)
}
