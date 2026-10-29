/**
 * Quantra Bank Statement CSV Parser Engine
 * Parses CSV statement exports from HDFC Bank, SBI, ICICI, Axis Bank, and Kotak.
 * Categorizes line items on-device with zero server transmission.
 */

import { ExpenseCategory, PaymentMethod } from '@/types/finance';
import { ParsedTransactionResult } from './smsParserService';

export function parseBankStatementCsv(csvContent: string): ParsedTransactionResult[] {
  const lines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const results: ParsedTransactionResult[] = [];
  let headerIndex = -1;
  let dateCol = -1;
  let descCol = -1;
  let debitCol = -1;
  let creditCol = -1;

  // Identify header row
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const lower = lines[i].toLowerCase();
    if (
      (lower.includes('date') || lower.includes('txn date')) &&
      (lower.includes('narration') || lower.includes('description') || lower.includes('particulars'))
    ) {
      headerIndex = i;
      const headers = lines[i].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
      dateCol = headers.findIndex((h) => h.includes('date'));
      descCol = headers.findIndex((h) => h.includes('narration') || h.includes('description') || h.includes('particulars'));
      debitCol = headers.findIndex((h) => h.includes('withdrawal') || h.includes('debit') || h.includes('dr'));
      creditCol = headers.findIndex((h) => h.includes('deposit') || h.includes('credit') || h.includes('cr'));
      break;
    }
  }

  // Fallback: If header wasn't found by keyword, check if line 0 looks like standard CSV
  if (headerIndex === -1 && lines.length > 0) {
    headerIndex = 0;
    dateCol = 0;
    descCol = 1;
    debitCol = 2;
    creditCol = 3;
  }

  const cleanNum = (val: string | undefined): number => {
    if (!val) return 0;
    const cleaned = val.replace(/["',]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // CSV split taking care of possible quotes
    const cells = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cells.length < 2) continue;

    const dateVal = cells[dateCol] || new Date().toISOString().split('T')[0];
    const narration = cells[descCol] || cells[1] || '';
    if (!narration) continue;

    const debitAmt = debitCol >= 0 ? cleanNum(cells[debitCol]) : 0;
    const creditAmt = creditCol >= 0 ? cleanNum(cells[creditCol]) : 0;

    if (debitAmt === 0 && creditAmt === 0) continue;

    const isDebit = debitAmt > 0;
    const amount = isDebit ? debitAmt : creditAmt;

    // Detect category from narration keywords
    let category: ExpenseCategory = 'OTHER_EXPENSE';
    const lowerNarration = narration.toLowerCase();

    if (/swiggy|zomato|starbucks|mcdonald|food|restaurant|cafe|dine/i.test(lowerNarration)) {
      category = 'FOOD_DINING';
    } else if (/amazon|flipkart|myntra|zara|retail|mart|croma|store/i.test(lowerNarration)) {
      category = 'SHOPPING_LIFESTYLE';
    } else if (/uber|ola|rapido|metro|petrol|fuel|iocl|bpcl|hpcl/i.test(lowerNarration)) {
      category = 'TRAVEL_COMMUTE';
    } else if (/airtel|jio|bescom|electricity|bill|recharge|broadband|water/i.test(lowerNarration)) {
      category = 'UTILITIES_BILLS';
    } else if (/zerodha|groww|upstox|mutual\s*fund|sip|clearing/i.test(lowerNarration)) {
      category = 'OTHER_EXPENSE';
    } else if (/pharmacy|hospital|apollo|1mg|doctor|clinic/i.test(lowerNarration)) {
      category = 'HEALTHCARE_INSURANCE';
    } else if (/netflix|spotify|prime|hotstar|pvr|movie/i.test(lowerNarration)) {
      category = 'ENTERTAINMENT_SUBS';
    } else if (/rent|society|maintenance/i.test(lowerNarration)) {
      category = 'HOUSING_RENT';
    } else if (/emi|loan/i.test(lowerNarration)) {
      category = 'EMI_LOANS';
    }

    // Determine payment method
    let paymentMethod: PaymentMethod = 'NET_BANKING';
    if (/upi|vpa|@/i.test(lowerNarration)) {
      paymentMethod = 'UPI';
    } else if (/pos|ecom|card|visa|master/i.test(lowerNarration)) {
      paymentMethod = 'CREDIT_CARD';
    } else if (/atm|cash/i.test(lowerNarration)) {
      paymentMethod = 'CASH';
    }

    // Extract cleanest merchant label
    let merchant = narration.substring(0, 30);
    const brandMatch = narration.match(
      /\b(SWIGGY|ZOMATO|UBER|OLA|AMAZON|FLIPKART|STARBUCKS|IOCL|APOLLO|BESCOM|INFOSYS|ZERODHA|AIRTEL|NETFLIX|SPOTIFY)\b/i
    );
    if (brandMatch && brandMatch[1]) {
      merchant = brandMatch[1].toUpperCase();
    } else {
      const upiMatch = narration.match(/(?:to|towards|vpa|at)\s+([A-Za-z0-9_\s&.-]+)/i);
      if (upiMatch && upiMatch[1]) {
        merchant = upiMatch[1].trim().split('/')[0].substring(0, 25).toUpperCase();
      }
    }

    results.push({
      id: `stmt-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      rawText: narration,
      amount,
      type: isDebit ? 'DEBIT' : 'CREDIT',
      merchant: merchant.toUpperCase(),
      category,
      paymentMethod,
      date: dateVal,
      confidence: 94,
    });
  }

  return results;
}
