import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  LifeOSSection,
  FinanceSubTab,
  TaskItem,
  WellnessState,
  LearningItem,
  DocumentItem,
} from '@/types/lifeos';
import {
  computeAdaptiveBlueprint,
  UserAdaptiveInputs,
  AdaptiveLifeBlueprint,
} from '@/services/adaptiveLifeEngine';

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

  // Learning & Career
  learningItems: LearningItem[];
  addLearningItem: (item: Omit<LearningItem, 'id'>) => void;

  // Life Administration Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id'>) => void;
  deleteDocument: (id: string) => void;
}

export const useLifeOSStore = create<LifeOSState>()(
  persist(
    (set) => ({
      currentSection: 'overview',
      setCurrentSection: (currentSection) => set({ currentSection }),

      financeSubTab: 'summary',
      setFinanceSubTab: (financeSubTab) => set({ financeSubTab }),

      timePeriod: 'week',
      setTimePeriod: (timePeriod) => set({ timePeriod }),

      userInputs: DEFAULT_USER_INPUTS,
      activeBlueprint: INITIAL_BLUEPRINT,
      isAiModalOpen: false,
      setIsAiModalOpen: (isAiModalOpen) => set({ isAiModalOpen }),

      generateAndApplyBlueprint: (customInputs) => {
        set((state) => {
          const mergedInputs: UserAdaptiveInputs = {
            ...state.userInputs,
            ...customInputs,
          };
          const blueprint = computeAdaptiveBlueprint(mergedInputs);

          // Dynamically map adaptive agenda to tasks
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

          return {
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
          };
        });
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

      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
                  badgeLabel: t.status === 'COMPLETED' ? 'To do' : 'Completed',
                }
              : t
          ),
        })),

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: `tsk_${Date.now()}`,
              badgeLabel: taskData.badgeLabel || 'To do',
            },
          ],
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

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

      updateBodyMetrics: (heightCm, weightKg) =>
        set((state) => ({
          wellness: {
            ...state.wellness,
            heightCm,
            weightKg,
          },
        })),

      logWater: (amount) =>
        set((state) => ({
          wellness: {
            ...state.wellness,
            waterLitersLogged: Math.round((state.wellness.waterLitersLogged + amount) * 10) / 10,
          },
        })),

      resetWater: () =>
        set((state) => ({
          wellness: {
            ...state.wellness,
            waterLitersLogged: 0,
          },
        })),

      logWorkoutMinutes: (minutes) =>
        set((state) => ({
          wellness: {
            ...state.wellness,
            workoutMinutesLogged: state.wellness.workoutMinutesLogged + minutes,
          },
        })),

      logCalories: (calories) =>
        set((state) => ({
          wellness: {
            ...state.wellness,
            caloriesLogged: state.wellness.caloriesLogged + calories,
          },
        })),

      learningItems: [
        {
          id: 'lrn_1',
          title: 'System Design & Distributed Data',
          field: 'Engineering',
          progressPercent: 65,
          hoursSpent: 18,
          targetHours: 30,
          status: 'IN_PROGRESS',
        },
        {
          id: 'lrn_2',
          title: 'Algorithmic Trading & Derivatives',
          field: 'Finance',
          progressPercent: 40,
          hoursSpent: 12,
          targetHours: 25,
          status: 'IN_PROGRESS',
        },
        {
          id: 'lrn_3',
          title: 'Full-Stack React & Next.js Architecture',
          field: 'Web Development',
          progressPercent: 85,
          hoursSpent: 42,
          targetHours: 50,
          status: 'IN_PROGRESS',
        },
      ],

      addLearningItem: (item) =>
        set((state) => ({
          learningItems: [
            ...state.learningItems,
            { ...item, id: `lrn_${Date.now()}` },
          ],
        })),

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
    }),
    {
      name: 'lifeos-workspace-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
