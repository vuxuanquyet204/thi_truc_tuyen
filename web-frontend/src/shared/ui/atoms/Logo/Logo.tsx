import React from 'react'
import { GraduationCap } from 'lucide-react'

interface LogoProps {
	text?: string
	showIcon?: boolean
	className?: string
	style?: React.CSSProperties
}

export default function Logo({ 
	text = 'EduPlatform', 
	showIcon = true,
	className = '',
	style = {}
}: LogoProps): JSX.Element {
	return (
		<div 
			className={`flex items-center ${className}`}
			style={{ 
				display: 'flex', 
				alignItems: 'center',
				...style
			}}
		>
			{showIcon && (
				<GraduationCap 
					className="w-8 h-8" 
					style={{ 
						width: '32px', 
						height: '32px', 
						color: 'var(--accent)',
						marginRight: '12px'
					}} 
				/>
			)}
			<h1 
				className="text-2xl font-bold logo-hover logo-glow"
				style={{
					fontSize: '24px',
					fontWeight: 700,
					fontFamily: 'var(--font-display)',
					color: 'var(--foreground)',
					margin: 0,
					position: 'relative',
					overflow: 'hidden',
					textShadow: 'none'
				}}
			>
				{text}
			</h1>
		</div>
	)
}
