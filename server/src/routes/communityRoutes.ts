import express, { type Request, type Response } from 'express';
import { queryAll, queryOne } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const communityRoutes = express.Router();

// In-memory or persisted kudos map
const kudosStore: Record<string, number> = {};
const userAliases: Record<string, { alias: string; status: string; isGhost: boolean }> = {};

// GET /api/community/leaderboard
communityRoutes.get('/leaderboard', (req: Request, res: Response) => {
  try {
    // 1. Fetch ALL real registered users from SQLite database
    const users = queryAll<{
      id: string;
      full_name: string;
      email: string;
      investor_type: string;
      joined_date: string;
    }>('SELECT id, full_name, email, investor_type, joined_date FROM users');

    const leaderboard = users.map((user) => {
      // 2. Compute actual real-time Finance points from real user data
      const txCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?', [user.id])?.count || 0;
      const assetCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE user_id = ?', [user.id])?.count || 0;
      const expenseCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM expenses WHERE user_id = ?', [user.id])?.count || 0;
      const goalCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM goals WHERE user_id = ?', [user.id])?.count || 0;
      const financePoints = txCount * 20 + assetCount * 15 + expenseCount * 10 + goalCount * 25;

      // 3. Compute actual real-time Wellness points
      const workoutCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM workout_sessions WHERE user_id = ?', [user.id])?.count || 0;
      const mealCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM meal_logs WHERE user_id = ?', [user.id])?.count || 0;
      const waterSum = queryOne<{ water: number }>('SELECT COALESCE(SUM(water_liters), 0) as water FROM wellness_logs WHERE user_id = ?', [user.id])?.water || 0;
      const wellnessPoints = workoutCount * 25 + mealCount * 10 + Math.round(waterSum * 10);

      // 4. Compute actual real-time Productivity points
      const completedTasks = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'COMPLETED'", [user.id])?.count || 0;
      const activeTasks = queryOne<{ count: number }>("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status != 'COMPLETED'", [user.id])?.count || 0;
      const focusSessions = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM focus_sessions WHERE user_id = ?', [user.id])?.count || 0;
      const productivityPoints = completedTasks * 25 + activeTasks * 5 + focusSessions * 20;

      // 5. Compute actual real-time Learning points
      const learningCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM learning_items WHERE user_id = ?', [user.id])?.count || 0;
      const bookCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM learning_books WHERE user_id = ?', [user.id])?.count || 0;
      const learningPoints = learningCount * 30 + bookCount * 20;

      // 6. Compute actual real-time Life Admin points
      const docCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM documents WHERE user_id = ?', [user.id])?.count || 0;
      const checklistDone = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM admin_checklists WHERE user_id = ? AND is_completed = 1', [user.id])?.count || 0;
      const lifeAdminPoints = docCount * 30 + checklistDone * 20;

      const totalPoints = financePoints + wellnessPoints + productivityPoints + learningPoints + lifeAdminPoints;
      const level = Math.floor(totalPoints / 250) + 1;

      const customMeta = userAliases[user.id] || {
        alias: `@${user.full_name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        status: `Active Quantra member · Joined ${user.joined_date || 'recently'}`,
        isGhost: false,
      };

      return {
        id: user.id,
        name: user.full_name,
        alias: customMeta.alias,
        avatarSeed: user.full_name.toLowerCase(),
        league: totalPoints >= 2000 ? 'DIAMOND' : totalPoints >= 1200 ? 'PLATINUM' : totalPoints >= 600 ? 'GOLD' : totalPoints >= 250 ? 'SILVER' : 'BRONZE',
        totalPoints,
        weeklyPoints: Math.round(totalPoints * 0.3),
        streakDays: Math.min(30, Math.max(1, Math.floor(totalPoints / 100))),
        level,
        sectionPoints: {
          FINANCE: financePoints,
          WELLNESS: wellnessPoints,
          PRODUCTIVITY: productivityPoints,
          LEARNING: learningPoints,
          LIFEADMIN: lifeAdminPoints,
        },
        badges: [],
        kudosCount: kudosStore[user.id] || 0,
        statusMessage: customMeta.status,
        location: user.investor_type ? `${user.investor_type} Member` : 'Verified User',
        isGhost: customMeta.isGhost,
      };
    });

    // Filter out ghosts and sort by totalPoints descending
    const activeLeaderboard = leaderboard.filter((m) => !m.isGhost);
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
