import React from 'react'
import { type Course as ApiCourse } from '@/features/courses/api/courseApi'
import Badge from '@/features/admin/ui/common/Badge'
import { Edit, Trash2, Eye, Play, Pause, Calendar, Hash, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import '@/features/admin/ui/common/styles/table.css'

interface CourseListTableProps {
	courses: ApiCourse[]
	onCourseClick?: (course: ApiCourse) => void
	onEditCourse?: (course: ApiCourse) => void
	onDeleteCourse?: (courseId: string) => void
	onToggleStatus?: (courseId: string) => void
	loading?: boolean
	emptyMessage?: string
}

const visibilityVariantMap: Record<ApiCourse['visibility'], Parameters<typeof Badge>[0]['variant']> = {
	draft: 'warning',
	published: 'success',
	archived: 'secondary',
	suspended: 'danger',
	private: 'secondary'
}

const visibilityLabelMap: Record<ApiCourse['visibility'], string> = {
	draft: 'Bản nháp',
	published: 'Đã xuất bản',
	archived: 'Đã lưu trữ',
	suspended: 'Tạm dừng',
	private: 'Riêng tư'
}

const fallbackRowThumbnail =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="%2394a3b8">No image</text></svg>'

const formatUpdatedAt = (value?: string) => {
	if (!value) return 'Không xác định'
	try {
		return formatDistanceToNow(new Date(value), { addSuffix: true, locale: vi })
	} catch {
		return value
	}
}

export default function CourseListTable({
	courses,
	onCourseClick,
	onEditCourse,
	onDeleteCourse,
	onToggleStatus,
	loading = false,
	emptyMessage = 'Không có khóa học nào'
}: CourseListTableProps): JSX.Element {
	if (loading) {
		return (
			<div className="course-list-loading">
				<div className="admin-table">
					<thead>
						<tr>
							<th>Khóa học</th>
							<th>Giảng viên</th>
							<th>Slug</th>
							<th>Trạng thái</th>
							<th>Cập nhật</th>
							<th>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: 5 }).map((_, index) => (
							<tr key={index}>
								<td>
									<div className="course-info-skeleton">
										<div className="skeleton-thumbnail" />
										<div className="skeleton-content">
											<div className="skeleton-title" />
											<div className="skeleton-description" />
										</div>
									</div>
								</td>
								<td><div className="skeleton-text" /></td>
								<td><div className="skeleton-text" /></td>
								<td><div className="skeleton-text" /></td>
								<td><div className="skeleton-text" /></td>
								<td><div className="skeleton-text" /></td>
							</tr>
						))}
					</tbody>
				</div>
			</div>
		)
	}

	if (courses.length === 0) {
		return (
			<div className="admin-table-empty">
				<div className="admin-table-empty-icon">📚</div>
				<div className="admin-table-empty-text">{emptyMessage}</div>
			</div>
		)
	}

	return (
		<div className="course-list-table">
			<table className="admin-table">
				<thead>
					<tr>
						<th>Khóa học</th>
						<th>Organization</th>
						<th>Slug</th>
						<th>Trạng thái</th>
						<th>Cập nhật</th>
						<th>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{courses.map(course => {
						const isPublished = course.visibility === 'published'
						const visibilityVariant = visibilityVariantMap[course.visibility] ?? 'secondary'
						const visibilityLabel = visibilityLabelMap[course.visibility] ?? course.visibility

						return (
							<tr key={course.id}>
								<td>
									<div className="course-info" onClick={() => onCourseClick?.(course)} role="button">
										<img
											src={course.thumbnailUrl || fallbackRowThumbnail}
											alt={course.title}
											className="course-thumbnail-small"
										/>
										<div className="course-details">
											<div className="course-title">{course.title}</div>
											<div className="course-description">{course.description}</div>
										</div>
									</div>
								</td>
								<td>
									<div className="meta-item">
										<User size={14} />
										<span>{(course as any).instructorName || ((course as any).organizationId ? `Org ${(course as any).organizationId}` : '—')}</span>
									</div>
								</td>
								<td>
									<div className="meta-item">
										<Hash size={14} />
										<span>{course.slug || '—'}</span>
									</div>
								</td>
								<td>
									<Badge variant={visibilityVariant}>{visibilityLabel}</Badge>
								</td>
								<td>
									<div className="meta-item">
										<Calendar size={14} />
										<span>{formatUpdatedAt(course.updatedAt)}</span>
									</div>
								</td>
								<td>
									<div className="action-buttons">
										<button className="btn btn-icon btn-sm btn-secondary" title="Xem" onClick={() => onCourseClick?.(course)}>
											<Eye size={16} />
										</button>
										<button className="btn btn-icon btn-sm btn-primary" title="Chỉnh sửa" onClick={() => onEditCourse?.(course)}>
											<Edit size={16} />
										</button>
										<button
											className={`btn btn-icon btn-sm ${isPublished ? 'btn-warning' : 'btn-success'}`}
											title={isPublished ? 'Chuyển về nháp' : 'Xuất bản'}
											onClick={() => onToggleStatus?.(course.id)}
										>
											{isPublished ? <Pause size={16} /> : <Play size={16} />}
										</button>
										<button className="btn btn-icon btn-sm btn-danger" title="Xóa" onClick={() => onDeleteCourse?.(course.id)}>
											<Trash2 size={16} />
										</button>
									</div>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
