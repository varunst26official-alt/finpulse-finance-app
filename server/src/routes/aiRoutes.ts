import express, { type Request, type Response } from 'express';

export const aiRoutes = express.Router();

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Groceries: ['supermarket', 'walmart', 'grocery', 'market', 'trader', 'sprouts', 'whole foods', 'milk', 'oats', 'bread', 'chicken', 'eggs', 'apple', 'fruit', 'veg'],
  Dining: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza', 'bar', 'grill', 'bistro', 'diner', 'bakery', 'food', 'tea'],
  Fuel: ['gas', 'fuel', 'chevron', 'shell', 'exxon', 'bp', 'petrol', 'diesel', 'station'],
  Utilities: ['electric', 'water', 'power', 'utility', 'internet', 'broadband', 'telecom', 'energy'],
  Shopping: ['clothing', 'apparel', 'zara', 'h&m', 'target', 'shoes', 'nike', 'amazon', 'mall', 'store', 'deco', 'gift', 'book', 'diy', 'enterprise'],
  Medical: ['pharmacy', 'clinic', 'hospital', 'doctor', 'medicine', 'health', 'cvs', 'walgreens'],
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return cat;
    }
  }
  return 'Other';
}

/**
 * 1. POST /api/ai/parse-bill
 */
aiRoutes.post('/parse-bill', (req: Request, res: Response) => {
  const { rawText } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    res.status(400).json({ success: false, message: 'rawText is required' });
    return;
  }

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Merchant detection
  let merchant = 'Unknown Merchant';
  for (const line of lines.slice(0, 6)) {
    const cleaned = line.replace(/[^a-zA-Z0-9\s&().-]/g, '').trim();
    if (cleaned.length > 3 && !/\b\d{4,}\b/.test(cleaned)) {
      if (!/welcome|receipt|invoice|order|document|date|cashier/i.test(cleaned)) {
        merchant = cleaned;
        break;
      }
    }
  }

  // Date detection
  const dateMatch = rawText.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})|(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/);
  const dateStr = dateMatch ? dateMatch[0] : null;

  // Amounts
  let totalAmount = 0.0;
  let taxAmount = 0.0;
  let subtotal = 0.0;

  const totalMatch = rawText.match(/(?:grand\s*total|round\s*d\s*total|total\s*\(rm\)|total\s*amount|total|balance\s*due)\s*[:=]?\s*[$₹€£]?\s*(?:rm)?\s*(\d+[.,]\d{2})/i);
  if (totalMatch) {
    totalAmount = parseFloat(totalMatch[1].replace(',', '.'));
  } else {
    // Multi-line check
    for (let i = 0; i < lines.length; i++) {
      if (/\b(total|amount due|grand total)\b/i.test(lines[i])) {
        for (let j = 1; j <= 2 && i + j < lines.length; j++) {
          const numMatch = lines[i + j].match(/^[$₹€£]?(?:rm)?\s*(\d+[.,]\d{2})$/i);
          if (numMatch) {
            totalAmount = parseFloat(numMatch[1].replace(',', '.'));
            break;
          }
        }
        if (totalAmount > 0) break;
      }
    }
  }

  const taxMatch = rawText.match(/(?:tax|vat|gst)\s*[:=]?\s*[$₹€£]?(?:rm)?\s*(\d+[.,]\d{2})/i);
  if (taxMatch) {
    taxAmount = parseFloat(taxMatch[1].replace(',', '.'));
  }

  const subtotalMatch = rawText.match(/(?:subtotal|sub-total|sub total)\s*[:=]?\s*[$₹€£]?(?:rm)?\s*(\d+[.,]\d{2})/i);
  if (subtotalMatch) {
    subtotal = parseFloat(subtotalMatch[1].replace(',', '.'));
  }

  // Line items
  const items: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }> = [];
  const itemRegex = /^([A-Za-z0-9\s&/-]{3,35})\s+[$₹€£]?(?:rm)?\s*(\d+[.,]\d{2})$/i;

  for (const line of lines) {
    const m = line.match(itemRegex);
    if (m) {
      const name = m[1].trim();
      if (!/total|subtotal|tax|change|cash|visa|mastercard/i.test(name)) {
        const p = parseFloat(m[2].replace(',', '.'));
        items.push({ name, quantity: 1, unitPrice: p, totalPrice: p });
      }
    }
  }

  res.json({
    success: true,
    data: {
      merchantName: merchant,
      date: dateStr,
      category: detectCategory(rawText),
      subtotal: subtotal || (totalAmount && taxAmount ? totalAmount - taxAmount : null),
      tax: taxAmount || null,
      totalAmount,
      items,
    },
  });
});

/**
 * 2. POST /api/ai/parse-statement
 */
const STATEMENT_CATEGORIES: Record<string, string[]> = {
  Salary: ['salary', 'payroll', 'direct dep', 'employer', 'stipend'],
  Housing: ['rent', 'mortgage', 'apartment', 'hoa', 'landlord'],
  Subscription: ['netflix', 'spotify', 'apple.com', 'prime', 'youtube', 'hulu', 'gym'],
  Utilities: ['electric', 'water', 'gas', 'power', 'internet', 'comcast', 'verizon', 'at&t'],
  Groceries: ['supermarket', 'walmart', 'grocery', 'trader joe', 'kroger', 'safeway', 'whole foods'],
  Dining: ['doordash', 'ubereats', 'starbucks', 'mcdonalds', 'restaurant', 'cafe'],
  Fuel: ['chevron', 'shell', 'exxon', 'speedway', 'mobil', 'bp', 'gas station'],
  Investment: ['vanguard', 'fidelity', 'robinhood', 'coinbase', 'etrade', 'dividend'],
};

aiRoutes.post('/parse-statement', (req: Request, res: Response) => {
  const { statementText } = req.body;
  if (!statementText || typeof statementText !== 'string') {
    res.status(400).json({ success: false, message: 'statementText is required' });
    return;
  }

  const transactions: Array<{ date: string; description: string; amount: number; type: 'debit' | 'credit'; category: string }> = [];
  const linePattern = /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\s+(.+?)\s+([+-]?[$₹€£]?\s*\d+[.,]\d{2})\s*(CR|DR)?/i;

  for (const line of statementText.split(/\r?\n/)) {
    const m = line.trim().match(linePattern);
    if (m) {
      const dateStr = m[1];
      const rawDesc = m[2].trim();
      const rawAmtStr = m[3].replace(/[$₹€£\s]/g, '').replace(',', '.');
      const suffix = m[4];

      const amt = parseFloat(rawAmtStr);
      if (!isNaN(amt)) {
        const isDebit = amt < 0 || (suffix && suffix.toUpperCase() === 'DR');
        const finalAmt = Math.abs(amt);

        let category = 'Miscellaneous';
        const lowerDesc = rawDesc.toLowerCase();
        for (const [cat, kws] of Object.entries(STATEMENT_CATEGORIES)) {
          if (kws.some((kw) => lowerDesc.includes(kw))) {
            category = cat;
            break;
          }
        }

        transactions.push({
          date: dateStr,
          description: rawDesc,
          amount: finalAmt,
          type: isDebit ? 'debit' : 'credit',
          category,
        });
      }
    }
  }

  res.json({
    success: true,
    data: {
      totalTransactions: transactions.length,
      transactions,
    },
  });
});

/**
 * 3. POST /api/ai/fitness-plan
 */
aiRoutes.post('/fitness-plan', (req: Request, res: Response) => {
  const { weightKg, heightCm, age, gender, activityLevel = 'moderate', goal = 'muscle_gain', dietaryPreference = 'standard', allergies = [], daysPerWeek = 4 } = req.body;

  const w = Number(weightKg) || 70;
  const h = Number(heightCm) || 175;
  const a = Number(age) || 25;
  const g = String(gender || 'male').toLowerCase();

  // BMR
  const bmr = g === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = Math.round(bmr * (multipliers[activityLevel.toLowerCase()] || 1.55));

  let targetCalories = tdee;
  let pRatio = 0.25;
  let cRatio = 0.5;
  let fRatio = 0.25;

  if (goal === 'fat_loss') {
    targetCalories = tdee - 450;
    pRatio = 0.35;
    cRatio = 0.35;
    fRatio = 0.3;
  } else if (goal === 'muscle_gain') {
    targetCalories = tdee + 350;
    pRatio = 0.3;
    cRatio = 0.45;
    fRatio = 0.25;
  }

  const proteinG = Math.round((targetCalories * pRatio) / 4);
  const carbsG = Math.round((targetCalories * cRatio) / 4);
  const fatG = Math.round((targetCalories * fRatio) / 9);

  const splitName = daysPerWeek >= 4 ? 'Upper / Lower Split (4 Days)' : 'Full Body (3 Days)';

  res.json({
    success: true,
    data: {
      metrics: {
        bmr: Math.round(bmr * 10) / 10,
        tdee,
        targetCalories,
        targetMacros: { proteinG, carbsG, fatG },
      },
      workoutSplit: {
        name: splitName,
        daysPerWeek,
      },
      dailyMeals: [
        { meal: 'Breakfast', recommendation: dietaryPreference.includes('veg') ? 'Oatmeal with chia seeds, banana, and protein' : 'Scrambled eggs with whole-grain toast and avocado' },
        { meal: 'Lunch', recommendation: dietaryPreference.includes('veg') ? 'Tofu/Paneer bowl with quinoa and steamed broccoli' : 'Grilled chicken breast with sweet potato and greens' },
        { meal: 'Dinner', recommendation: dietaryPreference.includes('veg') ? 'Lentil dal with brown rice and spinach' : 'Baked salmon with quinoa and asparagus' },
        { meal: 'Snack', recommendation: 'Handful of almonds with fresh apple' },
      ],
    },
  });
});

/**
 * 4. POST /api/ai/copilot
 */
aiRoutes.post('/copilot', (req: Request, res: Response) => {
  const { message, userContext = {} } = req.body;
  if (!message || typeof message !== 'string') {
    res.status(400).json({ success: false, message: 'message is required' });
    return;
  }

  const text = message.toLowerCase().trim();

  // Expense
  const expMatch = text.match(/(?:spent|paid|bought|cost|expense of)\s*[$₹€£]?\s*(\d+(?:\.\d{1,2})?)\s*(?:on|for)?\s*([a-zA-Z\s]+)?/i);
  if (expMatch) {
    const amount = parseFloat(expMatch[1]);
    const detail = expMatch[2] ? expMatch[2].replace(/^(on|for|at)\s+/i, '').trim() : 'General';
    const remaining = userContext.remainingBudget != null ? userContext.remainingBudget - amount : null;

    res.json({
      success: true,
      data: {
        reply: `Logged expense of $${amount.toFixed(2)} for ${detail}.${remaining != null ? ` Remaining budget is $${remaining.toFixed(2)}.` : ''}`,
        action: {
          actionType: 'LOG_TRANSACTION',
          title: `Log $${amount.toFixed(2)} for ${detail}`,
          payload: { amount, description: detail, category: detail, type: 'DEBIT' },
        },
      },
    });
    return;
  }

  // Workout
  if (/workout|cardio|ran|lifted|gym|squat|bench/i.test(text)) {
    res.json({
      success: true,
      data: {
        reply: 'Workout session recorded to your fitness tracker!',
        action: {
          actionType: 'LOG_WORKOUT',
          title: 'Record Workout Session',
          payload: { rawActivity: message },
        },
      },
    });
    return;
  }

  // General Status
  if (/budget|remaining/i.test(text)) {
    const rem = userContext.remainingBudget || 500;
    res.json({
      success: true,
      data: {
        reply: `You currently have $${rem.toFixed(2)} remaining in this month's budget.`,
        action: null,
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      reply: `Quantra AI Co-pilot: I am ready to process receipts, track expenses, log workouts, or update your targets!`,
      action: null,
    },
  });
});
