import React from 'react'
import Card from '../Card'
import styles from './ProgressCard.module.css'

type Props = {
	title: string
	percent: number
	delayMs?: number
}

export default function ProgressCard({ title, percent, delayMs = 0 }: Props): JSX.Element {
	const clamped = Math.max(0, Math.min(100, percent))
	return (
		<Card className={styles.widgetLoad} style={{ animationDelay: `${delayMs}ms` }}>
			<h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
			<div style={{ width: '100%', background: 'var(--muted)', borderRadius: 9999, height: 10, marginBottom: 8 }}>
				<div style={{ width: `${clamped}%`, background: 'var(--primary)', height: 10, borderRadius: 9999 }} />
			</div>
			<p style={{ fontSize: 14, color: 'var(--muted-foreground)', marginTop: 0 }}>{clamped}% Tỷ lệ hoàn thành</p>
		</Card>
	)
}