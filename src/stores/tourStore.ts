import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useLifeOSStore } from './lifeosStore';

export interface TourStep {
  id: string;
  targetId?: string; // DOM ID to highlight with spotlight
  title: string;
  badge: string;
  description: string;
  featureList?: string[];
  actionHint?: string;
  position?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LifeOS Command Centre!',
    badge: 'Step 1 of 6 • Welcome',
    description:
      'Your next-generation personal operating system. Seamlessly uniting your finances, fitness, clinical nutrition, deep work productivity, learning vault, and critical life administration into one high-performance dashboard.',
    featureList: [
      '6 connected lifecycle workspaces with zero context fragmentation',
      'Clinical Mifflin-St Jeor BMR, TDEE & macro blueprint recalibration',
      'Unified task, calendar, habit, and document expiry trackers',
      'Cross-domain situational AI Copilot with real-time awareness',
    ],
    position: 'center',
    actionHint: 'Click "Start Tour" to take an interactive walkthrough of your command centre.',
  },
  {
    id: 'workspaces',
    targetId: 'tour-section-switcher',
    title: '6 Dedicated Life Workspaces',
    badge: 'Step 2 of 6 • Navigation',
    description:
      'Effortlessly switch between your 6 life dimensions: Life Overview, Financial Portfolio, Fitness & Wellness, Productivity & Focus, Learning & Career, and Life Administration.',
    featureList: [
      'Overview: Daily vitals, priority tasks, and 1-click rapid logging',
      'Finance: Multi-asset net worth, investment ledger & wealth goals',
      'Wellness: Mifflin-St Jeor TDEE, workout volume & hydration station',
      'Productivity & Admin: Pomodoro focus, skill trees & document vault',
    ],
    position: 'bottom',
    actionHint: 'Click any workspace button in this sticky navigation bar to switch contexts.',
  },
  {
    id: 'blueprint',
    targetId: 'tour-adaptive-blueprint',
    title: 'Adaptive AI Life Blueprint',
    badge: 'Step 3 of 6 • Personal Intelligence',
    description:
      'Recalibrate your lifestyle in seconds! Input your age, height, weight, activity factor, and target goal. LifeOS computes your Mifflin-St Jeor BMR, TDEE, protein targets (1.8–2.2g/kg), workout split, and hydration baseline.',
    featureList: [
      'Clinical Mifflin-St Jeor BMR & PAL energy calculation formula',
      'Tailored 7-day hypertrophy, strength, or endurance workout split',
      'Dynamic macro targets (Protein, Carbs, Fat) & daily meal plan',
      'Real-time recalculation whenever your biometrics or goals change',
    ],
    position: 'bottom',
    actionHint: 'Click "AI Blueprint" in the top bar anytime to recalibrate your personalized plan.',
  },
  {
    id: 'quick-actions',
    targetId: 'tour-quick-actions',
    title: '1-Click Rapid Action Logger',
    badge: 'Step 4 of 6 • Rapid Logging',
    description:
      'Log daily habits in seconds without leaving your flow. Log hydration glasses, record workout sessions, track daily meals and calories, or create urgent prioritized tasks directly from your overview.',
    featureList: [
      '+250ml & +500ml instant water bottle logging',
      '+15m & +30m workout session quick tracker',
      'Food & calorie intake logger with macro tracking',
      'Fast task creation with High/Medium/Low priority flags',
    ],
    position: 'bottom',
    actionHint: 'Use these 1-click quick action buttons throughout your day to maintain momentum.',
  },
  {
    id: 'currency',
    targetId: 'tour-currency-switcher',
    title: 'Multi-Currency & Global Data Engine',
    badge: 'Step 5 of 6 • Global Settings',
    description:
      'Seamlessly switch your active display currency between Indian Rupee (₹ INR), US Dollar ($ USD), and UAE Dirham (د.إ AED). All investment charts, net worth totals, and financial targets update instantly.',
    featureList: [
      'Instant real-time currency conversion across all financial tabs',
      'One-click demo sample data loader for portfolio exploration',
      'Safe reset to a clean ₹0 fresh portfolio from your profile',
    ],
    position: 'bottom',
    actionHint: 'Click the currency badge to switch between INR, USD, and AED.',
  },
  {
    id: 'copilot',
    targetId: 'tour-floating-copilot',
    title: 'Conversational LifeOS AI Copilot',
    badge: 'Step 6 of 6 • AI Strategist',
    description:
      'Your 24/7 personal strategist. The AI Copilot has full cross-domain situational awareness across all 6 workspaces. Ask about your net worth, macro balance, study roadmap, or upcoming document renewals.',
    featureList: [
      'Full cross-domain awareness across finances, health, tasks & admin',
      'Pre-configured 1-click prompt starters for rapid guidance',
      'Clean formatted markdown responses with actionable recommendations',
    ],
    position: 'top',
    actionHint: 'Click the floating robot icon at the bottom-right anytime to chat with LifeOS AI!',
  },
];

interface TourState {
  hasSeenTour: boolean;
  isTourOpen: boolean;
  currentStepIndex: number;
  seenUserIds: string[];
  startTour: () => void;
  nextStep: (userId?: string) => void;
  prevStep: () => void;
  skipTour: (userId?: string) => void;
  resetTour: () => void;
  markTourCompleted: (userId?: string) => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      hasSeenTour: false,
      isTourOpen: false,
      currentStepIndex: 0,
      seenUserIds: [],

      startTour: () => {
        // Ensure overview section is active so quick actions are visible in the DOM
        try {
          useLifeOSStore.getState().setCurrentSection('overview');
        } catch (_) {}
        set({ isTourOpen: true, currentStepIndex: 0 });
      },

      nextStep: (userId?: string) => {
        const { currentStepIndex, seenUserIds } = get();
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          // Completed all steps
          const newSeen =
            userId && !seenUserIds.includes(userId)
              ? [...seenUserIds, userId]
              : seenUserIds;
          set({ isTourOpen: false, hasSeenTour: true, seenUserIds: newSeen });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTour: (userId?: string) => {
        const { seenUserIds } = get();
        const newSeen =
          userId && !seenUserIds.includes(userId)
            ? [...seenUserIds, userId]
            : seenUserIds;
        set({ isTourOpen: false, hasSeenTour: true, seenUserIds: newSeen });
      },

      resetTour: () => {
        try {
          useLifeOSStore.getState().setCurrentSection('overview');
        } catch (_) {}
        set({ hasSeenTour: false, isTourOpen: true, currentStepIndex: 0 });
      },

      markTourCompleted: (userId?: string) => {
        const { seenUserIds } = get();
        const newSeen =
          userId && !seenUserIds.includes(userId)
            ? [...seenUserIds, userId]
            : seenUserIds;
        set({ isTourOpen: false, hasSeenTour: true, seenUserIds: newSeen });
      },
    }),
    {
      name: 'lifeos-tour-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hasSeenTour: state.hasSeenTour,
        seenUserIds: state.seenUserIds || [],
      }),
    }
  )
);
