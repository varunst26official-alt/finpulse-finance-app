import express, { type Request, type Response } from 'express';
import { queryAll, queryOne, run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const lifeosRoutes = express.Router();

lifeosRoutes.use(requireAuth);

/**
 * GET /api/lifeos/data
 * Returns comprehensive LifeOS state for the user across all 6 workspaces
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

  // 2. Wellness
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

  // 5. Workouts & Sets (Phase 2)
  const sessionRows = queryAll<{
    id: string;
    date: string;
    split_name: string;
    duration_minutes: number;
    total_tonnage: number;
    total_sets: number;
    notes: string;
  }>('SELECT * FROM workout_sessions WHERE user_id = ? ORDER BY date DESC LIMIT 20', [userId]);

  const workoutSessions = sessionRows.map((s) => {
    const setRows = queryAll<{
      id: string;
      exercise_id: string;
      exercise_name: string;
      muscle_group: string;
      set_number: number;
      weight_kg: number;
      reps: number;
      rpe: number;
    }>('SELECT * FROM workout_sets WHERE session_id = ? ORDER BY set_number ASC', [s.id]);

    return {
      id: s.id,
      date: s.date,
      splitName: s.split_name,
      durationMinutes: s.duration_minutes,
      totalTonnage: s.total_tonnage,
      totalSets: s.total_sets,
      notes: s.notes || undefined,
      sets: setRows.map((st) => ({
        id: st.id,
        exerciseId: st.exercise_id,
        exerciseName: st.exercise_name,
        muscleGroup: st.muscle_group,
        setNumber: st.set_number,
        weightKg: st.weight_kg,
        reps: st.reps,
        rpe: st.rpe,
      })),
    };
  });

  // 6. Meal Logs (Phase 3)
  const mealRows = queryAll<{
    id: string;
    date: string;
    meal_type: string;
    name: string;
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
    portion_description: string;
  }>('SELECT * FROM meal_logs WHERE user_id = ? AND date = ? ORDER BY created_at ASC', [userId, todayStr]);

  const mealLogs = mealRows.map((m) => ({
    id: m.id,
    date: m.date,
    mealType: m.meal_type as any,
    name: m.name,
    calories: m.calories,
    proteinGrams: m.protein_grams,
    carbsGrams: m.carbs_grams,
    fatGrams: m.fat_grams,
    portionDescription: m.portion_description || undefined,
  }));

  // 7. Habits (Phase 4)
  const habitRows = queryAll<{
    id: string;
    title: string;
    category: string;
    streak_count: number;
    last_completed_date: string;
    target_frequency: string;
    icon: string;
  }>('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC', [userId]);

  const habits = habitRows.map((h) => ({
    id: h.id,
    title: h.title,
    category: h.category as any,
    streakCount: h.streak_count,
    isCompletedToday: h.last_completed_date === todayStr,
    icon: h.icon || '⚡',
  }));

  // 8. Focus Sessions (Phase 4)
  const focusRows = queryAll<{
    id: string;
    duration_minutes: number;
    session_type: string;
    task_title: string;
    date: string;
  }>('SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [userId]);

  const focusSessions = focusRows.map((f) => ({
    id: f.id,
    durationMinutes: f.duration_minutes,
    sessionType: f.session_type as any,
    taskTitle: f.task_title || undefined,
    date: f.date,
  }));

  // 9. Learning Books (Phase 5)
  const bookRows = queryAll<{
    id: string;
    title: string;
    author: string;
    category: string;
    current_page: number;
    total_pages: number;
    status: string;
    rating: number;
    notes: string;
  }>('SELECT * FROM learning_books WHERE user_id = ? ORDER BY created_at ASC', [userId]);

  const learningBooks = bookRows.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    currentPage: b.current_page,
    totalPages: b.total_pages,
    status: b.status as any,
    rating: b.rating,
    notes: b.notes || undefined,
  }));

  // 10. Emergency Profile (Phase 6)
  const emergencyRow = queryOne<{
    blood_group: string;
    allergies: string;
    medical_conditions: string;
    primary_contact_name: string;
    primary_contact_phone: string;
    primary_contact_relation: string;
    secondary_contact_name: string;
    secondary_contact_phone: string;
    physician_name: string;
    physician_phone: string;
    tpa_helpline: string;
    notes: string;
  }>('SELECT * FROM emergency_info WHERE user_id = ?', [userId]);

  const emergencyInfo = emergencyRow
    ? {
        bloodGroup: emergencyRow.blood_group,
        allergies: emergencyRow.allergies,
        medicalConditions: emergencyRow.medical_conditions,
        primaryContactName: emergencyRow.primary_contact_name,
        primaryContactPhone: emergencyRow.primary_contact_phone,
        primaryContactRelation: emergencyRow.primary_contact_relation,
        secondaryContactName: emergencyRow.secondary_contact_name,
        secondaryContactPhone: emergencyRow.secondary_contact_phone,
        physicianName: emergencyRow.physician_name,
        physicianPhone: emergencyRow.physician_phone,
        tpaHelpline: emergencyRow.tpa_helpline,
        notes: emergencyRow.notes,
      }
    : null;

  // 11. Admin Checklists (Phase 6)
  const checklistRows = queryAll<{
    id: string;
    title: string;
    frequency: string;
    due_date: string;
    is_completed: number;
    category: string;
    notes: string;
  }>('SELECT * FROM admin_checklists WHERE user_id = ? ORDER BY due_date ASC', [userId]);

  const adminChecklists = checklistRows.map((c) => ({
    id: c.id,
    title: c.title,
    frequency: c.frequency as any,
    dueDate: c.due_date,
    isCompleted: Boolean(c.is_completed),
    category: c.category,
    notes: c.notes || undefined,
  }));

  // 12. Blueprint
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
      // Ignore
    }
  }

  res.json({
    success: true,
    data: {
      tasks,
      wellness,
      learningItems,
      documents,
      workoutSessions,
      mealLogs,
      habits,
      focusSessions,
      learningBooks,
      emergencyInfo,
      adminChecklists,
      userInputs: userInputsData,
      blueprint: blueprintData,
    },
  });
});

/**
 * ============================================================
 * TASKS CRUD
 * ============================================================
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

  res.status(201).json({ success: true, taskId, message: 'Task created' });
});

lifeosRoutes.patch('/tasks/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { status, badgeLabel, title, notes, priority } = req.body;

  const existing = queryOne('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  if (!existing) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }

  const updates: string[] = [];
  const params: any[] = [];
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (badgeLabel !== undefined) { updates.push('badge_label = ?'); params.push(badgeLabel); }
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
  if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }

  if (updates.length > 0) {
    params.push(id, userId);
    run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
  }

  res.json({ success: true, message: 'Task updated' });
});

lifeosRoutes.delete('/tasks/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Task deleted' });
});

/**
 * ============================================================
 * WELLNESS LOGS & METRICS
 * ============================================================
 */
lifeosRoutes.post('/wellness/log', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { waterDeltaLiters, workoutDeltaMinutes, caloriesDelta, resetWater } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  let log = queryOne<{
    id: string;
    workout_minutes: number;
    calories_logged: number;
    water_liters: number;
  }>('SELECT * FROM wellness_logs WHERE user_id = ? AND date = ?', [userId, todayStr]);

  if (!log) {
    const last = queryOne<{ height_cm: number; weight_kg: number; calories_target: number; water_target_liters: number }>(
      'SELECT height_cm, weight_kg, calories_target, water_target_liters FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );

    const logId = `well_${userId}_${todayStr}`;
    run(
      `INSERT INTO wellness_logs
       (id, user_id, date, height_cm, weight_kg, workout_minutes, calories_logged, calories_target, water_liters, water_target_liters)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, 0, ?)`,
      [logId, userId, todayStr, last?.height_cm || 175, last?.weight_kg || 74, last?.calories_target || 2200, last?.water_target_liters || 2.5]
    );
    log = { id: logId, workout_minutes: 0, calories_logged: 0, water_liters: 0 };
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
    `UPDATE wellness_logs SET water_liters = ?, workout_minutes = ?, calories_logged = ? WHERE id = ?`,
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
      [logId, userId, todayStr, Number(heightCm || 175), Number(weightKg || 74), Number(targetWeightKg || 70), Number(caloriesTarget || 2200), Number(waterTargetLiters || 2.5)]
    );
  }

  res.json({ success: true, message: 'Body metrics updated' });
});

/**
 * ============================================================
 * WORKOUTS CRUD (Phase 2)
 * ============================================================
 */
lifeosRoutes.post('/workouts/session', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { splitName, durationMinutes, notes, sets } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  const sessionId = `wsess_${Date.now()}`;

  const setArray = Array.isArray(sets) ? sets : [];
  let totalTonnage = 0;
  for (const s of setArray) {
    totalTonnage += (Number(s.weightKg) || 0) * (Number(s.reps) || 0);
  }

  run(
    `INSERT INTO workout_sessions
     (id, user_id, date, split_name, duration_minutes, total_tonnage, total_sets, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [sessionId, userId, todayStr, splitName || 'Custom Workout', Number(durationMinutes) || 45, totalTonnage, setArray.length, notes || null]
  );

  for (let idx = 0; idx < setArray.length; idx++) {
    const s = setArray[idx];
    run(
      `INSERT INTO workout_sets
       (id, session_id, user_id, exercise_id, exercise_name, muscle_group, set_number, weight_kg, reps, rpe)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `wset_${sessionId}_${idx}`,
        sessionId,
        userId,
        s.exerciseId || 'custom',
        s.exerciseName || 'Exercise',
        s.muscleGroup || 'Full Body',
        s.setNumber || idx + 1,
        Number(s.weightKg) || 0,
        Number(s.reps) || 0,
        Number(s.rpe) || 8.0,
      ]
    );
  }

  // Update wellness workout minutes
  run(
    `UPDATE wellness_logs SET workout_minutes = workout_minutes + ? WHERE user_id = ? AND date = ?`,
    [Number(durationMinutes) || 45, userId, todayStr]
  );

  res.status(201).json({
    success: true,
    sessionId,
    totalTonnage,
    totalSets: setArray.length,
    message: 'Workout session recorded successfully',
  });
});

lifeosRoutes.delete('/workouts/session/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  run('DELETE FROM workout_sessions WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Workout session deleted' });
});

/**
 * ============================================================
 * NUTRITION & MEAL LOGS (Phase 3)
 * ============================================================
 */
lifeosRoutes.post('/meals', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { mealType, name, calories, proteinGrams, carbsGrams, fatGrams, portionDescription } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  if (!name || calories == null) {
    res.status(400).json({ success: false, message: 'Meal name and calories are required' });
    return;
  }

  const mealId = `meal_${Date.now()}`;
  run(
    `INSERT INTO meal_logs
     (id, user_id, date, meal_type, name, calories, protein_grams, carbs_grams, fat_grams, portion_description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mealId,
      userId,
      todayStr,
      mealType || 'SNACK',
      name,
      Number(calories),
      Number(proteinGrams) || 0,
      Number(carbsGrams) || 0,
      Number(fatGrams) || 0,
      portionDescription || null,
    ]
  );

  // Update wellness calories logged
  run(
    `UPDATE wellness_logs SET calories_logged = calories_logged + ? WHERE user_id = ? AND date = ?`,
    [Number(calories), userId, todayStr]
  );

  res.status(201).json({ success: true, mealId, message: 'Meal logged successfully' });
});

lifeosRoutes.delete('/meals/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const meal = queryOne<{ calories: number; date: string }>('SELECT calories, date FROM meal_logs WHERE id = ? AND user_id = ?', [id, userId]);
  if (meal) {
    run(`UPDATE wellness_logs SET calories_logged = MAX(0, calories_logged - ?) WHERE user_id = ? AND date = ?`, [meal.calories, userId, meal.date]);
    run('DELETE FROM meal_logs WHERE id = ? AND user_id = ?', [id, userId]);
  }

  res.json({ success: true, message: 'Meal deleted' });
});

/**
 * ============================================================
 * HABITS & ROUTINES (Phase 4)
 * ============================================================
 */
lifeosRoutes.post('/habits', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, category, icon } = req.body;

  if (!title) {
    res.status(400).json({ success: false, message: 'Title is required' });
    return;
  }

  const habitId = `hab_${Date.now()}`;
  run(
    `INSERT INTO habits (id, user_id, title, category, streak_count, icon) VALUES (?, ?, ?, ?, 0, ?)`,
    [habitId, userId, title, category || 'MORNING', icon || '⚡']
  );

  res.status(201).json({ success: true, habitId, message: 'Habit created' });
});

lifeosRoutes.patch('/habits/:id/toggle', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const todayStr = new Date().toISOString().split('T')[0];

  const habit = queryOne<{ last_completed_date: string; streak_count: number }>('SELECT last_completed_date, streak_count FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
  if (!habit) {
    res.status(404).json({ success: false, message: 'Habit not found' });
    return;
  }

  const isAlreadyDone = habit.last_completed_date === todayStr;
  const newStreak = isAlreadyDone ? Math.max(0, habit.streak_count - 1) : habit.streak_count + 1;
  const newDate = isAlreadyDone ? null : todayStr;

  run(
    `UPDATE habits SET streak_count = ?, last_completed_date = ? WHERE id = ? AND user_id = ?`,
    [newStreak, newDate, id, userId]
  );

  res.json({ success: true, isCompletedToday: !isAlreadyDone, streakCount: newStreak });
});

lifeosRoutes.delete('/habits/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  run('DELETE FROM habits WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Habit deleted' });
});

/**
 * ============================================================
 * FOCUS SESSIONS (Phase 4)
 * ============================================================
 */
lifeosRoutes.post('/focus', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { durationMinutes, sessionType, taskTitle } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  const focusId = `foc_${Date.now()}`;
  run(
    `INSERT INTO focus_sessions (id, user_id, duration_minutes, session_type, task_title, date) VALUES (?, ?, ?, ?, ?, ?)`,
    [focusId, userId, Number(durationMinutes) || 25, sessionType || 'POMODORO', taskTitle || null, todayStr]
  );

  res.status(201).json({ success: true, focusId, message: 'Focus session logged' });
});

/**
 * ============================================================
 * LEARNING BOOKS & COURSES (Phase 5)
 * ============================================================
 */
lifeosRoutes.post('/books', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, author, category, totalPages, notes } = req.body;

  if (!title) {
    res.status(400).json({ success: false, message: 'Book title is required' });
    return;
  }

  const bookId = `bk_${Date.now()}`;
  run(
    `INSERT INTO learning_books (id, user_id, title, author, category, current_page, total_pages, status, rating, notes)
     VALUES (?, ?, ?, ?, ?, 0, ?, 'IN_PROGRESS', 5, ?)`,
    [bookId, userId, title, author || 'Unknown Author', category || 'General', Number(totalPages) || 300, notes || null]
  );

  res.status(201).json({ success: true, bookId, message: 'Book added to library' });
});

lifeosRoutes.patch('/books/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { currentPage, status, rating, notes } = req.body;

  const updates: string[] = [];
  const params: any[] = [];
  if (currentPage !== undefined) { updates.push('current_page = ?'); params.push(Number(currentPage)); }
  if (status !== undefined) { updates.push('status = ?'); params.push(status); }
  if (rating !== undefined) { updates.push('rating = ?'); params.push(Number(rating)); }
  if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

  if (updates.length > 0) {
    params.push(id, userId);
    run(`UPDATE learning_books SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);
  }

  res.json({ success: true, message: 'Book updated' });
});

lifeosRoutes.delete('/books/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  run('DELETE FROM learning_books WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Book deleted' });
});

/**
 * ============================================================
 * EMERGENCY READINESS & CHECKLISTS (Phase 6)
 * ============================================================
 */
lifeosRoutes.post('/emergency', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    bloodGroup,
    allergies,
    medicalConditions,
    primaryContactName,
    primaryContactPhone,
    primaryContactRelation,
    secondaryContactName,
    secondaryContactPhone,
    physicianName,
    physicianPhone,
    tpaHelpline,
    notes,
  } = req.body;

  run(
    `INSERT OR REPLACE INTO emergency_info
     (user_id, blood_group, allergies, medical_conditions, primary_contact_name, primary_contact_phone, primary_contact_relation, secondary_contact_name, secondary_contact_phone, physician_name, physician_phone, tpa_helpline, notes, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      userId,
      bloodGroup || 'O+ Positive',
      allergies || 'None',
      medicalConditions || 'None',
      primaryContactName || 'Emergency Contact',
      primaryContactPhone || '+91 98765 00000',
      primaryContactRelation || 'Family',
      secondaryContactName || '',
      secondaryContactPhone || '',
      physicianName || '',
      physicianPhone || '',
      tpaHelpline || '1800-102-4477',
      notes || '',
    ]
  );

  res.json({ success: true, message: 'Emergency information saved' });
});

lifeosRoutes.post('/checklists', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, frequency, dueDate, category, notes } = req.body;

  if (!title || !dueDate) {
    res.status(400).json({ success: false, message: 'Title and due date are required' });
    return;
  }

  const checklistId = `chk_${Date.now()}`;
  run(
    `INSERT INTO admin_checklists (id, user_id, title, frequency, due_date, is_completed, category, notes)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
    [checklistId, userId, title, frequency || 'ANNUAL', dueDate, category || 'ADMIN', notes || null]
  );

  res.status(201).json({ success: true, checklistId, message: 'Checklist item created' });
});

lifeosRoutes.patch('/checklists/:id/toggle', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const current = queryOne<{ is_completed: number }>('SELECT is_completed FROM admin_checklists WHERE id = ? AND user_id = ?', [id, userId]);
  if (!current) {
    res.status(404).json({ success: false, message: 'Checklist not found' });
    return;
  }

  const nextVal = current.is_completed ? 0 : 1;
  run('UPDATE admin_checklists SET is_completed = ? WHERE id = ? AND user_id = ?', [nextVal, id, userId]);

  res.json({ success: true, isCompleted: Boolean(nextVal) });
});

lifeosRoutes.delete('/checklists/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  run('DELETE FROM admin_checklists WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Checklist item deleted' });
});

/**
 * ============================================================
 * BLUEPRINT
 * ============================================================
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
