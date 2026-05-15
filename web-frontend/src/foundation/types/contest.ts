export interface Contest {
  id: string;
  title: string;
  description: string;
  status: 'featured' | 'active' | 'upcoming' | 'archived';
  type: 'global' | 'college' | 'hiring' | 'practice';
  startDate?: string;
  endDate: string;
  registrationEndDate?: string;
  duration?: string;
  participants?: number;
  prizes?: string[];
  actionButtonText: string;
  actionButtonLink: string;
  isRegistrationOpen?: boolean;
  region?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface ContestSection {
  title: string;
  contests: Contest[];
  layout: 'list' | 'grid';
  showViewAll?: boolean;
  viewAllLink?: string;
}

export interface FeaturedContest extends Contest {
  featuredDescription?: string;
  registrationInfo?: string;
  backgroundImage?: string;
  logoUrl?: string;
}
