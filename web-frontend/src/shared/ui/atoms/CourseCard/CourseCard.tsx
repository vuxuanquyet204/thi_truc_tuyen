import React from 'react'
import { BookOpen, Play, Award, Clock } from 'lucide-react'
import styles from './CourseCard.module.css'

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

interface CourseCardProps {
	course: Course
	onContinueCourse?: (courseId: string) => void
	onViewCourse?: (courseId: string) => void
}

export default function CourseCard({ course, onContinueCourse, onViewCourse }: CourseCardProps): JSX.Element {
	const getProgressColor = (progress: number) => {
		if (progress >= 80) return 'var(--primary)'
		if (progress >= 60) return 'var(--primary)'
		if (progress >= 40) return 'var(--accent)'
		return 'var(--destructive)'
	}

	return (
		<div className={styles.card}>
			<div className={styles.content}>
				<div className={styles.contentLeft}>
					<div className={styles.header}>
						<BookOpen className={styles.headerIcon} />
						<h4 className={styles.title}>
							{course.title}
						</h4>
					</div>
					
					<div className={styles.meta}>
						<Clock className={styles.metaIcon} />
						{course.duration} • {course.completedLessons}/{course.totalLessons} bài học
					</div>

					{/* Progress Bar */}
					<div className={styles.progressSection}>
						<div className={styles.progressHeader}>
							<span className={styles.progressLabel}>
								Tiến độ
							</span>
							<span 
								className={styles.progressValue}
								style={{ color: getProgressColor(course.progress) }}
							>
								{course.progress}%
							</span>
						</div>
						<div className={styles.progressBar}>
							<div 
								className={styles.progressFill}
								style={{ width: `${course.progress}%` }}
							/>
						</div>
					</div>

					{course.nextLesson && (
						<div className={styles.nextLesson}>
							Tiếp theo: {course.nextLesson}
						</div>
					)}

					{course.certificate && (
						<div className={styles.certificateBadge}>
							<span className={styles.certificateLabel}>
								Có chứng chỉ
							</span>
						</div>
					)}
				</div>

				<div className={styles.contentRight}>
					<button
						onClick={() => course.progress < 100 && onContinueCourse?.(course.id)}
						className={styles.continueButton}
						disabled={course.progress === 100}
					>
						<Play className={styles.continueButtonIcon} />
						{course.progress === 100 ? 'Hoàn thành' : 'Tiếp tục'}
					</button>

					<button
						onClick={() => onViewCourse?.(course.id)}
						className={styles.viewButton}
					>
						Xem chi tiết
					</button>
				</div>
			</div>
		</div>
	)
}
