import React from 'react';
import ProfileHeader from '../../molecules/ProfileHeader';
import InfoCard from '../../atoms/InfoCard';
import { UserProfile, InfoCardData } from '../../../../types/profile';
import styles from './ProfilePage.module.css';
import { 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  FolderOpen, 
  Trophy,
  Link,
  Download,
  Upload
} from 'lucide-react';

interface ProfileSidebarProps {
  profile: UserProfile;
  onEditPersonalInfo: () => void;
  onEditWorkExperience: () => void;
  onEditEducation: () => void;
  onEditSkills: () => void;
  onEditCertifications: () => void;
  onEditProjects: () => void;
  onEditAchievements: () => void;
  onEditSocialLinks: () => void;
  onUploadCV: () => void;
  onDownloadCV: () => void;
}

export default function ProfileSidebar({
  profile,
  onEditPersonalInfo,
  onEditWorkExperience,
  onEditEducation,
  onEditSkills,
  onEditCertifications,
  onEditProjects,
  onEditAchievements,
  onEditSocialLinks,
  onUploadCV,
  onDownloadCV
}: ProfileSidebarProps): JSX.Element {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return '#ef4444';
      case 'advanced': return '#f59e0b';
      case 'intermediate': return '#3b82f6';
      case 'beginner': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Work Experience Card
  const workExperienceCard: InfoCardData = {
    id: 'work-experience',
    title: 'Kinh nghiệm làm việc',
    icon: <Briefcase style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profile.workExperience.map((exp, index) => (
          <div key={exp.id} className={styles.contentCard}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px'
            }}>
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  margin: '0 0 4px 0',
                  color: 'var(--foreground)'
                }}>
                  {exp.position}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--accent)',
                  margin: '0 0 4px 0',
                  fontWeight: 500
                }}>
                  {exp.company}
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--muted-foreground)',
                  margin: 0
                }}>
                  {formatDate(exp.startDate)} - {exp.current ? 'Hiện tại' : formatDate(exp.endDate || '')}
                </p>
              </div>
              {exp.current && (
                <span style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  background: '#10b981',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 500
                }}>
                  Hiện tại
                </span>
              )}
            </div>
            <p style={{
              fontSize: '13px',
              color: 'var(--foreground)',
              lineHeight: 1.5,
              margin: '0 0 8px 0'
            }}>
              {exp.description}
            </p>
            {exp.technologies && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {exp.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
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
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm kinh nghiệm',
      onClick: onEditWorkExperience,
      variant: 'outline'
    },
    status: profile.workExperience.length > 0 ? 'completed' : 'incomplete'
  };

  // Education Card
  const educationCard: InfoCardData = {
    id: 'education',
    title: 'Học vấn',
    icon: <GraduationCap style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {profile.education.map((edu) => (
          <div key={edu.id} className={styles.contentCard}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 4px 0',
              color: 'var(--foreground)'
            }}>
              {edu.degree} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}
            </h4>
            <p style={{
              fontSize: '14px',
              color: 'var(--accent)',
              margin: '0 0 4px 0',
              fontWeight: 500
            }}>
              {edu.institution}
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--muted-foreground)',
              margin: '0 0 8px 0'
            }}>
              {formatDate(edu.startDate)} - {edu.current ? 'Hiện tại' : formatDate(edu.endDate || '')}
              {edu.gpa && ` • GPA: ${edu.gpa}`}
            </p>
            {edu.description && (
              <p style={{
                fontSize: '13px',
                color: 'var(--foreground)',
                lineHeight: 1.5,
                margin: 0
              }}>
                {edu.description}
              </p>
            )}
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm học vấn',
      onClick: onEditEducation,
      variant: 'outline'
    },
    status: profile.education.length > 0 ? 'completed' : 'incomplete'
  };

  // Skills Card
  const skillsCard: InfoCardData = {
    id: 'skills',
    title: 'Kỹ năng',
    icon: <Code style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {profile.skills.map((skill) => (
          <div key={skill.id} className={styles.contentCard}>
            <div>
              <h5 style={{
                fontSize: '14px',
                fontWeight: 600,
                margin: '0 0 2px 0',
                color: 'var(--foreground)'
              }}>
                {skill.name}
              </h5>
              <p style={{
                fontSize: '12px',
                color: 'var(--muted-foreground)',
                margin: 0,
                textTransform: 'capitalize'
              }}>
                {skill.category} • {skill.yearsOfExperience && `${skill.yearsOfExperience} năm`}
              </p>
            </div>
            <span style={{
              fontSize: '11px',
              padding: '4px 8px',
              background: getSkillLevelColor(skill.level),
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {skill.level}
            </span>
          </div>
        ))}
      </div>
    ),
    actionButton: {
      text: 'Thêm kỹ năng',
      onClick: onEditSkills,
      variant: 'outline'
    },
    status: profile.skills.length > 0 ? 'completed' : 'incomplete'
  };

  // CV Management Card
  const cvCard: InfoCardData = {
    id: 'cv',
    title: 'CV / Resume',
    icon: <Download style={{ width: '20px', height: '20px' }} />,
    content: (
      <div style={{
        textAlign: 'center',
        padding: '20px',
        background: 'var(--muted)',
        borderRadius: 'var(--radius-md)',
        border: '2px dashed var(--border)'
      }}>
        <Upload style={{
          width: '32px',
          height: '32px',
          color: 'var(--muted-foreground)',
          margin: '0 auto 12px'
        }} />
        <p style={{
          fontSize: '14px',
          color: 'var(--muted-foreground)',
          margin: '0 0 16px 0'
        }}>
          Chưa có CV được tải lên
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--muted-foreground)',
          margin: 0
        }}>
          Tải lên CV để tăng cơ hội được tuyển dụng
        </p>
      </div>
    ),
    actionButton: {
      text: 'Tải lên CV',
      onClick: onUploadCV
    },
    status: 'incomplete'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header */}
      <ProfileHeader 
        personalInfo={profile.personalInfo}
        onEditProfile={onEditPersonalInfo}
      />

      {/* Work Experience */}
      <InfoCard data={workExperienceCard} />

      {/* Education */}
      <InfoCard data={educationCard} />

      {/* Skills */}
      <InfoCard data={skillsCard} />

      {/* CV Management */}
      <InfoCard data={cvCard} />
    </div>
  );
}
