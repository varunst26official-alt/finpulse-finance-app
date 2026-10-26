import express, { type Request, type Response } from 'express';
import { queryAll, queryOne, run, clearUserData, seedUserData } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const portfolioRoutes = express.Router();

portfolioRoutes.use(requireAuth);

/**
 * GET /api/portfolio/data
 * Returns the entire synced financial database state for the authenticated user
 */
portfolioRoutes.get('/data', (req: Request, res: Response) => {
  const userId = req.user!.id;

  // 1. Assets
  const assetRows = queryAll<{
    id: string;
    symbol: string;
    name: string;
    category: string;
    quantity: number;
    average_buy_price: number;
    current_market_price: number;
    currency: string;
    institution?: string;
    expected_return_rate?: number;
    maturity_date?: string;
    last_updated: string;
  }>('SELECT * FROM assets WHERE user_id = ? ORDER BY current_market_price * quantity DESC', [userId]);

  const assets = assetRows.map((a) => ({
    id: a.id,
    symbol: a.symbol,
    name: a.name,
    category: a.category,
    quantity: a.quantity,
    averageBuyPrice: a.average_buy_price,
    currentMarketPrice: a.current_market_price,
    currency: a.currency,
    institution: a.institution,
    expectedReturnRate: a.expected_return_rate,
    maturityDate: a.maturity_date,
    lastUpdated: a.last_updated,
  }));

  // 2. Transactions
  const transactionRows = queryAll<{
    id: string;
    asset_id: string;
    asset_symbol: string;
    asset_name: string;
    category: string;
    type: string;
    quantity: number;
    price_per_unit: number;
    total_amount: number;
    date: string;
    platform?: string;
    notes?: string;
  }>('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [userId]);

  const transactions = transactionRows.map((t) => ({
    id: t.id,
    assetId: t.asset_id,
    assetSymbol: t.asset_symbol,
    assetName: t.asset_name,
    category: t.category,
    type: t.type,
    quantity: t.quantity,
    pricePerUnit: t.price_per_unit,
    totalAmount: t.total_amount,
    date: t.date,
    platform: t.platform,
    notes: t.notes,
  }));

  // 3. Debts with repayments
  const debtRows = queryAll<{
    id: string;
    title: string;
    category: string;
    lender: string;
    original_principal: number;
    current_outstanding: number;
    interest_rate: number;
    monthly_emi: number;
    emi_due_day: number;
    start_date: string;
    end_date?: string;
    tenure_months: number;
    notes?: string;
  }>('SELECT * FROM debts WHERE user_id = ? ORDER BY current_outstanding DESC', [userId]);

  const repaymentRows = queryAll<{
    id: string;
    debt_id: string;
    amount: number;
    date: string;
    type: string;
    notes?: string;
  }>('SELECT * FROM debt_repayments WHERE user_id = ? ORDER BY date DESC', [userId]);

  const debts = debtRows.map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category,
    lender: d.lender,
    originalPrincipal: d.original_principal,
    currentOutstanding: d.current_outstanding,
    interestRate: d.interest_rate,
    monthlyEmi: d.monthly_emi,
    emiDueDay: d.emi_due_day,
    startDate: d.start_date,
    endDate: d.end_date,
    tenureMonths: d.tenure_months,
    notes: d.notes,
    repayments: repaymentRows
      .filter((r) => r.debt_id === d.id)
      .map((r) => ({
        id: r.id,
        debtId: r.debt_id,
        amount: r.amount,
        date: r.date,
        type: r.type,
        notes: r.notes,
      })),
  }));

  // 4. Insurance Policies
  const policyRows = queryAll<{
    id: string;
    policy_name: string;
    type: string;
    provider: string;
    policy_number: string;
    sum_assured: number;
    annual_premium: number;
    renewal_due_date: string;
    covered_members: string;
    status: string;
    cashless_hospitals_count: number;
    tpa_helpline?: string;
    notes?: string;
  }>('SELECT * FROM policies WHERE user_id = ? ORDER BY renewal_due_date ASC', [userId]);

  const policies = policyRows.map((p) => ({
    id: p.id,
    policyName: p.policy_name,
    type: p.type,
    provider: p.provider,
    policyNumber: p.policy_number,
    sumAssured: p.sum_assured,
    annualPremium: p.annual_premium,
    renewalDueDate: p.renewal_due_date,
    coveredMembers: p.covered_members,
    status: p.status,
    cashlessHospitalsCount: p.cashless_hospitals_count,
    tpaHelpline: p.tpa_helpline,
    notes: p.notes,
  }));

  // 5. Goals
  const goalRows = queryAll<{
    id: string;
    title: string;
    category: string;
    target_amount: number;
    target_date: string;
    current_saved: number;
    monthly_contribution: number;
    priority: string;
    inflation_rate: number;
    expected_return_rate: number;
    allocated_asset_ids?: string;
    is_achieved: number;
    notes?: string;
  }>('SELECT * FROM goals WHERE user_id = ? ORDER BY target_date ASC', [userId]);

  const goals = goalRows.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    targetAmount: g.target_amount,
    targetDate: g.target_date,
    currentSaved: g.current_saved,
    monthlyContribution: g.monthly_contribution,
    priority: g.priority,
    inflationRate: g.inflation_rate,
    expectedReturnRate: g.expected_return_rate,
    allocatedAssetIds: g.allocated_asset_ids ? JSON.parse(g.allocated_asset_ids) : [],
    isAchieved: Boolean(g.is_achieved),
    notes: g.notes,
  }));

  // 6. Calendar Events
  const eventRows = queryAll<{
    id: string;
    title: string;
    date: string;
    type: string;
    amount: number;
    category_name: string;
    is_completed: number;
    notes?: string;
  }>('SELECT * FROM calendar_events WHERE user_id = ? ORDER BY date ASC', [userId]);

  const calendarEvents = eventRows.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date,
    type: e.type,
    amount: e.amount,
    categoryName: e.category_name,
    isCompleted: Boolean(e.is_completed),
    notes: e.notes,
  }));

  // 7. Settings
  const settings = queryOne<{ currency: string; emergency_target_months: number }>(
    'SELECT currency, emergency_target_months FROM user_settings WHERE user_id = ?',
    [userId]
  );

  res.json({
    success: true,
    data: {
      assets,
      transactions,
      debts,
      policies,
      goals,
      calendarEvents,
      currency: settings?.currency || 'INR',
      emergencyTargetMonths: settings?.emergency_target_months || 6,
    },
  });
});

/**
 * POST /api/portfolio/assets
 * Add a new asset or update holding
 */
portfolioRoutes.post('/assets', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { symbol, name, category, quantity, averageBuyPrice, currentMarketPrice, currency, institution, expectedReturnRate, maturityDate } = req.body;

  if (!symbol || !name || !category || quantity == null || averageBuyPrice == null) {
    res.status(400).json({ success: false, message: 'Missing required asset fields.' });
    return;
  }

  const assetId = `ast_${Date.now()}`;
  const now = new Date().toISOString();

  run(
    `INSERT INTO assets
     (id, user_id, symbol, name, category, quantity, average_buy_price, current_market_price, currency, institution, expected_return_rate, maturity_date, last_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      assetId,
      userId,
      symbol.toUpperCase(),
      name,
      category,
      Number(quantity),
      Number(averageBuyPrice),
      Number(currentMarketPrice || averageBuyPrice),
      currency || 'USD',
      institution || null,
      expectedReturnRate ? Number(expectedReturnRate) : null,
      maturityDate || null,
      now,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Asset recorded successfully in database.',
    assetId,
  });
});

/**
 * DELETE /api/portfolio/assets/:id
 */
portfolioRoutes.delete('/assets/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM assets WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Asset removed.' });
});

/**
 * POST /api/portfolio/reset
 * Resets user's account to a fresh 0-balance portfolio
 */
portfolioRoutes.post('/reset', (req: Request, res: Response) => {
  const userId = req.user!.id;
  clearUserData(userId);
  res.json({ success: true, message: 'Portfolio successfully reset to clean ₹0 slate.' });
});

/**
 * POST /api/portfolio/seed-demo
 * Seeds demo holdings for the current user
 */
portfolioRoutes.post('/seed-demo', (req: Request, res: Response) => {
  const userId = req.user!.id;
  clearUserData(userId);
  seedUserData(userId);
  res.json({ success: true, message: 'Demo data loaded successfully.' });
});
