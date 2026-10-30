import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useAuthStore, UserProfile } from '@/stores/authStore';
import { api, hasAuthToken } from '@/services/apiClient';
import { useMasteryStore } from '@/stores/masteryStore';
import {
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DEBTS,
  INITIAL_POLICIES,
  INITIAL_GOALS,
  INITIAL_HISTORY,
  INITIAL_AI_MESSAGES,
} from '@/data/mockData';
import { computeAdaptiveBlueprint, UserAdaptiveInputs } from '@/services/adaptiveLifeEngine';

export function getUserStorageKey(user: { id?: string; email?: string } | null): string {
  if (!user || (!user.id && !user.email)) return 'lifeos_guest';
  const identifier = user.email || user.id || 'anonymous';
  return `lifeos_usr_${identifier.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Saves current in-memory state of Finance and LifeOS stores to the user's isolated storage
 */
export function saveUserScopedData(user: UserProfile | null): void {
  if (!user || !user.email) return;
  const userKey = getUserStorageKey(user);

  try {
    const finState = useFinanceStore.getState();
    const lifeState = useLifeOSStore.getState();

    console.log('[saveUserScopedData]', user.email, 'Assets:', finState.assets.length, 'isClearing:', isClearing);

    const financeData = {
      assets: finState.assets,
      transactions: finState.transactions,
      expenses: finState.expenses,
      incomes: finState.incomes,
      calendarEvents: finState.calendarEvents,
      debts: finState.debts,
      policies: finState.policies,
      goals: finState.goals,
      emergencyTargetMonths: finState.emergencyTargetMonths,
      history: finState.history,
      currency: finState.currency,
      aiMessages: finState.aiMessages,
    };

    const lifeosData = {
      tasks: lifeState.tasks,
      wellness: lifeState.wellness,
      workoutSessions: lifeState.workoutSessions,
      mealLogs: lifeState.mealLogs,
      habits: lifeState.habits,
      focusSessions: lifeState.focusSessions,
      learningItems: lifeState.learningItems,
      learningBooks: lifeState.learningBooks,
      documents: lifeState.documents,
      emergencyInfo: lifeState.emergencyInfo,
      adminChecklists: lifeState.adminChecklists,
      userInputs: lifeState.userInputs,
      activeBlueprint: lifeState.activeBlueprint,
      userLocation: lifeState.userLocation,
      weeklyMealPlan: lifeState.weeklyMealPlan,
    };

    localStorage.setItem(`${userKey}_finance`, JSON.stringify(financeData));
    localStorage.setItem(`${userKey}_lifeos`, JSON.stringify(lifeosData));
  } catch (err) {
    console.error('[UserStorage] Failed to save user-scoped data:', err);
  }
}

/**
 * Loads the user's isolated storage into active in-memory stores.
 * If user has no previous data, initializes a clean, empty ₹0 slate.
 */
export function loadUserScopedData(user: UserProfile | null): void {
  if (!user || !user.email) return;
  const userKey = getUserStorageKey(user);
  const isDemo =
    user.id === 'demo_varun_senthil_kumar' ||
    user.id === 'demo_guest_investor' ||
    user.email === 'varun@quantra.io' ||
    user.email === 'investor@quantra.io' ||
    user.fullName.toLowerCase().includes('varun');

  if (isDemo) {
    useFinanceStore.setState({
      assets: INITIAL_ASSETS,
      transactions: INITIAL_TRANSACTIONS,
      expenses: INITIAL_EXPENSES,
      incomes: INITIAL_INCOMES,
      calendarEvents: INITIAL_CALENDAR_EVENTS,
      debts: [
        {
          id: 'debt_demo_1',
          title: 'HDFC Priority Home Loan',
          category: 'HOME_LOAN',
          lender: 'HDFC Bank',
          originalPrincipal: 15000,
          currentOutstanding: 4500,
          interestRate: 8.55,
          monthlyEmi: 320,
          emiDueDay: 5,
          startDate: '2023-01-10',
          tenureMonths: 120,
          repayments: [],
        },
      ],
      policies: INITIAL_POLICIES,
      goals: INITIAL_GOALS,
      emergencyTargetMonths: 6,
      history: INITIAL_HISTORY,
      currency: 'INR',
      aiMessages: INITIAL_AI_MESSAGES,
    });

    const demoInputs: UserAdaptiveInputs = {
      age: 28,
      gender: 'MALE',
      heightCm: 178,
      weightKg: 73.5,
      fitnessGoal: 'FAT_LOSS',
      intensityLevel: 'MODERATE_FITNESS',
      dietaryPreference: 'BALANCED_NON_VEG',
      workHoursPerDay: 8,
      riskProfile: 'AGGRESSIVE',
    };

    const demoBlueprint = computeAdaptiveBlueprint(demoInputs);

    useLifeOSStore.setState({
      userInputs: demoInputs,
      activeBlueprint: demoBlueprint,
      wellness: {
        heightCm: 178,
        weightKg: 73.5,
        targetWeightKg: 70,
        workoutMinutesLogged: 45,
        caloriesLogged: 1680,
        caloriesTarget: 2200,
        waterLitersLogged: 2.25,
        waterTargetLiters: 3.0,
        sleepHours: 7.5,
      },
      tasks: [
        {
          id: 'task_demo_1',
          title: 'Rebalance Q4 Equity & Index Fund Allocations',
          category: 'FINANCE',
          priority: 'HIGH',
          status: 'TODO',
          badgeLabel: 'High Priority',
          time: '11:00 AM',
          iconSymbol: '₹',
        },
        {
          id: 'task_demo_2',
          title: 'Morning Push Day: 45m Chest & Triceps Protocol',
          category: 'WELLNESS',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          badgeLabel: 'Done',
          time: '07:30 AM',
          iconSymbol: '♡',
        },
        {
          id: 'task_demo_3',
          title: 'Log Daily Macro Protein & 3L Water Target',
          category: 'WELLNESS',
          priority: 'HIGH',
          status: 'TODO',
          badgeLabel: '2.25L / 3L',
          time: '02:00 PM',
          iconSymbol: '♡',
        },
        {
          id: 'task_demo_4',
          title: 'Review System Design Chapter 5: Distributed Caching',
          category: 'LEARNING',
          priority: 'MEDIUM',
          status: 'TODO',
          badgeLabel: 'In Progress',
          time: '05:30 PM',
          iconSymbol: '▧',
        },
        {
          id: 'task_demo_5',
          title: 'File Q3 Medical Insurance Claim Receipts into Vault',
          category: 'LIFEADMIN',
          priority: 'LOW',
          status: 'COMPLETED',
          badgeLabel: 'Archived',
          time: 'Yesterday',
          iconSymbol: '◇',
        },
      ],
      habits: [
        {
          id: 'hbt_1',
          title: 'Drink 3L Hydration Target',
          category: 'ANYTIME',
          streakCount: 14,
          isCompletedToday: false,
          icon: '💧',
        },
        {
          id: 'hbt_2',
          title: 'Morning 45-Min Workout',
          category: 'MORNING',
          streakCount: 8,
          isCompletedToday: true,
          icon: '⚡',
        },
        {
          id: 'hbt_3',
          title: 'Zero Unplanned Expense Day',
          category: 'EVENING',
          streakCount: 6,
          isCompletedToday: true,
          icon: '₹',
        },
        {
          id: 'hbt_4',
          title: 'Read 20 Pages Non-Fiction',
          category: 'AFTERNOON',
          streakCount: 21,
          isCompletedToday: false,
          icon: '📚',
        },
      ],
    });

    const mastery = useMasteryStore.getState();
    mastery.syncWithActualUserData();

    return;
  }

  try {
    const rawFin = localStorage.getItem(`${userKey}_finance`);
    const rawLife = localStorage.getItem(`${userKey}_lifeos`);

    if (rawFin) {
      const parsedFin = JSON.parse(rawFin);
      // Sanitize legacy mock defaults so no user starts with hardcoded mock debts/policies/calendar
      if (parsedFin.debts && parsedFin.debts.length > 0 && parsedFin.debts[0]?.id === 'debt_hdfc_home_1') {
        parsedFin.debts = [];
      }
      if (parsedFin.policies && parsedFin.policies.length > 0 && parsedFin.policies[0]?.id === 'pol_hdfc_ergo_optima') {
        parsedFin.policies = [];
      }
      if (parsedFin.goals && parsedFin.goals.length > 0 && parsedFin.goals[0]?.id === 'goal_emergency_fund') {
        parsedFin.goals = [];
      }
      if (parsedFin.calendarEvents && parsedFin.calendarEvents.length > 0 && parsedFin.calendarEvents[0]?.id === 'cev_sip_nifty50_01') {
        parsedFin.calendarEvents = [];
      }
      useFinanceStore.setState(parsedFin);
    } else {
      // Clean slate for new user
      useFinanceStore.getState().resetToFreshPortfolio(user.fullName);
    }

    if (rawLife) {
      const parsedLife = JSON.parse(rawLife);
      // Sanitize legacy mock emergency info
      if (
        parsedLife.emergencyInfo &&
        (parsedLife.emergencyInfo.primaryContactName === 'Jane S T' ||
          parsedLife.emergencyInfo.physicianName === 'Dr. Arvind Sharma (MD)')
      ) {
        parsedLife.emergencyInfo = null;
      }
      // Sanitize legacy mock defaults so no user starts with hardcoded biometric data
      if (
        parsedLife.userInputs &&
        parsedLife.userInputs.age === 29 &&
        parsedLife.userInputs.heightCm === 175 &&
        parsedLife.userInputs.weightKg === 74
      ) {
        parsedLife.userInputs = {
          age: '',
          gender: '',
          heightCm: '',
          weightKg: '',
          fitnessGoal: '',
          intensityLevel: '',
          dietaryPreference: '',
          workHoursPerDay: '',
          riskProfile: '',
        };
      }
      if (
        parsedLife.wellness &&
        parsedLife.wellness.heightCm === 175 &&
        parsedLife.wellness.weightKg === 70
      ) {
        parsedLife.wellness.heightCm = 0;
        parsedLife.wellness.weightKg = 0;
        parsedLife.wellness.targetWeightKg = 0;
      }
      useLifeOSStore.setState(parsedLife);
    } else {
      // Clean slate for new user
      useLifeOSStore.getState().resetToFreshState();
    }
  } catch (err) {
    console.error('[UserStorage] Failed to load user-scoped data:', err);
    useFinanceStore.getState().resetToFreshPortfolio(user.fullName);
    useLifeOSStore.getState().resetToFreshState();
  }
}

let isClearing = false;

/**
 * Fully wipes and resets ALL data for the given user:
 * 1. Resets in-memory Finance store (assets, txns, expenses, incomes, debts, policies, goals, calendar)
 * 2. Resets in-memory LifeOS store (tasks, habits, documents, emergencyInfo, checklists, wellness, meals, workouts)
 * 3. Removes stored keys from localStorage for this user and saves empty clean state
 * 4. Calls backend API reset (/api/portfolio/reset) if authenticated
 */
export function resetAllUserData(user: UserProfile | null): void {
  isClearing = true;
  try {
    useFinanceStore.getState().resetToFreshPortfolio(user?.fullName || 'User');
    useLifeOSStore.getState().resetToFreshState();

    if (user && user.email) {
      const userKey = getUserStorageKey(user);
      try {
        localStorage.removeItem(`${userKey}_finance`);
        localStorage.removeItem(`${userKey}_lifeos`);
      } catch (e) {
        console.warn('[UserStorage] Failed to clear local storage:', e);
      }
      saveUserScopedData(user);
    }

    if (hasAuthToken()) {
      api.portfolio.resetToFresh().catch((err) => console.debug('[SQLite Sync] Reset portfolio backend:', err));
    }
  } finally {
    isClearing = false;
  }
}

/**
 * Clears all in-memory stores back to a clean empty state on logout.
 */
export function clearActiveUserStores(): void {
  isClearing = true;
  try {
    useFinanceStore.getState().resetToFreshPortfolio('');
    useLifeOSStore.getState().resetToFreshState();
  } finally {
    isClearing = false;
  }
}

let autoSaveInitialized = false;

/**
 * Automatically subscribes to store changes and persists them to the active user's key
 */
export function initUserStorageAutoSave(): void {
  if (autoSaveInitialized) return;
  autoSaveInitialized = true;

  useFinanceStore.subscribe(() => {
    if (isClearing) return;
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && auth.user) {
      saveUserScopedData(auth.user);
    }
  });

  useLifeOSStore.subscribe(() => {
    if (isClearing) return;
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && auth.user) {
      saveUserScopedData(auth.user);
    }
  });
}
