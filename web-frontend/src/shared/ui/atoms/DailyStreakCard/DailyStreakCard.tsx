import React from 'react'
import styles from './DailyStreakCard.module.css'

interface DailyStreakCardProps {
	currentStreak: number
	weeklyProgress?: boolean[] // Array of 7 booleans for each day of the week
}

export default function DailyStreakCard({ 
	currentStreak, 
	weeklyProgress = [true, true, true, true, true, true, true] // Default: all days completed
}: DailyStreakCardProps): JSX.Element {
	const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

	return (
		<div className={styles.container}>
			{/* Title */}
			<h3 className={styles.title}>
				Chuỗi ngày
			</h3>

			{/* Days of Week */}
			<div className={styles.daysRow}>
				{days.map((day, index) => (
					<span 
						key={index}
						className={styles.dayLabel}
					>
						{day}
					</span>
				))}
			</div>

			{/* Progress Dots */}
			<div className={styles.progressRow}>
				{weeklyProgress.map((isCompleted, index) => (
					<div 
						key={index}
						className={`${styles.progressDot} ${isCompleted ? styles.progressDotCompleted : styles.progressDotIncomplete}`}
					/>
				))}
			</div>

			{/* Current Streak Summary */}
			<div className={styles.streakSummary}>
				<span className={styles.streakLabel}>
					Chuỗi hiện tại:
				</span>
				<span className={styles.streakValue}>
					{currentStreak} ngày
				</span>
			</div>
		</div>
	)
}
