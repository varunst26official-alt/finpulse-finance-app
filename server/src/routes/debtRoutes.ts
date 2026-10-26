import express, { type Request, type Response } from 'express';
import { queryOne, run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const debtRoutes = express.Router();

debtRoutes.use(requireAuth);

/**
 * POST /api/debts
 * Create a new debt/loan record
 */
debtRoutes.post('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    title,
    category,
    lender,
    originalPrincipal,
    currentOutstanding,
    interestRate,
    monthlyEmi,
    emiDueDay,
    startDate,
    endDate,
    tenureMonths,
    notes,
  } = req.body;

  if (!title || !category || !lender || originalPrincipal == null || interestRate == null || monthlyEmi == null) {
    res.status(400).json({ success: false, message: 'Missing required debt/loan fields.' });
    return;
  }

  const debtId = `dbt_${Date.now()}`;

  run(
    `INSERT INTO debts
     (id, user_id, title, category, lender, original_principal, current_outstanding, interest_rate, monthly_emi, emi_due_day, start_date, end_date, tenure_months, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      debtId,
      userId,
      title,
      category,
      lender,
      Number(originalPrincipal),
      Number(currentOutstanding != null ? currentOutstanding : originalPrincipal),
      Number(interestRate),
      Number(monthlyEmi),
      Number(emiDueDay || 1),
      startDate || new Date().toISOString().split('T')[0],
      endDate || null,
      Number(tenureMonths || 60),
      notes || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Debt/Loan record created in database.',
    debtId,
  });
});

/**
 * POST /api/debts/:id/repay
 * Record an EMI or prepayment towards a debt and reduce current balance
 */
debtRoutes.post('/:id/repay', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { amount, date, type, notes } = req.body;

  if (amount == null || Number(amount) <= 0) {
    res.status(400).json({ success: false, message: 'Valid repayment amount is required.' });
    return;
  }

  const debt = queryOne<{ current_outstanding: number }>(
    'SELECT current_outstanding FROM debts WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (!debt) {
    res.status(404).json({ success: false, message: 'Debt liability not found.' });
    return;
  }

  const repaymentId = `rep_${Date.now()}`;
  const repayDate = date || new Date().toISOString().split('T')[0];
  const repayType = type || 'REGULAR_EMI';
  const payAmount = Number(amount);

  // Insert into repayments ledger
  run(
    `INSERT INTO debt_repayments (id, debt_id, user_id, amount, date, type, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [repaymentId, id, userId, payAmount, repayDate, repayType, notes || null]
  );

  // Reduce outstanding balance
  const updatedBalance = Math.max(0, debt.current_outstanding - payAmount);
  run('UPDATE debts SET current_outstanding = ? WHERE id = ?', [updatedBalance, id]);

  res.json({
    success: true,
    message: 'Repayment recorded and outstanding balance updated.',
    repaymentId,
    newOutstandingBalance: updatedBalance,
  });
});

/**
 * DELETE /api/debts/:id
 */
debtRoutes.delete('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM debt_repayments WHERE debt_id = ? AND user_id = ?', [id, userId]);
  run('DELETE FROM debts WHERE id = ? AND user_id = ?', [id, userId]);

  res.json({ success: true, message: 'Debt record deleted.' });
});
