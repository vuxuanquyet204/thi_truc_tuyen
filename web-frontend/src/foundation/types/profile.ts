// Profile Types
export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
  socialLinks: SocialLink[];
  preferences: UserPreferences;
  completionPercentage: number;
  lastUpdated: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  technologies?: string[];
  achievements?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  description?: string;
  activities?: string[];
}

export interface Skill {
  id: string;
  name: string;
  category: 'programming' | 'framework' | 'tool' | 'language' | 'soft-skill';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  certifications?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  url?: string;
  githubUrl?: string;
  demoUrl?: string;
  achievements?: string[];
  teamSize?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  issuer?: string;
  category: 'award' | 'recognition' | 'competition' | 'publication' | 'other';
  url?: string;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'website';
  url: string;
  username?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'vi' | 'en';
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  profileVisibility: 'public' | 'private' | 'connections-only';
}

// InfoCard Types
export interface InfoCardData {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  status?: 'completed' | 'incomplete' | 'pending';
  completionPercentage?: number;
}

// Profile Completion Types
export interface ProfileCompletion {
  totalSections: number;
  completedSections: number;
  percentage: number;
  missingSections: string[];
  recommendations: string[];
}
