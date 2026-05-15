import React, { useState, useEffect } from 'react'
import { Star, TrendingUp, Award, Calendar, Zap, Trophy } from 'lucide-react'
import StatCard from '../../atoms/StatCard'
import DailyStreakCard from '../../atoms/DailyStreakCard'
import styles from './WelcomeBanner.module.css'

interface WelcomeBannerProps {
	userName?: string
	level?: number
	xp?: number
	totalExams?: number
	certificates?: number
	streak?: number
}

export default function WelcomeBanner({
	userName = 'User',
	level = 5,
	xp = 2500,
	totalExams = 12,
	certificates = 3,
	streak = 7
}: WelcomeBannerProps): JSX.Element {
	const [animatedXP, setAnimatedXP] = useState(0)

	// Calculate XP for next level (e.g., 1000 XP per level)
	const xpPerLevel = 1000
	const currentLevelXP = xp % xpPerLevel
	const nextLevelXP = xpPerLevel
	const xpProgress = (currentLevelXP / nextLevelXP) * 100

	// Animate XP counter on mount
	useEffect(() => {
		let start = 0
		const end = currentLevelXP
		const duration = 1500
		const increment = end / (duration / 16)

		const timer = setInterval(() => {
			start += increment
			if (start >= end) {
				setAnimatedXP(end)
				clearInterval(timer)
			} else {
				setAnimatedXP(Math.floor(start))
			}
		}, 16)

		return () => clearInterval(timer)
	}, [currentLevelXP])

	return (
		<div className={styles.banner}>
			{/* Animated Background Circles */}
			<div className={`${styles.backgroundCircle} ${styles.backgroundCircleTop}`} />
			<div className={`${styles.backgroundCircle} ${styles.backgroundCircleBottom}`} />

			{/* Floating Particles */}
			<div className={`${styles.particle} ${styles.particle1}`} />
			<div className={`${styles.particle} ${styles.particle2}`} />
			<div className={`${styles.particle} ${styles.particle3}`} />

			{/* Main Content */}
			<div className={styles.mainContent}>
				{/* Header Section with Level Badge */}
				<div className={styles.header}>
					<div className={styles.headerText}>
						<h1 className={styles.title}>
							Chào mừng trở lại, {userName}! 
						</h1>
						<p className={styles.subtitle}>
							Sẵn sàng tiếp tục hành trình học tập của bạn chưa?
						</p>
					</div>

					{/* Level Badge */}
					<div className={styles.levelBadge}>
						<div className={styles.levelBadgeShimmer} />
						<Trophy className={styles.levelBadgeIcon} />
						<div className={styles.levelBadgeContent}>
							<div className={styles.levelBadgeLabel}>
								CẤP ĐỘ
							</div>
							<div className={styles.levelBadgeValue}>
								{level}
							</div>
						</div>
					</div>
				</div>

				{/* XP Progress Bar */}
				<div className={styles.xpProgress}>
					<div className={styles.xpProgressHeader}>
						<div className={styles.xpProgressLabel}>
							<Zap className={styles.xpProgressIcon} />
							<span className={styles.xpProgressText}>
								Kinh nghiệm
							</span>
						</div>
						<span className={styles.xpProgressValue}>
							{animatedXP} / {nextLevelXP} XP
						</span>
					</div>
					<div className={styles.xpProgressBar}>
						<div 
							className={styles.xpProgressFill}
							style={{ width: `${xpProgress}%` }}
						>
							<div className={styles.xpProgressShine} />
						</div>
					</div>
					<div className={styles.xpProgressHint}>
						Còn {nextLevelXP - currentLevelXP} XP nữa để đạt cấp {level + 1}
					</div>
				</div>

				{/* Stats Grid - Two Column Layout */}
				<div className={styles.statsGrid}>
					{/* Left Column - Stats */}
					<div className={styles.statsColumn}>
						<div className={styles.statsItem}>
							<StatCard
								title="Tổng XP"
								value={xp.toLocaleString()}
								icon={<TrendingUp style={{ width: 'clamp(24px, 3.5vw, 28px)', height: 'clamp(24px, 3.5vw, 28px)' }} />}
								gradient="primary"
							/>
						</div>
						<div className={styles.statsItem}>
							<StatCard
								title="Bài thi đã làm"
								value={totalExams}
								icon={<Calendar style={{ width: 'clamp(24px, 3.5vw, 28px)', height: 'clamp(24px, 3.5vw, 28px)' }} />}
								gradient="accent"
							/>
						</div>
						<div className={styles.statsItem}>
							<StatCard
								title="Chứng chỉ"
								value={certificates}
								icon={<Award style={{ width: 'clamp(24px, 3.5vw, 28px)', height: 'clamp(24px, 3.5vw, 28px)' }} />}
								gradient="primary"
							/>
						</div>
						<div className={styles.statsItem}>
							<StatCard
								title="Ngày liên tiếp"
								value={streak}
								icon={<Star style={{ width: 'clamp(24px, 3.5vw, 28px)', height: 'clamp(24px, 3.5vw, 28px)' }} />}
								gradient="accent"
							/>
						</div>
					</div>

					{/* Right Column - Daily Streak */}
					<div className={styles.dailyStreakColumn}>
						<DailyStreakCard
							currentStreak={streak}
							weeklyProgress={[true, true, true, true, true, true, true]}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
