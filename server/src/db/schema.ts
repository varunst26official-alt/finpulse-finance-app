export const SCHEMA_SQL = `
-- FinPulse SQLite Database Schema
PRAGMA foreign_keys = ON;

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone_number TEXT,
  investor_type TEXT DEFAULT 'RETAIL', -- RETAIL | HNI | INSTITUTIONAL
  joined_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Assets & Investment Holdings
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity REAL NOT NULL,
  average_buy_price REAL NOT NULL, -- USD Base
  current_market_price REAL NOT NULL, -- USD Base
  currency TEXT DEFAULT 'USD',
  institution TEXT,
  expected_return_rate REAL,
  maturity_date TEXT,
  last_updated TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transactions Ledger
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id TEXT,
  asset_symbol TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL, -- BUY | SELL | DIVIDEND | INTEREST | SIP
  quantity REAL NOT NULL,
  price_per_unit REAL NOT NULL,
  total_amount REAL NOT NULL,
  date TEXT NOT NULL,
  platform TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Debts, Loans & Liabilities
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  lender TEXT NOT NULL,
  original_principal REAL NOT NULL,
  current_outstanding REAL NOT NULL,
  interest_rate REAL NOT NULL,
  monthly_emi REAL NOT NULL,
  emi_due_day INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  tenure_months INTEGER NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Debt Repayments Ledger
CREATE TABLE IF NOT EXISTS debt_repayments (
  id TEXT PRIMARY KEY,
  debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- REGULAR_EMI | LUMP_SUM_PREPAYMENT
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insurance Policies
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  sum_assured REAL NOT NULL,
  annual_premium REAL NOT NULL,
  renewal_due_date TEXT NOT NULL,
  covered_members TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  cashless_hospitals_count INTEGER DEFAULT 0,
  tpa_helpline TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Life Goals & Milestone Buckets
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_amount REAL NOT NULL,
  target_date TEXT NOT NULL,
  current_saved REAL NOT NULL DEFAULT 0,
  monthly_contribution REAL NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'HIGH',
  inflation_rate REAL NOT NULL DEFAULT 6.5,
  expected_return_rate REAL NOT NULL DEFAULT 12.0,
  allocated_asset_ids TEXT, -- JSON Array
  is_achieved INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Financial Calendar & Planned Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  category_name TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Expenses & Incomes
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  frequency TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incomes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT NOT NULL,
  date TEXT NOT NULL,
  account TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. User Preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'INR',
  emergency_target_months INTEGER DEFAULT 6,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_repayments_debt ON debt_repayments(debt_id);
CREATE INDEX IF NOT EXISTS idx_policies_user ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_user ON incomes(user_id);
`;
