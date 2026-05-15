import React from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
	title: string
	value: string | number
	icon?: React.ReactNode
	gradient?: 'primary' | 'accent'
	subtitle?: string
	delayMs?: number
}

export default function StatCard({ title, value, icon, gradient = 'primary', subtitle }: StatCardProps): JSX.Element {
	const cardClass = gradient === 'accent' ? `${styles.card} ${styles.cardAccent}` : `${styles.card} ${styles.cardPrimary}`

	return (
		<div className={cardClass}>
			<div className={styles.content}>
				<div className={styles.contentLeft}>
					<p className={styles.title}>
						{title}
					</p>
					<p className={styles.value}>
						{value}
					</p>
					{subtitle && (
						<p className={styles.subtitle}>
							{subtitle}
						</p>
					)}
				</div>
				{icon && (
					<div className={styles.iconContainer}>
						{icon}
					</div>
				)}
			</div>
		</div>
	)
}
