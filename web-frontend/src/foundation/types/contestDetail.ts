export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Dễ' | 'Trung bình' | 'Khó';
export type ChallengeStatus = 'solved' | 'attempted' | 'not_attempted';

export interface Challenge {
  id: string;
  title: string;
  successRate: number;
  maxScore: number;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  description?: string;
  tags?: string[];
}

export interface ContestDetail {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'archived';
  challenges: Challenge[];
  currentRank?: number;
  totalParticipants?: number;
  ratingUpdateMessage?: string;
}
