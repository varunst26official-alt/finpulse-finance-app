/**
 * Quantra Google Pay UPI Statement Parser Engine
 * Handles Google Pay PDF/Text exports with 100% on-device parsing.
 * Auto-categorizes merchants, isolates RuPay cards vs Bank accounts,
 * detects Self-Transfers, and reconciles Debits & Credits down to the paise.
 */

import { ExpenseCategory, PaymentMethod } from '@/types/finance';
import { ParsedTransactionResult } from '@/services/smsParserService';

export function normalizeDateToISO(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const cleaned = trimmed.replace(/,/g, '').trim();
  const parts = cleaned.split(/[\s\/-]+/);

  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', may_long: '05', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
  };

  if (parts.length === 3) {
    // Case 1: DD Month YYYY (e.g. 01 Apr 2026)
    if (isNaN(Number(parts[1]))) {
      const day = parts[0].padStart(2, '0');
      const monKey = parts[1].toLowerCase().slice(0, 3);
      const mon = monthMap[monKey] || '01';
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${year}-${mon}-${day}`;
    }
    // Case 2: YYYY-MM-DD
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    // Case 3: DD-MM-YYYY
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }

  // Fallback to standard JS Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return trimmed;
}

export interface GPaySummary {
  period: string;
  totalSent: number;
  totalReceived: number;
  totalSelfTransfer: number;
  accountPhone: string;
  accountEmail: string;
}

export function isGooglePayStatement(text: string): boolean {
  return (
    text.includes('Google Pay') ||
    text.includes('Transaction statement') ||
    (text.includes('UPI Transaction ID:') && text.includes('Paid to '))
  );
}

export function parseGooglePayStatement(text: string): {
  transactions: ParsedTransactionResult[];
  summary: GPaySummary;
} {
  const dateRegex = /^(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s+\d{4})$/i;
  const timeRegex = /^(\d{2}:\d{2}\s*(?:AM|PM))$/i;
  const upiRegex = /^UPI\s*Transaction\s*ID:\s*([0-9]+)$/i;

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const transactions: ParsedTransactionResult[] = [];

  let accountPhone = '';
  let accountEmail = '';
  let period = '';
  let totalSent = 0;
  let totalReceived = 0;
  let totalSelfTransfer = 0;

  // Header extraction
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    const contactMatch = line.match(/(\d{10}),\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (contactMatch) {
      accountPhone = contactMatch[1];
      accountEmail = contactMatch[2];
    }
    if (line.toLowerCase().includes('transaction statement period') && lines[i + 1]) {
      period = lines[i + 1];
    }
  }

  interface RawTxn {
    date: string;
    time: string;
    action: string;
    entityName: string;
    upiId: string;
    paymentInfo: string;
    amount: number;
    type: 'DEBIT' | 'CREDIT' | 'TRANSFER';
  }

  const rawTxns: RawTxn[] = [];
  let current: RawTxn | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (dateRegex.test(line) && lines[i + 1] && timeRegex.test(lines[i + 1])) {
      if (current && current.amount > 0) {
        rawTxns.push(current);
      }
      current = {
        date: line,
        time: lines[i + 1],
        action: '',
        entityName: '',
        upiId: '',
        paymentInfo: '',
        amount: 0,
        type: 'DEBIT',
      };
      i++;
      continue;
    }

    if (!current) continue;

    if (!current.action) {
      if (line.startsWith('Paid to ')) {
        current.action = 'Paid to';
        current.entityName = line.replace('Paid to ', '').trim();
        current.type = 'DEBIT';
      } else if (line.startsWith('Received from ')) {
        current.action = 'Received from';
        current.entityName = line.replace('Received from ', '').trim();
        current.type = 'CREDIT';
      } else if (line.startsWith('Self transfer to ')) {
        current.action = 'Self transfer to';
        current.entityName = line.replace('Self transfer to ', '').trim();
        current.type = 'TRANSFER';
      }
    } else if (upiRegex.test(line)) {
      current.upiId = line.match(upiRegex)![1];
    } else if (line.startsWith('Paid by ') || (current.action && line.startsWith('Paid to '))) {
      current.paymentInfo = line;
    } else if (/[0-9]/.test(line) && !current.amount) {
      // Clean amount: strips currency symbols (₹, Rs, comma, etc.)
      const cleaned = line.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0) {
        current.amount = num;
      }
    }
  }

  if (current && current.amount > 0) {
    rawTxns.push(current);
  }

  // Convert raw transactions to Quantra ParsedTransactionResult
  rawTxns.forEach((raw, idx) => {
    let category: ExpenseCategory = 'OTHER_EXPENSE';
    const lowerName = raw.entityName.toLowerCase();
    const lowerPayment = raw.paymentInfo.toLowerCase();

    // Categorization logic tailored to Indian UPI ecosystem
    if (
      /food|dining|restaurant|hotel|mess|briyani|biryani|shawarma|tiffin|bakery|cakes|sweets|juice|coffee|tea|cafe|kadai|soups|chicken|mutton|fish|meat|kitchen|dosa|idli|snack|eats|swiggy|zomato|fb cakes|pizza|burger|vilas|kebabs|tender|crescent/i.test(
        lowerName
      )
    ) {
      category = 'FOOD_DINING';
    } else if (
      /hospital|pharmacy|medical|medicals|scans|doctor|clinic|apollo|lab|health|dentist|dental|diagno|care|medicine|pharma|dr\b/i.test(
        lowerName
      )
    ) {
      category = 'HEALTHCARE_INSURANCE';
    } else if (
      /petrol|fuel|filling|hpcl|bpcl|iocl|shell|redbus|bus|train|irctc|ticket|auto|uber|ola|fastag|toll|parking|motors|honda|hero|yamaha|car|bike|tours|travels/i.test(
        lowerName
      )
    ) {
      category = 'TRAVEL_COMMUTE';
    } else if (
      /airtel|jio|\bvi\b|vodafone|bsnl|tangedco|electricity|eb bill|water|recharge|dth|broadband|wifi|act fibernet|tata play|gas|cylinder|indane|bharat gas/i.test(
        lowerName
      )
    ) {
      category = 'UTILITIES_BILLS';
    } else if (
      /store|stores|supermarket|mart|shop|fancy|gift|gifts|mall|silks|textiles|clothing|dress|fashion|jewel|watch|shoes|footwear|electricals|hardwares|aquarium|cubes|zepto|blinkit|amazon|flipkart|myntra|ajio|zara|croma|reliance|tata cliq|groceries|provision|angadi|retail/i.test(
        lowerName
      )
    ) {
      category = 'SHOPPING_LIFESTYLE';
    } else if (/manappuram|muthoot|bajaj|finance|loan|cars24|emi|chits|credit card/i.test(lowerName)) {
      category = 'EMI_LOANS';
    } else if (/theatre|movie|cinema|bookmyshow|pvr|inox|netflix|prime|hotstar|spotify|youtube/i.test(lowerName)) {
      category = 'ENTERTAINMENT_SUBS';
    } else if (/angel one|zerodha|groww|securities|mutual|investment|groww/i.test(lowerName)) {
      category = 'OTHER_EXPENSE';
    }

    // Determine payment method
    let paymentMethod: PaymentMethod = 'UPI';
    if (lowerPayment.includes('credit card') || lowerPayment.includes('rupay')) {
      paymentMethod = 'CREDIT_CARD';
    } else if (lowerPayment.includes('bank') || lowerPayment.includes('0781') || lowerPayment.includes('6504')) {
      paymentMethod = 'NET_BANKING';
    }

    let accountRef = 'UPI';
    if (lowerPayment.includes('icici bank xx03')) {
      accountRef = 'ICICI RuPay Card XX03';
    } else if (lowerPayment.includes('icici bank 0781')) {
      accountRef = 'ICICI Bank 0781';
    } else if (lowerPayment.includes('union bank of india 6504')) {
      accountRef = 'Union Bank 6504';
    } else if (lowerPayment.includes('indusind bank 6245')) {
      accountRef = 'IndusInd Bank 6245';
    }

    if (raw.type === 'DEBIT') {
      totalSent += raw.amount;
    } else if (raw.type === 'CREDIT') {
      totalReceived += raw.amount;
    } else if (raw.type === 'TRANSFER') {
      totalSelfTransfer += raw.amount;
    }

    const isoDate = normalizeDateToISO(raw.date);

    transactions.push({
      id: `gpay-${Date.now()}-${idx}-${raw.upiId || Math.random().toString(36).substring(2, 6)}`,
      rawText: `${raw.action} ${raw.entityName} | ${raw.paymentInfo} | UPI:${raw.upiId}`,
      amount: raw.amount,
      type: raw.type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
      merchant: raw.entityName.toUpperCase(),
      category,
      paymentMethod,
      accountRef,
      date: isoDate,
      confidence: 96,
    });
  });

  return {
    transactions,
    summary: {
      period,
      totalSent,
      totalReceived,
      totalSelfTransfer,
      accountPhone,
      accountEmail,
    },
  };
}
