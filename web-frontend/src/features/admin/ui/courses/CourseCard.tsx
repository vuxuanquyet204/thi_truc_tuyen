import { type Course as ApiCourse } from '@/features/courses/api/courseApi'
import Badge from '@/features/admin/ui/common/Badge'
import styles from './CourseCard.module.css'
import { Edit, Trash2, Eye, Play, Pause, Calendar, Hash, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface CourseCardProps {
	course: ApiCourse & { instructorName?: string | null }
	onClick?: (course: ApiCourse) => void
	onEdit?: (course: ApiCourse) => void
	onDelete?: (courseId: string) => void
	onToggleStatus?: (courseId: string) => void
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

const fallbackThumbnail =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="280" height="160"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="%2394a3b8">No thumbnail</text></svg>'

const truncate = (value: string, length = 160) => {
	if (!value) return ''
	return value.length <= length ? value : `${value.slice(0, length)}…`
}

const stopPropagation = (fn: () => void) => (e: React.MouseEvent) => {
	e.stopPropagation()
	fn()
}

export default function CourseCard({ course, onClick, onEdit, onDelete, onToggleStatus }: CourseCardProps): JSX.Element {
	const isPublished = course.visibility === 'published'
	const visibilityVariant = visibilityVariantMap[course.visibility] ?? 'secondary'
	const visibilityLabel = visibilityLabelMap[course.visibility] ?? course.visibility
	const updatedAt = course.updatedAt
		? formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true, locale: vi })
		: 'Không xác định'

	const instructorDisplay = course.instructorName || `Org ${(course as ApiCourse & { organizationId?: string }).organizationId || '—'}`

	return (
		<div
			className={styles['course-card']}
			onClick={() => onClick?.(course)}
			role="button"
			tabIndex={0}
			onKeyDown={e => e.key === 'Enter' && onClick?.(course)}
		>
			<div className={styles['course-overlay']}>
				<div className={styles['course-actions']}>
					<button type="button" className={`${styles['course-action-btn']} ${styles['course-action-btn--view']}`} title="Xem chi tiết" onClick={stopPropagation(() => onClick?.(course))}>
						<Eye size={16} />
					</button>
					<button type="button" className={`${styles['course-action-btn']} ${styles['course-action-btn--edit']}`} title="Chỉnh sửa" onClick={stopPropagation(() => onEdit?.(course))}>
						<Edit size={16} />
					</button>
					<button
						type="button"
						className={`${styles['course-action-btn']} ${isPublished ? styles['course-action-btn--pause'] : styles['course-action-btn--publish']}`}
						title={isPublished ? 'Chuyển về nháp' : 'Xuất bản khóa học'}
						onClick={stopPropagation(() => onToggleStatus?.(course.id))}
					>
						{isPublished ? <Pause size={18} /> : <Play size={18} />}
					</button>
					<button type="button" className={`${styles['course-action-btn']} ${styles['course-action-btn--delete']}`} title="Xóa khóa học" onClick={stopPropagation(() => onDelete?.(course.id))}>
						<Trash2 size={16} />
					</button>
				</div>
			</div>

			<div className={styles['course-hero']}>
				<img src={course.thumbnailUrl || fallbackThumbnail} alt={course.title} className={styles['course-hero-thumbnail']} />
				<div className={styles['course-hero-top']}>
					<Badge variant={visibilityVariant}>{visibilityLabel}</Badge>
				</div>
				<h3 className={styles['course-hero-title']}>{course.title}</h3>
			</div>

			<div className={styles['course-content']}>
				<p className={styles['course-description']}>{truncate(course.description)}</p>

				<div className={styles['course-meta-simple']}>
					<div className={styles['meta-item']}>
						<User size={14} />
						<span>{instructorDisplay}</span>
					</div>
					{course.slug && (
						<div className={styles['meta-item']}>
							<Hash size={14} />
							<span>{course.slug}</span>
						</div>
					)}
					<div className={styles['meta-item']}>
						<Calendar size={14} />
						<span>Cập nhật {updatedAt}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
