export type MasteryCategory =
  | 'FINANCE'
  | 'WELLNESS'
  | 'PRODUCTIVITY'
  | 'LEARNING'
  | 'LIFEADMIN';

export type MasteryLeague =
  | 'BRONZE'
  | 'SILVER'
  | 'GOLD'
  | 'PLATINUM'
  | 'DIAMOND';

export type DisplayNameMode = 'REAL_NAME' | 'ALIAS' | 'ANONYMOUS';

export interface PointEvent {
  id: string;
  category: MasteryCategory;
  points: number;
  reason: string;
  timestamp: string;
}

export interface MasteryBadge {
  id: string;
  name: string;
  description: string;
  category: MasteryCategory | 'ALL';
  icon: string;
  color: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
  requirementText: string;
}

export interface LeaderboardMember {
  id: string;
  name: string;
  alias: string;
  avatarUrl?: string;
  avatarSeed: string;
  isCurrentUser: boolean;
  league: MasteryLeague;
  rank: number;
  previousRank?: number;
  totalPoints: number;
  weeklyPoints: number;
  streakDays: number;
  level: number;
  sectionPoints: {
    FINANCE: number;
    WELLNESS: number;
    PRODUCTIVITY: number;
    LEARNING: number;
    LIFEADMIN: number;
  };
  badges: string[];
  kudosCount: number;
  hasGivenKudo?: boolean;
  statusMessage: string;
  location?: string;
}

export interface MasteryNotification {
  id: string;
  points: number;
  category: MasteryCategory;
  reason: string;
  timestamp: number;
}
