import React from 'react'

interface ContinuePracticeProps {
	title?: string
	subtitle?: string
	onResume?: () => void
}

export default function ContinuePractice({ 
	title = 'Problem Solving (Basic)',
	subtitle = 'Arrays, Strings, Sorting',
	onResume
}: ContinuePracticeProps): JSX.Element {
	const handleResume = () => {
		if (onResume) {
			onResume()
		} else {
			console.log('Resume practice')
		}
	}

	return (
		<div className="card stagger-load hover-lift interactive" style={{ animationDelay: '200ms' }}>
			<h2 className="text-xl font-bold mb-3" style={{ marginBottom: 'var(--space-3)', marginTop: 0, marginLeft: 0, marginRight: 0 }}>
				Continue Practice
			</h2>
			<div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div>
					<p className="text-base font-semibold" style={{ margin: 0 }}>
						{title}
					</p>
					<p 
						className="text-sm font-normal"
						style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}
					>
						{subtitle}
					</p>
				</div>
				<button 
					onClick={handleResume}
					className="button-primary"
					style={{
						background: 'var(--gradient-primary)',
						color: 'var(--primary-foreground)',
						padding: '8px 16px',
						borderRadius: 'var(--radius-md)',
						fontSize: '0.875rem',
						fontWeight: 600,
						border: 'none',
						cursor: 'pointer',
						transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						boxShadow: 'var(--shadow-md)',
						letterSpacing: '0.025em'
					}}
				>
					Resume
				</button>
			</div>
		</div>
	)
}