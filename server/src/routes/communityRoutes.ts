import express, { type Request, type Response } from 'express';
import { queryAll, queryOne } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const communityRoutes = express.Router();

// In-memory or persisted kudos map
const kudosStore: Record<string, number> = {
  usr_demo: 24,
  usr_raghav: 18,
  usr_dharshini: 21,
  usr_shameer: 12,
  usr_krishna: 9,
};

const userAliases: Record<string, { alias: string; status: string; isGhost: boolean }> = {
  usr_demo: { alias: '@varun_sk', status: 'Compounding wealth & daily habit discipline', isGhost: false },
  usr_raghav: { alias: '@raghav_invests', status: 'FIRE Portfolio compounding • 19d streak', isGhost: false },
  usr_dharshini: { alias: '@dharshini_wellness', status: 'Consistent 3L hydration & strength protocol', isGhost: false },
  usr_shameer: { alias: '@shameer_quant', status: 'Algorithmic rebalancing & deep work', isGhost: false },
  usr_krishna: { alias: '@krishna_builder', status: 'Building wealth runway step-by-step', isGhost: false },
};

const OFFICIAL_PEERS = [
  {
    id: 'usr_raghav',
    name: 'Raghav',
    alias: '@raghav_invests',
    avatarSeed: 'raghav',
    league: 'PLATINUM',
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
    isGhost: false,
  },
  {
    id: 'usr_dharshini',
    name: 'Dharshini',
    alias: '@dharshini_wellness',
    avatarSeed: 'dharshini',
    league: 'GOLD',
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
    isGhost: false,
  },
  {
    id: 'usr_shameer',
    name: 'Shameer',
    alias: '@shameer_quant',
    avatarSeed: 'shameer',
    league: 'GOLD',
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
    isGhost: false,
  },
  {
    id: 'usr_krishna',
    name: 'Krishna',
    alias: '@krishna_builder',
    avatarSeed: 'krishna',
    league: 'SILVER',
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
    isGhost: false,
  },
];

// GET /api/community/leaderboard
communityRoutes.get('/leaderboard', (req: Request, res: Response) => {
  try {
    // 1. Fetch real registered users from SQLite database
    const users = queryAll<{
      id: string;
      full_name: string;
      email: string;
      investor_type: string;
      joined_date: string;
    }>('SELECT id, full_name, email, investor_type, joined_date FROM users');

    const dbMembers = users.map((user) => {
      // 2. Compute actual real-time Finance points from real user data
      const txCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?', [user.id])?.count || 0;
      const assetCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE user_id = ?', [user.id])?.count || 0;
      const expenseCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM expenses WHERE user_id = ?', [user.id])?.count || 0;
      const goalCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM goals WHERE user_id = ?', [user.id])?.count || 0;
      let financePoints = txCount * 20 + assetCount * 15 + expenseCount * 10 + goalCount * 25;

      // 3. Compute actual real-time Wellness points
      const workoutCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM workout_sessions WHERE user_id = ?', [user.id])?.count || 0;
      const mealCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM meal_logs WHERE user_id = ?', [user.id])?.count || 0;
      const waterSum = queryOne<{ water: number }>('SELECT COALESCE(SUM(water_liters), 0) as water FROM wellness_logs WHERE user_id = ?', [user.id])?.water || 0;
      let wellnessPoints = workoutCount * 25 + mealCount * 10 + Math.round(waterSum * 10);

      // 4. Compute actual real-time Productivity points
      const completedTasks = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'COMPLETED'", [user.id])?.count || 0;
      const activeTasks = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'COMPLETED'", [user.id])?.count || 0;
      const focusSessions = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM focus_sessions WHERE user_id = ?', [user.id])?.count || 0;
      let productivityPoints = completedTasks * 25 + activeTasks * 5 + focusSessions * 20;

      // 5. Compute actual real-time Learning points
      const learningCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM learning_items WHERE user_id = ?', [user.id])?.count || 0;
      const bookCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM learning_books WHERE user_id = ?', [user.id])?.count || 0;
      let learningPoints = learningCount * 30 + bookCount * 20;

      // 6. Compute actual real-time Life Admin points
      const docCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', [user.id])?.count || 0;
      const checklistDone = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM admin_checklists WHERE user_id = ? AND is_completed = 1', [user.id])?.count || 0;
      let lifeAdminPoints = docCount * 30 + checklistDone * 20;

      const isVarun = user.id === 'usr_demo';
      const fullName = isVarun ? 'Varun Senthil kumar' : user.full_name;

      let totalPoints = financePoints + wellnessPoints + productivityPoints + learningPoints + lifeAdminPoints;
      if (isVarun) {
        totalPoints = 1420;
        financePoints = 580;
        wellnessPoints = 340;
        productivityPoints = 260;
        learningPoints = 140;
        lifeAdminPoints = 100;
      }

      const level = Math.floor(totalPoints / 250) + 1;

      const customMeta = userAliases[user.id] || {
        alias: `@${fullName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        status: isVarun ? 'Compounding wealth & daily habit discipline' : `Active Quantra member • Joined ${user.joined_date || 'recently'}`,
        isGhost: false,
      };

      return {
        id: user.id,
        name: fullName,
        alias: customMeta.alias,
        avatarSeed: fullName.toLowerCase(),
        league: totalPoints >= 2000 ? 'DIAMOND' : totalPoints >= 1200 ? 'PLATINUM' : totalPoints >= 600 ? 'GOLD' : totalPoints >= 250 ? 'SILVER' : 'BRONZE',
        totalPoints,
        weeklyPoints: Math.round(totalPoints * 0.3),
        streakDays: isVarun ? 21 : Math.min(30, Math.max(1, Math.floor(totalPoints / 100))),
        level,
        sectionPoints: {
          FINANCE: financePoints,
          WELLNESS: wellnessPoints,
          PRODUCTIVITY: productivityPoints,
          LEARNING: learningPoints,
          LIFEADMIN: lifeAdminPoints,
        },
        badges: isVarun ? ['badge-fire-starter', 'badge-budget-boss', 'badge-hydration-hero', 'badge-iron-discipline'] : [],
        kudosCount: kudosStore[user.id] || (isVarun ? 24 : 0),
        statusMessage: customMeta.status,
        location: isVarun ? 'HNI Member • Chennai, India' : (user.investor_type ? `${user.investor_type} Member` : 'Verified User'),
        isGhost: customMeta.isGhost,
      };
    });

    // Combine Varun / DB users with the requested peer community members: Raghav, Dharshini, Shameer, Krishna
    const combinedMap = new Map<string, any>();

    // Add DB members first
    dbMembers.forEach((m) => combinedMap.set(m.id, m));

    // Ensure peer users are present
    OFFICIAL_PEERS.forEach((peer) => {
      if (!combinedMap.has(peer.id)) {
        combinedMap.set(peer.id, {
          ...peer,
          kudosCount: kudosStore[peer.id] || peer.kudosCount,
        });
      }
    });

    // Filter out ghosts and sort by totalPoints descending
    const activeLeaderboard = Array.from(combinedMap.values()).filter((m) => !m.isGhost);
    activeLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    activeLeaderboard.forEach((m, idx) => {
      (m as any).rank = idx + 1;
    });

    res.json({
      success: true,
      count: activeLeaderboard.length,
      leaderboard: activeLeaderboard,
    });
  } catch (err: any) {
    console.error('[Community Route Error]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch real-time community leaderboard', error: err.message });
  }
});

// POST /api/community/kudos/:userId
communityRoutes.post('/kudos/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  kudosStore[userId] = (kudosStore[userId] || 0) + 1;
  res.json({ success: true, kudosCount: kudosStore[userId] });
});

// POST /api/community/profile (Update alias/status)
communityRoutes.post('/profile', requireAuth, (req: any, res: Response) => {
  const userId = req.user.id;
  const { alias, status, isGhost } = req.body;
  userAliases[userId] = {
    alias: alias || userAliases[userId]?.alias || `@user_${userId.slice(-4)}`,
    status: status || userAliases[userId]?.status || 'Quantra member',
    isGhost: isGhost ?? userAliases[userId]?.isGhost ?? false,
  };
  res.json({ success: true, profile: userAliases[userId] });
});
