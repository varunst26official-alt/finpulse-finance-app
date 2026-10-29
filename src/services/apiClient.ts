import {
  Asset,
  Transaction,
  DebtItem,
  InsurancePolicy,
  GoalItem,
  CalendarEvent,
  Currency,
} from '@/types/finance';
import {
  TaskItem,
  WellnessState,
  LearningItem,
  DocumentItem,
  WorkoutSession,
  MealLogItem,
  HabitItem,
  FocusSessionItem,
  LearningBookItem,
  EmergencyProfile,
  AdminChecklistItem,
} from '@/types/lifeos';
import { UserAdaptiveInputs, AdaptiveLifeBlueprint } from '@/services/adaptiveLifeEngine';
import { UserProfile } from '@/stores/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : '/api';
const TOKEN_KEY = 'finpulse_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth token in storage:', err);
  }
}

/** Returns true if a valid auth token exists in storage */
export function hasAuthToken(): boolean {
  return !!getStoredToken();
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

async function authenticatedRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!hasAuthToken()) {
    throw new Error('[Local Mode] No auth token — skipping remote sync.');
  }
  return request<T>(endpoint, options);
}

export const api = {
  // Auth Endpoints
  auth: {
    login: async (email: string, password: string): Promise<{ success: boolean; user: UserProfile; token: string }> => {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    register: async (data: {
      fullName: string;
      email: string;
      password: string;
      phoneNumber?: string;
    }): Promise<{ success: boolean; user: UserProfile; token: string }> => {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    demo: async (): Promise<{ success: boolean; user: UserProfile; token: string }> => {
      const res = await request<{ success: boolean; user: UserProfile; token: string }>('/auth/demo', {
        method: 'POST',
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    me: async (): Promise<{ success: boolean; user: UserProfile & { currency: Currency; emergencyTargetMonths: number } }> => {
      return request('/auth/me');
    },

    logout: () => {
      setStoredToken(null);
    },
  },

  // Portfolio & Wealth Synchronization
  portfolio: {
    fetchData: async (): Promise<{
      success: boolean;
      data: {
        assets: Asset[];
        transactions: Transaction[];
        debts: DebtItem[];
        policies: InsurancePolicy[];
        goals: GoalItem[];
        calendarEvents: CalendarEvent[];
        currency: Currency;
        emergencyTargetMonths: number;
      };
    }> => {
      return authenticatedRequest('/portfolio/data');
    },

    addAsset: async (asset: Partial<Asset>): Promise<{ success: boolean; assetId: string }> => {
      return authenticatedRequest('/portfolio/assets', {
        method: 'POST',
        body: JSON.stringify(asset),
      });
    },

    deleteAsset: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/portfolio/assets/${id}`, {
        method: 'DELETE',
      });
    },

    resetToFresh: async (): Promise<{ success: boolean; message: string }> => {
      return authenticatedRequest('/portfolio/reset', {
        method: 'POST',
      });
    },

    seedDemo: async (): Promise<{ success: boolean; message: string }> => {
      return request('/portfolio/seed-demo', {
        method: 'POST',
      });
    },
  },

  // Transactions
  transactions: {
    create: async (tx: Partial<Transaction>): Promise<{ success: boolean; transactionId: string }> => {
      return authenticatedRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Debts & Repayments
  debts: {
    create: async (debt: Partial<DebtItem>): Promise<{ success: boolean; debtId: string }> => {
      return authenticatedRequest('/debts', {
        method: 'POST',
        body: JSON.stringify(debt),
      });
    },

    repay: async (
      debtId: string,
      payload: { amount: number; date?: string; type?: string; notes?: string }
    ): Promise<{ success: boolean; repaymentId: string; newOutstandingBalance: number }> => {
      return authenticatedRequest(`/debts/${debtId}/repay`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/debts/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Insurance Policies
  policies: {
    create: async (policy: Partial<InsurancePolicy>): Promise<{ success: boolean; policyId: string }> => {
      return authenticatedRequest('/policies', {
        method: 'POST',
        body: JSON.stringify(policy),
      });
    },

    update: async (id: string, payload: Partial<InsurancePolicy>): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/policies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/policies/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Goals
  goals: {
    create: async (goal: Partial<GoalItem>): Promise<{ success: boolean; goalId: string }> => {
      return authenticatedRequest('/goals', {
        method: 'POST',
        body: JSON.stringify(goal),
      });
    },

    contribute: async (id: string, amount: number): Promise<{ success: boolean; newSaved: number; isAchieved: boolean }> => {
      return authenticatedRequest(`/goals/${id}/contribute`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/goals/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Financial Calendar
  calendar: {
    create: async (event: Partial<CalendarEvent>): Promise<{ success: boolean; eventId: string }> => {
      return authenticatedRequest('/calendar', {
        method: 'POST',
        body: JSON.stringify(event),
      });
    },

    toggle: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/calendar/${id}/toggle`, {
        method: 'PUT',
      });
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/calendar/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // LifeOS Platform Synchronization
  lifeos: {
    fetchData: async (): Promise<{
      success: boolean;
      data: {
        tasks: TaskItem[];
        wellness: WellnessState;
        learningItems: LearningItem[];
        documents: DocumentItem[];
        workoutSessions: WorkoutSession[];
        mealLogs: MealLogItem[];
        habits: HabitItem[];
        focusSessions: FocusSessionItem[];
        learningBooks: LearningBookItem[];
        emergencyInfo: EmergencyProfile | null;
        adminChecklists: AdminChecklistItem[];
        userInputs?: UserAdaptiveInputs;
        blueprint?: AdaptiveLifeBlueprint;
      };
    }> => {
      return authenticatedRequest('/lifeos/data');
    },

    createTask: async (task: Partial<TaskItem>): Promise<{ success: boolean; taskId: string }> => {
      return authenticatedRequest('/lifeos/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    },

    updateTask: async (id: string, updates: Partial<TaskItem>): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/lifeos/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    deleteTask: async (id: string): Promise<{ success: boolean }> => {
      return authenticatedRequest(`/lifeos/tasks/${id}`, {
        method: 'DELETE',
      });
    },

    logWellness: async (payload: {
      waterDeltaLiters?: number;
      workoutDeltaMinutes?: number;
      caloriesDelta?: number;
      resetWater?: boolean;
    }): Promise<{
      success: boolean;
      wellness: {
        waterLitersLogged: number;
        workoutMinutesLogged: number;
        caloriesLogged: number;
      };
    }> => {
      return authenticatedRequest('/lifeos/wellness/log', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateMetrics: async (payload: {
      heightCm?: number;
      weightKg?: number;
      targetWeightKg?: number;
      caloriesTarget?: number;
      waterTargetLiters?: number;
    }): Promise<{ success: boolean }> => {
      return authenticatedRequest('/lifeos/wellness/metrics', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    saveBlueprint: async (
      userInputs: UserAdaptiveInputs,
      blueprint: AdaptiveLifeBlueprint
    ): Promise<{ success: boolean }> => {
      return request('/lifeos/blueprint', {
        method: 'POST',
        body: JSON.stringify({ userInputs, blueprint }),
      });
    },

    // Workouts (Phase 2)
    recordWorkoutSession: async (session: {
      splitName: string;
      durationMinutes: number;
      notes?: string;
      sets: Array<{
        exerciseId: string;
        exerciseName: string;
        muscleGroup: string;
        setNumber: number;
        weightKg: number;
        reps: number;
        rpe?: number;
      }>;
    }): Promise<{ success: boolean; sessionId: string; totalTonnage: number; totalSets: number }> => {
      return request('/lifeos/workouts/session', {
        method: 'POST',
        body: JSON.stringify(session),
      });
    },

    deleteWorkoutSession: async (id: string): Promise<{ success: boolean }> => {
      return request(`/lifeos/workouts/session/${id}`, {
        method: 'DELETE',
      });
    },

    // Meals (Phase 3)
    createMealLog: async (meal: Partial<MealLogItem>): Promise<{ success: boolean; mealId: string }> => {
      return request('/lifeos/meals', {
        method: 'POST',
        body: JSON.stringify(meal),
      });
    },

    deleteMealLog: async (id: string): Promise<{ success: boolean }> => {
      return request(`/lifeos/meals/${id}`, {
        method: 'DELETE',
      });
    },

    // Habits & Deep Work (Phase 4)
    createHabit: async (habit: { title: string; category: string; icon?: string }): Promise<{ success: boolean; habitId: string }> => {
      return request('/lifeos/habits', {
        method: 'POST',
        body: JSON.stringify(habit),
      });
    },

    toggleHabit: async (id: string): Promise<{ success: boolean; isCompletedToday: boolean; streakCount: number }> => {
      return request(`/lifeos/habits/${id}/toggle`, {
        method: 'PATCH',
      });
    },

    deleteHabit: async (id: string): Promise<{ success: boolean }> => {
      return request(`/lifeos/habits/${id}`, {
        method: 'DELETE',
      });
    },

    logFocusSession: async (session: { durationMinutes: number; sessionType: string; taskTitle?: string }): Promise<{ success: boolean; focusId: string }> => {
      return request('/lifeos/focus', {
        method: 'POST',
        body: JSON.stringify(session),
      });
    },

    // Learning Books (Phase 5)
    createBook: async (book: Partial<LearningBookItem>): Promise<{ success: boolean; bookId: string }> => {
      return request('/lifeos/books', {
        method: 'POST',
        body: JSON.stringify(book),
      });
    },

    updateBook: async (id: string, updates: Partial<LearningBookItem>): Promise<{ success: boolean }> => {
      return request(`/lifeos/books/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    deleteBook: async (id: string): Promise<{ success: boolean }> => {
      return request(`/lifeos/books/${id}`, {
        method: 'DELETE',
      });
    },

    // Life Admin (Phase 6)
    saveEmergencyInfo: async (info: Partial<EmergencyProfile>): Promise<{ success: boolean }> => {
      return request('/lifeos/emergency', {
        method: 'POST',
        body: JSON.stringify(info),
      });
    },

    createChecklist: async (item: Partial<AdminChecklistItem>): Promise<{ success: boolean; checklistId: string }> => {
      return request('/lifeos/checklists', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },

    toggleChecklist: async (id: string): Promise<{ success: boolean; isCompleted: boolean }> => {
      return request(`/lifeos/checklists/${id}/toggle`, {
        method: 'PATCH',
      });
    },

    deleteChecklist: async (id: string): Promise<{ success: boolean }> => {
      return request(`/lifeos/checklists/${id}`, {
        method: 'DELETE',
      });
    },
  },
};
