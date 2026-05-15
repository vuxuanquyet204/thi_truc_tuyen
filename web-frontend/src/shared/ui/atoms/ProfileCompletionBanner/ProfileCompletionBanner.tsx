import React from 'react';
import { CheckCircle, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { ProfileCompletion } from '@/foundation/types/profile';
import styles from './ProfileCompletionBanner.module.css';

interface ProfileCompletionBannerProps {
  completion: ProfileCompletion;
  onCompleteProfile: () => void;
}

export default function ProfileCompletionBanner({ completion, onCompleteProfile }: ProfileCompletionBannerProps): JSX.Element {
  const getCompletionColor = () => {
    if (completion.percentage >= 80) return 'var(--primary)'; // green
    if (completion.percentage >= 60) return 'var(--accent)'; // yellow
    return 'var(--destructive)'; // red
  };

  const getCompletionIcon = () => {
    if (completion.percentage >= 80) return <CheckCircle style={{ width: '20px', height: '20px' }} />;
    if (completion.percentage >= 60) return <TrendingUp style={{ width: '20px', height: '20px' }} />;
    return <AlertTriangle style={{ width: '20px', height: '20px' }} />;
  };

  return (
    <div className={styles.profileCard}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: `linear-gradient(135deg, ${getCompletionColor()}20 0%, ${getCompletionColor()}10 100%)`,
        borderRadius: '50%',
        transform: 'translate(50%, -50%)',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: getCompletionColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {getCompletionIcon()}
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: 0,
                color: 'var(--foreground)'
              }}>
                Hoàn thành hồ sơ
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                margin: 0
              }}>
                {completion.completedSections}/{completion.totalSections} mục đã hoàn thành
              </p>
            </div>
          </div>

          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              color: getCompletionColor(),
              lineHeight: 1
            }}>
              {completion.percentage}%
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--muted-foreground)',
              marginTop: '4px'
            }}>
              hoàn thành
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          marginBottom: '16px'
        }}>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--muted)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              width: `${completion.percentage}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${getCompletionColor()} 0%, ${getCompletionColor()}CC 100%)`,
              transition: 'width 0.5s ease',
              borderRadius: '4px'
            }} />
          </div>
        </div>

        {/* Missing Sections */}
        {completion.missingSections.length > 0 && (
          <div style={{
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              margin: '0 0 8px 0'
            }}>
              Còn thiếu:
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {completion.missingSections.map((section, index) => (
                <span
                  key={index}
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    background: 'var(--destructive)',
                    color: 'var(--destructive-foreground)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 500
                  }}
                >
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {completion.recommendations.length > 0 && (
          <div style={{
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Target style={{ width: '14px', height: '14px' }} />
              Gợi ý:
            </p>
            <ul style={{
              fontSize: '13px',
              color: 'var(--foreground)',
              margin: 0,
              paddingLeft: '16px',
              lineHeight: 1.5
            }}>
              {completion.recommendations.map((recommendation, index) => (
                <li key={index}>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {completion.percentage < 100 && (
          <button
            onClick={onCompleteProfile}
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Target style={{ width: '16px', height: '16px' }} />
            Hoàn thiện hồ sơ ngay
          </button>
        )}

        {/* Completion Message */}
        {completion.percentage === 100 && (
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: `${getCompletionColor()}20`,
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${getCompletionColor()}40`
          }}>
            <CheckCircle style={{
              width: '24px',
              height: '24px',
              color: getCompletionColor(),
              margin: '0 auto 8px'
            }} />
            <p style={{
              fontSize: '14px',
              fontWeight: 600,
              color: getCompletionColor(),
              margin: 0
            }}>
              Hồ sơ đã hoàn thành 100%!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
