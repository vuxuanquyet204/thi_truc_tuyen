import React from 'react'
import { useTheme } from '@/foundation/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle(): JSX.Element {
	const { theme, toggleTheme } = useTheme()

	return (
		<button
			onClick={toggleTheme}
			style={{
				position: 'fixed',
				top: '1.5rem',
				right: '1.5rem',
				zIndex: 1000,
				width: '56px',
				height: '56px',
				background: 'var(--card)',
				border: '2px solid var(--border)',
				borderRadius: '50%',
				cursor: 'pointer',
				color: 'var(--foreground)',
				transition: 'all var(--transition-normal)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				boxShadow: 'var(--shadow-xl)',
				backdropFilter: 'blur(10px)',
				WebkitBackdropFilter: 'blur(10px)',
				overflow: 'hidden'
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = theme === 'dark' ? 'var(--primary)' : 'var(--accent)'
				e.currentTarget.style.borderColor = theme === 'dark' ? 'var(--primary)' : 'var(--accent)'
				e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)'
				e.currentTarget.style.boxShadow = theme === 'dark' ? 'var(--glow-primary)' : 'var(--glow-accent)'
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = 'var(--card)'
				e.currentTarget.style.borderColor = 'var(--border)'
				e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
				e.currentTarget.style.boxShadow = 'var(--shadow-xl)'
			}}
			title={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
			aria-label={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
		>
			<div style={{
				position: 'relative',
				width: '28px',
				height: '28px'
			}}>
				{/* Sun Icon - Light Mode */}
				<Sun
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '28px',
						height: '28px',
						color: theme === 'light' ? 'var(--accent)' : 'var(--muted-foreground)',
						transform: theme === 'light'
							? 'translate(-50%, -50%) rotate(0deg) scale(1)'
							: 'translate(-50%, -50%) rotate(90deg) scale(0)',
						transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), color 0.3s ease',
						opacity: theme === 'light' ? 1 : 0
					}}
				/>
				{/* Moon Icon - Dark Mode */}
				<Moon
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						width: '28px',
						height: '28px',
						color: theme === 'dark' ? 'var(--primary)' : 'var(--muted-foreground)',
						transform: theme === 'dark'
							? 'translate(-50%, -50%) rotate(0deg) scale(1)'
							: 'translate(-50%, -50%) rotate(-90deg) scale(0)',
						transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), color 0.3s ease',
						opacity: theme === 'dark' ? 1 : 0
					}}
				/>
			</div>

			{/* Animated Background Circle */}
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				width: '100%',
				height: '100%',
				borderRadius: '50%',
				background: theme === 'dark'
					? 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
					: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)',
				transform: 'translate(-50%, -50%)',
				transition: 'all 0.5s ease',
				zIndex: -1,
				animation: 'pulse 2s ease-in-out infinite'
			}} />

			{/* CSS Animations */}
			<style>{`
				@keyframes pulse {
					0%, 100% {
						transform: translate(-50%, -50%) scale(1);
						opacity: 1;
					}
					50% {
						transform: translate(-50%, -50%) scale(1.2);
						opacity: 0.5;
					}
				}
			`}</style>
		</button>
	)
}
