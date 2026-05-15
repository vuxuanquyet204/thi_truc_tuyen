import React from 'react';
import { SettingsNavItem as SettingsNavItemType } from '@/types/settings';

interface SettingsNavItemProps {
  item: SettingsNavItemType;
  onClick: (itemId: string) => void;
}

export default function SettingsNavItem({ item, onClick }: SettingsNavItemProps): JSX.Element {
  
  const handleClick = () => {
    if (!item.isDisabled) {
      onClick(item.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={item.isDisabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: item.isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--transition-normal)',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: item.isActive ? 600 : 500,
        color: item.isActive 
          ? 'var(--primary)' 
          : item.isDisabled 
            ? 'var(--muted-foreground)' 
            : 'var(--foreground)',
        position: 'relative',
        opacity: item.isDisabled ? 0.5 : 1
      }}
      onMouseEnter={(e) => {
        if (!item.isDisabled && !item.isActive) {
          e.currentTarget.style.background = 'var(--muted)';
          e.currentTarget.style.color = 'var(--foreground)';
        }
      }}
      onMouseLeave={(e) => {
        if (!item.isDisabled && !item.isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--foreground)';
        }
      }}
    >
      {/* Active Indicator */}
      {item.isActive && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '3px',
          height: '20px',
          background: 'var(--primary)',
          borderRadius: '0 2px 2px 0'
        }} />
      )}

      {/* Icon */}
      <span style={{
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px'
      }}>
        {item.icon}
      </span>

      {/* Label */}
      <span style={{
        flex: 1,
        lineHeight: 1.4
      }}>
        {item.label}
      </span>

      {/* Active Indicator Dot */}
      {item.isActive && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--primary)',
          flexShrink: 0
        }} />
      )}
    </button>
  );
}
