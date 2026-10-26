import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
    title: 'Welcome to FinPulse Wealth OS!',
    badge: 'Step 1 of 5 • Introduction',
    description:
      'Your next-generation all-in-one financial operating system. Track listed stocks, physical real estate, fixed deposits, spent expenses, and life events with real-time portfolio intelligence.',
    featureList: [
      'Multi-asset net worth & asset allocation donut',
      'Real-time cash flow & 50%+ savings rate tracking',
      'Unified multi-asset trade & expense logging',
      'Financial calendar with life events & report downloads',
    ],
    position: 'center',
    actionHint: 'Click "Start Tour" to take an interactive walkthrough of your dashboard.',
  },
  {
    id: 'kpis',
    targetId: 'tour-kpi-cards',
    title: 'Real-time Net Worth & Savings KPIs',
    badge: 'Step 2 of 5 • Portfolio Health',
    description:
      'Monitor your Total Net Worth across all asset classes, cumulative invested capital, unrealized capital gains (P&L), and your Net Monthly Savings Rate with real-time liquidity surplus.',
    featureList: [
      'Automatically aggregates physical, liquid, and market holdings',
      '24-hour return percentage and daily rupee/dollar change',
      'Dynamic emergency cash runway estimation',
    ],
    position: 'bottom',
    actionHint: 'These metrics refresh automatically with every trade or expense logged.',
  },
  {
    id: 'add-trade',
    targetId: 'tour-add-trade',
    title: 'Unified Multi-Asset Entry Hub',
    badge: 'Step 3 of 5 • One-Click Logging',
    description:
      'Log any trade or financial record in a single place! Features a free live searchable directory of 120+ Indian (NSE/BSE) and US (NASDAQ/NYSE) stocks, crypto, and mutual funds.',
    featureList: [
      'Instant autocomplete with live prices & custom ticker adder',
      'Fixed Assets mode: Real estate, Bank FDs, SGB gold, PPF',
      'Spent Expenses mode: Rent, EMI, groceries, utilities via UPI/Card',
      'Income Inflows mode: Salary, rental yields, freelance payouts',
    ],
    position: 'bottom',
    actionHint: 'Click "+ Add Trade" in the navbar anytime to open the unified hub.',
  },
  {
    id: 'currency',
    targetId: 'tour-currency-switcher',
    title: 'Instant Multi-Currency Engine',
    badge: 'Step 4 of 5 • Global Benchmarking',
    description:
      'Seamlessly switch your active display currency between Indian Rupee (₹ INR), UAE Dirham (د.إ AED), and US Dollar ($ USD). All conversions calculate in real-time across charts, holdings, and reports.',
    featureList: [
      'Anchored with institutional FX exchange rates',
      'Zero reload needed — converts charts and tooltips instantly',
    ],
    position: 'bottom',
    actionHint: 'Try clicking "د.إ AED" or "$ USD" to convert your portfolio on the fly.',
  },
  {
    id: 'calendar',
    targetId: 'tour-calendar-nav',
    title: 'Financial Calendar & Life Events',
    badge: 'Step 5 of 5 • Cash Flow Planning',
    description:
      'Schedule planned expenses, EMI due dates, mutual fund SIP debits, family birthdays, and annual medical checkups. Visualizes expected inflows vs. outflows and exports PDF/CSV reports!',
    featureList: [
      'Color-coded event dots on month calendar cells',
      'Dual-bar cash flow projection chart with net balance curve',
      'Download print-ready PDF statements or export CSV spreadsheets',
    ],
    position: 'right',
    actionHint: 'Access via the sidebar navigation or scroll down to the calendar on your dashboard.',
  },
];

interface TourState {
  hasSeenTour: boolean;
  isTourOpen: boolean;
  currentStepIndex: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      hasSeenTour: false,
      isTourOpen: false,
      currentStepIndex: 0,

      startTour: () => {
        set({ isTourOpen: true, currentStepIndex: 0 });
      },

      nextStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          // Completed all steps
          set({ isTourOpen: false, hasSeenTour: true });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTour: () => {
        set({ isTourOpen: false, hasSeenTour: true });
      },

      resetTour: () => {
        set({ hasSeenTour: false, isTourOpen: true, currentStepIndex: 0 });
      },
    }),
    {
      name: 'finpulse-tour-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hasSeenTour: state.hasSeenTour,
      }),
    }
  )
);
