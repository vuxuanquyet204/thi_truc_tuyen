import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, Clock, Users, Star, Award, ChevronRight, Play, FileText, CheckCircle, TrendingUp, Clapperboard, ClipboardList, PlayCircle, BadgeCheck, LockKeyhole } from 'lucide-react'
import courseApi, { Course, Material, Progress } from '@/features/courses/api'
import { useAppSelector } from '@/foundation/store/hooks'

type ProgressState = Progress & {
  progressPercentage?: number;
  completedMaterials?: string[];
};

const COURSE_COMPLETION_REWARD = Number(import.meta.env.VITE_COURSE_COMPLETION_REWARD ?? 100);

export default function CourseDetailPage(): JSX.Element {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  
  const [course, setCourse] = useState<Course | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor'>('overview')
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const getDerivedCompletedCount = (total: number, percent: number): number => {
    if (!Number.isFinite(percent) || total <= 0) return 0
    if (percent >= 100) return total
    const approx = Math.round((percent / 100) * total)
    return Math.min(Math.max(approx, 0), total)
  }

  const getPercentComplete = (value?: ProgressState | null): number => {
    if (!value) {
      return 0
    }
    const rawPercent =
      value.percentComplete ??
      value.progressPercentage ??
      ((value as unknown) as Record<string, unknown>).progress ??
      0
    const numeric = Number(rawPercent)
    return Number.isFinite(numeric) ? numeric : 0
  }

  const normalizeProgress = (data: any): ProgressState | null => {
    if (!data) {
      return null
    }
    const percent = Number(
      data?.percentComplete ?? data?.progressPercentage ?? data?.progress ?? 0
    )
    const normalizedPercent = Number.isFinite(percent) ? percent : 0
    const completedMaterials = Array.isArray(data?.completedMaterials)
      ? data.completedMaterials
      : []

    return {
      ...data,
      percentComplete: normalizedPercent,
      progressPercentage: normalizedPercent,
      completedMaterials,
    } as ProgressState
  }

  // ✅ FIX: Add guard to prevent duplicate fetch in React StrictMode
  useEffect(() => {
    if (courseId && !hasFetched) {
      fetchCourseData()
      setHasFetched(true)
    }
  }, [courseId, hasFetched])

  const fetchCourseData = async () => {
    if (!courseId) return
    
    try {
      setLoading(true)
      
      // Fetch course details
      const courseResponse = await courseApi.getCourseById(courseId)
      setCourse(courseResponse.data ?? null)

      // Fetch materials
      try {
        const materialsResponse = await courseApi.getCourseMaterials(courseId)
        setMaterials(materialsResponse.data ?? [])
      } catch (err) {
        console.log('No materials found or error fetching materials')
      }

      // Fetch progress if user is enrolled
      if (user?.id) {
        try {
          const progressResponse = await courseApi.getStudentProgress(user.id, courseId)
          const normalizedProgress = normalizeProgress(progressResponse.data)
          setProgress(normalizedProgress)
          setIsEnrolled(true)
        } catch (err) {
          console.log('User not enrolled or no progress found')
          setProgress(null)
          setIsEnrolled(false)
        }
      }

      setError(null)
    } catch (err: any) {
      console.error('Error fetching course data:', err)
      setError(err.message || 'Không thể tải thông tin khóa học')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollCourse = () => {
    if (!courseId) return
    // TODO: Implement enrollment logic
    console.log('Enroll course:', courseId)
    setIsEnrolled(true)
    navigate(`/user/courses/${courseId}/learn`)
  }

  const handleStartLearning = () => {
    if (!courseId) return
    navigate(`/user/courses/${courseId}/learn`)
  }

  const handleMaterialClick = (materialId: string) => {
    if (!isEnrolled) {
      alert('Vui lòng đăng ký khóa học để truy cạp tài liệu')
      return
    }
    navigate(`/user/courses/${courseId}/learn?material=${materialId}`)
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Cư bản'
      case 'intermediate': return 'Trung cấp'
      case 'advanced': return 'Nâng cao'
      default: return level
    }
  }

  const formatDuration = (duration: number | string | null | undefined) => {
    const numeric = Number(duration)

    if (!Number.isFinite(numeric) || numeric <= 0) {
      return '0 giǭ'
    }

    if (Number.isInteger(numeric)) {
      return `${numeric} giǭ`
    }

    return `${numeric.toFixed(1)} giǭ`
  }

  const formatMaterialDuration = (duration: number | string | null | undefined) => {
    const numeric = Number(duration)

    if (!Number.isFinite(numeric) || numeric <= 0) {
      return null
    }

    const totalMinutes = Math.round(numeric)

    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const parts: string[] = []

      if (hours > 0) {
        parts.push(`${hours} giǭ`)
      }

      if (minutes > 0) {
        parts.push(`${minutes} phút`)
      }

      return parts.join(' ')
    }

    return `${totalMinutes} phút`
  }

  const getMaterialTypeMeta = (type?: string) => {
    const normalizedType = type?.toLowerCase()

    switch (normalizedType) {
      case 'video':
        return {
          className: 'video',
          label: 'Video bài giảng',
          icon: <Clapperboard size={24} strokeWidth={1.8} />
        }
      case 'quiz':
        return {
          className: 'quiz',
          label: 'Bại kiểm tra',
          icon: <ClipboardList size={24} strokeWidth={1.8} />
        }
      case 'document':
      case 'pdf':
        return {
          className: 'document',
          label: 'Tài liệu',
          icon: <FileText size={24} strokeWidth={1.8} />
        }
      default:
        return {
          className: 'default',
          label: 'Nội dung',
          icon: <BookOpen size={24} strokeWidth={1.8} />
        }
    }
  }

  const isMaterialCompleted = (materialId: string) => {
    const completed = progress?.completedMaterials ?? []
    if (Array.isArray(completed) && completed.includes(materialId)) return true
    const total = materials.length
    if (total === 0) return false
    const derivedCount = getDerivedCompletedCount(total, getPercentComplete(progress))
    if (derivedCount <= 0) return false
    const index = materials.findIndex(m => m.id === materialId)
    return index > -1 && index < derivedCount
  }

  const getMaterialStatusMeta = (materialId: string) => {
    if (isMaterialCompleted(materialId)) {
      return {
        className: 'completed',
        label: 'đã hoàn thành',
        icon: <BadgeCheck size={20} />
      }
    }

    if (!isEnrolled) {
      return {
        className: 'locked',
        label: 'Bại bị khóa',
        icon: <LockKeyhole size={20} />
      }
    }

    return {
      className: 'active',
      label: 'Hộ ngay',
      icon: <PlayCircle size={20} />
    }
  }

  const percentComplete = getPercentComplete(progress)
  const completedMaterialsCount = (() => {
    const listCount = Array.isArray(progress?.completedMaterials) ? progress!.completedMaterials!.length : 0
    const derived = getDerivedCompletedCount(materials.length, percentComplete)
    return Math.max(listCount, derived)
  })()

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải khóa học...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="course-detail-error">
        <p>{error || 'Không tìm thấy khóa học'}</p>
        <button onClick={() => navigate('/user/courses')} className="btn-back">
          Quay lại danh sách khóa học
        </button>
      </div>
    )
  }

  return (
    <div className="course-detail-page">
      <div className="course-detail-container">
        {/* Summary Card */}
        <div className="course-summary-card">
          <div className="course-summary-main">
            {/* Category & Level */}
            <div className="course-meta">
              {course.category && (
                <span className="category-badge">{course.category.name}</span>
              )}
              <span className="level-badge">{getLevelText(course.level)}</span>
            </div>

            {/* Title */}
            <h1 className="course-title">{course.title}</h1>

            {/* Description */}
            <p className="course-description">{course.description}</p>

            {/* Stats */}
            <div className="course-stats">
              {course.rating !== undefined && (
                <div className="stat">
                  <Star size={20} fill="currentColor" />
                  <span>{course.rating.toFixed(1)}</span>
                  {course.reviewCount !== undefined && (
                    <span className="muted">({course.reviewCount} đánh giá)</span>
                  )}
                </div>
              )}

              {(course as any).enrollmentCount !== undefined || (course as any).studentsCount !== undefined || (course as any).learnersCount !== undefined ? (
                <div className="stat">
                  <Users size={20} />
                  <span>{(course as any).enrollmentCount ?? (course as any).studentsCount ?? (course as any).learnersCount} hộ viên</span>
                </div>
              ) : null}

              <div className="stat">
                <Clock size={20} />
                <span>{formatDuration((course as any).duration ?? (course as any).totalDurationMinutes ?? (course as any).durationMinutes)}</span>
              </div>

              {course.certificateAvailable && (
                <div className="stat">
                  <Award size={20} />
                  <span>Có chỏ ng chỏ</span>
                </div>
              )}
            </div>

            {/* Instructor */}
            {course.instructor && (
              <div className="course-instructor">
                <div className="instructor-avatar">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.name} />
                  ) : (
                    <Users size={24} />
                  )}
                </div>
                <div>
                  <p className="label">Giảng viên</p>
                  <p className="name">{course.instructor.name}</p>
                </div>
              </div>
            )}

            <div className="course-actions">
              {/* CTA Button */}
              {isEnrolled ? (
                <button onClick={handleStartLearning} className="btn-primary">
                  <Play size={20} />
                  <span>Tiếp tục học</span>
                  {progress && (
                    <span className="progress-badge">{percentComplete}%</span>
                  )}
                </button>
              ) : (
                <button onClick={handleEnrollCourse} className="btn-primary">
                  <span>đăng kộ học</span>
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Price */}
              <div className="course-price">
                {course.price === 0 ? (
                  <span className="free">Miễn phí</span>
                ) : (
                  <>
                    <span className="price">{course.price}</span>
                    <span className="token">{course.tokenSymbol || 'LEARN'}</span>
                  </>
                )}
              </div>

              <div className="reward-info">
                <Award />
                <span>Hoàn thành khóa học để nhận {COURSE_COMPLETION_REWARD} LEARN.</span>
              </div>
            </div>
          </div>

            <div className="course-summary-side">
            {/* Thumbnail */}
            <div className="course-thumbnail">
              {course.thumbnailUrl || (course as any).thumbnail ? (
                <img src={(course as any).thumbnailUrl || (course as any).thumbnail} alt={course.title} />
              ) : (
                <div className="thumbnail-placeholder">
                  <BookOpen size={64} />
                </div>
              )}
            </div>

            {/* Progress Card (if enrolled) */}
            {isEnrolled && progress && (
              <div className="progress-card">
                <div className="progress-header">
                  <TrendingUp size={20} />
                  <span>Tiến độ học tập</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${percentComplete}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {completedMaterialsCount} / {materials.length} tài liệu hoàn thành
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="course-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button
            className={activeTab === 'curriculum' ? 'active' : ''}
            onClick={() => setActiveTab('curriculum')}
          >
            Nội dung khóa học
          </button>
          <button
            className={activeTab === 'instructor' ? 'active' : ''}
            onClick={() => setActiveTab('instructor')}
          >
            Giờng viên
          </button>
        </div>

        {/* Tab Content */}
        <div className="course-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Learning Outcomes */}
            {course.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div className="content-section">
                <h2>Bạn sẽ học được gì</h2>
                <ul className="outcomes-list">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index}>
                      <CheckCircle size={20} />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="content-section">
                <h2>Yêu cầu</h2>
                <ul className="prerequisites-list">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index}>
                      <ChevronRight size={16} />
                      <span>{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course Info */}
            <div className="content-section">
              <h2>Thông tin khóa học</h2>
              <div className="info-grid">
                <div className="info-item">
                  <Clock size={24} />
                  <div>
                    <p className="label">Thời lưởng</p>
                    <p className="value">{formatDuration(course.duration)}</p>
                  </div>
                </div>
                <div className="info-item">
                  <BookOpen size={24} />
                  <div>
                    <p className="label">Số tài liệu</p>
                    <p className="value">{materials.length} tài liệu</p>
                  </div>
                </div>
                <div className="info-item">
                  <Users size={24} />
                  <div>
                    <p className="label">Hộc viên</p>
                    <p className="value">{course.enrollmentCount || 0} người</p>
                  </div>
                </div>
                {course.certificateAvailable && (
                  <div className="info-item">
                    <Award size={24} />
                    <div>
                      <p className="label">Chứng chỉ</p>
                      <p className="value">Có</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && (
          <div className="tab-content">
            <div className="content-section">
              <h2>Nội dung khóa học</h2>
              <p className="section-description">
                {materials.length} tài liệu • {formatDuration(course.duration)}
              </p>

              {materials.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>Chưa có tài liệu nào</p>
                </div>
              ) : (
                <div className="materials-list">
                  {materials.map((material, index) => {
                    const typeMeta = getMaterialTypeMeta(material.type)
                    const statusMeta = getMaterialStatusMeta(material.id)
                    const materialDuration = formatMaterialDuration(material.duration)

                    return (
                      <div
                        key={material.id}
                        className={`material-item ${isMaterialCompleted(material.id) ? 'completed' : ''} ${!isEnrolled ? 'locked' : ''}`}
                        onClick={() => handleMaterialClick(material.id)}
                      >
                        <div className="material-left">
                          <span className="material-number">{String(index + 1).padStart(2, '0')}</span>
                          <div className={`material-icon ${typeMeta.className}`}>
                            {typeMeta.icon}
                          </div>
                          <div
                            className="material-info"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
                          >
                            <h3 style={{ margin: 0, flex: 1 }}>{material.title}</h3>
                            <span className={`material-type-badge ${typeMeta.className}`}>
                              {typeMeta.label}
                            </span>
                            {material.description && (
                              <p>{material.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="material-right">
                          {materialDuration && (
                            <span className="material-duration">
                              <Clock size={16} />
                              {materialDuration}
                            </span>
                          )}
                          <span className={`material-status ${statusMeta.className}`}>
                            {statusMeta.icon}
                            <span>{statusMeta.label}</span>
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructor Tab */}
        {activeTab === 'instructor' && course.instructor && (
          <div className="tab-content">
            <div className="content-section">
              <div className="instructor-profile">
                <div className="instructor-avatar-large">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.name} />
                  ) : (
                    <Users size={64} />
                  )}
                </div>
                <div className="instructor-info">
                  <h2>{course.instructor.name}</h2>
                  {course.instructor.email && (
                    <p className="instructor-email">{course.instructor.email}</p>
                  )}
                  {course.instructor.bio && (
                    <p className="instructor-bio">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

