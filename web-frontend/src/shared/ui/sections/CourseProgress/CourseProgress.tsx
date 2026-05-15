import React, { useState, useEffect } from 'react'
import { X, BookOpen, Award, Clock, TrendingUp, CheckCircle, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CourseCard from '../../atoms/CourseCard'
import courseApi from '@/features/courses/api'
import { useAppSelector } from '@/foundation/store/hooks'
import styles from './CourseProgress.module.css'

interface Course {
    id: string
    title: string
    progress: number
    totalLessons: number
    completedLessons: number
    duration: string
    nextLesson?: string
    certificate?: boolean
}

interface CourseProgressProps {
    courses?: Course[]
    onContinueCourse?: (courseId: string) => void
    onViewCourse?: (courseId: string) => void
}

export default function CourseProgress({
    courses: propCourses,
    onContinueCourse,
    onViewCourse
}: CourseProgressProps): JSX.Element {
    const normalizeProgress = (data: any) => {
        const percent = Number(
            data?.percentComplete ??
            data?.progressPercentage ??
            data?.progress ??
            0
        )

        const percentComplete = Number.isFinite(percent)
            ? Math.min(Math.max(percent, 0), 100)
            : 0

        const completedMaterials = Array.isArray(data?.completedMaterials)
            ? data.completedMaterials
            : []

        return {
            percentComplete,
            completedMaterials
        }
    }

    const getDerivedCompletedCount = (total: number, percent: number): number => {
        if (!Number.isFinite(percent) || total <= 0) return 0
        if (percent >= 100) return total
        const approx = Math.round((percent / 100) * total)
        return Math.min(Math.max(approx, 0), total)
    }

    const formatDuration = (duration: number | string | null | undefined) => {
        const numeric = Number(duration)

        if (!Number.isFinite(numeric) || numeric <= 0) {
            return '0 giờ'
        }

        if (Number.isInteger(numeric)) {
            return `${numeric} giờ`
        }

        return `${numeric.toFixed(1)} giờ`
    }

    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)
    const [showCourseDetailModal, setShowCourseDetailModal] = useState(false)
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
    const [courses, setCourses] = useState<Course[]>(propCourses || [])
    const [loading, setLoading] = useState(!propCourses)

    useEffect(() => {
        if (!propCourses && user?.id) {
            fetchEnrolledCourses()
        }
    }, [propCourses, user])

    const fetchEnrolledCourses = async () => {
        if (!user?.id) return
        
        try {
            setLoading(true)
            // Fetch courses with progress
            const coursesResponse = await courseApi.getAllCourses(0, 4)
            const coursesData = coursesResponse.data?.content ?? []
            
            // Fetch progress for each course and transform data
            const coursesWithProgress = await Promise.all(
                coursesData.slice(0, 4).map(async (course) => {
                    const [progressResult, materialsResult] = await Promise.allSettled([
                        courseApi.getStudentProgress(user.id, course.id),
                        courseApi.getCourseMaterials(course.id)
                    ])

                    const normalizedProgress = progressResult.status === 'fulfilled'
                        ? normalizeProgress(progressResult.value.data)
                        : normalizeProgress(null)

                    const materials = materialsResult.status === 'fulfilled' && Array.isArray(materialsResult.value.data)
                        ? materialsResult.value.data
                        : []

                    const derivedCompleted = getDerivedCompletedCount(materials.length, normalizedProgress.percentComplete)
                    const completedLessons = Math.max(normalizedProgress.completedMaterials.length, derivedCompleted)
                    const finalCompletedLessons = normalizedProgress.percentComplete >= 100 ? materials.length : completedLessons

                    return {
                        id: course.id,
                        title: course.title,
                        progress: normalizedProgress.percentComplete,
                        totalLessons: materials.length,
                        completedLessons: finalCompletedLessons,
                        duration: formatDuration(course.duration ?? course.totalDuration),
                        certificate: Boolean(course.certificateAvailable ?? course.certificate)
                    }
                })
            )
            
            setCourses(coursesWithProgress)
        } catch (err) {
            console.error('Error fetching enrolled courses:', err)
            // Set empty courses on error
            setCourses([])
        } finally {
            setLoading(false)
        }
    }

    const handleContinueCourse = (courseId: string) => {
        const course = courses.find(c => c.id === courseId)
        if (course) {
            if (course.progress === 100) {
                // Show completion modal
                setSelectedCourse(course)
                setShowCompletionModal(true)
            } else {
                // Navigate to continue course
                navigate(`/user/courses/${courseId}/learn`)
            }
            onContinueCourse?.(courseId)
        }
    }

    const handleViewCourse = (courseId: string) => {
        const course = courses.find(c => c.id === courseId)
        if (course) {
            setSelectedCourse(course)
            setShowCourseDetailModal(true)
            onViewCourse?.(courseId)
        }
    }

    const handleViewAllCourses = () => {
        navigate('/user/courses')
    }

    const handleViewCertificate = () => {
        if (selectedCourse) {
            navigate(`/user/certificate/${selectedCourse.id}`)
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'var(--primary)'
        if (progress >= 60) return 'var(--primary)'
        if (progress >= 40) return 'var(--accent)'
        return 'var(--destructive)'
    }

    const getProgressMessage = (progress: number) => {
        if (progress === 100) return 'Đã hoàn thành!'
        if (progress >= 80) return 'Sắp hoàn thành!'
        if (progress >= 60) return 'Đang tiến bộ tốt!'
        if (progress >= 40) return 'Tiếp tục phát huy!'
        if (progress >= 20) return 'Đang bắt đầu'
        return 'Mới bắt đầu'
    }

    return (
        <>
            <div className={`card stagger-load hover-lift interactive ${styles.container}`}>
                <div className={styles.header}>
                    <h3 className={styles.title}>
                        Tiến độ khóa học
                    </h3>
                    <button
                        onClick={handleViewAllCourses}
                        className={styles.viewCoursesButton}
                    >
                        Xem khóa học
                    </button>
                </div>

                <div className={styles.courseList}>
                    {loading ? (
                        <div className={styles.stateContainer}>
                            <p className={styles.stateText}>Đang tải...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className={styles.stateContainer}>
                            <BookOpen className={styles.stateIcon} size={48} />
                            <p className={styles.stateText}>Bạn chưa đăng ký khóa học nào</p>
                            <button
                                onClick={handleViewAllCourses}
                                className={styles.exploreButton}
                            >
                                Khám phá khóa học
                            </button>
                        </div>
                    ) : (
                        <div className={styles.courseListContainer}>
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onContinueCourse={handleContinueCourse}
                                    onViewCourse={handleViewCourse}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Course Detail Modal */}
            {showCourseDetailModal && selectedCourse && (
                <div 
                    className={styles.modalOverlay}
                    onClick={() => setShowCourseDetailModal(false)}
                >
                    <div 
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowCourseDetailModal(false)}
                            className={styles.modalCloseButton}
                        >
                            <X className={styles.modalCloseIcon} />
                        </button>

                        <div className={styles.modalHeader}>
                            {/* Progress Circle */}
                            <div 
                                className={styles.progressCircle}
                                style={{
                                    background: `linear-gradient(135deg, ${getProgressColor(selectedCourse.progress)}, var(--accent))`
                                }}
                            >
                                <span className={styles.progressValue}>
                                    {selectedCourse.progress}%
                                </span>
                                <span className={styles.progressLabel}>
                                    Hoàn thành
                                </span>
                            </div>

                            <h2 className={styles.modalTitle}>
                                {selectedCourse.title}
                            </h2>

                            <p 
                                className={styles.modalPerformance}
                                style={{
                                    color: getProgressColor(selectedCourse.progress)
                                }}
                            >
                                {getProgressMessage(selectedCourse.progress)}
                            </p>

                            {/* Stats Grid */}
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <Clock className={styles.statIcon} />
                                        <span className={styles.statLabel}>
                                            Thời lượng
                                        </span>
                                    </div>
                                    <p className={styles.statValue}>
                                        {selectedCourse.duration}
                                    </p>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <BookOpen className={styles.statIcon} />
                                        <span className={styles.statLabel}>
                                            Bài học
                                        </span>
                                    </div>
                                    <p className={styles.statValue}>
                                        {selectedCourse.completedLessons}/{selectedCourse.totalLessons}
                                    </p>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <TrendingUp className={styles.statIcon} />
                                        <span className={styles.statLabel}>
                                            Tiến độ
                                        </span>
                                    </div>
                                    <p className={styles.statValue}>
                                        {selectedCourse.progress}%
                                    </p>
                                </div>

                                <div className={styles.statCard}>
                                    <div className={styles.statHeader}>
                                        <Award className={styles.statIcon} />
                                        <span className={styles.statLabel}>
                                            Chứng chỉ
                                        </span>
                                    </div>
                                    <p className={styles.statValue}>
                                        {selectedCourse.certificate ? 'Có' : 'Không'}
                                    </p>
                                </div>
                            </div>

                            {/* Next Lesson Info */}
                            {selectedCourse.nextLesson && selectedCourse.progress < 100 && (
                                <div className={styles.nextLessonInfo}>
                                    <p className={styles.nextLessonLabel}>
                                        <strong>Bài học tiếp theo:</strong>
                                    </p>
                                    <p className={styles.nextLessonText}>
                                        {selectedCourse.nextLesson}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className={styles.actionButtons}>
                                <button
                                    onClick={() => {
                                        setShowCourseDetailModal(false)
                                        handleContinueCourse(selectedCourse.id)
                                    }}
                                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                                >
                                    <PlayCircle className={styles.actionButtonIcon} />
                                    {selectedCourse.progress === 100 ? 'Xem lại' : 'Tiếp tục học'}
                                </button>

                                {selectedCourse.certificate && selectedCourse.progress === 100 && (
                                    <button
                                        onClick={handleViewCertificate}
                                        className={`${styles.actionButton} ${styles.actionButtonSecondary}`}
                                    >
                                        <Award className={styles.actionButtonIcon} />
                                        Xem chứng chỉ
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Completion Modal */}
            {showCompletionModal && selectedCourse && selectedCourse.progress === 100 && (
                <div 
                    className={styles.modalOverlay}
                    onClick={() => setShowCompletionModal(false)}
                >
                    <div 
                        className={`${styles.modalContent} ${styles.modalContentSmall}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowCompletionModal(false)}
                            className={styles.modalCloseButton}
                        >
                            <X className={styles.modalCloseIcon} />
                        </button>

                        <h2 className={styles.completionTitle}>
                            Chúc mừng!
                        </h2>

                        <p className={styles.completionDescription}>
                            Bạn đã hoàn thành khóa học<br />
                            <strong style={{ color: 'var(--foreground)' }}>{selectedCourse.title}</strong>
                        </p>

                        <div className={styles.completionInfo}>
                            <CheckCircle className={styles.completionIcon} />
                            <p className={styles.completionInfoText}>
                                Hoàn thành {selectedCourse.totalLessons} bài học
                            </p>
                            <p className={`${styles.completionInfoText} ${styles.completionInfoTextMargin}`}>
                                Tổng thời lượng: {selectedCourse.duration}
                            </p>
                        </div>

                        {selectedCourse.certificate && (
                            <button
                                onClick={handleViewCertificate}
                                className={`${styles.completionButton} ${styles.completionButtonPrimary}`}
                            >
                                <Award className={styles.completionButtonIcon} />
                                Nhận chứng chỉ
                            </button>
                        )}

                        <button
                            onClick={() => setShowCompletionModal(false)}
                            className={`${styles.completionButton} ${styles.completionButtonSecondary}`}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
