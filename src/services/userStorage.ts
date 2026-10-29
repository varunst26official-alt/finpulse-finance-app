import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useAuthStore, UserProfile } from '@/stores/authStore';
import { api, hasAuthToken } from '@/services/apiClient';

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
