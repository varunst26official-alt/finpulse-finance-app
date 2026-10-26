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
} from '@/services/adaptiveLifeEngine';
import { api } from '@/services/apiClient';

const DEFAULT_USER_INPUTS: UserAdaptiveInputs = {
  age: 29,
  gender: 'MALE',
  heightCm: 175,
  weightKg: 74,
  fitnessGoal: 'FAT_LOSS',
  intensityLevel: 'MODERATE_FITNESS',
  dietaryPreference: 'BALANCED_NON_VEG',
  workHoursPerDay: 8,
  riskProfile: 'BALANCED',
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
            heightCm: mergedInputs.heightCm,
            weightKg: mergedInputs.weightKg,
            caloriesTarget: blueprint.targetCalories,
            waterTargetLiters: blueprint.dailyWaterTargetLiters,
          },
        });

        api.lifeos.saveBlueprint(mergedInputs, blueprint).catch(() => {});
        api.lifeos.updateMetrics({
          heightCm: mergedInputs.heightCm,
          weightKg: mergedInputs.weightKg,
          caloriesTarget: blueprint.targetCalories,
          waterTargetLiters: blueprint.dailyWaterTargetLiters,
        }).catch(() => {});
      },

      tasks: [
        {
          id: 'tsk_1',
          title: 'Workout session',
          time: '7:00 AM',
          category: 'WELLNESS',
          priority: 'HIGH',
          status: 'TODO',
          badgeLabel: 'Planned',
          notes: 'Full-body movement and mobility · 30 minutes',
          iconSymbol: '♡',
        },
        {
          id: 'tsk_2',
          title: 'Review monthly spending',
          time: '1:00 PM',
          category: 'FINANCE',
          priority: 'MEDIUM',
          status: 'TODO',
          badgeLabel: 'To do',
          notes: 'Check transactions, mutual fund SIPs, and upcoming bills',
          iconSymbol: '₹',
        },
        {
          id: 'tsk_3',
          title: 'Learning milestone',
          time: '4:30 PM',
          category: 'LEARNING',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          badgeLabel: 'In progress',
          notes: 'Complete the next system architecture chapter',
          iconSymbol: '▧',
        },
        {
          id: 'tsk_4',
          title: 'Hydration goal (2.5L)',
          time: '6:00 PM',
          category: 'WELLNESS',
          priority: 'LOW',
          status: 'TODO',
          badgeLabel: 'In progress',
          notes: 'Drink 4 full bottles of water today',
          iconSymbol: '◒',
        },
        {
          id: 'tsk_5',
          title: 'Daily check-in & reflection',
          time: '8:30 PM',
          category: 'PRODUCTIVITY',
          priority: 'LOW',
          status: 'TODO',
          badgeLabel: 'Planned',
          notes: 'Record nutrition estimates, gratitude, and wrap up today',
          iconSymbol: '↻',
        },
      ],

      toggleTaskComplete: (id) => {
        const state = get();
        const target = state.tasks.find((t) => t.id === id);
        if (!target) return;

        const nextStatus = target.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        const nextBadge = nextStatus === 'COMPLETED' ? 'Completed' : 'To do';

        set({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: nextStatus, badgeLabel: nextBadge } : t
          ),
        });

        api.lifeos.updateTask(id, { status: nextStatus, badgeLabel: nextBadge }).catch(() => {});
      },

      addTask: (taskData) => {
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
        heightCm: 175,
        weightKg: 74.0,
        targetWeightKg: 70.0,
        workoutMinutesLogged: 45,
        caloriesLogged: 1650,
        caloriesTarget: 2200,
        waterLitersLogged: 1.8,
        waterTargetLiters: 2.5,
        sleepHours: 7.5,
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
      workoutSessions: [
        {
          id: 'wsess_demo_1',
          date: new Date().toISOString().split('T')[0],
          splitName: 'Push (Chest & Triceps)',
          durationMinutes: 45,
          totalTonnage: 3420,
          totalSets: 6,
          notes: 'Heavy bench day with controlled eccentric',
          sets: [
            { id: 'st_1', exerciseId: 'barbell_bench', exerciseName: 'Barbell Flat Bench Press', muscleGroup: 'Chest', setNumber: 1, weightKg: 60, reps: 10, rpe: 7 },
            { id: 'st_2', exerciseId: 'barbell_bench', exerciseName: 'Barbell Flat Bench Press', muscleGroup: 'Chest', setNumber: 2, weightKg: 70, reps: 8, rpe: 8 },
            { id: 'st_3', exerciseId: 'barbell_bench', exerciseName: 'Barbell Flat Bench Press', muscleGroup: 'Chest', setNumber: 3, weightKg: 75, reps: 6, rpe: 9 },
            { id: 'st_4', exerciseId: 'incline_dumbbell', exerciseName: 'Incline DB Press', muscleGroup: 'Upper Chest', setNumber: 1, weightKg: 24, reps: 10, rpe: 7.5 },
            { id: 'st_5', exerciseId: 'incline_dumbbell', exerciseName: 'Incline DB Press', muscleGroup: 'Upper Chest', setNumber: 2, weightKg: 26, reps: 8, rpe: 8.5 },
            { id: 'st_6', exerciseId: 'tricep_rope', exerciseName: 'Tricep Rope Pushdown', muscleGroup: 'Triceps', setNumber: 1, weightKg: 25, reps: 12, rpe: 7 },
          ],
        },
      ],

      recordWorkoutSession: (sessionData) => {
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
      mealLogs: [
        { id: 'meal_1', date: new Date().toISOString().split('T')[0], mealType: 'BREAKFAST', name: 'Steel-Cut Oats with Whey, Chia & Blueberries', calories: 480, proteinGrams: 38, carbsGrams: 54, fatGrams: 12, portionDescription: '1 bowl with 1 scoop whey' },
        { id: 'meal_2', date: new Date().toISOString().split('T')[0], mealType: 'LUNCH', name: 'Grilled Herb Chicken Breast with Quinoa & Steamed Greens', calories: 620, proteinGrams: 52, carbsGrams: 50, fatGrams: 16, portionDescription: '200g chicken breast + 150g quinoa' },
        { id: 'meal_3', date: new Date().toISOString().split('T')[0], mealType: 'SNACK', name: 'Greek Yogurt with Crushed Walnuts & Honey', calories: 260, proteinGrams: 20, carbsGrams: 18, fatGrams: 10, portionDescription: '1 cup Greek yogurt' },
      ],

      addMealLog: (mealData) => {
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

      // Phase 4: Habits & Focus
      habits: [
        { id: 'hab_1', title: 'Morning Hydration (750ml) & Mobility Flow', category: 'MORNING', streakCount: 14, isCompletedToday: true, icon: '💧' },
        { id: 'hab_2', title: 'Deep Work Focus Block (No Slack/Phone)', category: 'AFTERNOON', streakCount: 8, isCompletedToday: false, icon: '🧠' },
        { id: 'hab_3', title: 'Evening Spending & Portfolio Log', category: 'EVENING', streakCount: 21, isCompletedToday: true, icon: '📊' },
        { id: 'hab_4', title: 'Nightly Reflection & Sleep Wind-down', category: 'EVENING', streakCount: 12, isCompletedToday: false, icon: '🌙' },
      ],

      addHabit: (habitData) => {
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

      focusSessions: [
        { id: 'foc_1', durationMinutes: 50, sessionType: 'DEEP_WORK', taskTitle: 'System Architecture & SQLite Schema Design', date: new Date().toISOString().split('T')[0] },
      ],

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
      learningItems: [
        {
          id: 'lrn_1',
          title: 'System Design & Distributed Data',
          field: 'Engineering',
          progressPercent: 68,
          hoursSpent: 34,
          targetHours: 50,
          status: 'IN_PROGRESS',
          notes: 'Node.js, PostgreSQL, Distributed Caching & Event Sinks',
        },
        {
          id: 'lrn_2',
          title: 'Advanced Personal Portfolio Management',
          field: 'Finance',
          progressPercent: 45,
          hoursSpent: 18,
          targetHours: 40,
          status: 'IN_PROGRESS',
          notes: 'Asset allocation theory, Beta hedged portfolios, Bond yields',
        },
        {
          id: 'lrn_3',
          title: 'Full-Stack React & Next.js Architecture',
          field: 'Web Development',
          progressPercent: 85,
          hoursSpent: 42,
          targetHours: 50,
          status: 'IN_PROGRESS',
          notes: 'React 19 hooks, Server actions, Component library design',
        },
      ],

      addLearningItem: (item) =>
        set((state) => ({
          learningItems: [
            ...state.learningItems,
            { ...item, id: `lrn_${Date.now()}` },
          ],
        })),

      learningBooks: [
        { id: 'bk_1', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Distributed Systems', currentPage: 290, totalPages: 560, status: 'IN_PROGRESS', rating: 5, notes: 'Key insights on partitioning and replication lag' },
        { id: 'bk_2', title: 'The Intelligent Investor', author: 'Benjamin Graham', category: 'Value Investing', currentPage: 340, totalPages: 340, status: 'COMPLETED', rating: 5, notes: 'Margin of safety & Mr. Market mindset' },
        { id: 'bk_3', title: 'Outlive: The Science and Art of Longevity', author: 'Dr. Peter Attia', category: 'Health & Longevity', currentPage: 180, totalPages: 496, status: 'IN_PROGRESS', rating: 5, notes: 'Zone 2 cardio and VO2 max importance' },
      ],

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
      documents: [
        {
          id: 'doc_1',
          title: 'Republic of India Passport',
          category: 'ID_CARD',
          documentNumber: 'Z8942019',
          expiryDate: '2031-10-15',
          status: 'ACTIVE',
          authority: 'Ministry of External Affairs',
        },
        {
          id: 'doc_2',
          title: 'Comprehensive Health Insurance Card',
          category: 'INSURANCE',
          documentNumber: 'SH-551029-B',
          expiryDate: '2026-11-20',
          status: 'EXPIRING_SOON',
          authority: 'Star Health & Allied',
        },
        {
          id: 'doc_3',
          title: 'Permanent Driving License',
          category: 'ID_CARD',
          documentNumber: 'KA-04-2016-004921',
          expiryDate: '2036-05-24',
          status: 'ACTIVE',
          authority: 'Bangalore Central RTO',
        },
        {
          id: 'doc_4',
          title: 'Villa Sale Deed & Khata Certificate',
          category: 'PROPERTY',
          documentNumber: 'BLR-REG-2022-771',
          status: 'ACTIVE',
          authority: 'Sub-Registrar Karnataka',
        },
      ],

      addDocument: (doc) =>
        set((state) => ({
          documents: [
            ...state.documents,
            { ...doc, id: `doc_${Date.now()}` },
          ],
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      emergencyInfo: {
        bloodGroup: 'O+ Positive',
        allergies: 'Penicillin (mild rash)',
        medicalConditions: 'None reported',
        primaryContactName: 'Jane S T',
        primaryContactPhone: '+91 98765 11223',
        primaryContactRelation: 'Spouse',
        secondaryContactName: 'Senior Varun',
        secondaryContactPhone: '+91 98765 44332',
        physicianName: 'Dr. Arvind Sharma (MD Cardiology)',
        physicianPhone: '+91 80 4123 4567',
        tpaHelpline: '1800-102-4477 (HDFC ERGO Cashless)',
        notes: 'Emergency ID and insurance cards located in LifeOS Document Vault',
      },

      saveEmergencyInfo: (info) => {
        set({ emergencyInfo: info });
        api.lifeos.saveEmergencyInfo(info).catch(() => {});
      },

      adminChecklists: [
        { id: 'chk_1', title: 'Income Tax Return (ITR-2) Filing', frequency: 'ANNUAL', dueDate: '2027-07-31', isCompleted: false, category: 'TAX' },
        { id: 'chk_2', title: 'Vehicle Comprehensive Insurance Renewal', frequency: 'ANNUAL', dueDate: '2027-03-15', isCompleted: false, category: 'VEHICLE' },
        { id: 'chk_3', title: 'Quarterly Net Worth & Asset Rebalance', frequency: 'QUARTERLY', dueDate: '2026-12-31', isCompleted: true, category: 'FINANCE' },
        { id: 'chk_4', title: 'Annual Full-Body Health Checkup & Blood Panel', frequency: 'ANNUAL', dueDate: '2027-04-10', isCompleted: false, category: 'HEALTH' },
      ],

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
    }),
    {
      name: 'lifeos-workspace-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
