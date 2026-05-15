import React from 'react';
import { User, MapPin, Calendar, Globe } from 'lucide-react';
import { PersonalInfo } from '@/types/profile';

interface ProfileHeaderProps {
  personalInfo: PersonalInfo;
  onEditProfile: () => void;
}

export default function ProfileHeader({ personalInfo, onEditProfile }: ProfileHeaderProps): JSX.Element {
  const getInitials = () => {
    return `${personalInfo.firstName.charAt(0)}${personalInfo.lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(20px, 3vw, 32px)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
        borderRadius: '50%',
        transform: 'translate(50%, -50%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '24px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'var(--primary-foreground)',
            border: '4px solid var(--card)',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative',
            flexShrink: 0
          }}>
            {personalInfo.avatar ? (
              <img
                src={personalInfo.avatar}
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span>{getInitials()}</span>
            )}
            
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#10b981',
              border: '3px solid var(--card)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }} />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              margin: '0 0 8px 0',
              color: 'var(--foreground)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {personalInfo.firstName} {personalInfo.lastName}
              <button
                onClick={onEditProfile}
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <User style={{ width: '16px', height: '16px' }} />
                Chỉnh sửa
              </button>
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: 'var(--accent)',
              margin: '0 0 12px 0',
              fontWeight: 500
            }}>
              @{personalInfo.username}
            </p>

            {personalInfo.bio && (
              <p style={{
                fontSize: '16px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.6,
                margin: '0 0 16px 0'
              }}>
                {personalInfo.bio}
              </p>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {personalInfo.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ width: '16px', height: '16px', color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{personalInfo.location}</span>
            </div>
          )}

          {personalInfo.dateOfBirth && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '16px', height: '16px', color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{calculateAge(personalInfo.dateOfBirth)} tuổi</span>
            </div>
          )}

          {personalInfo.website && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe style={{ width: '16px', height: '16px', color: 'var(--accent)', flexShrink: 0 }} />
              <a
                href={personalInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '14px',
                  color: 'var(--accent)',
                  textDecoration: 'none'
                }}
              >
                {personalInfo.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '16px',
              height: '16px',
              borderRadius: '2px',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: 'var(--accent-foreground)',
              flexShrink: 0
            }}>
              @
            </span>
            <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>{personalInfo.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
