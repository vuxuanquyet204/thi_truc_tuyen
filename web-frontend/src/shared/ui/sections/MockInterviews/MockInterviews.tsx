import React, { useState } from 'react'
import { Star, Info, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import InterviewCard from '@/shared/ui/atoms/InterviewCard/InterviewCard'
import styles from './MockInterviews.module.css'

interface MockInterview {
    id: string
    title: string
    description: string
    duration: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    isLocked: boolean
    isFree: boolean
    isNew?: boolean
}

interface MockInterviewsProps {
    interviews?: MockInterview[]
    onStartInterview?: (interviewId: string) => void
    onUnlockInterview?: (interviewId: string) => void
}

export default function MockInterviews({
    interviews = [
        {
            id: '1',
            title: 'Kỹ sư phần mềm',
            description: 'Giải quyết vấn đề (Trung bình)',
            duration: '60 phút',
            difficulty: 'Medium',
            isLocked: false,
            isFree: true,
            isNew: true
        },
        {
            id: '2',
            title: 'Lập trình viên Frontend',
            description: 'React (Trung bình)',
            duration: '60 phút',
            difficulty: 'Medium',
            isLocked: true,
            isFree: false
        },
        {
            id: '3',
            title: 'Lập trình viên Backend',
            description: 'Node (Trung bình)',
            duration: '60 phút',
            difficulty: 'Medium',
            isLocked: true,
            isFree: false
        },
        {
            id: '4',
            title: 'Thiết kế hệ thống',
            description: 'Thiết kế kiến trúc (Trung bình)',
            duration: '60 phút',
            difficulty: 'Medium',
            isLocked: true,
            isFree: false
        },
        {
            id: '5',
            title: 'Khoa học dữ liệu',
            description: 'Python & Pandas (Khó)',
            duration: '90 phút',
            difficulty: 'Hard',
            isLocked: true,
            isFree: false
        }
    ],
    onStartInterview,
    onUnlockInterview
}: MockInterviewsProps): JSX.Element {
    const navigate = useNavigate()
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showUnlockModal, setShowUnlockModal] = useState(false)
    const [selectedInterview, setSelectedInterview] = useState<MockInterview | null>(null)

    const handleStartInterview = (interviewId: string) => {
        const interview = interviews.find(i => i.id === interviewId)
        if (interview && !interview.isLocked) {
            // Navigate to interview page
            navigate(`/user/interview/${interviewId}`)
            onStartInterview?.(interviewId)
        }
    }

    const handleUnlockInterview = (interviewId: string) => {
        const interview = interviews.find(i => i.id === interviewId)
        if (interview) {
            setSelectedInterview(interview)
            setShowUnlockModal(true)
            onUnlockInterview?.(interviewId)
        }
    }

    const handleLearnMore = () => {
        setShowInfoModal(true)
    }

    const handlePurchasePremium = () => {
        // Navigate to pricing/payment page
        navigate('/user/premium')
        setShowUnlockModal(false)
    }

    return (
        <>
            <div className={`card stagger-load hover-lift interactive ${styles.container}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.title}>
                            Phỏng vấn mô phỏng AI
                        </h2>
                        <Badge variant="primary">
                            Mới
                        </Badge>
                    </div>
                    <button
                        onClick={handleLearnMore}
                        className={styles.learnMoreButton}
                    >
                        <Info className={styles.learnMoreIcon} />
                        Tìm hiểu thêm
                    </button>
                </div>

                <div className={styles.interviewList}>
                    {/* Interview Cards Grid */}
                    <div className={styles.interviewGrid}>
                        {interviews.map((interview) => (
                            <InterviewCard
                                key={interview.id}
                                interview={interview}
                                onStartInterview={handleStartInterview}
                                onUnlockInterview={handleUnlockInterview}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Info Modal */}
            {showInfoModal && (
                <div className={styles.modalOverlay} onClick={() => setShowInfoModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowInfoModal(false)}
                            className={styles.modalCloseButton}
                        >
                            <X className={styles.modalCloseIcon} />
                        </button>

                        <h2 className={styles.modalTitle}>
                            Phỏng vấn mô phỏng AI
                        </h2>

                        <div className={styles.modalContentText}>
                            <p className={styles.modalParagraph}>
                                <strong>Phỏng vấn mô phỏng AI</strong> là công cụ luyện tập phỏng vấn được hỗ trợ bởi trí tuệ nhân tạo, giúp bạn chuẩn bị cho các buổi phỏng vấn thực tế.
                            </p>

                            <h3 className={styles.modalSubtitle}>
                                Tính năng nổi bật:
                            </h3>
                            <ul className={styles.modalList}>
                                <li className={styles.modalListItem}>AI phỏng vấn thông minh với câu hỏi động</li>
                                <li className={styles.modalListItem}>Đánh giá chi tiết về kỹ năng và điểm mạnh/yếu</li>
                                <li className={styles.modalListItem}>Gợi ý cải thiện dựa trên hiệu suất</li>
                                <li className={styles.modalListItem}>Phỏng vấn theo từng vị trí cụ thể</li>
                                <li className={styles.modalListItem}>Mô phỏng áp lực thời gian thực tế</li>
                            </ul>

                            <h3 className={styles.modalSubtitle}>
                                Các loại phỏng vấn:
                            </h3>
                            <ul className={styles.modalList}>
                                <li className={styles.modalListItem}>Kỹ sư phần mềm - Giải quyết thuật toán</li>
                                <li className={styles.modalListItem}>Frontend Developer - React, Vue, Angular</li>
                                <li className={styles.modalListItem}>Backend Developer - Node.js, Python, Java</li>
                                <li className={styles.modalListItem}>Thiết kế hệ thống - Kiến trúc quy mô lớn</li>
                                <li className={styles.modalListItem}>Khoa học dữ liệu - ML, AI, Data Analysis</li>
                            </ul>

                            <div className={styles.modalTip}>
                                <p className={styles.modalTipText}>
                                    💡 <strong>Mẹo:</strong> Hãy luyện tập thường xuyên để cải thiện kỹ năng phỏng vấn của bạn. Mỗi buổi phỏng vấn sẽ giúp bạn tự tin hơn!
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowInfoModal(false)}
                            className={styles.modalButton}
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Unlock Premium Modal */}
            {showUnlockModal && selectedInterview && (
                <div className={styles.modalOverlay} onClick={() => setShowUnlockModal(false)}>
                    <div className={`${styles.modalContent} ${styles.modalContentSmall}`} onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowUnlockModal(false)}
                            className={styles.modalCloseButton}
                        >
                            <X className={styles.modalCloseIcon} />
                        </button>

                        <div className={styles.unlockContent}>
                            <div className={styles.unlockIconContainer}>
                                🔒
                            </div>

                            <h2 className={styles.unlockTitle}>
                                Nâng cấp Premium
                            </h2>

                            <p className={styles.unlockDescription}>
                                Phỏng vấn <strong>{selectedInterview.title}</strong> là nội dung Premium. Nâng cấp tài khoản để truy cập không giới hạn!
                            </p>

                            <div className={styles.unlockFeatures}>
                                <h3 className={styles.unlockFeaturesTitle}>
                                    Premium bao gồm:
                                </h3>
                                <ul className={styles.unlockFeaturesList}>
                                    <li className={styles.unlockFeaturesItem}>✅ Truy cập tất cả phỏng vấn mô phỏng</li>
                                    <li className={styles.unlockFeaturesItem}>✅ Báo cáo chi tiết về hiệu suất</li>
                                    <li className={styles.unlockFeaturesItem}>✅ Phỏng vấn không giới hạn</li>
                                    <li className={styles.unlockFeaturesItem}>✅ Hỗ trợ ưu tiên</li>
                                </ul>
                            </div>

                            <div className={styles.unlockButtonGroup}>
                                <button
                                    onClick={() => setShowUnlockModal(false)}
                                    className={`${styles.unlockButton} ${styles.unlockButtonSecondary}`}
                                >
                                    Để sau
                                </button>
                                <button
                                    onClick={handlePurchasePremium}
                                    className={`${styles.unlockButton} ${styles.unlockButtonPrimary}`}
                                >
                                    Nâng cấp ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}