import React from 'react'
import { Award } from 'lucide-react'

interface CertificationCardProps {
	certificationTitle?: string
	onGetCertified?: () => void
	onViewAll?: () => void
}

export default function CertificationCard({ 
	certificationTitle = 'Python (Basic)',
	onGetCertified,
	onViewAll
}: CertificationCardProps): JSX.Element {
	const handleGetCertified = () => {
		if (onGetCertified) {
			onGetCertified()
		} else {
			console.log('Get certified')
		}
	}

	const handleViewAll = () => {
		if (onViewAll) {
			onViewAll()
		} else {
			console.log('View all certifications')
		}
	}

	return (
		<div className="card stagger-load hover-lift interactive" style={{ animationDelay: '400ms' }}>
			<h2 className="text-lg font-bold mb-4" style={{ marginBottom: 'var(--space-4)', marginTop: 0, marginLeft: 0, marginRight: 0 }}>
				Your Next Certification
			</h2>
			<div 
				className="border border-oklch(0.3 0 0) rounded-lg p-4 flex items-center space-x-4 glass"
				style={{
					border: '1px solid var(--glass-border)',
					borderRadius: 'var(--radius-lg)',
					padding: '16px',
					display: 'flex',
					alignItems: 'center',
					gap: '16px',
					background: 'var(--glass-bg)',
					backdropFilter: 'blur(15px)',
					WebkitBackdropFilter: 'blur(15px)'
				}}
			>
				<Award 
					className="w-8 h-8 text-[var(--accent)] icon-enhanced"
					style={{ width: '32px', height: '32px', color: 'var(--accent)' }}
				/>
				<div>
					<h3 className="text-base font-semibold" style={{ margin: 0 }}>
						{certificationTitle}
					</h3>
					<button 
						onClick={handleGetCertified}
						className="text-sm font-medium hover:underline hover-glow"
						style={{
							fontSize: '0.875rem',
							color: 'var(--accent)',
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							textDecoration: 'underline',
							transition: 'all 0.3s ease',
							fontWeight: 500
						}}
					>
						Get Certified
					</button>
				</div>
			</div>
			<button 
				onClick={handleViewAll}
				className="block text-center mt-4 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover-lift"
				style={{
					display: 'block',
					textAlign: 'center',
					marginTop: '16px',
					fontSize: '14px',
					color: 'var(--muted-foreground)',
					background: 'none',
					border: 'none',
					cursor: 'pointer',
					width: '100%',
					transition: 'all 0.3s ease'
				}}
			>
				View all certifications
			</button>
		</div>
	)
}
