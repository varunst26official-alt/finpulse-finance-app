export type LifeOSSection =
  | 'overview'
  | 'finance'
  | 'wellness'
  | 'productivity'
  | 'learning'
  | 'lifeadmin'
  | 'community';

export type FinanceSubTab =
  | 'summary'
  | 'bank-statements'
  | 'calendar'
  | 'holdings'
  | 'commitments'
  | 'debts'
  | 'insurance'
  | 'health'
  | 'ledger'
  | 'goals';

export type LifeOSCategory = 'FINANCE' | 'WELLNESS' | 'PRODUCTIVITY' | 'LEARNING' | 'LIFEADMIN';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TaskItem {
  id: string;
  title: string;
  time?: string;
  category: LifeOSCategory;
  priority: PriorityLevel;
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
  notes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'ID_CARD' | 'INSURANCE' | 'PROPERTY' | 'VEHICLE' | 'TAX_RECORD';
  documentNumber: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';
  authority: string;
  notes?: string;
}

// Phase 2: Fitness & Workout Entities
export interface WorkoutSet {
  id: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number; // 1 to 10
}

export interface WorkoutSession {
  id: string;
  date: string;
  splitName: string;
  durationMinutes: number;
  totalTonnage: number;
  totalSets: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Cardio';
  targetSubMuscles: string;
  equipment: 'Barbell' | 'Dumbbell' | 'Cable' | 'Bodyweight' | 'Machine';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mechanics: 'Compound' | 'Isolation';
  cues: string[];
}

// Phase 3: Nutrition Entities
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealLogItem {
  id: string;
  date: string;
  mealType: MealType;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  portionDescription?: string;
}

// Phase 4: Habits & Deep Work
export interface HabitItem {
  id: string;
  title: string;
  category: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME';
  streakCount: number;
  isCompletedToday: boolean;
  icon: string;
}

export interface FocusSessionItem {
  id: string;
  durationMinutes: number;
  sessionType: 'POMODORO' | 'DEEP_WORK' | 'SHORT_BREAK';
  taskTitle?: string;
  date: string;
}

// Phase 5: Books & Knowledge
export interface LearningBookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  currentPage: number;
  totalPages: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  rating: number;
  notes?: string;
}

// Phase 6: Life Admin Emergency & Checklists
export interface EmergencyProfile {
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactRelation: string;
  secondaryContactName: string;
  secondaryContactPhone: string;
  physicianName: string;
  physicianPhone: string;
  tpaHelpline: string;
  notes: string;
}

export interface AdminChecklistItem {
  id: string;
  title: string;
  frequency: 'ANNUAL' | 'BIANNUAL' | 'QUARTERLY' | 'MONTHLY';
  dueDate: string;
  isCompleted: boolean;
  category: string;
  notes?: string;
}
