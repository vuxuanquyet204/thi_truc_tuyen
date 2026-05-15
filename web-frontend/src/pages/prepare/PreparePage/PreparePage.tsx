import { useState } from 'react'
import { Book, Code, FileText, Video, CheckCircle, Clock, TrendingUp, Star, Play, Lock, ChevronRight, Search, Filter } from 'lucide-react'
import styles from './PreparePage.module.css'

interface Course {
    id: string
    title: string
    description: string
    progress: number
    totalLessons: number
    completedLessons: number
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    duration: string
    category: string
    isLocked: boolean
    thumbnail: string
    instructor: string
    rating: number
}

interface LearningPath {
    id: string
    title: string
    description: string
    courses: number
    duration: string
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    icon: string
}

export default function PreparePage(): JSX.Element {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const categories = [
        { value: 'all', label: 'Tất cả' },
        { value: 'programming', label: 'Lập trình' },
        { value: 'web', label: 'Web Development' },
        { value: 'data', label: 'Data Science' },
        { value: 'mobile', label: 'Mobile' },
        { value: 'devops', label: 'DevOps' }
    ]

    const learningPaths: LearningPath[] = [
        {
            id: '1',
            title: 'Full Stack Web Developer',
            description: 'Học lập trình web từ frontend đến backend, database và deployment',
            courses: 12,
            duration: '6 tháng',
            difficulty: 'Intermediate',
            icon: '🌐'
        },
        {
            id: '2',
            title: 'Python Developer',
            description: 'Làm chủ Python từ cơ bản đến nâng cao, automation và data science',
            courses: 8,
            duration: '4 tháng',
            difficulty: 'Beginner',
            icon: '🐍'
        },
        {
            id: '3',
            title: 'Data Scientist',
            description: 'Machine Learning, Deep Learning và Big Data Analytics',
            courses: 10,
            duration: '5 tháng',
            difficulty: 'Advanced',
            icon: '📊'
        },
        {
            id: '4',
            title: 'Mobile App Developer',
            description: 'Phát triển ứng dụng iOS và Android với React Native',
            courses: 9,
            duration: '5 tháng',
            difficulty: 'Intermediate',
            icon: '📱'
        }
    ]

    const courses: Course[] = [
        {
            id: '1',
            title: 'Python Cơ Bản - Zero to Hero',
            description: 'Học Python từ con số 0, phù hợp cho người mới bắt đầu',
            progress: 65,
            totalLessons: 50,
            completedLessons: 32,
            level: 'Beginner',
            duration: '40 giờ',
            category: 'programming',
            isLocked: false,
            thumbnail: '/images/python.jpg',
            instructor: 'Nguyễn Văn A',
            rating: 4.8
        },
        {
            id: '2',
            title: 'React & TypeScript Masterclass',
            description: 'Xây dựng ứng dụng web hiện đại với React và TypeScript',
            progress: 30,
            totalLessons: 60,
            completedLessons: 18,
            level: 'Intermediate',
            duration: '50 giờ',
            category: 'web',
            isLocked: false,
            thumbnail: '/images/react.jpg',
            instructor: 'Trần Thị B',
            rating: 4.9
        },
        {
            id: '3',
            title: 'Data Science với Python',
            description: 'Machine Learning, Data Analysis và Visualization',
            progress: 0,
            totalLessons: 45,
            completedLessons: 0,
            level: 'Advanced',
            duration: '60 giờ',
            category: 'data',
            isLocked: false,
            thumbnail: '/images/datascience.jpg',
            instructor: 'Lê Văn C',
            rating: 4.7
        },
        {
            id: '4',
            title: 'Node.js Backend Development',
            description: 'Xây dựng RESTful API và Microservices với Node.js',
            progress: 45,
            totalLessons: 40,
            completedLessons: 18,
            level: 'Intermediate',
            duration: '45 giờ',
            category: 'web',
            isLocked: false,
            thumbnail: '/images/nodejs.jpg',
            instructor: 'Phạm Văn D',
            rating: 4.6
        },
        {
            id: '5',
            title: 'Advanced Algorithms & Data Structures',
            description: 'Thuật toán nâng cao và cấu trúc dữ liệu cho phỏng vấn',
            progress: 0,
            totalLessons: 35,
            completedLessons: 0,
            level: 'Advanced',
            duration: '30 giờ',
            category: 'programming',
            isLocked: true,
            thumbnail: '/images/algorithms.jpg',
            instructor: 'Hoàng Thị E',
            rating: 4.9
        },
        {
            id: '6',
            title: 'Mobile App Development với React Native',
            description: 'Phát triển ứng dụng iOS và Android đa nền tảng',
            progress: 0,
            totalLessons: 48,
            completedLessons: 0,
            level: 'Intermediate',
            duration: '55 giờ',
            category: 'mobile',
            isLocked: true,
            thumbnail: '/images/mobile.jpg',
            instructor: 'Ngô Văn F',
            rating: 4.5
        }
    ]

    const filteredCourses = courses.filter(course => {
        const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return 'var(--primary)'
            case 'Intermediate': return 'var(--accent)'
            case 'Advanced': return 'var(--destructive)'
            default: return 'var(--foreground)'
        }
    }

    return (
        <div className={styles.preparePage}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <Book />
                        Học Tập & Chuẩn Bị
                    </h1>
                    <p className={styles.subtitle}>
                        Nâng cao kỹ năng lập trình với các khóa học chất lượng cao
                    </p>
                </div>

                <div className={styles.searchFilter}>
                    <div className={styles.searchBox}>
                        <Search />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khóa học..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className={styles.categories}>
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                className={`${styles.categoryBtn} ${selectedCategory === cat.value ? styles.active : ''}`}
                                onClick={() => setSelectedCategory(cat.value)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <TrendingUp />
                        Lộ Trình Học Tập
                    </h2>
                    <p className={styles.sectionDesc}>Chọn lộ trình phù hợp với mục tiêu nghề nghiệp của bạn</p>
                </div>

                <div className={styles.pathsGrid}>
                    {learningPaths.map(path => (
                        <div key={path.id} className={styles.pathCard}>
                            <div className={styles.pathIcon}>{path.icon}</div>
                            <h3 className={styles.pathTitle}>{path.title}</h3>
                            <p className={styles.pathDesc}>{path.description}</p>
                            <div className={styles.pathMeta}>
                                <span><Book /> {path.courses} khóa học</span>
                                <span><Clock /> {path.duration}</span>
                                <span className={styles.pathMetaDifficulty} style={{ color: getDifficultyColor(path.difficulty) }}>
                                    {path.difficulty}
                                </span>
                            </div>
                            <button className={styles.pathBtn}>
                                Xem chi tiết
                                <ChevronRight />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <Video />
                        Khóa Học Của Bạn
                    </h2>
                    <p className={styles.sectionDesc}>
                        Hiển thị {filteredCourses.length} khóa học
                    </p>
                </div>

                <div className={styles.coursesGrid}>
                    {filteredCourses.map(course => (
                        <div key={course.id} className={`${styles.courseCard} ${course.isLocked ? styles.locked : ''}`}>
                            {course.isLocked && (
                                <div className={styles.lockBadge}>
                                    <Lock />
                                </div>
                            )}

                            <div className={styles.courseThumbnail}>
                                <div className={styles.thumbnailPlaceholder}>
                                    <Code />
                                </div>
                                {course.progress > 0 && (
                                    <div className={styles.progressBadge}>
                                        {course.progress}%
                                    </div>
                                )}
                            </div>

                            <div className={styles.courseContent}>
                                <div className={styles.courseMeta}>
                                    <span className={styles.courseLevel} style={{ color: getDifficultyColor(course.level) }}>
                                        {course.level}
                                    </span>
                                    <span className={styles.courseRating}>
                                        <Star fill="var(--accent)" />
                                        {course.rating}
                                    </span>
                                </div>

                                <h3 className={styles.courseTitle}>{course.title}</h3>
                                <p className={styles.courseDesc}>{course.description}</p>

                                <div className={styles.courseInstructor}>
                                    <span>Giảng viên: {course.instructor}</span>
                                </div>

                                <div className={styles.courseStats}>
                                    <span>
                                        <FileText />
                                        {course.completedLessons}/{course.totalLessons} bài
                                    </span>
                                    <span>
                                        <Clock />
                                        {course.duration}
                                    </span>
                                </div>

                                {course.progress > 0 && (
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                )}

                                <button
                                    className={styles.courseBtn}
                                    disabled={course.isLocked}
                                >
                                    {course.isLocked ? (
                                        <>
                                            <Lock />
                                            Mở khóa với token
                                        </>
                                    ) : course.progress > 0 ? (
                                        <>
                                            <Play />
                                            Tiếp tục học
                                        </>
                                    ) : (
                                        <>
                                            <Play />
                                            Bắt đầu học
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
