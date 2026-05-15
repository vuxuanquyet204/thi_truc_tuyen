import React from 'react';
import { TextInputProps } from '@/foundation/types/settings';

export default function TextInput({
  label,
  description,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
  error,
  maxLength,
  autoComplete
}: TextInputProps): JSX.Element {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      width: '100%'
    }}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--foreground)',
            margin: 0
          }}
        >
          {label}
          {required && (
            <span style={{
              color: 'var(--destructive)',
              marginLeft: '4px'
            }}>
              *
            </span>
          )}
        </label>
      )}

      {/* Description */}
      {description && (
        <p style={{
          fontSize: '13px',
          color: 'var(--muted-foreground)',
          margin: 0,
          lineHeight: 1.4
        }}>
          {description}
        </p>
      )}

      {/* Input Field */}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)',
          background: 'var(--background)',
          border: `1px solid ${error ? 'var(--destructive)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          color: 'var(--foreground)',
          transition: 'all var(--transition-normal)',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--destructive)' : 'var(--primary)';
          e.target.style.boxShadow = `0 0 0 1px ${error ? 'var(--destructive)' : 'var(--primary)'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--destructive)' : 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      />

      {/* Error Message */}
      {error && (
        <p style={{
          fontSize: '12px',
          color: 'var(--destructive)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Character Count */}
      {maxLength && (
        <p style={{
          fontSize: '11px',
          color: 'var(--muted-foreground)',
          margin: 0,
          textAlign: 'right'
        }}>
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}
