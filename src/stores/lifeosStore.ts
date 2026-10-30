import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  LifeOSSection,
  FinanceSubTab,
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
import {
  computeAdaptiveBlueprint,
  UserAdaptiveInputs,
  AdaptiveLifeBlueprint,
  MealItem,
} from '@/services/adaptiveLifeEngine';
import { detectUserLocation, UserLocationProfile } from '@/services/locationService';
import { generateLocalizedWeeklyMealPlan, AiGenerationOptions } from '@/services/aiMealGenerator';
import { api } from '@/services/apiClient';
import { useMasteryStore } from './masteryStore';
import { useAuthStore } from './authStore';

const DEFAULT_USER_INPUTS: UserAdaptiveInputs = {
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

const INITIAL_BLUEPRINT = computeAdaptiveBlueprint(DEFAULT_USER_INPUTS);

interface LifeOSState {
  currentSection: LifeOSSection;
  setCurrentSection: (section: LifeOSSection) => void;

  financeSubTab: FinanceSubTab;
  setFinanceSubTab: (tab: FinanceSubTab) => void;

  timePeriod: 'week' | 'month' | 'year';
  setTimePeriod: (period: 'week' | 'month' | 'year') => void;

  isLoading: boolean;
  fetchLifeOSData: () => Promise<void>;

  // Adaptive LifeOS Engine State
  userInputs: UserAdaptiveInputs;
  activeBlueprint: AdaptiveLifeBlueprint;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (isOpen: boolean) => void;
  generateAndApplyBlueprint: (customInputs?: Partial<UserAdaptiveInputs>) => void;

  // Tasks & Agenda
  tasks: TaskItem[];
  toggleTaskComplete: (id: string) => void;
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  deleteTask: (id: string) => void;

  // Wellness & Metrics
  wellness: WellnessState;
  updateBodyMetrics: (heightCm: number, weightKg: number) => void;
  logWater: (liters: number) => void;
  resetWater: () => void;
  logWorkoutMinutes: (minutes: number) => void;
  logCalories: (calories: number) => void;

  // Workouts (Phase 2)
  workoutSessions: WorkoutSession[];
  recordWorkoutSession: (session: {
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
  }) => void;
  deleteWorkoutSession: (id: string) => void;

  // Nutrition (Phase 3)
  mealLogs: MealLogItem[];
  addMealLog: (meal: Omit<MealLogItem, 'id' | 'date'>) => void;
  deleteMealLog: (id: string) => void;

  // Location & Localized AI Nutrition
  userLocation: UserLocationProfile | null;
  setUserLocation: (loc: UserLocationProfile) => void;
  detectAndApplyLocation: () => Promise<UserLocationProfile>;
  weeklyMealPlan: Record<string, MealItem[]>;
  setWeeklyMealPlan: (plan: Record<string, MealItem[]>) => void;
  regenerateWeeklyMealPlan: (options?: AiGenerationOptions) => Promise<void>;
  isGeneratingMeals: boolean;

  // Habits & Focus (Phase 4)
  habits: HabitItem[];
  addHabit: (habit: { title: string; category: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'ANYTIME'; icon?: string }) => void;
  toggleHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  focusSessions: FocusSessionItem[];
  logFocusSession: (session: { durationMinutes: number; sessionType: 'POMODORO' | 'DEEP_WORK' | 'SHORT_BREAK'; taskTitle?: string }) => void;

  // Learning & Career (Phase 5)
  learningItems: LearningItem[];
  addLearningItem: (item: Omit<LearningItem, 'id'>) => void;
  learningBooks: LearningBookItem[];
  addBook: (book: Omit<LearningBookItem, 'id'>) => void;
  updateBook: (id: string, updates: Partial<LearningBookItem>) => void;
  deleteBook: (id: string) => void;

  // Life Administration Documents (Phase 6)
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id'>) => void;
  deleteDocument: (id: string) => void;

  emergencyInfo: EmergencyProfile | null;
  saveEmergencyInfo: (info: EmergencyProfile) => void;

  adminChecklists: AdminChecklistItem[];
  addChecklist: (item: Omit<AdminChecklistItem, 'id' | 'isCompleted'>) => void;
  toggleChecklist: (id: string) => void;
  deleteChecklist: (id: string) => void;

  resetToFreshState: () => void;
}

export const useLifeOSStore = create<LifeOSState>()(
  persist(
    (set, get) => ({
      currentSection: 'overview',
      setCurrentSection: (currentSection) => set({ currentSection }),

      financeSubTab: 'summary',
      setFinanceSubTab: (financeSubTab) => set({ financeSubTab }),

      timePeriod: 'week',
      setTimePeriod: (timePeriod) => set({ timePeriod }),

      isLoading: false,

      fetchLifeOSData: async () => {
        if (useAuthStore.getState().isDemoMode) return;
        try {
          set({ isLoading: true });
          const res = await api.lifeos.fetchData();
          if (res.success && res.data) {
            set((state) => ({
              tasks: res.data.tasks?.length ? res.data.tasks : state.tasks,
              wellness: res.data.wellness ? { ...state.wellness, ...res.data.wellness } : state.wellness,
              learningItems: res.data.learningItems?.length ? res.data.learningItems : state.learningItems,
              documents: res.data.documents?.length ? res.data.documents : state.documents,
              workoutSessions: res.data.workoutSessions?.length ? res.data.workoutSessions : state.workoutSessions,
              mealLogs: res.data.mealLogs?.length ? res.data.mealLogs : state.mealLogs,
              habits: res.data.habits?.length ? res.data.habits : state.habits,
              focusSessions: res.data.focusSessions?.length ? res.data.focusSessions : state.focusSessions,
              learningBooks: res.data.learningBooks?.length ? res.data.learningBooks : state.learningBooks,
              emergencyInfo: res.data.emergencyInfo || state.emergencyInfo,
              adminChecklists: res.data.adminChecklists?.length ? res.data.adminChecklists : state.adminChecklists,
              userInputs: res.data.userInputs || state.userInputs,
              activeBlueprint: res.data.blueprint || state.activeBlueprint,
            }));
          }
        } catch (err) {
          console.warn('[LifeOS] Backend sync unavailable, using local persistence:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      userInputs: DEFAULT_USER_INPUTS,
      activeBlueprint: INITIAL_BLUEPRINT,
      isAiModalOpen: false,
      setIsAiModalOpen: (isAiModalOpen) => set({ isAiModalOpen }),

      generateAndApplyBlueprint: (customInputs) => {
        const state = get();
        const mergedInputs: UserAdaptiveInputs = {
          ...state.userInputs,
          ...customInputs,
        };
        const blueprint = computeAdaptiveBlueprint(mergedInputs);

        const updatedTasks: TaskItem[] = blueprint.productivityAgenda.map((item, idx) => ({
          id: `tsk_gen_${Date.now()}_${idx}`,
          title: item.title,
          time: item.time,
          category: item.category,
          priority: item.priority,
          status: 'TODO',
          badgeLabel: item.badge,
          iconSymbol: item.icon,
          notes: item.notes,
        }));

        set({
          userInputs: mergedInputs,
          activeBlueprint: blueprint,
          tasks: updatedTasks,
          wellness: {
            ...state.wellness,
            heightCm: Number(mergedInputs.heightCm) || 0,
            weightKg: Number(mergedInputs.weightKg) || 0,
            caloriesTarget: blueprint.targetCalories,
            waterTargetLiters: blueprint.dailyWaterTargetLiters,
          },
        });

        api.lifeos.saveBlueprint(mergedInputs, blueprint).catch(() => {});
        api.lifeos.updateMetrics({
          heightCm: Number(mergedInputs.heightCm) || undefined,
          weightKg: Number(mergedInputs.weightKg) || undefined,
          caloriesTarget: blueprint.targetCalories,
          waterTargetLiters: blueprint.dailyWaterTargetLiters,
        }).catch(() => {});

        get().regenerateWeeklyMealPlan().catch(() => {});
      },

      tasks: [],

      toggleTaskComplete: (id) => {
        if (!useAuthStore.getState().requireAuth('mark tasks complete')) return;
        const state = get();
        const target = state.tasks.find((t) => t.id === id);
        if (!target) return;

        const nextStatus = target.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        const nextBadge = nextStatus === 'COMPLETED' ? 'Completed' : 'To do';

        if (nextStatus === 'COMPLETED') {
          useMasteryStore.getState().awardPoints('PRODUCTIVITY', 25, `Completed task: ${target.title}`);
        }

        set({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: nextStatus, badgeLabel: nextBadge } : t
          ),
        });

        api.lifeos.updateTask(id, { status: nextStatus, badgeLabel: nextBadge }).catch(() => {});
      },

      addTask: (taskData) => {
        if (!useAuthStore.getState().requireAuth('create tasks')) return;
        const newId = `tsk_${Date.now()}`;
        const newTask: TaskItem = {
          ...taskData,
          id: newId,
          badgeLabel: taskData.badgeLabel || 'To do',
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        api.lifeos.createTask(newTask).catch(() => {});
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));

        api.lifeos.deleteTask(id).catch(() => {});
      },

      wellness: {
        heightCm: 0,
        weightKg: 0,
        targetWeightKg: 0,
        workoutMinutesLogged: 0,
        caloriesLogged: 0,
        caloriesTarget: 0,
        waterLitersLogged: 0,
        waterTargetLiters: 0,
        sleepHours: 0,
      },

      updateBodyMetrics: (heightCm, weightKg) => {
        set((state) => ({
          wellness: {
            ...state.wellness,
            heightCm,
            weightKg,
          },
        }));

        api.lifeos.updateMetrics({ heightCm, weightKg }).catch(() => {});
      },

      logWater: (amount) => {
        if (!useAuthStore.getState().requireAuth('log hydration')) return;
        useMasteryStore.getState().awardPoints('WELLNESS', 15, `Logged hydration (+${amount}L water)`);
        set((state) => ({
          wellness: {
            ...state.wellness,
            waterLitersLogged: Math.round((state.wellness.waterLitersLogged + amount) * 10) / 10,
          },
        }));

        api.lifeos.logWellness({ waterDeltaLiters: amount }).catch(() => {});
      },

      resetWater: () => {
        set((state) => ({
          wellness: {
            ...state.wellness,
            waterLitersLogged: 0,
          },
        }));

        api.lifeos.logWellness({ resetWater: true }).catch(() => {});
      },

      logWorkoutMinutes: (minutes) => {
        useMasteryStore.getState().awardPoints('WELLNESS', 30, `Logged workout (${minutes} mins)`);
        set((state) => ({
          wellness: {
            ...state.wellness,
            workoutMinutesLogged: state.wellness.workoutMinutesLogged + minutes,
          },
        }));

        api.lifeos.logWellness({ workoutDeltaMinutes: minutes }).catch(() => {});
      },

      logCalories: (calories) => {
        set((state) => ({
          wellness: {
            ...state.wellness,
            caloriesLogged: state.wellness.caloriesLogged + calories,
          },
        }));

        api.lifeos.logWellness({ caloriesDelta: calories }).catch(() => {});
      },

      // Phase 2: Workouts
      workoutSessions: [],

      recordWorkoutSession: (sessionData) => {
        if (!useAuthStore.getState().requireAuth('record workout session')) return;
        const newSessionId = `wsess_${Date.now()}`;
        const todayStr = new Date().toISOString().split('T')[0];
        let totalTonnage = 0;
        const sets = sessionData.sets.map((s, idx) => {
          totalTonnage += s.weightKg * s.reps;
          return {
            id: `wset_${newSessionId}_${idx}`,
            exerciseId: s.exerciseId,
            exerciseName: s.exerciseName,
            muscleGroup: s.muscleGroup,
            setNumber: s.setNumber,
            weightKg: s.weightKg,
            reps: s.reps,
            rpe: s.rpe || 8.0,
          };
        });

        const newSession: WorkoutSession = {
          id: newSessionId,
          date: todayStr,
          splitName: sessionData.splitName,
          durationMinutes: sessionData.durationMinutes,
          totalTonnage,
          totalSets: sets.length,
          notes: sessionData.notes,
          sets,
        };

        set((state) => ({
          workoutSessions: [newSession, ...state.workoutSessions],
          wellness: {
            ...state.wellness,
            workoutMinutesLogged: state.wellness.workoutMinutesLogged + sessionData.durationMinutes,
          },
        }));

        api.lifeos.recordWorkoutSession(sessionData).catch(() => {});
      },

      deleteWorkoutSession: (id) => {
        set((state) => ({
          workoutSessions: state.workoutSessions.filter((w) => w.id !== id),
        }));
        api.lifeos.deleteWorkoutSession(id).catch(() => {});
      },

      // Phase 3: Meal Logs
      mealLogs: [],

      addMealLog: (mealData) => {
        if (!useAuthStore.getState().requireAuth('log meal macros')) return;
        const todayStr = new Date().toISOString().split('T')[0];
        const newMeal: MealLogItem = {
          ...mealData,
          id: `meal_${Date.now()}`,
          date: todayStr,
        };

        set((state) => ({
          mealLogs: [...state.mealLogs, newMeal],
          wellness: {
            ...state.wellness,
            caloriesLogged: state.wellness.caloriesLogged + mealData.calories,
          },
        }));

        api.lifeos.createMealLog(mealData).catch(() => {});
      },

      deleteMealLog: (id) => {
        const target = get().mealLogs.find((m) => m.id === id);
        set((state) => ({
          mealLogs: state.mealLogs.filter((m) => m.id !== id),
          wellness: target
            ? {
                ...state.wellness,
                caloriesLogged: Math.max(0, state.wellness.caloriesLogged - target.calories),
              }
            : state.wellness,
        }));

        api.lifeos.deleteMealLog(id).catch(() => {});
      },

      // Location & Localized AI Nutrition Implementation
      userLocation: null,
      weeklyMealPlan: {},
      isGeneratingMeals: false,

      setUserLocation: (loc) => {
        set({ userLocation: loc });
        get().regenerateWeeklyMealPlan({ cuisineOverride: loc.cuisineStyle });
      },

      detectAndApplyLocation: async () => {
        try {
          const loc = await detectUserLocation();
          set({ userLocation: loc });
          await get().regenerateWeeklyMealPlan({ cuisineOverride: loc.cuisineStyle });
          return loc;
        } catch (e) {
          console.warn('[LifeOS] Location detection error:', e);
          const fallbackLoc: UserLocationProfile = {
            city: 'Chennai',
            region: 'Tamil Nadu',
            country: 'India',
            cuisineStyle: 'South Indian (Tamil Nadu / Coastal & Millets)',
            source: 'TIMEZONE',
            detectedAt: new Date().toISOString(),
          };
          set({ userLocation: fallbackLoc });
          await get().regenerateWeeklyMealPlan({ cuisineOverride: fallbackLoc.cuisineStyle });
          return fallbackLoc;
        }
      },

      setWeeklyMealPlan: (plan) => set({ weeklyMealPlan: plan }),

      regenerateWeeklyMealPlan: async (options) => {
        const state = get();
        set({ isGeneratingMeals: true });
        try {
          let loc = state.userLocation;
          if (!loc) {
            loc = await detectUserLocation();
            set({ userLocation: loc });
          }

          const targetCalories = state.activeBlueprint?.targetCalories || 2000;
          const macros = state.activeBlueprint?.macros || { proteinGrams: 120, carbsGrams: 180, fatGrams: 50 };
          const pref = state.userInputs.dietaryPreference || 'BALANCED_NON_VEG';

          const weeklyPlan = await generateLocalizedWeeklyMealPlan(
            targetCalories,
            macros,
            pref,
            loc,
            options
          );

          // Find current day name
          const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const todayName = DAYS[new Date().getDay()];
          const todaysMeals = weeklyPlan[todayName] || weeklyPlan['Monday'] || [];

          set({
            weeklyMealPlan: weeklyPlan,
            activeBlueprint: {
              ...state.activeBlueprint,
              dailyMealPlan: todaysMeals,
            },
          });
        } catch (err) {
          console.error('[LifeOS] Meal generation error:', err);
        } finally {
          set({ isGeneratingMeals: false });
        }
      },

      // Phase 4: Habits & Focus
      habits: [],

      addHabit: (habitData) => {
        if (!useAuthStore.getState().requireAuth('create habit')) return;
        const newHabit: HabitItem = {
          id: `hab_${Date.now()}`,
          title: habitData.title,
          category: habitData.category,
          streakCount: 0,
          isCompletedToday: false,
          icon: habitData.icon || '⚡',
        };

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));

        api.lifeos.createHabit(habitData).catch(() => {});
      },

      toggleHabit: (id) => {
        if (!useAuthStore.getState().requireAuth('track habit streak')) return;
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === id) {
              const nextDone = !h.isCompletedToday;
              return {
                ...h,
                isCompletedToday: nextDone,
                streakCount: nextDone ? h.streakCount + 1 : Math.max(0, h.streakCount - 1),
              };
            }
            return h;
          }),
        }));

        api.lifeos.toggleHabit(id).catch(() => {});
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
        api.lifeos.deleteHabit(id).catch(() => {});
      },

      focusSessions: [],

      logFocusSession: (sessionData) => {
        const newSession: FocusSessionItem = {
          id: `foc_${Date.now()}`,
          durationMinutes: sessionData.durationMinutes,
          sessionType: sessionData.sessionType,
          taskTitle: sessionData.taskTitle,
          date: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          focusSessions: [newSession, ...state.focusSessions],
        }));

        api.lifeos.logFocusSession(sessionData).catch(() => {});
      },

      // Phase 5: Learning & Books
      learningItems: [],

      addLearningItem: (item) =>
        set((state) => ({
          learningItems: [
            ...state.learningItems,
            { ...item, id: `lrn_${Date.now()}` },
          ],
        })),

      learningBooks: [],

      addBook: (bookData) => {
        const newBook: LearningBookItem = {
          ...bookData,
          id: `bk_${Date.now()}`,
        };
        set((state) => ({
          learningBooks: [...state.learningBooks, newBook],
        }));
        api.lifeos.createBook(bookData).catch(() => {});
      },

      updateBook: (id, updates) => {
        set((state) => ({
          learningBooks: state.learningBooks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
        api.lifeos.updateBook(id, updates).catch(() => {});
      },

      deleteBook: (id) => {
        set((state) => ({
          learningBooks: state.learningBooks.filter((b) => b.id !== id),
        }));
        api.lifeos.deleteBook(id).catch(() => {});
      },

      // Phase 6: Documents, Emergency & Checklists
      documents: [],

      addDocument: (doc) => {
        if (!useAuthStore.getState().requireAuth('vault documents')) return;
        set((state) => ({
          documents: [
            ...state.documents,
            { ...doc, id: `doc_${Date.now()}` },
          ],
        }));
      },

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      emergencyInfo: null,

      saveEmergencyInfo: (info) => {
        set({ emergencyInfo: info });
        api.lifeos.saveEmergencyInfo(info).catch(() => {});
      },

      adminChecklists: [],

      addChecklist: (itemData) => {
        const newItem: AdminChecklistItem = {
          ...itemData,
          id: `chk_${Date.now()}`,
          isCompleted: false,
        };
        set((state) => ({
          adminChecklists: [...state.adminChecklists, newItem],
        }));
        api.lifeos.createChecklist(itemData).catch(() => {});
      },

      toggleChecklist: (id) => {
        set((state) => ({
          adminChecklists: state.adminChecklists.map((c) =>
            c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
          ),
        }));
        api.lifeos.toggleChecklist(id).catch(() => {});
      },

      deleteChecklist: (id) => {
        set((state) => ({
          adminChecklists: state.adminChecklists.filter((c) => c.id !== id),
        }));
        api.lifeos.deleteChecklist(id).catch(() => {});
      },

      resetToFreshState: () => {
        set({
          userInputs: DEFAULT_USER_INPUTS,
          userLocation: null,
          weeklyMealPlan: {},
          tasks: [],
          workoutSessions: [],
          mealLogs: [],
          habits: [],
          focusSessions: [],
          learningItems: [],
          learningBooks: [],
          documents: [],
          emergencyInfo: null,
          adminChecklists: [],
          wellness: {
            heightCm: 0,
            weightKg: 0,
            targetWeightKg: 0,
            workoutMinutesLogged: 0,
            caloriesLogged: 0,
            caloriesTarget: 0,
            waterLitersLogged: 0,
            waterTargetLiters: 0,
            sleepHours: 0,
          },
        });
      },
    }),
    {
      name: 'lifeos-workspace-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
