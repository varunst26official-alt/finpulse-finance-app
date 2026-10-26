import express, { type Request, type Response } from 'express';
import { queryAll, queryOne, run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const lifeosRoutes = express.Router();

lifeosRoutes.use(requireAuth);

/**
 * GET /api/lifeos/data
 * Returns comprehensive LifeOS state for the user (tasks, wellness, learning, documents, blueprint)
 */
lifeosRoutes.get('/data', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Tasks
  const taskRows = queryAll<{
    id: string;
    title: string;
    time: string;
    category: string;
    priority: string;
    status: string;
    badge_label: string;
    icon_symbol: string;
    notes: string;
    due_date: string;
    created_at: string;
  }>('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at ASC', [userId]);

  const tasks = taskRows.map((r) => ({
    id: r.id,
    title: r.title,
    time: r.time || undefined,
    category: r.category as any,
    priority: r.priority as any,
    status: r.status as any,
    badgeLabel: r.badge_label || 'To do',
    iconSymbol: r.icon_symbol || '☑',
    notes: r.notes || undefined,
    dueDate: r.due_date || undefined,
  }));

  // 2. Wellness (Latest or today)
  let wellnessRow = queryOne<{
    height_cm: number;
    weight_kg: number;
    target_weight_kg: number;
    workout_minutes: number;
    calories_logged: number;
    calories_target: number;
    water_liters: number;
    water_target_liters: number;
    sleep_hours: number;
  }>('SELECT * FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1', [userId]);

  if (!wellnessRow) {
    // Default fallback
    wellnessRow = {
      height_cm: 175,
      weight_kg: 74,
      target_weight_kg: 70,
      workout_minutes: 0,
      calories_logged: 0,
      calories_target: 2200,
      water_liters: 0,
      water_target_liters: 2.5,
      sleep_hours: 7.5,
    };
  }

  const wellness = {
    heightCm: wellnessRow.height_cm,
    weightKg: wellnessRow.weight_kg,
    targetWeightKg: wellnessRow.target_weight_kg || 70,
    workoutMinutesLogged: wellnessRow.workout_minutes || 0,
    caloriesLogged: wellnessRow.calories_logged || 0,
    caloriesTarget: wellnessRow.calories_target || 2200,
    waterLitersLogged: wellnessRow.water_liters || 0,
    waterTargetLiters: wellnessRow.water_target_liters || 2.5,
    sleepHours: wellnessRow.sleep_hours || 7.5,
  };

  // 3. Learning Items
  const learningRows = queryAll<{
    id: string;
    title: string;
    field: string;
    progress_percent: number;
    hours_spent: number;
    target_hours: number;
    status: string;
    notes: string;
  }>('SELECT * FROM learning_items WHERE user_id = ? ORDER BY created_at ASC', [userId]);

  const learningItems = learningRows.map((r) => ({
    id: r.id,
    title: r.title,
    field: r.field,
    progressPercent: r.progress_percent,
    hoursSpent: r.hours_spent,
    targetHours: r.target_hours,
    status: r.status as any,
    notes: r.notes || undefined,
  }));

  // 4. Documents
  const docRows = queryAll<{
    id: string;
    title: string;
    category: string;
    document_number: string;
    expiry_date: string;
    status: string;
    authority: string;
    file_url: string;
    notes: string;
  }>('SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC', [userId]);

  const documents = docRows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category as any,
    documentNumber: r.document_number,
    expiryDate: r.expiry_date || undefined,
    status: r.status as any,
    authority: r.authority || undefined,
    notes: r.notes || undefined,
  }));

  // 5. Blueprint
  const blueprintRow = queryOne<{
    inputs_json: string;
    blueprint_json: string;
  }>('SELECT inputs_json, blueprint_json FROM user_blueprint WHERE user_id = ?', [userId]);

  let blueprintData = null;
  let userInputsData = null;
  if (blueprintRow) {
    try {
      userInputsData = JSON.parse(blueprintRow.inputs_json);
      blueprintData = JSON.parse(blueprintRow.blueprint_json);
    } catch {
      // Ignore JSON parse errors
    }
  }

  res.json({
    success: true,
    data: {
      tasks,
      wellness,
      learningItems,
      documents,
      userInputs: userInputsData,
      blueprint: blueprintData,
    },
  });
});

/**
 * POST /api/lifeos/tasks
 * Create a task item
 */
lifeosRoutes.post('/tasks', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, time, category, priority, status, badgeLabel, iconSymbol, notes, dueDate } = req.body;

  if (!title || !category) {
    res.status(400).json({ success: false, message: 'Title and category are required' });
    return;
  }

  const taskId = `tsk_${Date.now()}`;
  run(
    `INSERT INTO tasks
     (id, user_id, title, time, category, priority, status, badge_label, icon_symbol, notes, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskId,
      userId,
      title,
      time || null,
      category,
      priority || 'MEDIUM',
      status || 'TODO',
      badgeLabel || 'To do',
      iconSymbol || '☑',
      notes || null,
      dueDate || null,
    ]
  );

  res.status(201).json({
    success: true,
    taskId,
    message: 'Task created successfully',
  });
});

/**
 * PATCH /api/lifeos/tasks/:id
 * Toggle status or update fields of a task
 */
lifeosRoutes.patch('/tasks/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { status, badgeLabel, title, notes, priority } = req.body;

  const existing = queryOne('SELECT id, status FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (badgeLabel !== undefined) {
    updates.push('badge_label = ?');
    params.push(badgeLabel);
  }
  if (title !== undefined) {
    updates.push('title = ?');
    params.push(title);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }
  if (priority !== undefined) {
    updates.push('priority = ?');
    params.push(priority);
  }

  if (updates.length > 0) {
    params.push(id, userId);
    run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
  }

  res.json({ success: true, message: 'Task updated successfully' });
});

/**
 * DELETE /api/lifeos/tasks/:id
 */
lifeosRoutes.delete('/tasks/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Task deleted successfully' });
});

/**
 * POST /api/lifeos/wellness/log
 * Log water, workout minutes, or calories for today
 */
lifeosRoutes.post('/wellness/log', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { waterDeltaLiters, workoutDeltaMinutes, caloriesDelta, resetWater } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  let log = queryOne<{
    id: string;
    height_cm: number;
    weight_kg: number;
    workout_minutes: number;
    calories_logged: number;
    calories_target: number;
    water_liters: number;
    water_target_liters: number;
  }>('SELECT * FROM wellness_logs WHERE user_id = ? AND date = ?', [userId, todayStr]);

  if (!log) {
    // Get last known height and weight
    const last = queryOne<{ height_cm: number; weight_kg: number; calories_target: number; water_target_liters: number }>(
      'SELECT height_cm, weight_kg, calories_target, water_target_liters FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );

    const logId = `well_${userId}_${todayStr}`;
    run(
      `INSERT INTO wellness_logs
       (id, user_id, date, height_cm, weight_kg, workout_minutes, calories_logged, calories_target, water_liters, water_target_liters)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, 0, ?)`,
      [
        logId,
        userId,
        todayStr,
        last?.height_cm || 175,
        last?.weight_kg || 74,
        last?.calories_target || 2200,
        last?.water_target_liters || 2.5,
      ]
    );

    log = {
      id: logId,
      height_cm: last?.height_cm || 175,
      weight_kg: last?.weight_kg || 74,
      workout_minutes: 0,
      calories_logged: 0,
      calories_target: last?.calories_target || 2200,
      water_liters: 0,
      water_target_liters: last?.water_target_liters || 2.5,
    };
  }

  let newWater = log.water_liters;
  if (resetWater) {
    newWater = 0;
  } else if (waterDeltaLiters) {
    newWater = Math.max(0, Math.round((newWater + Number(waterDeltaLiters)) * 10) / 10);
  }

  const newWorkout = Math.max(0, (log.workout_minutes || 0) + (Number(workoutDeltaMinutes) || 0));
  const newCalories = Math.max(0, (log.calories_logged || 0) + (Number(caloriesDelta) || 0));

  run(
    `UPDATE wellness_logs
     SET water_liters = ?, workout_minutes = ?, calories_logged = ?
     WHERE id = ?`,
    [newWater, newWorkout, newCalories, log.id]
  );

  res.json({
    success: true,
    wellness: {
      waterLitersLogged: newWater,
      workoutMinutesLogged: newWorkout,
      caloriesLogged: newCalories,
    },
  });
});

/**
 * PATCH /api/lifeos/wellness/metrics
 * Update body height, weight, and targets
 */
lifeosRoutes.patch('/wellness/metrics', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { heightCm, weightKg, targetWeightKg, caloriesTarget, waterTargetLiters } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  const logId = `well_${userId}_${todayStr}`;
  const existing = queryOne('SELECT id FROM wellness_logs WHERE user_id = ? AND date = ?', [userId, todayStr]);

  if (existing) {
    const updates: string[] = [];
    const params: any[] = [];
    if (heightCm) { updates.push('height_cm = ?'); params.push(Number(heightCm)); }
    if (weightKg) { updates.push('weight_kg = ?'); params.push(Number(weightKg)); }
    if (targetWeightKg) { updates.push('target_weight_kg = ?'); params.push(Number(targetWeightKg)); }
    if (caloriesTarget) { updates.push('calories_target = ?'); params.push(Number(caloriesTarget)); }
    if (waterTargetLiters) { updates.push('water_target_liters = ?'); params.push(Number(waterTargetLiters)); }

    if (updates.length > 0) {
      params.push(userId, todayStr);
      run(`UPDATE wellness_logs SET ${updates.join(', ')} WHERE user_id = ? AND date = ?`, params);
    }
  } else {
    run(
      `INSERT INTO wellness_logs
       (id, user_id, date, height_cm, weight_kg, target_weight_kg, calories_target, water_target_liters)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logId,
        userId,
        todayStr,
        Number(heightCm || 175),
        Number(weightKg || 74),
        Number(targetWeightKg || 70),
        Number(caloriesTarget || 2200),
        Number(waterTargetLiters || 2.5),
      ]
    );
  }

  res.json({ success: true, message: 'Body metrics updated successfully' });
});

/**
 * POST /api/lifeos/blueprint
 * Save user inputs and calculated blueprint to database
 */
lifeosRoutes.post('/blueprint', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { userInputs, blueprint } = req.body;

  if (!userInputs || !blueprint) {
    res.status(400).json({ success: false, message: 'userInputs and blueprint are required' });
    return;
  }

  run(
    `INSERT OR REPLACE INTO user_blueprint (user_id, inputs_json, blueprint_json, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
    [userId, JSON.stringify(userInputs), JSON.stringify(blueprint)]
  );

  res.json({ success: true, message: 'Adaptive Blueprint persisted' });
});
