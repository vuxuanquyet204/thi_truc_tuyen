import React from 'react'
import Badge from '../Badge/Badge'
import styles from './SkillCard.module.css'

interface Skill {
	id: string
	title: string
	icon: React.ReactNode
	category: 'algorithm' | 'language' | 'framework' | 'tool'
	progress?: number
	isCompleted?: boolean
}

interface SkillCardProps {
	skill: Skill
	onSkillClick?: (skillId: string) => void
}

export default function SkillCard({ skill, onSkillClick }: SkillCardProps): JSX.Element {
	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'algorithm': return 'var(--primary)'
			case 'language': return 'var(--primary)'
			case 'framework': return 'var(--accent)'
			case 'tool': return 'var(--primary)'
			default: return 'var(--muted-foreground)'
		}
	}

	const getProgressColor = (progress: number) => {
		if (progress >= 80) return 'var(--primary)'
		if (progress >= 60) return 'var(--primary)'
		if (progress >= 40) return 'var(--accent)'
		return 'var(--destructive)'
	}

	const categoryColor = getCategoryColor(skill.category)
	const progressColor = skill.progress !== undefined ? getProgressColor(skill.progress) : 'var(--muted-foreground)'

	return (
		<div
			className={styles.card}
			onClick={() => onSkillClick?.(skill.id)}
		>
			{/* Icon */}
			<div 
				className={styles.iconContainer}
				style={{
					background: categoryColor + '20',
					color: categoryColor
				}}
			>
				{skill.icon}
			</div>

			{/* Title */}
			<h3 className={styles.title}>
				{skill.title}
			</h3>

			{/* Progress Bar */}
			{skill.progress !== undefined && (
				<div className={styles.progressSection}>
					<div className={styles.progressHeader}>
						<span className={styles.progressLabel}>
							Tiến độ
						</span>
						<span 
							className={styles.progressValue}
							style={{ color: progressColor }}
						>
							{skill.progress}%
						</span>
					</div>
					<div className={styles.progressBarContainer}>
						<div 
							className={styles.progressBarFill}
							style={{
								background: progressColor,
								width: `${skill.progress}%`
							}}
						/>
					</div>
				</div>
			)}

			{/* Category Badge */}
			<div className={styles.categoryBadgeContainer}>
				<span 
					className={styles.categoryBadge}
					style={{
						background: categoryColor + '20',
						color: categoryColor
					}}
				>
					{skill.category}
				</span>
			</div>

			{/* Completed Badge */}
			{skill.isCompleted && (
				<div className={styles.completedBadgeContainer}>
					<Badge variant="success" size="sm">
						✓
					</Badge>
				</div>
			)}
		</div>
	)
}
