import React, { memo, useMemo } from 'react'

interface ButtonProps {
	type?: 'button' | 'submit'
	children: React.ReactNode
	onClick?: () => void
	disabled?: boolean
	loading?: boolean
	variant?: 'primary' | 'secondary' | 'outline'
	size?: 'sm' | 'md' | 'lg'
	className?: string
	style?: React.CSSProperties
}

const ButtonComponent = ({
	type = 'button',
	children,
	onClick,
	disabled = false,
	loading = false,
	variant = 'primary',
	size = 'md',
	className,
	style = {}
}: ButtonProps): JSX.Element => {
	const sizeStyles = useMemo(() => {
		return size === 'sm' ? {
			padding: '0.5rem 0.75rem',
			fontSize: '0.75rem'
		} : size === 'lg' ? {
			padding: '1rem 1.5rem',
			fontSize: '1rem'
		} : {
			padding: '0.75rem 1rem',
			fontSize: '0.875rem'
		}
	}, [size]);

	const variantStyles = useMemo(() => {
		return variant === 'primary' ? {
			background: 'var(--primary)',
			color: 'var(--primary-foreground)'
		} : variant === 'secondary' ? {
			background: 'var(--secondary)',
			color: 'var(--secondary-foreground)'
		} : {
			background: 'transparent',
			color: 'var(--foreground)',
			border: '1px solid var(--border)'
		}
	}, [variant]);

	const baseStyles = useMemo(() => ({
		width: '100%',
		border: 'none',
		borderRadius: 'var(--radius-md)',
		fontWeight: '500',
		cursor: disabled || loading ? 'not-allowed' : 'pointer',
		transition: 'all 0.2s ease',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '0.5rem',
		opacity: disabled || loading ? 0.6 : 1,
		...sizeStyles
	}), [disabled, loading, sizeStyles]);

	const combinedStyles = useMemo(() => ({
		...baseStyles,
		...variantStyles,
		...style
	}), [baseStyles, variantStyles, style]);

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			className={className}
			style={combinedStyles}
		>
			{loading && <span>⏳</span>}
			{children}
		</button>
	)
}

// Memoize button to prevent unnecessary re-renders
export default memo(ButtonComponent);
