import React from 'react';
import ProfileCompletionBanner from '../../atoms/ProfileCompletionBanner';
import InfoCard from '../../atoms/InfoCard';
import { UserProfile, InfoCardData, ProfileCompletion } from '../../../../types/profile';
import styles from './ProfilePage.module.css';
import { 
  Award, 
  FolderOpen, 
  Trophy,
  Link,
  Star,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  Target
} from 'lucide-react';

interface ProfileMainContentProps {
  profile: UserProfile;
  completion: ProfileCompletion;
  onCompleteProfile: () => void;
  onEditCertifications: () => void;
  onEditProjects: () => void;
  onEditAchievements: () => void;
  onEditSocialLinks: () => void;
}

export default function ProfileMainContent({
  profile,
  completion,
  onCompleteProfile,
  onEditCertifications,
  onEditProjects,
  onEditAchievements,
  onEditSocialLinks
}: ProfileMainContentProps): JSX.Element {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Certifications Card
  const certificationsCard: InfoCardData = {
    id: 'certifications',
    title: 'Chứng chỉ',
    icon: <Award style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profile.certifications.map((cert) => (
          <div key={cert.id} style={{
            padding: '16px',
            background: 'var(--muted) !important',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border) !important',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                  color: 'var(--foreground)'
                }}>
                  {cert.name}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--accent)',
                  margin: '0 0 4px 0',
                  fontWeight: 500
                }}>
                  {cert.issuer}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  margin: 0
                }}>
                  Cấp ngày: {formatDate(cert.issueDate)}
                  {cert.expiryDate && ` • Hết hạn: ${formatDate(cert.expiryDate)}`}
                </p>
              </div>
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                </a>
              )}
            </div>
            {cert.skills && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                marginTop: '8px'
              }}>
                {cert.skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      background: 'var(--accent)',
                      color: 'var(--accent-foreground)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm chứng chỉ',
      onClick: onEditCertifications,
      variant: 'outline'
    },
    status: profile.certifications.length > 0 ? 'completed' : 'incomplete'
  };

  // Projects Card
  const projectsCard: InfoCardData = {
    id: 'projects',
    title: 'Dự án',
    icon: <FolderOpen style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profile.projects.map((project) => (
          <div key={project.id} style={{
            padding: '16px',
            background: 'var(--muted) !important',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border) !important',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                  color: 'var(--foreground)'
                }}>
                  {project.name}
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  margin: '0 0 8px 0'
                }}>
                  {formatDate(project.startDate)} - {project.current ? 'Hiện tại' : formatDate(project.endDate || '')}
                  {project.teamSize && ` • Team: ${project.teamSize} người`}
                </p>
              </div>
              {project.current && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}>
                  Đang thực hiện
                </span>
              )}
            </div>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--foreground)',
              lineHeight: 1.5,
              margin: '0 0 12px 0'
            }}>
              {project.description}
            </p>

            {project.technologies && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                marginBottom: '12px'
              }}>
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      background: 'var(--accent)',
                      color: 'var(--accent-foreground)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 500
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Project Links */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  <ExternalLink style={{ width: '12px', height: '12px' }} />
                  Demo
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'color var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  <ExternalLink style={{ width: '12px', height: '12px' }} />
                  GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm dự án',
      onClick: onEditProjects,
      variant: 'outline'
    },
    status: profile.projects.length > 0 ? 'completed' : 'incomplete'
  };

  // Achievements Card
  const achievementsCard: InfoCardData = {
    id: 'achievements',
    title: 'Thành tích',
    icon: <Trophy style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profile.achievements.map((achievement) => (
          <div key={achievement.id} style={{
            padding: '16px',
            background: 'var(--muted) !important',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border) !important',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-foreground)',
                flexShrink: 0
              }}>
                <Trophy style={{ width: '16px', height: '16px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                  color: 'var(--foreground)'
                }}>
                  {achievement.title}
                </h4>
                {achievement.issuer && (
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--accent)',
                    margin: '0 0 4px 0',
                    fontWeight: 500
                  }}>
                    {achievement.issuer}
                  </p>
                )}
                <p style={{
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Calendar style={{ width: '12px', height: '12px' }} />
                  {formatDate(achievement.date)}
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--foreground)',
                  lineHeight: 1.5,
                  margin: 0
                }}>
                  {achievement.description}
                </p>
              </div>
              {achievement.url && (
                <a
                  href={achievement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '6px',
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    transition: 'all var(--transition-normal)',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm thành tích',
      onClick: onEditAchievements,
      variant: 'outline'
    },
    status: profile.achievements.length > 0 ? 'completed' : 'incomplete'
  };

  // Social Links Card
  const socialLinksCard: InfoCardData = {
    id: 'social-links',
    title: 'Liên kết xã hội',
    icon: <Link style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {profile.socialLinks.map((link) => (
          <div key={link.platform} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            background: 'var(--muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-foreground)',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {link.platform.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  margin: '0 0 2px 0',
                  color: 'var(--foreground)',
                  textTransform: 'capitalize'
                }}>
                  {link.platform}
                </p>
                {link.username && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    margin: 0
                  }}>
                    @{link.username}
                  </p>
                )}
              </div>
            </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                transition: 'all var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
            </a>
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm liên kết',
      onClick: onEditSocialLinks,
      variant: 'outline'
    },
    status: profile.socialLinks.length > 0 ? 'completed' : 'incomplete'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Completion Banner */}
      <ProfileCompletionBanner 
        completion={completion}
        onCompleteProfile={onCompleteProfile}
      />

      {/* certifications */}
      <InfoCard data={certificationsCard} />

      {/* Projects */}
      <InfoCard data={projectsCard} />

      {/* Achievements */}
      <InfoCard data={achievementsCard} />

      {/* Social Links */}
      <InfoCard data={socialLinksCard} />
    </div>
  );
}
