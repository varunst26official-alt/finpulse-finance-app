import express, { type Request, type Response } from 'express';
import { queryOne, run } from '../db/database.ts';
import { requireAuth } from '../middleware/auth.ts';

export const transactionRoutes = express.Router();

transactionRoutes.use(requireAuth);

/**
 * POST /api/transactions
 * Create a new transaction and update the underlying asset
 */
transactionRoutes.post('/', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    assetId,
    assetSymbol,
    assetName,
    category,
    type,
    quantity,
    pricePerUnit,
    totalAmount,
    date,
    platform,
    notes,
  } = req.body;

  if (!assetSymbol || !type || quantity == null || pricePerUnit == null) {
    res.status(400).json({ success: false, message: 'Missing required transaction fields.' });
    return;
  }

  const txId = `tx_${Date.now()}`;
  const computedTotal = totalAmount != null ? Number(totalAmount) : Number(quantity) * Number(pricePerUnit);
  const txDate = date || new Date().toISOString().split('T')[0];

  run(
    `INSERT INTO transactions
     (id, user_id, asset_id, asset_symbol, asset_name, category, type, quantity, price_per_unit, total_amount, date, platform, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      txId,
      userId,
      assetId || null,
      assetSymbol.toUpperCase(),
      assetName || assetSymbol,
      category || 'EQUITY',
      type,
      Number(quantity),
      Number(pricePerUnit),
      computedTotal,
      txDate,
      platform || null,
      notes || null,
    ]
  );

  // If BUY or SELL and assetId provided, adjust asset quantity
  if (assetId) {
    const existingAsset = queryOne<{ quantity: number; average_buy_price: number }>(
      'SELECT quantity, average_buy_price FROM assets WHERE id = ? AND user_id = ?',
      [assetId, userId]
    );

    if (existingAsset) {
      if (type === 'BUY' || type === 'SIP') {
        const newQty = existingAsset.quantity + Number(quantity);
        const newAvg = (existingAsset.quantity * existingAsset.average_buy_price + computedTotal) / Math.max(1, newQty);
        run('UPDATE assets SET quantity = ?, average_buy_price = ?, last_updated = ? WHERE id = ?', [
          newQty,
          newAvg,
          new Date().toISOString(),
          assetId,
        ]);
      } else if (type === 'SELL') {
        const newQty = Math.max(0, existingAsset.quantity - Number(quantity));
        run('UPDATE assets SET quantity = ?, last_updated = ? WHERE id = ?', [
          newQty,
          new Date().toISOString(),
          assetId,
        ]);
      }
    }
  }

  res.status(201).json({
    success: true,
    message: 'Transaction saved and portfolio adjusted.',
    transactionId: txId,
  });
});

/**
 * DELETE /api/transactions/:id
 */
transactionRoutes.delete('/:id', (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
  res.json({ success: true, message: 'Transaction deleted.' });
});
