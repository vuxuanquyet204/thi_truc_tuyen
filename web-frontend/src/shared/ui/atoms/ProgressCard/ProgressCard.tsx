import React from 'react'
import Card from '../Card/Card'
import styles from './ProgressCard.module.css'

type Props = {
	title: string
	percent: number
	delayMs?: number
}

export default function ProgressCard({ title, percent, delayMs = 0 }: Props): JSX.Element {
	const clamped = Math.max(0, Math.min(100, percent))
	return (
		<Card className={`widget-load ${styles.card}`} style={{ animationDelay: `${delayMs}ms` }}>
			<h3 className={styles.title}>{title}</h3>
			<div className={styles.progressBarContainer}>
				<div 
					className={styles.progressBarFill}
					style={{ width: `${clamped}%` }}
				/>
			</div>
			<p className={styles.progressText}>{clamped}% Tỷ lệ hoàn thành</p>
		</Card>
	)
}
