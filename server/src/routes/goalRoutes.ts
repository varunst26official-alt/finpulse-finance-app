import express, { type Request, type Response } from 'express';
import { queryOne, run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const goalRoutes = express.Router();

goalRoutes.use(requireAuth);

/**
 * POST /api/goals
 * Create a life goal bucket
 */
goalRoutes.post('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    title,
    category,
    targetAmount,
    targetDate,
    currentSaved,
    monthlyContribution,
    priority,
    inflationRate,
    expectedReturnRate,
    notes,
  } = req.body;

  if (!title || !category || targetAmount == null || !targetDate) {
    res.status(400).json({ success: false, message: 'Missing required goal fields.' });
    return;
  }

  const goalId = `goal_${Date.now()}`;

  run(
    `INSERT INTO goals
     (id, user_id, title, category, target_amount, target_date, current_saved, monthly_contribution, priority, inflation_rate, expected_return_rate, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      goalId,
      userId,
      title,
      category,
      Number(targetAmount),
      targetDate,
      Number(currentSaved || 0),
      Number(monthlyContribution || 0),
      priority || 'HIGH',
      Number(inflationRate || 6.5),
      Number(expectedReturnRate || 12.0),
      notes || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Life goal bucket created in database.',
    goalId,
  });
});

/**
 * POST /api/goals/:id/contribute
 * Add lump sum or savings contribution towards a goal
 */
goalRoutes.post('/:id/contribute', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { amount } = req.body;

  if (amount == null || Number(amount) <= 0) {
    res.status(400).json({ success: false, message: 'Valid contribution amount is required.' });
    return;
  }

  const goal = queryOne<{ current_saved: number; target_amount: number }>(
    'SELECT current_saved, target_amount FROM goals WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (!goal) {
    res.status(404).json({ success: false, message: 'Goal bucket not found.' });
    return;
  }

  const newSaved = goal.current_saved + Number(amount);
  const isAchieved = newSaved >= goal.target_amount ? 1 : 0;

  run('UPDATE goals SET current_saved = ?, is_achieved = ? WHERE id = ?', [newSaved, isAchieved, id]);

  res.json({
    success: true,
    message: 'Contribution recorded towards goal.',
    newSaved,
    isAchieved: Boolean(isAchieved),
  });
});

/**
 * DELETE /api/goals/:id
 */
goalRoutes.delete('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Goal removed.' });
});
