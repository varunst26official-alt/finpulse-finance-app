import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useAuthStore, UserProfile } from '@/stores/authStore';

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
      useFinanceStore.setState(parsedFin);
    } else {
      // Clean slate for new user
      useFinanceStore.getState().resetToFreshPortfolio(user.fullName);
    }

    if (rawLife) {
      const parsedLife = JSON.parse(rawLife);
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

/**
 * Clears all in-memory stores back to a clean empty state on logout.
 */
export function clearActiveUserStores(): void {
  useFinanceStore.getState().resetToFreshPortfolio('');
  useLifeOSStore.getState().resetToFreshState();
}

let autoSaveInitialized = false;

/**
 * Automatically subscribes to store changes and persists them to the active user's key
 */
export function initUserStorageAutoSave(): void {
  if (autoSaveInitialized) return;
  autoSaveInitialized = true;

  useFinanceStore.subscribe(() => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && auth.user) {
      saveUserScopedData(auth.user);
    }
  });

  useLifeOSStore.subscribe(() => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && auth.user) {
      saveUserScopedData(auth.user);
    }
  });
}
