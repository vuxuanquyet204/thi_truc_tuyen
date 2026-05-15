import React, { useState, useCallback } from 'react'

interface InputProps {
	id: string
	name: string
	type: 'text' | 'email' | 'password'
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
	placeholder: string
	error?: string
	success?: boolean
	suggestions?: string[]
	required?: boolean
	disabled?: boolean
	autoComplete?: string
	'aria-describedby'?: string
}

export default function Input({
	id,
	name,
	type,
	value,
	onChange,
	onBlur,
	onFocus,
	placeholder,
	error,
	success = false,
	suggestions = [],
	required = false,
	disabled = false,
	autoComplete,
	'aria-describedby': ariaDescribedBy
}: InputProps): JSX.Element {
	const [isFocused, setIsFocused] = useState(false)

	const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(true)
		onFocus?.(e)
	}, [onFocus])

	const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		setIsFocused(false)
		onBlur?.(e)
	}, [onBlur])

	// Note: Password visibility toggle removed - browsers have native support
	const hasError = Boolean(error)
	const hasSuccess = success && !hasError && value.length > 0
	const errorId = `${id}-error`
	const suggestionsId = `${id}-suggestions`
	const describedBy = [
		ariaDescribedBy,
		hasError ? errorId : null,
		suggestions.length > 0 && isFocused ? suggestionsId : null
	].filter(Boolean).join(' ')

	return (
		<div style={{ position: 'relative' }}>
			<label
				htmlFor={id}
				style={{
					display: 'block',
					fontSize: '0.875rem',
					fontWeight: '500',
					color: hasError ? 'var(--destructive)' : 'var(--card-foreground)',
					marginBottom: '0.25rem',
					transition: 'color 0.2s ease'
				}}
			>
				{placeholder}
				{required && <span style={{ color: 'var(--destructive)', marginLeft: '0.25rem' }}>*</span>}
			</label>

			<div style={{ position: 'relative' }}>
				<input
					type={type}
					id={id}
					name={name}
					value={value}
					onChange={onChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					disabled={disabled}
					autoComplete={autoComplete}
					aria-describedby={describedBy || undefined}
					aria-invalid={hasError}
					aria-required={required}
					style={{
						width: '100%',
						padding: '0.75rem 1rem',
						border: `2px solid ${
							hasError 
								? 'var(--destructive)' 
								: hasSuccess 
									? '#22c55e' 
									: isFocused 
										? 'var(--primary)' 
										: 'var(--border)'
						}`,
						background: disabled ? 'var(--muted)' : 'var(--background)',
						borderRadius: 'var(--radius-md)',
						outline: 'none',
						color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
						fontSize: '0.875rem',
						transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
						boxSizing: 'border-box',
						boxShadow: isFocused && !hasError ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
					}}
					placeholder={isFocused ? '' : placeholder}
					required={required}
				/>

				{/* Success indicator */}
				{hasSuccess && (
					<div
						style={{
							position: 'absolute',
							right: '0.75rem',
							top: '50%',
							transform: 'translateY(-50%)',
							color: '#22c55e',
							fontSize: '1rem'
						}}
						aria-hidden="true"
					>
						✓
					</div>
				)}
			</div>

			{/* Error message */}
			{hasError && (
				<div
					id={errorId}
					role="alert"
					aria-live="polite"
					style={{
						fontSize: '0.875rem',
						color: '#ef4444', // Fallback red color
						marginTop: '0.5rem',
						display: 'flex',
						alignItems: 'center',
						gap: '0.25rem'
					}}
				>
					{error}
				</div>
			)}

			{/* Suggestions */}
			{suggestions.length > 0 && isFocused && !hasError && (
				<div
					id={suggestionsId}
					style={{
						fontSize: '0.75rem',
						color: 'var(--muted-foreground)',
						marginTop: '0.5rem',
						padding: '0.5rem',
						background: 'var(--muted)',
						borderRadius: 'var(--radius-sm)',
						border: '1px solid var(--border)'
					}}
				>
					<div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Gợi ý:</div>
					<ul style={{ margin: 0, paddingLeft: '1rem' }}>
						{suggestions.map((suggestion, index) => (
							<li key={index} style={{ marginBottom: '0.125rem' }}>
								{suggestion}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
