import React from 'react'
import '@/features/admin/ui/common/styles/common.css'

interface BadgeProps {
	children?: React.ReactNode
	variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'primary' | 'outline'
	dot?: boolean
	className?: string
	style?: React.CSSProperties
}

export default function Badge({
	children,
	variant = 'secondary',
	dot = false,
	className = '',
	style
}: BadgeProps): JSX.Element {
	return (
		<span className={`badge badge-${variant} ${className}`} style={style}>
			{dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />}
			{children}
		</span>
	)
}
