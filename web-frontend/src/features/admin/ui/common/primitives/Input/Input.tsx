import React from 'react'
import styles from './Input.module.css'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  size?: InputSize
  wrapperClassName?: string
}

export default function Input({
  label,
  error,
  hint,
  prefix,
  suffix,
  size = 'md',
  wrapperClassName = '',
  className = '',
  id,
  ...props
}: InputProps): JSX.Element {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`

  const wrapperClasses = [
    styles.wrapper,
    styles[size],
    error ? styles.error : '',
    prefix ? styles.hasPrefix : '',
    suffix ? styles.hasSuffix : '',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input id={inputId} className={`${styles.input} ${className}`} {...props} />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
