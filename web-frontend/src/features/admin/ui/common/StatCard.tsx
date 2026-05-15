import React from 'react'
import styles from './StatCard.module.css'

export type StatCardGradient = 'primary' | 'accent' | 'gradient'

export interface StatCardProps {
	title: string
	value: string | number
	icon?: React.ReactNode
	gradient?: StatCardGradient
	subtitle?: string
	delayMs?: number
	trend?: { value: number; isPositive: boolean }
	onClick?: () => void
}

export default function StatCard({
	title,
	value,
	icon,
	gradient = 'primary',
	subtitle,
	trend,
	onClick
}: StatCardProps): JSX.Element {
	const cardClasses = [
		styles.card,
		styles[gradient],
		onClick ? styles.clickable : '',
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div className={cardClasses} onClick={onClick}>
			<div className={styles.inner}>
				<div className={styles.textGroup}>
					<p className={styles.title}>{title}</p>
					<p className={styles.value}>{value}</p>
					{subtitle && <p className={styles.subtitle}>{subtitle}</p>}
					{trend && (
						<div className={`${styles.trend} ${trend.isPositive ? styles.trendUp : styles.trendDown}`}>
							<span>{trend.isPositive ? '↗' : '↘'}</span>
							<span>{trend.value.toFixed(1)}%</span>
						</div>
					)}
				</div>
				{icon && <div className={styles.icon}>{icon}</div>}
			</div>
		</div>
	)
}
