/**
 * Quantra Smart Ingestion Engine - SMS & Notification Parser
 * Calibrated specifically for Indian Banking, UPI, Credit Cards, and Merchant SMS formats.
 * 100% On-Device & Offline-First.
 */

import { ExpenseCategory, PaymentMethod } from '@/types/finance';

export interface ParsedTransactionResult {
  id: string;
  rawText: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT' | 'INVESTMENT_BUY' | 'INVESTMENT_SELL';
  merchant: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  accountRef?: string;
  date: string;
  confidence: number; // 0 - 100
  sourceApp?: string;
  isDuplicate?: boolean;
}

// Category keyword mappings for Indian retail & online commerce
const CATEGORY_MAP: Record<string, ExpenseCategory> = {
  // Food & Dining
  swiggy: 'FOOD_DINING',
  zomato: 'FOOD_DINING',
  eats: 'FOOD_DINING',
  mcdonalds: 'FOOD_DINING',
  starbucks: 'FOOD_DINING',
  dominos: 'FOOD_DINING',
  chaipoint: 'FOOD_DINING',
  restaurant: 'FOOD_DINING',
  cafe: 'FOOD_DINING',

  // Shopping & Lifestyle
  amazon: 'SHOPPING_LIFESTYLE',
  flipkart: 'SHOPPING_LIFESTYLE',
  myntra: 'SHOPPING_LIFESTYLE',
  ajio: 'SHOPPING_LIFESTYLE',
  zara: 'SHOPPING_LIFESTYLE',
  reliance: 'SHOPPING_LIFESTYLE',
  croma: 'SHOPPING_LIFESTYLE',
  blinkit: 'SHOPPING_LIFESTYLE',
  zepto: 'SHOPPING_LIFESTYLE',
  instamart: 'SHOPPING_LIFESTYLE',

  // Travel & Commute
  uber: 'TRAVEL_COMMUTE',
  ola: 'TRAVEL_COMMUTE',
  rapido: 'TRAVEL_COMMUTE',
  irctc: 'TRAVEL_COMMUTE',
  makemytrip: 'TRAVEL_COMMUTE',
  indigo: 'TRAVEL_COMMUTE',
  petrol: 'TRAVEL_COMMUTE',
  fuel: 'TRAVEL_COMMUTE',
  iocl: 'TRAVEL_COMMUTE',
  bpcl: 'TRAVEL_COMMUTE',

  // Utilities & Bills
  bescom: 'UTILITIES_BILLS',
  tneb: 'UTILITIES_BILLS',
  jio: 'UTILITIES_BILLS',
  airtel: 'UTILITIES_BILLS',
  vi: 'UTILITIES_BILLS',
  broadband: 'UTILITIES_BILLS',
  actcorp: 'UTILITIES_BILLS',
  electricity: 'UTILITIES_BILLS',
  water: 'UTILITIES_BILLS',
  gas: 'UTILITIES_BILLS',

  // Healthcare
  apollo: 'HEALTHCARE_INSURANCE',
  pharmeasy: 'HEALTHCARE_INSURANCE',
  '1mg': 'HEALTHCARE_INSURANCE',
  hospital: 'HEALTHCARE_INSURANCE',
  medplus: 'HEALTHCARE_INSURANCE',

  // Entertainment
  netflix: 'ENTERTAINMENT_SUBS',
  spotify: 'ENTERTAINMENT_SUBS',
  prime: 'ENTERTAINMENT_SUBS',
  hotstar: 'ENTERTAINMENT_SUBS',
  pvr: 'ENTERTAINMENT_SUBS',
  inox: 'ENTERTAINMENT_SUBS',
  bookmyshow: 'ENTERTAINMENT_SUBS',
};

/**
 * Main regex & heuristic parser for an Indian banking/UPI SMS
 */
export function parseFinancialSms(smsText: string): ParsedTransactionResult | null {
  const clean = smsText.trim();
  if (!clean || clean.length < 15) return null;

  // 1. Extract Amount (Supports "Rs.", "INR", "Rs ", "INR ")
  const amountRegex = /(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const amountMatch = clean.match(amountRegex);
  if (!amountMatch) return null;

  const rawAmountStr = amountMatch[1].replace(/,/g, '');
  const amount = parseFloat(rawAmountStr);
  if (isNaN(amount) || amount <= 0) return null;

  // 2. Determine Transaction Type (Debit vs Credit vs Investment)
  let type: ParsedTransactionResult['type'] = 'DEBIT';
  if (/credited|received|deposited|refund/i.test(clean)) {
    type = 'CREDIT';
  } else if (/executed\s+buy|bought|credited\s+shares/i.test(clean)) {
    type = 'INVESTMENT_BUY';
  } else if (/executed\s+sell|sold|debited\s+shares/i.test(clean)) {
    type = 'INVESTMENT_SELL';
  }

  // 3. Extract Merchant / VPA / Counterparty
  let merchant = 'Unknown Merchant';
  let confidence = 75;

  // Pattern: "to VPA / at Merchant / towards Purpose"
  const merchantRegex = /(?:to|at|towards|info|vpa|paid to|spent on)\s+([A-Za-z0-9\s@._&'-]{2,30}?)(?:\s+on|\s+ref|\s+upi|\s+avl|\s+bal|\.|\n|$)/i;
  const merchantMatch = clean.match(merchantRegex);

  if (merchantMatch && merchantMatch[1]) {
    const rawMerchant = merchantMatch[1].trim();
    // Clean out trailing noise
    merchant = rawMerchant
      .replace(/^(vpa\s*[:\-]?\s*)/i, '')
      .replace(/\s+(on|via|using|card|ref).*$/i, '')
      .trim();
    confidence += 15;
  } else if (/swiggy/i.test(clean)) {
    merchant = 'Swiggy';
  } else if (/zomato/i.test(clean)) {
    merchant = 'Zomato';
  } else if (/amazon/i.test(clean)) {
    merchant = 'Amazon India';
  } else if (/flipkart/i.test(clean)) {
    merchant = 'Flipkart';
  } else if (/uber/i.test(clean)) {
    merchant = 'Uber';
  } else if (/zerodha|kite/i.test(clean)) {
    merchant = 'Zerodha Broking';
  }

  // 4. Payment Method
  let paymentMethod: PaymentMethod = 'UPI';
  if (/credit\s*card|ending\s*with\s*\d{4}|card\s*xx\d{2}/i.test(clean)) {
    paymentMethod = 'CREDIT_CARD';
  } else if (/debit\s*card/i.test(clean)) {
    paymentMethod = 'DEBIT_CARD';
  } else if (/netbanking|neft|rtgs|imps/i.test(clean)) {
    paymentMethod = 'NET_BANKING';
  } else if (/upi|gpay|phonepe|paytm/i.test(clean)) {
    paymentMethod = 'UPI';
  }

  // 5. Account Reference (e.g. HDFC *1234, SBI A/c XX89)
  let accountRef: string | undefined;
  const accMatch = clean.match(/(?:a\/c|acct|card|account)\s*(?:no\.?)?\s*([x*]+\d{2,4}|\d{4})/i);
  if (accMatch) {
    accountRef = `A/c ${accMatch[1]}`;
  }

  // 6. Categorization
  const merchantLower = merchant.toLowerCase();
  let category: ExpenseCategory = 'OTHER_EXPENSE';

  for (const [kw, cat] of Object.entries(CATEGORY_MAP)) {
    if (merchantLower.includes(kw) || clean.toLowerCase().includes(kw)) {
      category = cat;
      confidence = Math.min(confidence + 10, 99);
      break;
    }
  }

  // Default to today's ISO date
  const date = new Date().toISOString().split('T')[0];

  return {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    rawText: clean,
    amount,
    type,
    merchant: merchant.length > 30 ? merchant.substring(0, 30) : merchant,
    category,
    paymentMethod,
    accountRef,
    date,
    confidence,
  };
}

/**
 * Batch parses multiple SMS logs (from raw text block or native Android dump)
 */
export function parseBatchSmsLogs(rawBatchText: string): ParsedTransactionResult[] {
  // Split on double newlines or standard SMS separator patterns
  const chunks = rawBatchText.split(/\n\s*\n|(?=[A-Z]{2}-[A-Z0-9]+:)/);
  const results: ParsedTransactionResult[] = [];

  for (const chunk of chunks) {
    const parsed = parseFinancialSms(chunk);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Presets of real-world Indian bank SMS samples for instant test & demo
 */
export const SAMPLE_INDIAN_BANK_SMS: {
  title: string;
  bank: string;
  sms: string;
}[] = [
  {
    title: 'HDFC UPI Payment (Swiggy)',
    bank: 'HDFC Bank',
    sms: 'Sent Rs.485.00 from HDFC Bank A/c **1234 to SWIGGY on 29-OCT-24 via UPI Ref 4291823901. Bal: Rs.42,150.00.',
  },
  {
    title: 'SBI Credit Card (Reliance Digital)',
    bank: 'SBI Card',
    sms: 'Alert: Rs. 3,499.00 spent on your SBI Credit Card ending 8812 at RELIANCE DIGITAL on 28-Oct-24. Avl Lmt: Rs 1,45,000.',
  },
  {
    title: 'ICICI Bank UPI (Uber India)',
    bank: 'ICICI Bank',
    sms: 'Dear Customer, your A/c XX892 is debited for Rs 340.00 on 29-Oct-24 towards VPA uber.pay@axisbank (UPI Ref no 4298192831).',
  },
  {
    title: 'Axis Bank Demat Inflow (Zerodha)',
    bank: 'Axis Bank',
    sms: 'Your A/c no. XX9901 is debited for Rs.10,000.00 on 27-OCT-2024 towards ZERODHA BROKING LTD via NetBanking Ref 9081293.',
  },
  {
    title: 'Airtel Broadband Bill Payment',
    bank: 'Kotak Bank',
    sms: 'Kotak Bank: Rs 1,179.00 debited from A/c XX4521 on 26-Oct-24 towards AIRTEL BROADBAND BILLPAY via Autopay.',
  },
  {
    title: 'Apollo Pharmacy Medical',
    bank: 'Paytm Payments Bank',
    sms: 'Paid Rs 720.00 to APOLLO PHARMACY using Paytm UPI from Bank A/c **3301 on 28 Oct 2024 at 07:15 PM.',
  },
];
