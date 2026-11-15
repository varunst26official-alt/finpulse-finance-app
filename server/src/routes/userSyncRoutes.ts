import express, { type Request, type Response } from 'express';
import { queryOne, run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const userSyncRoutes = express.Router();

userSyncRoutes.use(requireAuth);

/**
 * GET /api/user/sync-state
 * Retrieves the full cross-device synced state for the authenticated user
 */
userSyncRoutes.get('/sync-state', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const row = queryOne<{
      user_id: string;
      finance_state: string;
      lifeos_state: string;
      updated_at: string;
    }>('SELECT * FROM user_sync_states WHERE user_id = ?', [userId]);

    if (!row) {
      res.json({
        success: true,
        data: null,
        message: 'No remote cloud state found for user.',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        financeState: JSON.parse(row.finance_state),
        lifeosState: JSON.parse(row.lifeos_state),
        updatedAt: row.updated_at,
      },
    });
  } catch (err: any) {
    console.error('[userSyncRoutes GET Error]', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve sync state', error: err.message });
  }
});

/**
 * POST /api/user/sync-state
 * Saves/upserts the full cross-device synced state for the authenticated user
 */
userSyncRoutes.post('/sync-state', (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { financeState, lifeosState } = req.body;

    if (!financeState && !lifeosState) {
      res.status(400).json({ success: false, message: 'Payload missing financeState or lifeosState' });
      return;
    }

    const finJson = financeState ? JSON.stringify(financeState) : '{}';
    const lifeJson = lifeosState ? JSON.stringify(lifeosState) : '{}';

    run(
      `INSERT INTO user_sync_states (user_id, finance_state, lifeos_state, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id) DO UPDATE SET
         finance_state = excluded.finance_state,
         lifeos_state = excluded.lifeos_state,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, finJson, lifeJson]
    );

    res.json({
      success: true,
      message: 'User state securely synchronized to cloud.',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[userSyncRoutes POST Error]', err);
    res.status(500).json({ success: false, message: 'Failed to persist sync state', error: err.message });
  }
});
