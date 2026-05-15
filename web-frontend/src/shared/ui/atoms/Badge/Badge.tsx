import React from 'react'

interface BadgeProps {
	children: React.ReactNode
	variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
	size?: 'sm' | 'md' | 'lg'
}

export default function Badge({ children, variant = 'primary', size = 'md' }: BadgeProps): JSX.Element {
	const getVariantStyles = () => {
		switch (variant) {
			case 'primary':
				return {
					background: 'var(--primary)',
					color: 'var(--primary-foreground)'
				}
			case 'accent':
				return {
					background: 'var(--accent)',
					color: 'var(--accent-foreground)'
				}
			case 'success':
				return {
					background: 'var(--accent)',
					color: 'var(--accent-foreground)'
				}
			case 'warning':
				return {
					background: 'var(--destructive)',
					color: 'var(--destructive-foreground)'
				}
			case 'error':
				return {
					background: 'var(--destructive)',
					color: 'var(--destructive-foreground)'
				}
			default:
				return {
					background: 'var(--primary)',
					color: 'var(--primary-foreground)'
				}
		}
	}

	const getSizeStyles = () => {
		switch (size) {
			case 'sm':
				return {
					fontSize: '10px',
					padding: '2px 6px'
				}
			case 'md':
				return {
					fontSize: '12px',
					padding: '4px 8px'
				}
			case 'lg':
				return {
					fontSize: '14px',
					padding: '6px 12px'
				}
			default:
				return {
					fontSize: '12px',
					padding: '4px 8px'
				}
		}
	}

	const variantStyles = getVariantStyles()
	const sizeStyles = getSizeStyles()

	return (
		<span style={{ 
			...variantStyles,
			...sizeStyles,
			fontWeight: 600, 
			borderRadius: '9999px',
			display: 'inline-flex',
			alignItems: 'center',
			gap: '4px'
		}}>
			{children}
		</span>
	)
}
