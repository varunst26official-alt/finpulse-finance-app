import { QuantrixActionPayload } from '@/types/finance';
import { LifeOSCategory, PriorityLevel } from '@/types/lifeos';

export function parseSystemActionIntent(prompt: string): QuantrixActionPayload | null {
  const text = prompt.trim();
  const lower = text.toLowerCase();

  // 1. HYDRATION: "drank 500ml water", "log 1.5L water", "drink a glass of water", "add 250ml water"
  const waterLiterMatch = lower.match(/(?:drank|drink|log|logged|add)\s*([0-9.]+)\s*(?:l|liter|litres|liters)\s*(?:of\s+)?(?:water)?/i);
  if (waterLiterMatch) {
    const liters = parseFloat(waterLiterMatch[1]);
    if (!isNaN(liters) && liters > 0) {
      return {
        id: `act_${Date.now()}`,
        actionType: 'LOG_WATER',
        title: `Log ${liters}L Hydration`,
        status: 'PENDING',
        data: { waterLiters: Number(liters.toFixed(2)) },
      };
    }
  }

  const waterMlMatch = lower.match(/(?:drank|drink|log|logged|add)\s*(\d{2,4})\s*ml\s*(?:of\s+)?(?:water)?/i);
  if (waterMlMatch) {
    const ml = parseInt(waterMlMatch[1], 10);
    if (!isNaN(ml) && ml > 0) {
      const liters = ml / 1000;
      return {
        id: `act_${Date.now()}`,
        actionType: 'LOG_WATER',
        title: `Log ${ml}ml (${liters}L) Hydration`,
        status: 'PENDING',
        data: { waterLiters: Number(liters.toFixed(2)) },
      };
    }
  }

  if (/(?:drank|drink)\s*(?:a\s+)?glass(?:\s+of)?\s*water/i.test(lower)) {
    return {
      id: `act_${Date.now()}`,
      actionType: 'LOG_WATER',
      title: 'Log Glass of Water (+250ml)',
      status: 'PENDING',
      data: { waterLiters: 0.25 },
    };
  }

  if (/(?:drank|drink)\s*(?:a\s+)?bottle(?:\s+of)?\s*water/i.test(lower)) {
    return {
      id: `act_${Date.now()}`,
      actionType: 'LOG_WATER',
      title: 'Log Water Bottle (+750ml)',
      status: 'PENDING',
      data: { waterLiters: 0.75 },
    };
  }

  // 2. WORKOUT: "logged 45 min workout", "gym 60 mins chest", "ran 30 mins"
  const workoutMatch = lower.match(/(?:logged|log|did|completed|finished)\s*(\d{1,3})\s*(?:min|mins|minute|minutes)\s*(?:of\s+)?(?:workout|gym|exercise|training|running|cardio|chest|push|pull|legs)?/i) ||
                       lower.match(/(?:workout|gym|exercise|running|cardio)\s*(?:for\s+)?(\d{1,3})\s*(?:min|mins|minutes)/i);
  if (workoutMatch) {
    const mins = parseInt(workoutMatch[1], 10);
    if (!isNaN(mins) && mins > 0) {
      let workoutTitle = 'Workout Session';
      if (lower.includes('chest') || lower.includes('push')) workoutTitle = 'Push Day (Chest/Triceps)';
      else if (lower.includes('back') || lower.includes('pull')) workoutTitle = 'Pull Day (Back/Biceps)';
      else if (lower.includes('legs') || lower.includes('squat')) workoutTitle = 'Leg Day (Quads/Hamstrings)';
      else if (lower.includes('run') || lower.includes('cardio')) workoutTitle = 'Cardio & Conditioning';
      else if (lower.includes('gym')) workoutTitle = 'Gym Training';

      return {
        id: `act_${Date.now()}`,
        actionType: 'LOG_WORKOUT',
        title: `Record ${mins}m ${workoutTitle}`,
        status: 'PENDING',
        data: {
          workoutMinutes: mins,
          workoutTitle,
        },
      };
    }
  }

  // 3. MEALS / CALORIES: "ate 500 kcal chicken rice", "logged lunch 600 calories", "had oatmeal 350 kcal"
  const mealMatch1 = lower.match(/(?:ate|had|log meal|logged meal|lunch|dinner|breakfast|snack)\s*(?:of\s+)?(\d{2,4})\s*(?:kcal|calories)\s*(?:of\s+)?(.+)?/i);
  const mealMatch2 = lower.match(/(?:ate|had)\s+(.+?)\s+(?:for\s+)?(\d{2,4})\s*(?:kcal|calories)/i);

  if (mealMatch1) {
    const cals = parseInt(mealMatch1[1], 10);
    const mealName = mealMatch1[2]?.trim() || 'Meal Log';
    return {
      id: `act_${Date.now()}`,
      actionType: 'LOG_MEAL',
      title: `Log ${cals} kcal (${mealName})`,
      status: 'PENDING',
      data: {
        calories: cals,
        mealName: mealName.charAt(0).toUpperCase() + mealName.slice(1),
        proteinGrams: Math.round(cals * 0.06), // estimated benchmark
      },
    };
  } else if (mealMatch2) {
    const mealName = mealMatch2[1]?.trim() || 'Meal Log';
    const cals = parseInt(mealMatch2[2], 10);
    return {
      id: `act_${Date.now()}`,
      actionType: 'LOG_MEAL',
      title: `Log ${cals} kcal (${mealName})`,
      status: 'PENDING',
      data: {
        calories: cals,
        mealName: mealName.charAt(0).toUpperCase() + mealName.slice(1),
        proteinGrams: Math.round(cals * 0.06),
      },
    };
  }

  // 4. TASK CREATION: "add task: Rebalance mutual funds by 5pm high priority", "remind me to pay bills", "todo: Review SIP"
  const taskCreateMatch =
    lower.match(/^(?:add|create|new|schedule)\s+(?:task|todo|agenda)(?:\s*:\s*|\s+)(.+)/i) ||
    lower.match(/^(?:remind me to|remember to)\s+(.+)/i) ||
    lower.match(/^todo:\s*(.+)/i);

  if (taskCreateMatch) {
    let rawTitle = taskCreateMatch[1].trim();

    // Priority detection
    let priority: PriorityLevel = 'MEDIUM';
    if (/\b(urgent|high priority|highest priority|p1|asap|critical)\b/i.test(rawTitle)) {
      priority = 'HIGH';
      rawTitle = rawTitle.replace(/\b(urgent|high priority|highest priority|p1|asap|critical)\b/gi, '').trim();
    } else if (/\b(low priority|minor|someday|p3)\b/i.test(rawTitle)) {
      priority = 'LOW';
      rawTitle = rawTitle.replace(/\b(low priority|minor|someday|p3)\b/gi, '').trim();
    }

    // Time detection: "by 5 PM", "at 11:30 AM"
    let taskTime = '';
    const timeMatch = rawTitle.match(/\b(?:by|at)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\b/i);
    if (timeMatch) {
      taskTime = timeMatch[1].toUpperCase();
      rawTitle = rawTitle.replace(timeMatch[0], '').trim();
    }

    // Category detection
    let category: LifeOSCategory = 'PRODUCTIVITY';
    if (/\b(invest|equity|stock|nifty|sip|bank|fund|portfolio|rebalance|tax)\b/i.test(rawTitle)) category = 'FINANCE';
    else if (/\b(gym|workout|water|diet|protein|cardio|sleep|run|stretch)\b/i.test(rawTitle)) category = 'WELLNESS';
    else if (/\b(study|read|book|course|system design|code|interview)\b/i.test(rawTitle)) category = 'LEARNING';
    else if (/\b(bill|passport|license|insurance|claim|emi|rent|contract)\b/i.test(rawTitle)) category = 'LIFEADMIN';

    // Clean punctuation
    const cleanTitle = rawTitle.replace(/^[:\-\s]+|[:\-\s]+$/g, '');
    const capitalized = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    return {
      id: `act_${Date.now()}`,
      actionType: 'CREATE_TASK',
      title: `Create Task: "${capitalized}"`,
      status: 'PENDING',
      data: {
        taskTitle: capitalized,
        taskPriority: priority,
        taskCategory: category,
        taskTime: taskTime || 'Today',
      },
    };
  }

  // 5. TASK COMPLETION: "mark task done", "complete task Rebalance"
  const taskCompleteMatch = lower.match(/(?:mark|complete|finish|done with)\s+(?:task|todo)\s*(.+)?/i);
  if (taskCompleteMatch && !lower.includes('create') && !lower.includes('add')) {
    const query = taskCompleteMatch[1]?.trim() || '';
    return {
      id: `act_${Date.now()}`,
      actionType: 'TOGGLE_TASK',
      title: query ? `Mark Task Done: "${query}"` : 'Complete Task',
      status: 'PENDING',
      data: {
        taskTitle: query,
      },
    };
  }

  // 6. DAILY COMMAND BRIEFING: "morning brief", "daily summary", "what should I focus on"
  if (
    lower.includes('morning brief') ||
    lower.includes('daily brief') ||
    lower.includes('daily summary') ||
    lower.includes('today summary') ||
    lower.includes('plan my day') ||
    lower.includes('what should i do') ||
    lower.includes('daily briefing')
  ) {
    return {
      id: `act_${Date.now()}`,
      actionType: 'DAILY_BRIEF',
      title: 'Generate Daily Command Briefing',
      status: 'PENDING',
      data: {},
    };
  }

  return null;
}
