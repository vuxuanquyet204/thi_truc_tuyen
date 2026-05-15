import React from 'react'

interface SuccessMessageProps {
	message: string
	onClose: () => void
}

export default function SuccessMessage({ message, onClose }: SuccessMessageProps): JSX.Element {
	return (
		<div style={{
			background: 'var(--accent)',
			color: 'var(--accent-foreground)',
			padding: '1rem',
			borderRadius: 'var(--radius-md)',
			marginBottom: '1rem',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: '0.5rem'
		}}>
			<span style={{ fontSize: '0.875rem' }}>{message}</span>
			<button
				type="button"
				onClick={onClose}
				style={{
					background: 'none',
					border: 'none',
					color: 'inherit',
					cursor: 'pointer',
					fontSize: '1rem',
					padding: '0.25rem'
				}}
			>
				✕
			</button>
		</div>
	)
}
