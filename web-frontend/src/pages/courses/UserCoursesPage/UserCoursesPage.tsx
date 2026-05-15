import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	BookOpen, Search, Clock, Users, Star, Award,
	Play, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'
import courseApi, { Course } from '@/features/courses/api'
import './UserCoursesPage.css'

const PAGE_SIZE = 12

const levelMap: Record<string, string> = {
	beginner: 'Cơ bản',
	intermediate: 'Trung cấp',
	advanced: 'Nâng cao',
}

const levelColorMap: Record<string, string> = {
	beginner: '#10b981',
	intermediate: '#6366f1',
	advanced: '#ef4444',
}

const formatRelativeTime = (isoDate: string | undefined): string => {
	if (!isoDate) return ''
	const target = new Date(isoDate)
	if (Number.isNaN(target.getTime())) return ''
	const diffSeconds = Math.floor((Date.now() - target.getTime()) / 1000)
	if (diffSeconds < 45) return 'Vừa xong'
	const diffMinutes = Math.floor(diffSeconds / 60)
	if (diffMinutes < 60) return `${diffMinutes} phút trước`
	const diffHours = Math.floor(diffMinutes / 60)
	if (diffHours < 24) return `${diffHours} giờ trước`
	const diffDays = Math.floor(diffHours / 24)
	if (diffDays < 7) return `${diffDays} ngày trước`
	const diffWeeks = Math.floor(diffDays / 7)
	if (diffWeeks < 5) return `${diffWeeks} tuần trước`
	const diffMonths = Math.floor(diffDays / 30)
	if (diffMonths < 12) return `${diffMonths} tháng trước`
	return `${Math.max(1, Math.floor(diffDays / 365))} năm trước`
}

const resolveThumbnail = (c: Course): string | undefined => {
	return (c.thumbnailUrl || (c as any).thumbnail || (c as any).imageUrl || (c as any).coverUrl) as string | undefined
}

const getEnrollmentCount = (c: Course): number | undefined => {
	const v = (c as any).enrollmentCount ?? (c as any).learnersCount ?? (c as any).studentsCount ?? (c as any).enrolledCount
	if (Number.isFinite(Number(v))) return Number(v)
	const roster = (c as any).roster
	if (Array.isArray(roster)) return roster.length
	return undefined
}

const getDurationText = (c: Course): string => {
	const hours = Number((c as any).durationHours ?? (c as any).duration ?? (c as any).totalDurationHours)
	const minutes = Number((c as any).durationMinutes ?? (c as any).totalDurationMinutes)
	if (Number.isFinite(hours) && hours > 0) return `${hours} giờ`
	if (Number.isFinite(minutes) && minutes > 0) {
		if (minutes >= 60) {
			const h = Math.floor(minutes / 60)
			const m = minutes % 60
			return m > 0 ? `${h}h ${m}ph` : `${h} giờ`
		}
		return `${minutes} phút`
	}
	return '—'
}

const SkeletonCard = () => (
	<div className="skeleton-card">
		<div className="skeleton-thumb" />
		<div className="skeleton-body">
			<div className="skeleton-line" style={{ height: 12, width: '40%' }} />
			<div className="skeleton-line" style={{ height: 20, width: '85%' }} />
			<div className="skeleton-line" style={{ height: 16, width: '95%' }} />
			<div className="skeleton-line" style={{ height: 13, width: '60%' }} />
		</div>
	</div>
)

export default function UserCoursesPage(): JSX.Element {
	const navigate = useNavigate()

	const [courses, setCourses] = useState<Course[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedLevel, setSelectedLevel] = useState('all')
	const [currentPage, setCurrentPage] = useState(0)
	const [totalPages, setTotalPages] = useState(0)
	const [totalElements, setTotalElements] = useState(0)

	useEffect(() => {
		fetchCourses()
	}, [currentPage])

	const fetchCourses = async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await courseApi.getAllCourses(currentPage, PAGE_SIZE)
			setCourses(res.data.content ?? [])
			setTotalPages(res.data.totalPages ?? 0)
			setTotalElements(res.data.totalElements ?? 0)
		} catch (err: any) {
			setError(err?.message || 'Không thể tải danh sách khóa học')
		} finally {
			setLoading(false)
		}
	}

	const filteredCourses = courses.filter(c => {
		const q = searchQuery.toLowerCase()
		const matchesSearch =
			!q ||
			c.title?.toLowerCase().includes(q) ||
			c.description?.toLowerCase().includes(q)
		const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel
		return matchesSearch && matchesLevel
	})

	const handleCourseClick = (courseId: string) => {
		navigate(`/user/courses/${courseId}`)
	}

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.slice(0, 2)
			.map(w => w[0]?.toUpperCase() ?? '')
			.join('')
	}

	// Build page numbers with ellipsis
	const buildPages = () => {
		const total = totalPages
		if (total <= 7) return Array.from({ length: total }, (_, i) => i)
		const pages: (number | '...')[] = []
		pages.push(0)
		if (currentPage > 3) pages.push('...')
		const start = Math.max(1, currentPage - 1)
		const end = Math.min(total - 2, currentPage + 1)
		for (let i = start; i <= end; i++) pages.push(i)
		if (currentPage < total - 4) pages.push('...')
		pages.push(total - 1)
		return pages
	}

	const pages = buildPages()

	return (
		<div className="page-wrapper">

			{/* Hero Header */}
			<div className="hero-header">
				<div className="hero-content">
					<div className="hero-left">
						<div className="hero-icon">
							<BookOpen size={28} />
						</div>
						<div className="hero-text">
							<h1>Khám phá khóa học</h1>
							<p>Học tập mọi lúc, mọi nơi với các khóa học chất lượng cao</p>
						</div>
					</div>
					<div className="hero-stats">
						<div className="hero-stat">
							<BookOpen size={15} />
							{totalElements} khóa học
						</div>
						<div className="hero-stat">
							<Sparkles size={15} />
							Học liên tục
						</div>
					</div>
				</div>
			</div>

			{/* Filter Bar */}
			<div className="filter-bar">
				<div className="filter-card">
					<div className="search-input-wrap">
						<Search size={18} />
						<input
							className="search-input"
							placeholder="Tìm kiếm khóa học..."
							value={searchQuery}
							onChange={e => {
								setSearchQuery(e.target.value)
								setCurrentPage(0)
							}}
						/>
					</div>

					<select
						className="filter-select"
						value={selectedLevel}
						onChange={e => {
							setSelectedLevel(e.target.value)
							setCurrentPage(0)
						}}
					>
						<option value="all">Tất cả cấp độ</option>
						<option value="beginner">Cơ bản</option>
						<option value="intermediate">Trung cấp</option>
						<option value="advanced">Nâng cao</option>
					</select>

					<div className="results-count">
						{loading ? '...' : `${filteredCourses.length} khóa học`}
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="main-content">

				{/* Courses Grid */}
				<div className="courses-grid">
					{loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

					{!loading && error && (
						<div className="error-state">
							<div className="error-title">{error}</div>
							<button className="btn-retry" onClick={fetchCourses}>Thử lại</button>
						</div>
					)}

					{!loading && !error && filteredCourses.length === 0 && (
						<div className="empty-state">
							<div className="empty-icon">
								<BookOpen size={36} />
							</div>
							<div className="empty-title">Không tìm thấy khóa học</div>
							<div className="empty-subtitle">
								Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem thêm kết quả
							</div>
						</div>
					)}

					{!loading && !error && filteredCourses.map(course => {
						const thumbnail = resolveThumbnail(course)
						const enrollmentCount = getEnrollmentCount(course)
						const levelText = levelMap[course.level ?? ''] ?? course.level
						const levelColor = levelColorMap[course.level ?? ''] ?? '#6366f1'
						const instructorName = (course as any).instructorName ?? (course as any).instructor?.name ?? 'Giảng viên'

						return (
							<div
								key={course.id}
								className="course-card"
								onClick={() => handleCourseClick(course.id)}
							>
								{/* Thumbnail */}
								<div className="card-thumbnail">
									{thumbnail ? (
										<img
											src={thumbnail}
											alt={course.title}
											onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
										/>
									) : (
										<div className="thumbnail-placeholder">
											<BookOpen size={40} />
										</div>
									)}

									{/* Badges on thumbnail */}
									<div className="thumbnail-badges">
										{levelText && (
											<span
												className="thumbnail-badge badge-level"
												style={{ background: levelColor + 'ee', color: '#fff' }}
											>
												{levelText}
											</span>
										)}
										{(course as any).price === 0 && (
											<span className="thumbnail-badge badge-free">Miễn phí</span>
										)}
										{(course as any).price > 0 && (
											<span className="thumbnail-badge badge-paid">
												{(course as any).tokenSymbol ?? 'Token'}
											</span>
										)}
										{course.isFeatured && (
											<span className="thumbnail-badge badge-featured">Nổi bật</span>
										)}
										{course.certificateAvailable && (
											<span className="thumbnail-badge badge-cert">
												<Award size={10} style={{ marginRight: 3 }} />
												Chứng chỉ
											</span>
										)}
									</div>
								</div>

								{/* Card Body */}
								<div className="card-body">
									{(course as any).categoryName && (
										<div className="card-category">{(course as any).categoryName}</div>
									)}

									<h3 className="card-title">{course.title}</h3>

									{course.description && (
										<p className="card-description">
											{course.description.length > 120
												? course.description.slice(0, 120) + '…'
												: course.description}
										</p>
									)}

									{/* Meta row */}
									<div className="card-meta">
										<div className="meta-item">
											<Clock size={13} />
											{getDurationText(course)}
										</div>
										{enrollmentCount !== undefined && (
											<div className="meta-item">
												<Users size={13} />
												{enrollmentCount} học viên
											</div>
										)}
										{course.rating !== undefined && (
											<div className="meta-item rating">
												<Star size={13} fill="currentColor" />
												{course.rating.toFixed(1)}
											</div>
										)}
									</div>
								</div>

								{/* Card Footer */}
								<div className="card-footer">
									<div className="instructor-row">
										<div className="instructor-avatar">
											{(course as any).instructorAvatar ? (
												<img src={(course as any).instructorAvatar} alt={instructorName} />
											) : (
												getInitials(instructorName)
											)}
										</div>
										<span className="instructor-name">{instructorName}</span>
									</div>

									<button
										className="btn-study"
										onClick={e => { e.stopPropagation(); handleCourseClick(course.id) }}
									>
										<Play size={13} />
										Học ngay
									</button>
								</div>
							</div>
						)
					})}
				</div>

				{/* Pagination */}
				{!loading && totalPages > 1 && (
					<div className="pagination">
						<button
							className="page-btn"
							disabled={currentPage === 0}
							onClick={() => setCurrentPage(p => p - 1)}
						>
							<ChevronLeft size={16} />
						</button>

						{pages.map((p, i) =>
							p === '...' ? (
								<span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
							) : (
								<button
									key={p}
									className={`page-btn${currentPage === p ? ' active' : ''}`}
									onClick={() => setCurrentPage(p as number)}
								>
									{(p as number) + 1}
								</button>
							)
						)}

						<button
							className="page-btn"
							disabled={currentPage >= totalPages - 1}
							onClick={() => setCurrentPage(p => p + 1)}
						>
							<ChevronRight size={16} />
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
