import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Search,
  Clock,
  Users,
  Star,
  ChevronRight,
  Award,
  TrendingUp,
  Play
} from 'lucide-react'
import courseApi, { Course } from '@/features/courses/api'
import { useAppSelector } from '@/foundation/store/hooks'

const formatRelativeTime = (isoDate: string | undefined): string => {
  if (!isoDate) return ''
  const target = new Date(isoDate)
  if (Number.isNaN(target.getTime())) return ''

  const now = Date.now()
  const diffSeconds = Math.floor((now - target.getTime()) / 1000)

  if (diffSeconds < 45) return 'vừỏ xong'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `khoảng ${diffMinutes} phút trướ`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `khoảng ${diffHours} giǭ trướ`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `khoảng ${diffDays} ngày trước`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 5) return `khoảng ${diffWeeks} tuần trước`

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `khoảng ${diffMonths} tháng trước`

  const diffYears = Math.max(1, Math.floor(diffDays / 365))
  return `khoảng ${diffYears} năm trước`
}

export default function UserCoursesPage(): JSX.Element {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasFetched, setHasFetched] = useState(false)

  // ✅ FIX: Add guard to prevent duplicate fetch in React StrictMode
  useEffect(() => {
    if (!hasFetched || currentPage > 0) {
      fetchCourses()
      setHasFetched(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await courseApi.getAllCourses(currentPage, 12)
      setCourses(response.data.content)
      setTotalPages(response.data.totalPages)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching courses:', err)
      setError(err.message || 'Không thể tải danh sách khóa học')
    } finally {
      setLoading(false)
    }
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    const matchesCategory = selectedCategory === 'all' || course.category?.name === selectedCategory
    return matchesSearch && matchesLevel && matchesCategory
  })

  const handleCourseClick = (courseId: string) => {
    navigate(`/user/courses/${courseId}`)
  }

  const handleEnrollCourse = async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement enrollment logic
    console.log('Enroll course:', courseId)
    handleCourseClick(courseId)
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'var(--success)'
      case 'intermediate': return 'var(--accent)'
      case 'advanced': return 'var(--destructive)'
      default: return 'var(--muted-foreground)'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Cư bản'
      case 'intermediate': return 'Trung cấp'
      case 'advanced': return 'Nâng cao'
      default: return level
    }
  }

  const resolveThumbnail = (c: Course): string | undefined => {
    return (c.thumbnailUrl || (c as any).thumbnail || (c as any).imageUrl || (c as any).coverUrl) as string | undefined
  }

  const getDurationText = (c: Course): string => {
    const hours = Number((c as any).durationHours ?? (c as any).duration ?? (c as any).totalDurationHours)
    const minutes = Number((c as any).durationMinutes ?? (c as any).totalDurationMinutes)
    if (Number.isFinite(hours) && hours > 0) return `${hours}${Number.isInteger(hours) ? '' : ''} giǭ`
    if (Number.isFinite(minutes) && minutes > 0) {
      if (minutes >= 60) {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return m > 0 ? `${h} giǭ ${m} phút` : `${h} giǭ`
      }
      return `${minutes} phút`
    }
    return '0 giǭ'
  }

  const getEnrollmentCount = (c: Course): number | undefined => {
    const v = (c as any).enrollmentCount ?? (c as any).learnersCount ?? (c as any).studentsCount ?? (c as any).enrolledCount
    if (Number.isFinite(Number(v))) return Number(v)
    const roster = (c as any).roster
    if (Array.isArray(roster)) return roster.length
    return undefined
  }

  return (
    <div className="user-courses-page">
      {/* Header */}
      <div className="courses-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <BookOpen size={32} />
            </div>
            <div>
              <h1>Khóa học</h1>
              <p>Khám phá và học tập các khóa học chất lượng</p>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <BookOpen size={20} />
              <span>{courses.length} khóa học</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="courses-filters">
        <div className="filters-left">
          {/* Search */}
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm kiẉm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả cấp độ</option>
            <option value="beginner">Cư bản</option>
            <option value="intermediate">Trung cấp</option>
            <option value="advanced">Nâng cao</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả danh mục</option>
            {/* Will be populated dynamically */}
          </select>
        </div>

      </div>

      {/* Content */}
      <div className="courses-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải khóa học...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchCourses} className="btn-retry">
              Thử lại
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>Không tìm thấy khóa học</h3>
            <p>Thử điệu chỉnh bộ lộ c hoộc tìm kiẉm khác</p>
          </div>
        ) : (
          <>
            <div className="courses-grid">
              {filteredCourses.map((course) => {
                const subtitleParts = [course.instructor?.name, course.category?.name].filter(Boolean) as string[]
                const subtitleText = subtitleParts.length > 0
                  ? subtitleParts.join(' | ')
                  : 'Khóa học trền nền tảng Code Spark'

                return (
                  <div
                    key={course.id}
                    className="course-card"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="course-icon">
                      {resolveThumbnail(course) ? (
                        <img
                          src={resolveThumbnail(course)}
                          alt={course.title}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <BookOpen size={28} />
                      )}
                    </div>

                    <div className="course-card-content">
                      <div className="course-card-header">
                        <div>
                          <h3 className="course-title">{course.title}</h3>
                          <p className="course-subtitle">{subtitleText}</p>
                        </div>

                        {course.updatedAt && (
                          <span className="course-time">{formatRelativeTime(course.updatedAt)}</span>
                        )}
                      </div>

                      <p className="course-description">
                        {course.shortDescription || course.description}
                      </p>

                      <div className="course-tags">
                        {course.instructor && (
                          <span className="course-tag">
                            <Users size={14} />
                            {course.instructor.name}
                          </span>
                        )}

                        {course.category && (
                          <span className="course-tag neutral">
                            <BookOpen size={14} />
                            {course.category.name}
                          </span>
                        )}

                        <span className="course-tag level">
                          {getLevelText(course.level)}
                        </span>

                        {course.certificateAvailable && (
                          <span className="course-tag success">
                            <Award size={14} />
                            Chỏ ng chỏ
                          </span>
                        )}

                        {course.isFeatured && (
                          <span className="course-tag highlight">
                            <Star size={14} />
                            Nổi bật
                          </span>
                        )}

                        {course.price === 0 ? (
                          <span className="course-tag free">Miễn phí</span>
                        ) : (
                          <span className="course-tag token">
                            <TrendingUp size={14} />
                            +{course.price} {course.tokenSymbol || 'token'}
                          </span>
                        )}

                        {course.tags?.map((tag) => (
                          <span key={`${course.id}-${tag}`} className="course-tag subtle">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="course-footer">
                        <div className="course-meta">
                          <div className="meta-item">
                            <Clock size={16} />
                            <span>{getDurationText(course)}</span>
                          </div>

                          {getEnrollmentCount(course) !== undefined && (
                            <div className="meta-item">
                              <Users size={16} />
                              <span>{getEnrollmentCount(course)} hộ viên</span>
                            </div>
                          )}

                          {course.rating !== undefined && (
                            <div className="meta-item rating">
                              <Star size={16} fill="currentColor" />
                              <span>{course.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn-enroll"
                          onClick={(e) => handleEnrollCourse(course.id, e)}
                        >
                          <Play size={16} />
                          <span>Hộc ngay</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="btn-page"
                >
                  Trướ
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`btn-page-number ${currentPage === i ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages - 1}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="btn-page"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

