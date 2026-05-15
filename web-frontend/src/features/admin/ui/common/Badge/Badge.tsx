import React from 'react'
import styles from './Badge.module.css'

interface BadgeProps {
	children: React.ReactNode
	variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary'
	className?: string
	style?: React.CSSProperties
}

export default function Badge({
	children,
	variant = 'secondary',
	className = '',
	style
}: BadgeProps): JSX.Element {

	const variantClass = styles[variant] || styles.secondary

	return (
		<span className={`${styles.badge} ${variantClass} ${className}`} style={style}>
			{children}
		</span>
	)
}