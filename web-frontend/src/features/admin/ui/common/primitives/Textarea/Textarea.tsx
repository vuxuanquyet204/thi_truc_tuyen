import React from 'react'
import styles from './Textarea.module.css'

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  autoResize?: boolean
  maxLength?: number
  showCount?: boolean
  size?: TextareaSize
  wrapperClassName?: string
}

export default function Textarea({
  label,
  error,
  hint,
  autoResize = false,
  maxLength,
  showCount = false,
  size = 'md',
  wrapperClassName = '',
  className = '',
  id,
  value,
  onChange,
  ...props
}: TextareaProps): JSX.Element {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`

  const wrapperClasses = [
    styles.wrapper,
    styles[size],
    error ? styles.error : '',
    wrapperClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const currentLength = typeof value === 'string' ? value.length : 0
  const nearLimit = maxLength ? currentLength >= maxLength * 0.9 : false
  const overLimit = maxLength ? currentLength > maxLength : false

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto'
      e.target.style.height = `${e.target.scrollHeight}px`
    }
    onChange?.(e)
  }

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${styles.textarea} ${className}`}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
      <div className={styles.footer}>
        {showCount && maxLength && (
          <span
            className={`${styles.charCount} ${nearLimit ? styles.nearLimit : ''} ${overLimit ? styles.overLimit : ''}`}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  )
}
