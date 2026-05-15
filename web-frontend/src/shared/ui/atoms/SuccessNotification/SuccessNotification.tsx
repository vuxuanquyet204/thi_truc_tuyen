import React from 'react'

interface SuccessNotificationProps {
	title: string
	message: string
	icon?: string
	onClose?: () => void
	autoClose?: boolean
	duration?: number
}

export default function SuccessNotification({
	title,
	message,
	onClose,
	autoClose = false,
	duration = 5000
}: SuccessNotificationProps): JSX.Element {
	React.useEffect(() => {
		if (autoClose && onClose) {
			const timer = setTimeout(onClose, duration)
			return () => clearTimeout(timer)
		}
	}, [autoClose, onClose, duration])

	return (
		<div style={{
			background: 'linear-gradient(135deg, #22c55e, #16a34a)',
			color: 'white',
			padding: '1rem',
			borderRadius: 'var(--radius-lg)',
			marginBottom: '1.5rem',
			textAlign: 'center',
			boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
			position: 'relative',
			animation: 'slideInFromTop 0.5s ease-out'
		}}>
			{onClose && (
				<button
					onClick={onClose}
					style={{
						position: 'absolute',
						top: '0.5rem',
						right: '0.5rem',
						background: 'rgba(255, 255, 255, 0.2)',
						border: 'none',
						borderRadius: '50%',
						width: '1.5rem',
						height: '1.5rem',
						color: 'white',
						cursor: 'pointer',
						fontSize: '0.75rem',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transition: 'background-color 0.2s ease'
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
					}}
					aria-label="Đóng thông báo"
				>
					×
				</button>
			)}

			<div style={{ 
				fontSize: '1.25rem', 
				fontWeight: '600', 
				marginBottom: '0.5rem',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: '0.5rem'
			}}>
				{title}
			</div>
			
			<div style={{ 
				fontSize: '0.875rem', 
				opacity: 0.9,
				lineHeight: '1.4'
			}}>
				{message}
			</div>

			{autoClose && (
				<div style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: '2px',
					background: 'rgba(255, 255, 255, 0.3)',
					borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
					overflow: 'hidden'
				}}>
					<div style={{
						height: '100%',
						background: 'rgba(255, 255, 255, 0.8)',
						animation: `shrink ${duration}ms linear`,
						transformOrigin: 'left'
					}} />
				</div>
			)}

			<style>{`
				@keyframes slideInFromTop {
					from {
						opacity: 0;
						transform: translateY(-20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@keyframes shrink {
					from {
						transform: scaleX(1);
					}
					to {
						transform: scaleX(0);
					}
				}
			`}</style>
		</div>
	)
}
