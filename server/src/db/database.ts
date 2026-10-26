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
  }

  persistDatabase();
  return db;
}
