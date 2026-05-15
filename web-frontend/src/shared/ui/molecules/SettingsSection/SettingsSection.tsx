import React from 'react';
import { SettingsSection as SettingsSectionType } from '@/types/settings';

interface SettingsSectionProps {
  section: SettingsSectionType;
  className?: string;
}

export default function SettingsSection({ section, className = '' }: SettingsSectionProps): JSX.Element {
  
  return (
    <div 
      className={className}
      style={{
        marginBottom: '24px',
        padding: '24px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        width: '100%', // Sử dụng 100% width của parent
        boxSizing: 'border-box' // Đảm bảo padding không làm tăng width
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Danger Zone Indicator */}
      {section.isDangerous && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--destructive) 0%, var(--destructive-foreground) 100%)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }} />
      )}

      {/* Header */}
      <div style={{
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          margin: '0 0 8px 0',
          color: section.isDangerous ? 'var(--destructive)' : 'var(--foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {section.isDangerous && (
            <span style={{
              fontSize: '16px'
            }}>
              ⚠️
            </span>
          )}
          {section.title}
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: 'var(--muted-foreground)',
          margin: 0,
          lineHeight: 1.5,
          maxWidth: '100%'
        }}>
          {section.description}
        </p>
      </div>

      {/* Content */}
      <div style={{
        color: 'var(--foreground)'
      }}>
        {section.content}
      </div>

      {/* Confirmation Required Notice */}
      {section.requiresConfirmation && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--muted)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          color: 'var(--muted-foreground)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>ℹ️</span>
          <span>This action requires confirmation and cannot be undone.</span>
        </div>
      )}
    </div>
  );
}
