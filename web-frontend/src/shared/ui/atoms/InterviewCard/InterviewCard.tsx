import React from 'react'
import { Clock, Lock, Star } from 'lucide-react'
import Badge from '../Badge/Badge'
import styles from './InterviewCard.module.css'

interface Interview {
	id: string
	title: string
	description: string
	duration: string
	isLocked: boolean
	isNew?: boolean
}

interface InterviewCardProps {
	interview: Interview
	onStartInterview?: (id: string) => void
	onUnlockInterview?: (id: string) => void
}

export default function InterviewCard({ interview, onStartInterview, onUnlockInterview }: InterviewCardProps): JSX.Element {
	const cardClass = interview.isLocked ? `${styles.card} ${styles.cardLocked}` : styles.card

	return (
		<div className={cardClass}>
			{/* New Badge */}
			{interview.isNew && (
				<div className={styles.badgeContainer}>
					<Badge variant="accent" size="sm">
						<Star className={styles.badgeIcon} />
					</Badge>
				</div>
			)}

			{/* Content */}
			<div className={styles.content}>
				<h3 className={styles.title}>
					{interview.title}
				</h3>
				<p className={styles.description}>
					{interview.description}
				</p>
			</div>

			{/* Duration */}
			<div className={styles.duration}>
				<Clock className={styles.durationIcon} />
				{interview.duration}
			</div>

			{/* Action Button */}
			<div className={styles.actionSection}>
				{interview.isLocked ? (
					<div className={styles.lockedInfo}>
						<Lock className={styles.lockedIcon} />
						<span className={styles.lockedText}>Premium</span>
					</div>
				) : (
					<button
						onClick={() => onStartInterview?.(interview.id)}
						className={styles.startButton}
					>
						Dùng thử miễn phí
					</button>
				)}
				
				{interview.isLocked && (
					<button
						onClick={() => onUnlockInterview?.(interview.id)}
						className={styles.unlockButton}
					>
						Mở khóa
					</button>
				)}
			</div>
		</div>
	)
}
