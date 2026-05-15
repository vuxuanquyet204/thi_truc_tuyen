import { useState } from 'react'
import { useAppSelector } from '@/foundation/store/hooks'
import { useQuizzes } from '@/features/exams/hooks/useQuizzes';
import WelcomeBanner from '@/shared/ui/sections/WelcomeBanner'
import MockInterviews from '@/shared/ui/sections/MockInterviews'
import PracticeSkills from '@/shared/ui/sections/PracticeSkills'
import TokenWallet from '@/shared/ui/atoms/TokenWallet/TokenWallet'
import RecentExams from '@/shared/ui/sections/RecentExams'
import CourseProgress from '@/shared/ui/sections/CourseProgress'
import UpcomingExams from '@/shared/ui/sections/UpcomingExams'
import Footer from '@/shared/ui/layouts/Footer'
import RewardStoreModal from '@/shared/ui/molecules/RewardStoreModal'
import styles from './UserHomePage.module.css'

export default function UserHomePage(): JSX.Element {
	const { user } = useAppSelector((state) => state.auth)
	const { quizzes, loading: quizzesLoading } = useQuizzes()
	const [showRewardStore, setShowRewardStore] = useState(false)
	const handleStartInterview = (interviewId: string) => {
		console.log(`Start interview ${interviewId}`)
	}

	const handleUnlockInterview = (interviewId: string) => {
		console.log(`Unlock interview ${interviewId}`)
	}

	const handleSkillClick = (skillId: string) => {
		console.log(`Practice skill ${skillId}`)
	}

	const handleViewExam = (examId: string) => {
		console.log(`View exam ${examId}`)
	}

	const handleRetakeExam = (examId: string) => {
		console.log(`Retake exam ${examId}`)
	}

	const handleContinueCourse = (courseId: string) => {
		console.log(`Continue course ${courseId}`)
	}

	const handleViewCourse = (courseId: string) => {
		console.log(`View course ${courseId}`)
	}

	return (
		<div className={styles.userHomePage}>
			{/* Background Pattern */}
			<div className={styles.userHomePattern} />
			
			<main className={styles.main}>
				<div className={styles.contentWrapper}>
					{/* Welcome Banner */}
					<WelcomeBanner 
						userName={user?.name || 'User'} 
						level={5} 
						xp={2500}
						totalExams={12}
						certificates={3}
						streak={7}
					/>

					{/* Main Content - Responsive Flexbox Layout */}
					<div className={styles.mainContent}>
						{/* Row 1 - Mock Interviews và Token Wallet */}
						<div className={styles.responsiveRow}>
							<div className={`${styles.responsiveRowItem} ${styles.responsiveRowItemFlex2}`}>
								{/* Mock Interviews */}
								<MockInterviews 
									onStartInterview={handleStartInterview}
									onUnlockInterview={handleUnlockInterview}
								/>
							</div>

							<div className={`${styles.responsiveRowItem} ${styles.responsiveRowItemFlex1}`}>
								{/* Token Wallet */}
								<TokenWallet
									userId={user?.id}
								/>
							</div>
						</div>

						{/* Row 2 - Practice Skills Full Width */}
						<div className={styles.responsiveRowItemFullWidth}>
							{/* Practice Skills */}
							<PracticeSkills 
								onSkillClick={handleSkillClick}
							/>
						</div>

						{/* Row 3 - Recent Exams, Course Progress, Upcoming Exams */}
						<div className={styles.responsiveRow}>
							<div className={`${styles.responsiveRowItem} ${styles.responsiveRowItemFlex1}`}>
								{/* Recent Exams */}
								<RecentExams 
									onViewExam={handleViewExam}
									onRetakeExam={handleRetakeExam}
								/>
							</div>

							<div className={`${styles.responsiveRowItem} ${styles.responsiveRowItemFlex1}`}>
								{/* Course Progress */}
								<CourseProgress 
									onContinueCourse={handleContinueCourse}
									onViewCourse={handleViewCourse}
								/>
							</div>

							<div className={`${styles.responsiveRowItem} ${styles.responsiveRowItemFlex1}`}>
								{/* Upcoming Exams */}
								<UpcomingExams exams={quizzes} />
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />

			{/* Modals - Rendered at page level for full screen display */}
			<RewardStoreModal
				isOpen={showRewardStore}
				onClose={() => setShowRewardStore(false)}
				userId={user?.id || 'user-123'}
			/>
		</div>
	)
}