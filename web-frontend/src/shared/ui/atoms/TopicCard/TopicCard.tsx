import React from 'react'
import { LucideIcon } from 'lucide-react'
import styles from './TopicCard.module.css'

interface TopicCardProps {
	icon: LucideIcon
	title: string
	onClick?: () => void
}

export default function TopicCard({ icon: Icon, title, onClick }: TopicCardProps): JSX.Element {
	return (
		<div 
			className={styles.card}
			onClick={onClick}
		>
			<Icon className={styles.icon} />
			<h3 className={styles.title}>
				{title}
			</h3>
		</div>
	)
}
