import React from 'react';
import SettingsNavItem from '@/shared/ui/molecules/SettingsNavItem/SettingsNavItem';
import { SettingsNavItem as SettingsNavItemType } from '@/types/settings';

interface SettingsSidebarProps {
  navItems: SettingsNavItemType[];
  activeItemId: string;
  onNavItemClick: (itemId: string) => void;
  onSaveChanges: () => void;
}

export default function SettingsSidebar({
  navItems,
  activeItemId,
  onNavItemClick,
  onSaveChanges
}: SettingsSidebarProps): JSX.Element {
  
  const accountItems = navItems.filter(item => item.category === 'account');
  const preferenceItems = navItems.filter(item => item.category === 'preferences');

  return (
    <div style={{
      width: '280px',
      minWidth: '280px', // Đảm bảo không bị co lại
      maxWidth: '280px', // Đảm bảo không bị giãn ra
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      height: 'fit-content',
      position: 'sticky',
      top: '100px', // Tăng top để tránh header overlap (80px header + 20px spacing)
      zIndex: 10,
      boxShadow: 'var(--shadow-lg)',
      boxSizing: 'border-box'
    }}>
      {/* ACCOUNT Section */}
      <div style={{
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 12px 0',
          padding: '0 16px'
        }}>
          ACCOUNT
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {accountItems.map((item) => (
            <SettingsNavItem
              key={item.id}
              item={{
                ...item,
                isActive: item.id === activeItemId
              }}
              onClick={onNavItemClick}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--border)',
        margin: '24px 0'
      }} />

      {/* PREFERENCES Section */}
      <div style={{
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: '0 0 12px 0',
          padding: '0 16px'
        }}>
          PREFERENCES
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {preferenceItems.map((item) => (
            <SettingsNavItem
              key={item.id}
              item={{
                ...item,
                isActive: item.id === activeItemId
              }}
              onClick={onNavItemClick}
            />
          ))}
        </div>
      </div>

      {/* Save Changes Button */}
      <button
        onClick={onSaveChanges}
        style={{
          width: '100%',
          padding: '12px 20px',
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all var(--transition-normal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <span>💾</span>
        Save Changes
      </button>

      {/* Footer Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'var(--muted)',
        borderRadius: 'var(--radius-md)',
        fontSize: '11px',
        color: 'var(--muted-foreground)',
        textAlign: 'center',
        lineHeight: 1.4
      }}>
        Changes are saved automatically when you navigate between sections.
      </div>
    </div>
  );
}
