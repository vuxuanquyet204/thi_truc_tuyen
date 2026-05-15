import React, { useEffect, useState, useCallback } from 'react';
import ProfileSidebar from '@/shared/ui/sections/ProfileSidebar';
import ProfileMainContent from '@/shared/ui/sections/ProfileMainContent';
import { UserProfile, ProfileCompletion } from '@/foundation/types/profile';
import { getCurrentUser } from '@/features/users/api/userApi';
import { getBalance } from '@/features/rewards/api/tokenRewardApi';
import { useAuth } from '@/features/auth/hooks';
import styles from './ProfilePage.module.css';

// Default empty profile for initial state
const defaultEmptyProfile: UserProfile = {
  id: '',
  personalInfo: {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  },
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  achievements: [],
  socialLinks: [],
  preferences: {
    theme: 'light',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'public',
  },
  completionPercentage: 0,
  lastUpdated: new Date().toISOString(),
};

// Helper to calculate profile completion from available API data
const calculateProfileCompletion = (
  profile: UserProfile,
  tokenBalance?: number
): ProfileCompletion => {
  const sections = [
    { name: 'Personal Info', check: !!(profile.personalInfo?.firstName && profile.personalInfo?.lastName && profile.personalInfo?.email) },
    { name: 'Work Experience', check: (profile.workExperience?.length ?? 0) > 0 },
    { name: 'Education', check: (profile.education?.length ?? 0) > 0 },
    { name: 'Skills', check: (profile.skills?.length ?? 0) > 0 },
    { name: 'Certifications', check: (profile.certifications?.length ?? 0) > 0 },
    { name: 'Projects', check: (profile.projects?.length ?? 0) > 0 },
    { name: 'Social Links', check: (profile.socialLinks?.length ?? 0) > 0 },
    { name: 'Achievements', check: (profile.achievements?.length ?? 0) > 0 },
  ];

  const totalSections = sections.length;
  const completedSections = sections.filter(s => s.check).length;
  const percentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
  const missingSections = sections.filter(s => !s.check).map(s => s.name);

  const recommendations: string[] = [];
  if (!profile.personalInfo?.avatar) {
    recommendations.push('Upload a professional profile photo');
  }
  if (!profile.personalInfo?.bio) {
    recommendations.push('Add a bio to introduce yourself');
  }
  if (!profile.personalInfo?.location) {
    recommendations.push('Add your location');
  }
  if (!profile.personalInfo?.phone) {
    recommendations.push('Add your phone number');
  }
  if (missingSections.includes('Work Experience')) {
    recommendations.push('Add work experience to showcase your career');
  }
  if (missingSections.includes('Skills')) {
    recommendations.push('List your skills to highlight your expertise');
  }
  if (missingSections.includes('Projects')) {
    recommendations.push('Add portfolio projects to demonstrate your work');
  }
  if (tokenBalance === undefined || tokenBalance === 0) {
    recommendations.push('Earn tokens by completing courses and exams');
  }

  return {
    totalSections,
    completedSections,
    percentage,
    missingSections,
    recommendations: recommendations.slice(0, 3),
  };
};

export default function ProfilePage(): JSX.Element {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile>(defaultEmptyProfile);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    totalSections: 8,
    completedSections: 0,
    percentage: 0,
    missingSections: [
      'Personal Info',
      'Work Experience',
      'Education',
      'Skills',
      'Certifications',
      'Projects',
      'Social Links',
      'Achievements',
    ],
    recommendations: [],
  });
  const [tokenBalance, setTokenBalance] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data from APIs
  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user info from Identity Service
      const userResponse = await getCurrentUser();

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data;

        // Map API response to UserProfile
        const mappedProfile: UserProfile = {
          id: userData.id.toString(),
          personalInfo: {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || '',
            email: userData.email || '',
            phone: userData.phoneNumber,
            avatar: userData.avatarUrl,
            // bio, location, website, dateOfBirth, gender not available from this endpoint
          },
          workExperience: profile.workExperience || [],
          education: profile.education || [],
          skills: profile.skills || [],
          certifications: profile.certifications || [],
          projects: profile.projects || [],
          achievements: profile.achievements || [],
          socialLinks: profile.socialLinks || [],
          preferences: profile.preferences || {
            theme: 'light',
            language: 'vi',
            timezone: 'Asia/Ho_Chi_Minh',
            emailNotifications: true,
            pushNotifications: true,
            profileVisibility: 'public',
          },
          completionPercentage: profile.completionPercentage || 0,
          lastUpdated: userData.updatedAt || new Date().toISOString(),
        };

        // Update profile, preserving extended profile data if already loaded
        setProfile(prev => ({
          ...prev,
          ...mappedProfile,
          workExperience: mappedProfile.workExperience.length > 0 ? mappedProfile.workExperience : prev.workExperience,
          education: mappedProfile.education.length > 0 ? mappedProfile.education : prev.education,
          skills: mappedProfile.skills.length > 0 ? mappedProfile.skills : prev.skills,
          certifications: mappedProfile.certifications.length > 0 ? mappedProfile.certifications : prev.certifications,
          projects: mappedProfile.projects.length > 0 ? mappedProfile.projects : prev.projects,
          achievements: mappedProfile.achievements.length > 0 ? mappedProfile.achievements : prev.achievements,
          socialLinks: mappedProfile.socialLinks.length > 0 ? mappedProfile.socialLinks : prev.socialLinks,
        }));

        // Fetch token balance
        let fetchedBalance: number | undefined = undefined;
        try {
          const balanceData = await getBalance(userData.id);
          fetchedBalance = balanceData.balance ?? balanceData.tokenBalance ?? 0;
          setTokenBalance(fetchedBalance);
        } catch (balanceError) {
          console.warn('Could not fetch token balance:', balanceError);
          setTokenBalance(undefined);
        }

        // Calculate completion after profile is set
        setProfileCompletion(prev => {
          const newProfile = {
            ...prev,
            ...mappedProfile,
          };
          return calculateProfileCompletion(newProfile, fetchedBalance);
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Recalculate completion when profile changes
  useEffect(() => {
    if (!loading) {
      setProfileCompletion(prev => calculateProfileCompletion(profile, tokenBalance));
    }
  }, [profile, tokenBalance, loading]);

  // Event handlers (placeholder for future API endpoints)
  const handleEditPersonalInfo = () => {
    console.log('Edit personal info - endpoint not yet available');
  };

  const handleEditWorkExperience = () => {
    console.log('Edit work experience - endpoint not yet available');
  };

  const handleEditEducation = () => {
    console.log('Edit education - endpoint not yet available');
  };

  const handleEditSkills = () => {
    console.log('Edit skills - endpoint not yet available');
  };

  const handleEditCertifications = () => {
    console.log('Edit certifications - endpoint not yet available');
  };

  const handleEditProjects = () => {
    console.log('Edit projects - endpoint not yet available');
  };

  const handleEditAchievements = () => {
    console.log('Edit achievements - endpoint not yet available');
  };

  const handleEditSocialLinks = () => {
    console.log('Edit social links - endpoint not yet available');
  };

  const handleUploadCV = () => {
    console.log('Upload CV - endpoint not yet available');
  };

  const handleDownloadCV = () => {
    console.log('Download CV - endpoint not yet available');
  };

  const handleCompleteProfile = () => {
    console.log('Complete profile - endpoint not yet available');
  };

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.profileContainer}>
          <div className={styles.profilePageHeader}>
            <h1 className={styles.profilePageTitle}>Hồ sơ cá nhân</h1>
            <p className={styles.profilePageSubtitle}>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.profileContainer}>
          <div className={styles.profilePageHeader}>
            <h1 className={styles.profilePageTitle}>Hồ sơ cá nhân</h1>
            <p className={styles.profilePageSubtitle} style={{ color: '#ef4444' }}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileContainer}>
        <div className={styles.profilePageHeader}>
          <h1 className={styles.profilePageTitle}>
            Hồ sơ cá nhân
          </h1>
          <p className={styles.profilePageSubtitle}>
            Quản lý và cập nhật thông tin hồ sơ của bạn
          </p>
        </div>

        <div className={styles.profileGrid}>
          <div>
            <ProfileSidebar
              profile={profile}
              onEditPersonalInfo={handleEditPersonalInfo}
              onEditWorkExperience={handleEditWorkExperience}
              onEditEducation={handleEditEducation}
              onEditSkills={handleEditSkills}
              onEditCertifications={handleEditCertifications}
              onEditProjects={handleEditProjects}
              onEditAchievements={handleEditAchievements}
              onEditSocialLinks={handleEditSocialLinks}
              onUploadCV={handleUploadCV}
              onDownloadCV={handleDownloadCV}
            />
          </div>

          <div>
            <ProfileMainContent
              profile={profile}
              completion={profileCompletion}
              onCompleteProfile={handleCompleteProfile}
              onEditCertifications={handleEditCertifications}
              onEditProjects={handleEditProjects}
              onEditAchievements={handleEditAchievements}
              onEditSocialLinks={handleEditSocialLinks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
