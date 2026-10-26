export type LifeOSSection =
  | 'overview'
  | 'finance'
  | 'wellness'
  | 'productivity'
  | 'learning'
  | 'lifeadmin';

export type FinanceSubTab =
  | 'summary'
  | 'holdings'
  | 'debts'
  | 'insurance'
  | 'health'
  | 'ledger'
  | 'calendar'
  | 'goals';

export interface TaskItem {
  id: string;
  title: string;
  time?: string;
  category: 'FINANCE' | 'WELLNESS' | 'PRODUCTIVITY' | 'LEARNING' | 'LIFEADMIN';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  badgeLabel?: string;
  notes?: string;
  iconSymbol?: string;
}

export interface WellnessState {
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  workoutMinutesLogged: number;
  caloriesLogged: number;
  caloriesTarget: number;
  waterLitersLogged: number;
  waterTargetLiters: number;
  sleepHours: number;
}

export interface LearningItem {
  id: string;
  title: string;
  field: string;
  progressPercent: number;
  hoursSpent: number;
  targetHours: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'ID_CARD' | 'INSURANCE' | 'PROPERTY' | 'VEHICLE' | 'TAX_RECORD';
  documentNumber: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  authority: string;
}
