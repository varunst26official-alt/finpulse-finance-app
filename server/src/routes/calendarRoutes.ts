import express, { type Request, type Response } from 'express';
import { run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const calendarRoutes = express.Router();

calendarRoutes.use(requireAuth);

/**
 * POST /api/calendar
 * Add a calendar event
 */
calendarRoutes.post('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, date, type, amount, categoryName, notes } = req.body;

  if (!title || !date || !type) {
    res.status(400).json({ success: false, message: 'Missing required calendar fields.' });
    return;
  }

  const eventId = `evt_${Date.now()}`;

  run(
    `INSERT INTO calendar_events
     (id, user_id, title, date, type, amount, category_name, is_completed, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      eventId,
      userId,
      title,
      date,
      type,
      Number(amount || 0),
      categoryName || 'General',
      notes || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Financial calendar event scheduled.',
    eventId,
  });
});

/**
 * PUT /api/calendar/:id/toggle
 */
calendarRoutes.put('/:id/toggle', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run(
    `UPDATE calendar_events
     SET is_completed = CASE WHEN is_completed = 1 THEN 0 ELSE 1 END
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  res.json({ success: true, message: 'Calendar event status toggled.' });
});

/**
 * DELETE /api/calendar/:id
 */
calendarRoutes.delete('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM calendar_events WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Event deleted.' });
});
