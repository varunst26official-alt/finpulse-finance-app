import express, { type Request, type Response } from 'express';
import { run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const insuranceRoutes = express.Router();

insuranceRoutes.use(requireAuth);

/**
 * POST /api/policies
 * Register a new insurance policy
 */
insuranceRoutes.post('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    policyName,
    type,
    provider,
    policyNumber,
    sumAssured,
    annualPremium,
    renewalDueDate,
    coveredMembers,
    status,
    cashlessHospitalsCount,
    tpaHelpline,
    notes,
  } = req.body;

  if (!policyName || !type || !provider || sumAssured == null || annualPremium == null || !renewalDueDate) {
    res.status(400).json({ success: false, message: 'Missing required insurance policy fields.' });
    return;
  }

  const policyId = `pol_${Date.now()}`;

  run(
    `INSERT INTO policies
     (id, user_id, policy_name, type, provider, policy_number, sum_assured, annual_premium, renewal_due_date, covered_members, status, cashless_hospitals_count, tpa_helpline, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      policyId,
      userId,
      policyName,
      type,
      provider,
      policyNumber || `POL-${Date.now().toString().slice(-6)}`,
      Number(sumAssured),
      Number(annualPremium),
      renewalDueDate,
      coveredMembers || 'Self',
      status || 'ACTIVE',
      cashlessHospitalsCount ? Number(cashlessHospitalsCount) : 0,
      tpaHelpline || null,
      notes || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Insurance policy registered in database.',
    policyId,
  });
});

/**
 * PUT /api/policies/:id
 */
insuranceRoutes.put('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { status, renewalDueDate, annualPremium, sumAssured, notes } = req.body;

  run(
    `UPDATE policies
     SET status = COALESCE(?, status),
         renewal_due_date = COALESCE(?, renewal_due_date),
         annual_premium = COALESCE(?, annual_premium),
         sum_assured = COALESCE(?, sum_assured),
         notes = COALESCE(?, notes)
     WHERE id = ? AND user_id = ?`,
    [
      status || null,
      renewalDueDate || null,
      annualPremium ? Number(annualPremium) : null,
      sumAssured ? Number(sumAssured) : null,
      notes || null,
      id,
      userId,
    ]
  );

  res.json({ success: true, message: 'Policy updated.' });
});

/**
 * DELETE /api/policies/:id
 */
insuranceRoutes.delete('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM policies WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Policy removed.' });
});
