import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { SCHEMA_SQL } from './schema.ts';

type Database = any;
type SqlJsStatic = any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'finpulse.sqlite');

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Persists the in-memory SQLite database to disk
 */
export function persistDatabase(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist database to disk:', err);
  }
}

/**
 * Execute parameterized query returning array of rows
 */
export function queryAll<T = Record<string, any>>(sql: string, params: any[] = []): T[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  if (params && params.length > 0) {
    stmt.bind(params);
  }
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return rows;
}

/**
 * Execute parameterized query returning single row or null
 */
export function queryOne<T = Record<string, any>>(sql: string, params: any[] = []): T | null {
  const rows = queryAll<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute parameterized mutation and auto-persist
 */
export function run(sql: string, params: any[] = []): void {
  if (!db) throw new Error('Database not initialized');
  if (params && params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
  } else {
    db.run(sql);
  }
  persistDatabase();
}

/**
 * Seeds demo data for a user
 */
export function seedUserData(userId: string): void {
  // 1. Assets
  const assets = [
    {
      id: `ast_1_${userId}`,
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      category: 'EQUITY',
      quantity: 45,
      averageBuyPrice: 28.5,
      currentMarketPrice: 34.8,
      currency: 'USD',
      institution: 'Zerodha',
      expectedReturnRate: 14.5,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_2_${userId}`,
      symbol: 'TCS',
      name: 'Tata Consultancy Services',
      category: 'EQUITY',
      quantity: 30,
      averageBuyPrice: 42.0,
      currentMarketPrice: 48.2,
      currency: 'USD',
      institution: 'Zerodha',
      expectedReturnRate: 13.0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_3_${userId}`,
      symbol: 'PPFAS',
      name: 'Parag Parikh Flexi Cap Fund',
      category: 'MUTUAL_FUNDS',
      quantity: 120,
      averageBuyPrice: 22.0,
      currentMarketPrice: 29.4,
      currency: 'USD',
      institution: 'Groww',
      expectedReturnRate: 15.2,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_4_${userId}`,
      symbol: 'HDFC_FD',
      name: 'HDFC Bank Term Deposit',
      category: 'FIXED_DEPOSIT',
      quantity: 1,
      averageBuyPrice: 1183.43,
      currentMarketPrice: 1183.43,
      currency: 'USD',
      institution: 'HDFC Bank',
      expectedReturnRate: 7.25,
      maturityDate: '2027-04-15',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_5_${userId}`,
      symbol: 'SGB_2028',
      name: 'Sovereign Gold Bonds 2028',
      category: 'GOLD_SGB',
      quantity: 15,
      averageBuyPrice: 65.0,
      currentMarketPrice: 88.5,
      currency: 'USD',
      institution: 'RBI / Zerodha',
      expectedReturnRate: 9.5,
      maturityDate: '2028-11-20',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_6_${userId}`,
      symbol: 'BLR_APT',
      name: 'Whitefield 3BHK Apartment',
      category: 'REAL_ESTATE',
      quantity: 1,
      averageBuyPrice: 142011.83,
      currentMarketPrice: 165680.47,
      currency: 'USD',
      institution: 'Prestige Group',
      expectedReturnRate: 8.0,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_7_${userId}`,
      symbol: 'EPF_GOV',
      name: 'Employee Provident Fund (EPFO)',
      category: 'RETIREMENT_PPF',
      quantity: 1,
      averageBuyPrice: 17751.48,
      currentMarketPrice: 19526.63,
      currency: 'USD',
      institution: 'EPFO India',
      expectedReturnRate: 8.25,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: `ast_8_${userId}`,
      symbol: 'EMERGENCY_CASH',
      name: 'ICICI Instant Savings Account',
      category: 'LIQUID_CASH',
      quantity: 1,
      averageBuyPrice: 5917.16,
      currentMarketPrice: 5917.16,
      currency: 'USD',
      institution: 'ICICI Bank',
      expectedReturnRate: 3.5,
      lastUpdated: new Date().toISOString(),
    },
  ];

  for (const a of assets) {
    run(
      `INSERT OR REPLACE INTO assets 
       (id, user_id, symbol, name, category, quantity, average_buy_price, current_market_price, currency, institution, expected_return_rate, maturity_date, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        a.id,
        userId,
        a.symbol,
        a.name,
        a.category,
        a.quantity,
        a.averageBuyPrice,
        a.currentMarketPrice,
        a.currency,
        a.institution,
        a.expectedReturnRate,
        a.maturityDate || null,
        a.lastUpdated,
      ]
    );
  }

  // 2. Transactions
  const transactions = [
    {
      id: `tx_1_${userId}`,
      assetId: `ast_1_${userId}`,
      assetSymbol: 'RELIANCE',
      assetName: 'Reliance Industries Ltd',
      category: 'EQUITY',
      type: 'BUY',
      quantity: 20,
      pricePerUnit: 28.5,
      totalAmount: 570.0,
      date: '2026-10-15',
      platform: 'Zerodha',
      notes: 'Monthly SIP allocation',
    },
    {
      id: `tx_2_${userId}`,
      assetId: `ast_3_${userId}`,
      assetSymbol: 'PPFAS',
      assetName: 'Parag Parikh Flexi Cap Fund',
      category: 'MUTUAL_FUNDS',
      type: 'SIP',
      quantity: 40,
      pricePerUnit: 22.0,
      totalAmount: 880.0,
      date: '2026-10-10',
      platform: 'Groww',
      notes: 'Automated 10th of month SIP',
    },
    {
      id: `tx_3_${userId}`,
      assetId: `ast_2_${userId}`,
      assetSymbol: 'TCS',
      assetName: 'Tata Consultancy Services',
      category: 'EQUITY',
      type: 'DIVIDEND',
      quantity: 30,
      pricePerUnit: 0.8,
      totalAmount: 24.0,
      date: '2026-09-28',
      platform: 'Zerodha',
      notes: 'Interim Dividend payout',
    },
  ];

  for (const t of transactions) {
    run(
      `INSERT OR REPLACE INTO transactions 
       (id, user_id, asset_id, asset_symbol, asset_name, category, type, quantity, price_per_unit, total_amount, date, platform, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id,
        userId,
        t.assetId,
        t.assetSymbol,
        t.assetName,
        t.category,
        t.type,
        t.quantity,
        t.pricePerUnit,
        t.totalAmount,
        t.date,
        t.platform,
        t.notes,
      ]
    );
  }

  // 3. Debts & Repayments
  const debts = [
    {
      id: `dbt_1_${userId}`,
      title: 'HDFC Smart Home Loan',
      category: 'HOME_LOAN',
      lender: 'HDFC Bank',
      originalPrincipal: 76923.08,
      currentOutstanding: 61538.46,
      interestRate: 8.5,
      monthlyEmi: 668.64,
      emiDueDay: 5,
      startDate: '2022-04-10',
      tenureMonths: 240,
      notes: 'Flat 402 Bangalore property loan. Tax deductible u/s 24(b) & 80C.',
      repayments: [
        {
          id: `rep_1_${userId}`,
          amount: 668.64,
          date: '2026-10-05',
          type: 'REGULAR_EMI',
          notes: 'Auto-debit from salary account',
        },
        {
          id: `rep_2_${userId}`,
          amount: 2366.86,
          date: '2026-08-15',
          type: 'LUMP_SUM_PREPAYMENT',
          notes: 'Bonus prepayment towards principal',
        },
      ],
    },
    {
      id: `dbt_2_${userId}`,
      title: 'ICICI Car Loan (EV SUV)',
      category: 'AUTO_LOAN',
      lender: 'ICICI Bank',
      originalPrincipal: 17751.48,
      currentOutstanding: 8875.74,
      interestRate: 8.9,
      monthlyEmi: 372.78,
      emiDueDay: 10,
      startDate: '2023-09-15',
      tenureMonths: 60,
      notes: 'Electric vehicle loan at special green interest rate.',
      repayments: [
        {
          id: `rep_3_${userId}`,
          amount: 372.78,
          date: '2026-10-10',
          type: 'REGULAR_EMI',
          notes: 'Standard monthly installment',
        },
      ],
    },
  ];

  for (const d of debts) {
    run(
      `INSERT OR REPLACE INTO debts 
       (id, user_id, title, category, lender, original_principal, current_outstanding, interest_rate, monthly_emi, emi_due_day, start_date, tenure_months, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.id,
        userId,
        d.title,
        d.category,
        d.lender,
        d.originalPrincipal,
        d.currentOutstanding,
        d.interestRate,
        d.monthlyEmi,
        d.emiDueDay,
        d.startDate,
        d.tenureMonths,
        d.notes,
      ]
    );

    for (const r of d.repayments) {
      run(
        `INSERT OR REPLACE INTO debt_repayments
         (id, debt_id, user_id, amount, date, type, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [r.id, d.id, userId, r.amount, r.date, r.type, r.notes]
      );
    }
  }

  // 4. Insurance Policies
  const policies = [
    {
      id: `pol_1_${userId}`,
      policyName: 'HDFC Life Click 2 Protect Super',
      type: 'TERM_LIFE',
      provider: 'HDFC Life',
      policyNumber: 'HD-982144-X',
      sumAssured: 236686.39,
      annualPremium: 331.36,
      renewalDueDate: '2027-03-15',
      coveredMembers: 'Self (Varun S T)',
      status: 'ACTIVE',
      cashlessHospitalsCount: 0,
      tpaHelpline: '1800-266-9777',
      notes: 'Term life cover up to age 65 with accidental death rider.',
    },
    {
      id: `pol_2_${userId}`,
      policyName: 'Star Health Family Optima Floater',
      type: 'HEALTH_FLOATER',
      provider: 'Star Health & Allied',
      policyNumber: 'SH-551029-B',
      sumAssured: 29585.8,
      annualPremium: 402.37,
      renewalDueDate: '2026-11-20',
      coveredMembers: 'Self + Spouse + Child',
      status: 'DUE_SOON',
      cashlessHospitalsCount: 14200,
      tpaHelpline: '1800-425-2255',
      notes: '₹25L Comprehensive health insurance covering 14,000+ network hospitals.',
    },
  ];

  for (const p of policies) {
    run(
      `INSERT OR REPLACE INTO policies
       (id, user_id, policy_name, type, provider, policy_number, sum_assured, annual_premium, renewal_due_date, covered_members, status, cashless_hospitals_count, tpa_helpline, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        userId,
        p.policyName,
        p.type,
        p.provider,
        p.policyNumber,
        p.sumAssured,
        p.annualPremium,
        p.renewalDueDate,
        p.coveredMembers,
        p.status,
        p.cashlessHospitalsCount,
        p.tpaHelpline,
        p.notes,
      ]
    );
  }

  // 5. Life Goals
  const goals = [
    {
      id: `goal_1_${userId}`,
      title: 'FIRE Early Retirement by 48',
      category: 'RETIREMENT_FIRE',
      targetAmount: 591715.98,
      targetDate: '2036-12-31',
      currentSaved: 165680.47,
      monthlyContribution: 946.75,
      priority: 'HIGH',
      inflationRate: 6.5,
      expectedReturnRate: 12.0,
      notes: 'Target ₹5.00 Cr liquid corpus yielding ₹1.8L/mo inflation-adjusted passive income.',
    },
    {
      id: `goal_2_${userId}`,
      title: 'Aarav Overseas College Fund',
      category: 'CHILD_EDUCATION',
      targetAmount: 118343.2,
      targetDate: '2034-06-30',
      currentSaved: 35502.96,
      monthlyContribution: 473.37,
      priority: 'HIGH',
      inflationRate: 9.0,
      expectedReturnRate: 12.5,
      notes: 'Undergraduate tuition & living costs abroad (US/UK/Singapore).',
    },
    {
      id: `goal_3_${userId}`,
      title: 'Coorg Coffee Estate Villa',
      category: 'HOME_PURCHASE',
      targetAmount: 94674.56,
      targetDate: '2029-03-31',
      currentSaved: 29585.8,
      monthlyContribution: 591.72,
      priority: 'MEDIUM',
      inflationRate: 6.0,
      expectedReturnRate: 11.0,
      notes: 'Down payment for 3-acre homestay / vacation villa in Madikeri.',
    },
    {
      id: `goal_4_${userId}`,
      title: 'Europe 6-Month Sabbatical',
      category: 'LUXURY_VACATION',
      targetAmount: 17751.48,
      targetDate: '2027-08-31',
      currentSaved: 10650.89,
      monthlyContribution: 355.03,
      priority: 'LOW',
      inflationRate: 7.0,
      expectedReturnRate: 9.5,
      notes: 'Family road trip and remote work sabbatical across Portugal, Alps & Scandinavia.',
    },
  ];

  for (const g of goals) {
    run(
      `INSERT OR REPLACE INTO goals
       (id, user_id, title, category, target_amount, target_date, current_saved, monthly_contribution, priority, inflation_rate, expected_return_rate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        g.id,
        userId,
        g.title,
        g.category,
        g.targetAmount,
        g.targetDate,
        g.currentSaved,
        g.monthlyContribution,
        g.priority,
        g.inflationRate,
        g.expectedReturnRate,
        g.notes,
      ]
    );
  }

  // 6. Calendar Events
  const events = [
    {
      id: `evt_1_${userId}`,
      title: 'Star Health Insurance Premium Renewal',
      date: '2026-11-20',
      type: 'PLANNED_EXPENSE',
      amount: 402.37,
      categoryName: 'Insurance Protection',
      notes: 'Annual floater renewal before due date',
    },
    {
      id: `evt_2_${userId}`,
      title: 'Monthly SIP Auto-Debit (PPFAS & Nifty)',
      date: '2026-11-10',
      type: 'PLANNED_INVESTMENT',
      amount: 710.06,
      categoryName: 'Mutual Funds SIP',
      notes: 'Auto-debit from primary account',
    },
    {
      id: `evt_3_${userId}`,
      title: 'Salary Credit - Tech Lead Compensation',
      date: '2026-10-31',
      type: 'EXPECTED_INCOME',
      amount: 4260.36,
      categoryName: 'Monthly Salary',
      notes: 'Net salary credit',
    },
  ];

  for (const e of events) {
    run(
      `INSERT OR REPLACE INTO calendar_events
       (id, user_id, title, date, type, amount, category_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [e.id, userId, e.title, e.date, e.type, e.amount, e.categoryName, e.notes]
    );
  }

  // 7. User Settings
  run(
    `INSERT OR REPLACE INTO user_settings (user_id, currency, emergency_target_months)
     VALUES (?, 'INR', 6)`,
    [userId]
  );

  // 8. LifeOS Tasks
  const initialTasks = [
    {
      id: `tsk_1_${userId}`,
      title: 'Workout session',
      time: '7:00 AM',
      category: 'WELLNESS',
      priority: 'HIGH',
      status: 'TODO',
      badgeLabel: 'Planned',
      notes: 'Full-body movement and mobility · 30 minutes',
      iconSymbol: '♡',
    },
    {
      id: `tsk_2_${userId}`,
      title: 'Review monthly spending',
      time: '1:00 PM',
      category: 'FINANCE',
      priority: 'MEDIUM',
      status: 'TODO',
      badgeLabel: 'To do',
      notes: 'Check transactions, mutual fund SIPs, and upcoming bills',
      iconSymbol: '₹',
    },
    {
      id: `tsk_3_${userId}`,
      title: 'Learning milestone',
      time: '4:30 PM',
      category: 'LEARNING',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      badgeLabel: 'In progress',
      notes: 'Complete the next system architecture chapter',
      iconSymbol: '▧',
    },
    {
      id: `tsk_4_${userId}`,
      title: 'Hydration goal (2.5L)',
      time: '6:00 PM',
      category: 'WELLNESS',
      priority: 'LOW',
      status: 'TODO',
      badgeLabel: 'In progress',
      notes: 'Drink 4 full bottles of water today',
      iconSymbol: '◒',
    },
    {
      id: `tsk_5_${userId}`,
      title: 'Daily check-in & reflection',
      time: '8:30 PM',
      category: 'PRODUCTIVITY',
      priority: 'LOW',
      status: 'TODO',
      badgeLabel: 'Planned',
      notes: 'Record nutrition estimates, gratitude, and wrap up today',
      iconSymbol: '↻',
    },
  ];

  for (const t of initialTasks) {
    run(
      `INSERT OR REPLACE INTO tasks
       (id, user_id, title, time, category, priority, status, badge_label, icon_symbol, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, userId, t.title, t.time, t.category, t.priority, t.status, t.badgeLabel, t.iconSymbol, t.notes]
    );
  }

  // 9. LifeOS Wellness Log
  const todayStr = new Date().toISOString().split('T')[0];
  run(
    `INSERT OR REPLACE INTO wellness_logs
     (id, user_id, date, height_cm, weight_kg, target_weight_kg, workout_minutes, calories_logged, calories_target, water_liters, water_target_liters, sleep_hours, notes)
     VALUES (?, ?, ?, 175, 74.0, 70.0, 45, 1650, 2200, 1.8, 2.5, 7.5, 'Regular calibration')`,
    [`well_${userId}_${todayStr}`, userId, todayStr]
  );

  // 10. LifeOS Learning Items
  const learningItems = [
    {
      id: `lrn_1_${userId}`,
      title: 'Full-Stack Distributed Systems',
      field: 'Engineering',
      progressPercent: 68,
      hoursSpent: 34,
      targetHours: 50,
      status: 'IN_PROGRESS',
      notes: 'Node.js, PostgreSQL, Distributed Caching & Event Sinks',
    },
    {
      id: `lrn_2_${userId}`,
      title: 'Advanced Personal Portfolio Management',
      field: 'Finance',
      progressPercent: 45,
      hoursSpent: 18,
      targetHours: 40,
      status: 'IN_PROGRESS',
      notes: 'Asset allocation theory, Beta hedged portfolios, Bond yields',
    },
  ];

  for (const l of learningItems) {
    run(
      `INSERT OR REPLACE INTO learning_items
       (id, user_id, title, field, progress_percent, hours_spent, target_hours, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [l.id, userId, l.title, l.field, l.progressPercent, l.hoursSpent, l.targetHours, l.status, l.notes]
    );
  }

  // 11. LifeOS Documents
  const initialDocuments = [
    {
      id: `doc_1_${userId}`,
      title: 'Indian Passport (10-Year)',
      category: 'ID_CARD',
      documentNumber: 'Z9874521',
      expiryDate: '2031-08-14',
      status: 'ACTIVE',
      authority: 'Ministry of External Affairs, India',
      notes: 'Original in home safe',
    },
    {
      id: `doc_2_${userId}`,
      title: 'Comprehensive Health Card',
      category: 'INSURANCE',
      documentNumber: 'HDFC-ERGO-98742',
      expiryDate: '2027-02-15',
      status: 'ACTIVE',
      authority: 'HDFC ERGO General Insurance',
      notes: 'Cashless hospital emergency e-card',
    },
  ];

  for (const d of initialDocuments) {
    run(
      `INSERT OR REPLACE INTO documents
       (id, user_id, title, category, document_number, expiry_date, status, authority, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, userId, d.title, d.category, d.documentNumber, d.expiryDate, d.status, d.authority, d.notes]
    );
  }

  // 12. Workout Sessions & Sets (Phase 2)
  const initialSessionId = `wsess_demo_1`;
  run(
    `INSERT OR REPLACE INTO workout_sessions
     (id, user_id, date, split_name, duration_minutes, total_tonnage, total_sets, notes)
     VALUES (?, ?, ?, 'Push (Chest & Triceps)', 45, 3420, 9, 'Heavy bench day with controlled eccentric')`,
    [initialSessionId, userId, todayStr]
  );

  const initialSets = [
    { exId: 'barbell_bench', name: 'Barbell Flat Bench Press', muscle: 'Chest', setNum: 1, weight: 60, reps: 10, rpe: 7 },
    { exId: 'barbell_bench', name: 'Barbell Flat Bench Press', muscle: 'Chest', setNum: 2, weight: 70, reps: 8, rpe: 8 },
    { exId: 'barbell_bench', name: 'Barbell Flat Bench Press', muscle: 'Chest', setNum: 3, weight: 75, reps: 6, rpe: 9 },
    { exId: 'incline_dumbbell', name: 'Incline DB Press', muscle: 'Upper Chest', setNum: 1, weight: 24, reps: 10, rpe: 7.5 },
    { exId: 'incline_dumbbell', name: 'Incline DB Press', muscle: 'Upper Chest', setNum: 2, weight: 26, reps: 8, rpe: 8.5 },
    { exId: 'tricep_rope', name: 'Tricep Rope Pushdown', muscle: 'Triceps', setNum: 1, weight: 25, reps: 12, rpe: 7 },
  ];

  for (let idx = 0; idx < initialSets.length; idx++) {
    const s = initialSets[idx];
    run(
      `INSERT OR REPLACE INTO workout_sets
       (id, session_id, user_id, exercise_id, exercise_name, muscle_group, set_number, weight_kg, reps, rpe)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`wset_${initialSessionId}_${idx}`, initialSessionId, userId, s.exId, s.name, s.muscle, s.setNum, s.weight, s.reps, s.rpe]
    );
  }

  // 13. Nutrition Meal Logs (Phase 3)
  const initialMeals = [
    { id: `meal_1_${userId}`, type: 'BREAKFAST', name: 'Steel-Cut Oats with Whey, Chia & Blueberries', cal: 480, p: 38, c: 54, f: 12, desc: '1 bowl with 1 scoop whey' },
    { id: `meal_2_${userId}`, type: 'LUNCH', name: 'Grilled Herb Chicken Breast with Quinoa & Steamed Greens', cal: 620, p: 52, c: 50, f: 16, desc: '200g chicken breast + 150g quinoa' },
    { id: `meal_3_${userId}`, type: 'SNACK', name: 'Greek Yogurt with Crushed Walnuts & Honey', cal: 260, p: 20, c: 18, f: 10, desc: '1 cup Greek yogurt' },
  ];

  for (const m of initialMeals) {
    run(
      `INSERT OR REPLACE INTO meal_logs
       (id, user_id, date, meal_type, name, calories, protein_grams, carbs_grams, fat_grams, portion_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [m.id, userId, todayStr, m.type, m.name, m.cal, m.p, m.c, m.f, m.desc]
    );
  }

  // 14. Habits & Routines (Phase 4)
  const initialHabits = [
    { id: `hab_1_${userId}`, title: 'Morning Hydration (750ml) & Mobility Flow', cat: 'MORNING', streak: 14, icon: '💧' },
    { id: `hab_2_${userId}`, title: 'Deep Work Focus Block (No Slack/Phone)', cat: 'AFTERNOON', streak: 8, icon: '🧠' },
    { id: `hab_3_${userId}`, title: 'Evening Spending & Portfolio Log', cat: 'EVENING', streak: 21, icon: '📊' },
    { id: `hab_4_${userId}`, title: 'Nightly Reflection & Sleep Wind-down', cat: 'EVENING', streak: 12, icon: '🌙' },
  ];

  for (const h of initialHabits) {
    run(
      `INSERT OR REPLACE INTO habits
       (id, user_id, title, category, streak_count, last_completed_date, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [h.id, userId, h.title, h.cat, h.streak, todayStr, h.icon]
    );
  }

  // 15. Focus Sessions (Phase 4)
  run(
    `INSERT OR REPLACE INTO focus_sessions
     (id, user_id, duration_minutes, session_type, task_title, date)
     VALUES (?, ?, 50, 'DEEP_WORK', 'System Architecture & SQLite Schema Design', ?)`,
    [`foc_1_${userId}`, userId, todayStr]
  );

  // 16. Learning Books & Courses (Phase 5)
  const initialBooks = [
    { id: `bk_1_${userId}`, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', cat: 'Distributed Systems', curPage: 290, totPage: 560, status: 'IN_PROGRESS', rating: 5, notes: 'Key insights on partitioning and replication lag' },
    { id: `bk_2_${userId}`, title: 'The Intelligent Investor', author: 'Benjamin Graham', cat: 'Value Investing', curPage: 340, totPage: 340, status: 'COMPLETED', rating: 5, notes: 'Margin of safety & Mr. Market mindset' },
    { id: `bk_3_${userId}`, title: 'Outlive: The Science and Art of Longevity', author: 'Dr. Peter Attia', cat: 'Health & Longevity', curPage: 180, totPage: 496, status: 'IN_PROGRESS', rating: 5, notes: 'Zone 2 cardio and VO2 max importance' },
  ];

  for (const b of initialBooks) {
    run(
      `INSERT OR REPLACE INTO learning_books
       (id, user_id, title, author, category, current_page, total_pages, status, rating, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, userId, b.title, b.author, b.cat, b.curPage, b.totPage, b.status, b.rating, b.notes]
    );
  }

  // 17. Emergency Profile (Phase 6)
  run(
    `INSERT OR REPLACE INTO emergency_info
     (user_id, blood_group, allergies, medical_conditions, primary_contact_name, primary_contact_phone, primary_contact_relation, secondary_contact_name, secondary_contact_phone, physician_name, physician_phone, tpa_helpline, notes)
     VALUES (?, 'O+ Positive', 'Penicillin (mild rash)', 'None reported', 'Jane S T', '+91 98765 11223', 'Spouse', 'Senior Varun', '+91 98765 44332', 'Dr. Arvind Sharma (MD Cardiology)', '+91 80 4123 4567', '1800-102-4477 (HDFC ERGO Cashless)', 'Emergency ID and insurance cards located in LifeOS Document Vault')`,
    [userId]
  );

  // 18. Recurring Admin Checklists (Phase 6)
  const initialChecklists = [
    { id: `chk_1_${userId}`, title: 'Income Tax Return (ITR-2) Filing', freq: 'ANNUAL', dueDate: '2027-07-31', isComp: 0, cat: 'TAX' },
    { id: `chk_2_${userId}`, title: 'Vehicle Comprehensive Insurance Renewal', freq: 'ANNUAL', dueDate: '2027-03-15', isComp: 0, cat: 'VEHICLE' },
    { id: `chk_3_${userId}`, title: 'Quarterly Net Worth & Asset Rebalance', freq: 'QUARTERLY', dueDate: '2026-12-31', isComp: 1, cat: 'FINANCE' },
    { id: `chk_4_${userId}`, title: 'Annual Full-Body Health Checkup & Blood Panel', freq: 'ANNUAL', dueDate: '2027-04-10', isComp: 0, cat: 'HEALTH' },
  ];

  for (const c of initialChecklists) {
    run(
      `INSERT OR REPLACE INTO admin_checklists
       (id, user_id, title, frequency, due_date, is_completed, category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, userId, c.title, c.freq, c.dueDate, c.isComp, c.cat]
    );
  }
}

/**
 * Clear all portfolio data for a user (fresh 0-balance clean slate)
 */
export function clearUserData(userId: string): void {
  run('DELETE FROM assets WHERE user_id = ?', [userId]);
  run('DELETE FROM transactions WHERE user_id = ?', [userId]);
  run('DELETE FROM debts WHERE user_id = ?', [userId]);
  run('DELETE FROM debt_repayments WHERE user_id = ?', [userId]);
  run('DELETE FROM policies WHERE user_id = ?', [userId]);
  run('DELETE FROM goals WHERE user_id = ?', [userId]);
  run('DELETE FROM calendar_events WHERE user_id = ?', [userId]);
  run('DELETE FROM expenses WHERE user_id = ?', [userId]);
  run('DELETE FROM incomes WHERE user_id = ?', [userId]);
  run('DELETE FROM tasks WHERE user_id = ?', [userId]);
  run('DELETE FROM wellness_logs WHERE user_id = ?', [userId]);
  run('DELETE FROM learning_items WHERE user_id = ?', [userId]);
  run('DELETE FROM documents WHERE user_id = ?', [userId]);
  run('DELETE FROM user_blueprint WHERE user_id = ?', [userId]);
  run('DELETE FROM workout_sessions WHERE user_id = ?', [userId]);
  run('DELETE FROM workout_sets WHERE user_id = ?', [userId]);
  run('DELETE FROM meal_logs WHERE user_id = ?', [userId]);
  run('DELETE FROM habits WHERE user_id = ?', [userId]);
  run('DELETE FROM focus_sessions WHERE user_id = ?', [userId]);
  run('DELETE FROM learning_books WHERE user_id = ?', [userId]);
  run('DELETE FROM emergency_info WHERE user_id = ?', [userId]);
  run('DELETE FROM admin_checklists WHERE user_id = ?', [userId]);
}

/**
 * Initializes sql.js Database engine, runs schema, and ensures demo user exists
 */
export async function initDatabase(): Promise<Database> {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      console.log(`[Database] Loaded persistent SQLite database from: ${DB_FILE}`);
    } catch (err) {
      console.warn('[Database] Failed to read existing SQLite file, creating fresh database...', err);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log(`[Database] Initialized new in-memory SQLite database.`);
  }

  // Execute schema tables
  db.run(SCHEMA_SQL);

  // Check if demo user exists, if not create and seed
  const demoUser = queryOne('SELECT id FROM users WHERE id = ?', ['usr_demo']);
  if (!demoUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('demo1234', salt);

    run(
      `INSERT INTO users (id, full_name, email, password_hash, phone_number, investor_type, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'usr_demo',
        'Varun S T',
        'varunst26official@gmail.com',
        hash,
        '+91 98765 43210',
        'HNI',
        'March 2024',
      ]
    );

    // Seed demo data
    seedUserData('usr_demo');
    console.log('[Database] Seeded initial demo user and wealth portfolio.');
  } else {
    // If demo user exists but tasks or workout tables are empty, seed defaults
    const workoutCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM workout_sessions WHERE user_id = ?', ['usr_demo']);
    if (!workoutCount || workoutCount.count === 0) {
      seedUserData('usr_demo');
      console.log('[Database] Seeded full LifeOS Phase 2-6 items for demo user.');
    }
  }

  persistDatabase();
  return db;
}
