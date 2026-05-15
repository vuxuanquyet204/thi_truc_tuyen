import React from 'react'
import Input from '@/shared/ui/atoms/Input/Input'
import Button from '@/shared/ui/atoms/Button/Button'
import styles from './AuthForm.module.css'

interface AuthFormProps {
	title: string
	subtitle: string
	children: React.ReactNode
	onSubmit: (e: React.FormEvent) => void
	buttonText: string
	loading?: boolean
	error?: string | null
	footer?: React.ReactNode
	buttonStyle?: React.CSSProperties
	afterButton?: React.ReactNode
}

export default function AuthForm({
	title,
	subtitle,
	children,
	onSubmit,
	buttonText,
	loading = false,
	error,
	footer,
	buttonStyle = {},
	afterButton
}: AuthFormProps): JSX.Element {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>
					{title}
				</h1>
				<p className={styles.subtitle}>
					{subtitle}
				</p>
			</div>

			<form onSubmit={onSubmit} className={styles.form}>
				{children}
				
				{error && (
					<div className={styles.errorMessage}>
						{error}
					</div>
				)}
				
				<Button 
					type="submit" 
					loading={loading} 
					className={styles.submitButton}
					style={buttonStyle}
				>
					{buttonText}
				</Button>
			</form>

			{afterButton && (
				<div className={styles.afterButton}>
					{afterButton}
				</div>
			)}

			{footer && (
				<div className={styles.footer}>
					{footer}
				</div>
		)}
		</div>
	)
}
