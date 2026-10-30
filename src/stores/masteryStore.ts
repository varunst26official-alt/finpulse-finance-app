import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MasteryCategory,
  MasteryLeague,
  DisplayNameMode,
  PointEvent,
  MasteryBadge,
  LeaderboardMember,
  MasteryNotification,
} from '@/types/mastery';
import { api } from '@/services/apiClient';
import { useAuthStore } from '@/stores/authStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';

export const BASE_BADGE_DEFINITIONS: Omit<MasteryBadge, 'isUnlocked' | 'progressPercent' | 'unlockedAt'>[] = [
  {
    id: 'badge-fire-starter',
    name: 'FIRE Strategist',
    description: 'Calculated and modeled your financial independence number with annual step-up SIP.',
    category: 'FINANCE',
    icon: '🔥',
    color: '#d97706',
    requirementText: 'Run the FIRE Number Calculator',
  },
  {
    id: 'badge-budget-boss',
    name: 'Budget Disciplinarian',
    description: 'Maintained 0 negative cash flows across 10+ ledger entries.',
    category: 'FINANCE',
    icon: '💰',
    color: '#16836b',
    requirementText: 'Log 10 transactions within budget',
  },
  {
    id: 'badge-hydration-hero',
    name: 'Hydration Hero',
    description: 'Consistently achieved 2.5L daily water target.',
    category: 'WELLNESS',
    icon: '💧',
    color: '#0284c7',
    requirementText: 'Log 2.5L+ water today',
  },
  {
    id: 'badge-iron-discipline',
    name: 'Iron Habit',
    description: 'Maintained a 7-day continuous activity streak across fitness & workouts.',
    category: 'WELLNESS',
    icon: '⚡',
    color: '#d45b73',
    requirementText: 'Log 7 workout sessions',
  },
  {
    id: 'badge-centurion-focus',
    name: 'Centurion of Focus',
    description: 'Completed 50 high-priority agenda tasks and checklist milestones.',
    category: 'PRODUCTIVITY',
    icon: '🎯',
    color: '#5574d9',
    requirementText: 'Complete 50 daily tasks',
  },
  {
    id: 'badge-deep-work',
    name: 'Deep Work Master',
    description: 'Logged 20+ focused deep work sessions without distraction.',
    category: 'PRODUCTIVITY',
    icon: '⏳',
    color: '#4f46e5',
    requirementText: 'Log 20 deep work sessions',
  },
  {
    id: 'badge-polymath',
    name: 'Lifelong Polymath',
    description: 'Active learning tracking across 3 distinct skill domains simultaneously.',
    category: 'LEARNING',
    icon: '🧠',
    color: '#8a5bd6',
    requirementText: 'Track 3 learning skills',
  },
  {
    id: 'badge-vault-sentinel',
    name: 'Vault Sentinel',
    description: 'Secured critical identity, health, and asset documents in the vault.',
    category: 'LIFEADMIN',
    icon: '🛡️',
    color: '#b27635',
    requirementText: 'Store 5+ active documents',
  },
  {
    id: 'badge-diamond-league',
    name: 'Diamond Contender',
    description: 'Ascended to the top-tier Diamond League with 2,000+ total discipline points.',
    category: 'ALL',
    icon: '💎',
    color: '#2563eb',
    requirementText: 'Reach 2,000+ total Mastery XP',
  },
];

interface MasteryState {
  sectionPoints: Record<MasteryCategory, number>;
  weeklyPoints: number;
  streakDays: number;
  lastActiveDate: string;
  league: MasteryLeague;
  displayNameMode: DisplayNameMode;
  customAlias: string;
  isGhostMode: boolean;
  badges: MasteryBadge[];
  pinnedBadgeIds: string[];
  leaderboard: LeaderboardMember[];
  pointHistory: PointEvent[];
  activeNotification: MasteryNotification | null;
  isLoadingLeaderboard: boolean;

  // Actions
  awardPoints: (category: MasteryCategory, points: number, reason: string) => void;
  giveKudos: (memberId: string) => Promise<void>;
  setDisplayNameMode: (mode: DisplayNameMode) => void;
  setCustomAlias: (alias: string) => void;
  setGhostMode: (isGhost: boolean) => void;
  togglePinBadge: (badgeId: string) => void;
  dismissNotification: () => void;
  fetchRealtimeLeaderboard: () => Promise<void>;
  syncWithActualUserData: () => void;
  getUserRank: () => { rank: number; totalMembers: number; league: MasteryLeague };
  getComputedLevel: () => { level: number; currentXp: number; nextLevelXp: number; progressPercent: number };
}

export const DEFAULT_LEADERBOARD: LeaderboardMember[] = [
  {
    id: 'demo_varun_senthil_kumar',
    name: 'Varun Senthil kumar',
    alias: '@varun_sk',
    avatarSeed: 'varun senthil kumar',
    league: 'DIAMOND',
    rank: 1,
    totalPoints: 1420,
    weeklyPoints: 426,
    streakDays: 21,
    level: 6,
    sectionPoints: {
      FINANCE: 580,
      WELLNESS: 340,
      PRODUCTIVITY: 260,
      LEARNING: 140,
      LIFEADMIN: 100,
    },
    badges: ['badge-fire-starter', 'badge-budget-boss', 'badge-hydration-hero', 'badge-iron-discipline'],
    kudosCount: 24,
    statusMessage: 'Compounding wealth & daily habit discipline',
    location: 'HNI Member • Chennai, India',
    isCurrentUser: true,
  },
  {
    id: 'usr_raghav',
    name: 'Raghav',
    alias: '@raghav_invests',
    avatarSeed: 'raghav',
    league: 'PLATINUM',
    rank: 2,
    totalPoints: 1280,
    weeklyPoints: 384,
    streakDays: 19,
    level: 6,
    sectionPoints: {
      FINANCE: 520,
      WELLNESS: 280,
      PRODUCTIVITY: 260,
      LEARNING: 120,
      LIFEADMIN: 100,
    },
    badges: ['badge-fire-starter', 'badge-budget-boss'],
    kudosCount: 18,
    statusMessage: 'FIRE Portfolio compounding • 19d streak',
    location: 'Bangalore, India',
    isCurrentUser: false,
  },
  {
    id: 'usr_dharshini',
    name: 'Dharshini',
    alias: '@dharshini_wellness',
    avatarSeed: 'dharshini',
    league: 'GOLD',
    rank: 3,
    totalPoints: 1140,
    weeklyPoints: 342,
    streakDays: 14,
    level: 5,
    sectionPoints: {
      FINANCE: 380,
      WELLNESS: 420,
      PRODUCTIVITY: 210,
      LEARNING: 80,
      LIFEADMIN: 50,
    },
    badges: ['badge-hydration-hero', 'badge-iron-discipline'],
    kudosCount: 21,
    statusMessage: 'Consistent 3L hydration & strength protocol',
    location: 'Chennai, India',
    isCurrentUser: false,
  },
  {
    id: 'usr_shameer',
    name: 'Shameer',
    alias: '@shameer_quant',
    avatarSeed: 'shameer',
    league: 'GOLD',
    rank: 4,
    totalPoints: 980,
    weeklyPoints: 294,
    streakDays: 11,
    level: 4,
    sectionPoints: {
      FINANCE: 460,
      WELLNESS: 180,
      PRODUCTIVITY: 220,
      LEARNING: 90,
      LIFEADMIN: 30,
    },
    badges: ['badge-deep-work'],
    kudosCount: 12,
    statusMessage: 'Algorithmic rebalancing & deep work',
    location: 'Hyderabad, India',
    isCurrentUser: false,
  },
  {
    id: 'usr_krishna',
    name: 'Krishna',
    alias: '@krishna_builder',
    avatarSeed: 'krishna',
    league: 'SILVER',
    rank: 5,
    totalPoints: 860,
    weeklyPoints: 258,
    streakDays: 8,
    level: 4,
    sectionPoints: {
      FINANCE: 320,
      WELLNESS: 240,
      PRODUCTIVITY: 180,
      LEARNING: 70,
      LIFEADMIN: 50,
    },
    badges: ['badge-budget-boss'],
    kudosCount: 9,
    statusMessage: 'Building wealth runway step-by-step',
    location: 'Mumbai, India',
    isCurrentUser: false,
  },
];

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set, get) => ({
      sectionPoints: {
        FINANCE: 580,
        WELLNESS: 340,
        PRODUCTIVITY: 260,
        LEARNING: 140,
        LIFEADMIN: 100,
      },
      weeklyPoints: 426,
      streakDays: 21,
      lastActiveDate: new Date().toISOString().split('T')[0],
      league: 'DIAMOND',
      displayNameMode: 'REAL_NAME',
      customAlias: '@varun_sk',
      isGhostMode: false,
      badges: BASE_BADGE_DEFINITIONS.map((b) => ({
        ...b,
        isUnlocked: ['badge-fire-starter', 'badge-budget-boss', 'badge-hydration-hero', 'badge-iron-discipline'].includes(b.id),
        progressPercent: ['badge-fire-starter', 'badge-budget-boss', 'badge-hydration-hero', 'badge-iron-discipline'].includes(b.id) ? 100 : 40,
      })),
      pinnedBadgeIds: ['badge-fire-starter', 'badge-hydration-hero'],
      leaderboard: DEFAULT_LEADERBOARD,
      pointHistory: [],
      activeNotification: null,
      isLoadingLeaderboard: false,

      // Synchronize exact real-time points from user's current live stores
      syncWithActualUserData: () => {
        const finance = useFinanceStore.getState();
        const lifeos = useLifeOSStore.getState();
        const auth = useAuthStore.getState();
        const user = auth.user;

        // 1. Finance Real Points
        const txCount = finance.transactions?.length || 0;
        const assetCount = finance.assets?.length || 0;
        const expCount = finance.expenses?.length || 0;
        const goalCount = finance.goals?.length || 0;
        const financePoints = txCount * 20 + assetCount * 15 + expCount * 10 + goalCount * 25;

        // 2. Wellness Real Points
        const waterLiters = lifeos.wellness?.waterLitersLogged || 0;
        const workoutMinutes = lifeos.wellness?.workoutMinutesLogged || 0;
        const workoutCount = lifeos.workoutSessions?.length || 0;
        const mealCount = lifeos.mealLogs?.length || 0;
        const wellnessPoints =
          workoutCount * 25 +
          mealCount * 10 +
          Math.round(waterLiters * 10) +
          Math.min(100, Math.floor(workoutMinutes / 2));

        // 3. Productivity Real Points
        const tasks = lifeos.tasks || [];
        const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
        const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;
        const productivityPoints = completedTasks * 25 + activeTasks * 5;

        // 4. Learning Real Points
        const learningCount = lifeos.learningItems?.length || 0;
        const learningPoints = learningCount * 30;

        // 5. Life Admin Real Points
        const docCount = lifeos.documents?.length || 0;
        const lifeAdminPoints = docCount * 30;

        const totalPoints = financePoints + wellnessPoints + productivityPoints + learningPoints + lifeAdminPoints;
        const league: MasteryLeague =
          totalPoints >= 2000
            ? 'DIAMOND'
            : totalPoints >= 1200
            ? 'PLATINUM'
            : totalPoints >= 600
            ? 'GOLD'
            : totalPoints >= 250
            ? 'SILVER'
            : 'BRONZE';

        // Evaluate Badges dynamically based on real data
        const badges: MasteryBadge[] = BASE_BADGE_DEFINITIONS.map((def) => {
          let isUnlocked = false;
          let progressPercent = 0;

          if (def.id === 'badge-fire-starter') {
            const hasFire = goalCount > 0;
            isUnlocked = hasFire;
            progressPercent = hasFire ? 100 : 0;
          } else if (def.id === 'badge-budget-boss') {
            isUnlocked = txCount >= 10;
            progressPercent = Math.min(100, Math.round((txCount / 10) * 100));
          } else if (def.id === 'badge-hydration-hero') {
            isUnlocked = waterLiters >= 2.5;
            progressPercent = Math.min(100, Math.round((waterLiters / 2.5) * 100));
          } else if (def.id === 'badge-iron-discipline') {
            isUnlocked = workoutCount >= 7;
            progressPercent = Math.min(100, Math.round((workoutCount / 7) * 100));
          } else if (def.id === 'badge-centurion-focus') {
            isUnlocked = completedTasks >= 50;
            progressPercent = Math.min(100, Math.round((completedTasks / 50) * 100));
          } else if (def.id === 'badge-deep-work') {
            isUnlocked = false;
            progressPercent = 0;
          } else if (def.id === 'badge-polymath') {
            isUnlocked = learningCount >= 3;
            progressPercent = Math.min(100, Math.round((learningCount / 3) * 100));
          } else if (def.id === 'badge-vault-sentinel') {
            isUnlocked = docCount >= 5;
            progressPercent = Math.min(100, Math.round((docCount / 5) * 100));
          } else if (def.id === 'badge-diamond-league') {
            isUnlocked = totalPoints >= 2000;
            progressPercent = Math.min(100, Math.round((totalPoints / 2000) * 100));
          }

          return {
            ...def,
            isUnlocked,
            progressPercent,
            unlockedAt: isUnlocked ? 'Active' : undefined,
          };
        });

        const currentAlias =
          get().customAlias || (user?.fullName ? `@${user.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : '@user');

        set({
          sectionPoints: {
            FINANCE: financePoints,
            WELLNESS: wellnessPoints,
            PRODUCTIVITY: productivityPoints,
            LEARNING: learningPoints,
            LIFEADMIN: lifeAdminPoints,
          },
          weeklyPoints: Math.round(totalPoints * 0.35),
          league,
          badges,
          customAlias: currentAlias,
        });
      },

      fetchRealtimeLeaderboard: async () => {
        set({ isLoadingLeaderboard: true });
        try {
          // Sync local points first
          get().syncWithActualUserData();

          const auth = useAuthStore.getState();
          const currentUserId = auth.user?.id;
          const currentUserName = auth.user?.fullName;

          const res = await api.community.getLeaderboard();
          if (res?.success && Array.isArray(res.leaderboard)) {
            const raw = res.leaderboard;

            // Map and identify current user
            const processed: LeaderboardMember[] = raw.map((m: any) => {
              const isCurrentUser =
                (currentUserId && m.id === currentUserId) ||
                (currentUserName && m.name?.toLowerCase() === currentUserName?.toLowerCase());

              return {
                ...m,
                isCurrentUser: !!isCurrentUser,
              };
            });

            // If current user is not in database response yet, prepend them
            const hasCurrentUser = processed.some((m) => m.isCurrentUser);
            if (!hasCurrentUser && currentUserId && currentUserName) {
              const state = get();
              const myTotal = Object.values(state.sectionPoints).reduce((a, b) => a + b, 0);
              processed.push({
                id: currentUserId,
                name: currentUserName,
                alias: state.customAlias || `@${currentUserName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                avatarSeed: currentUserName.toLowerCase(),
                isCurrentUser: true,
                league: state.league,
                rank: processed.length + 1,
                totalPoints: myTotal,
                weeklyPoints: state.weeklyPoints,
                streakDays: state.streakDays,
                level: Math.floor(myTotal / 250) + 1,
                sectionPoints: state.sectionPoints,
                badges: state.badges.filter((b) => b.isUnlocked).map((b) => b.id),
                kudosCount: 0,
                statusMessage: 'Active Quantra member',
                location: 'Verified User',
              });
            }

            // Re-sort strictly by totalPoints descending
            processed.sort((a, b) => b.totalPoints - a.totalPoints);
            processed.forEach((m, idx) => {
              m.rank = idx + 1;
            });

            set({ leaderboard: processed, isLoadingLeaderboard: false });
          } else {
            set({ isLoadingLeaderboard: false });
          }
        } catch (err) {
          console.warn('[Community] Failed to fetch backend leaderboard:', err);
          set({ isLoadingLeaderboard: false });
        }
      },

      awardPoints: (category, points, reason) => {
        const state = get();
        const currentCatPoints = state.sectionPoints[category] || 0;
        const newCatPoints = currentCatPoints + points;
        const newWeeklyPoints = state.weeklyPoints + points;

        const newSectionPoints = {
          ...state.sectionPoints,
          [category]: newCatPoints,
        };

        const totalPoints = Object.values(newSectionPoints).reduce((a, b) => a + b, 0);
        const league: MasteryLeague =
          totalPoints >= 2000
            ? 'DIAMOND'
            : totalPoints >= 1200
            ? 'PLATINUM'
            : totalPoints >= 600
            ? 'GOLD'
            : totalPoints >= 250
            ? 'SILVER'
            : 'BRONZE';

        const newPointEvent: PointEvent = {
          id: `pe-${Date.now()}`,
          category,
          points,
          reason,
          timestamp: new Date().toISOString(),
        };

        // Update leaderboard current user entry
        const updatedLeaderboard = state.leaderboard.map((member) => {
          if (member.isCurrentUser) {
            return {
              ...member,
              sectionPoints: newSectionPoints,
              totalPoints,
              weeklyPoints: newWeeklyPoints,
              level: Math.floor(totalPoints / 250) + 1,
              league,
            };
          }
          return member;
        });

        updatedLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
        updatedLeaderboard.forEach((m, idx) => {
          m.rank = idx + 1;
        });

        const notification: MasteryNotification = {
          id: `notif-${Date.now()}`,
          points,
          category,
          reason,
          timestamp: Date.now(),
        };

        set({
          sectionPoints: newSectionPoints,
          weeklyPoints: newWeeklyPoints,
          league,
          pointHistory: [newPointEvent, ...state.pointHistory].slice(0, 30),
          leaderboard: updatedLeaderboard,
          activeNotification: notification,
        });
      },

      giveKudos: async (memberId) => {
        if (!useAuthStore.getState().requireAuth('give community kudos')) return;
        const state = get();
        const updated = state.leaderboard.map((m) => {
          if (m.id === memberId) {
            const hasGiven = m.hasGivenKudo;
            return {
              ...m,
              hasGivenKudo: !hasGiven,
              kudosCount: hasGiven ? Math.max(0, m.kudosCount - 1) : m.kudosCount + 1,
            };
          }
          return m;
        });
        set({ leaderboard: updated });

        try {
          await api.community.giveKudos(memberId);
        } catch (e) {
          console.warn('[Community] Kudos sync:', e);
        }
      },

      setDisplayNameMode: (mode) => set({ displayNameMode: mode }),
      setCustomAlias: (alias) => {
        const state = get();
        const updated = state.leaderboard.map((m) => {
          if (m.isCurrentUser) {
            return { ...m, alias };
          }
          return m;
        });
        set({ customAlias: alias, leaderboard: updated });
        api.community.updateProfile({ alias }).catch(() => {});
      },
      setGhostMode: (isGhost) => {
        set({ isGhostMode: isGhost });
        api.community.updateProfile({ isGhost }).catch(() => {});
      },

      togglePinBadge: (badgeId) => {
        const state = get();
        const exists = state.pinnedBadgeIds.includes(badgeId);
        if (exists) {
          set({ pinnedBadgeIds: state.pinnedBadgeIds.filter((id) => id !== badgeId) });
        } else {
          if (state.pinnedBadgeIds.length >= 3) {
            set({ pinnedBadgeIds: [...state.pinnedBadgeIds.slice(1), badgeId] });
          } else {
            set({ pinnedBadgeIds: [...state.pinnedBadgeIds, badgeId] });
          }
        }
      },

      dismissNotification: () => set({ activeNotification: null }),

      getUserRank: () => {
        const state = get();
        const currentMember = state.leaderboard.find((m) => m.isCurrentUser);
        return {
          rank: currentMember ? currentMember.rank : 1,
          totalMembers: state.leaderboard.length || 1,
          league: state.league,
        };
      },

      getComputedLevel: () => {
        const state = get();
        const total = Object.values(state.sectionPoints).reduce((a, b) => a + b, 0);
        const level = Math.floor(total / 250) + 1;
        const currentLevelBase = (level - 1) * 250;
        const currentXp = total - currentLevelBase;
        const progressPercent = Math.min(100, Math.round((currentXp / 250) * 100));

        return {
          level,
          currentXp,
          nextLevelXp: 250,
          progressPercent,
        };
      },
    }),
    {
      name: 'quantra-mastery-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
