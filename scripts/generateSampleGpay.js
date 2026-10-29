import fs from 'fs';
import path from 'path';

const textPath = path.resolve('sample-test-files/google_pay_extracted_text.txt');
const text = fs.readFileSync(textPath, 'utf-8');

const dateRegex = /^(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s+\d{4})$/i;
const timeRegex = /^(\d{2}:\d{2}\s*(?:AM|PM))$/i;
const upiRegex = /^UPI\s*Transaction\s*ID:\s*([0-9]+)$/i;

const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const transactions = [];

let accountPhone = '';
let accountEmail = '';
let period = '';
let totalSent = 0;
let totalReceived = 0;
let totalSelfTransfer = 0;

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

const rawTxns = [];
let current = null;

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
    current.upiId = line.match(upiRegex)[1];
  } else if (line.startsWith('Paid by ') || (current.action && line.startsWith('Paid to '))) {
    current.paymentInfo = line;
  } else if (/[0-9]/.test(line) && !current.amount) {
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

rawTxns.forEach((raw, idx) => {
  let category = 'OTHER_EXPENSE';
  const lowerName = raw.entityName.toLowerCase();
  const lowerPayment = raw.paymentInfo.toLowerCase();

  if (
    /briyani|biryani|restaurant|hotel|mess|dining|food|swiggy|zomato|shawarma|tiffin|bakery|cakes|sweets|juice|coffee|tea|cafe|kadai|soups|chicken|fruits|vegetables/i.test(
      lowerName
    )
  ) {
    category = 'FOOD_DINING';
  } else if (/zepto|blinkit|groceries|supermarket|provision|stores|mart|fruits|angadi/i.test(lowerName)) {
    category = 'SHOPPING_LIFESTYLE';
  } else if (/silks|amazon|flipkart|dress|clothing|fashion|jewellery|watches|gifts|shoe/i.test(lowerName)) {
    category = 'SHOPPING_LIFESTYLE';
  } else if (/petrol|fuel|filling|redbus|bus|train|ticket|auto|uber|ola|fastag|motors|car/i.test(lowerName)) {
    category = 'TRAVEL_COMMUTE';
  } else if (/airtel|jio|tangedco|electricity|water|recharge|dth|broadband/i.test(lowerName)) {
    category = 'UTILITIES_BILLS';
  } else if (/hospital|pharmacy|medical|scans|doctor|clinic|apollo|lab/i.test(lowerName)) {
    category = 'HEALTHCARE_INSURANCE';
  } else if (/manappuram|finance|loan|cars24|emi/i.test(lowerName)) {
    category = 'EMI_LOANS';
  } else if (/theatre|movie|cinema|bookmyshow/i.test(lowerName)) {
    category = 'ENTERTAINMENT_SUBS';
  } else if (/angel one|zerodha|groww|securities|mutual/i.test(lowerName)) {
    category = 'OTHER_EXPENSE';
  }

  let paymentMethod = 'UPI';
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

  transactions.push({
    id: `gpay-${idx + 1}-${raw.upiId || Math.random().toString(36).substring(2, 6)}`,
    rawText: `${raw.action} ${raw.entityName} | ${raw.paymentInfo} | UPI:${raw.upiId}`,
    amount: raw.amount,
    type: raw.type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
    merchant: raw.entityName.toUpperCase(),
    category,
    paymentMethod,
    accountRef,
    date: raw.date,
    confidence: 96,
  });
});

const summary = {
  period,
  totalSent,
  totalReceived,
  totalSelfTransfer,
  accountPhone,
  accountEmail,
  totalTransactions: transactions.length,
};

const code = `import { ParsedTransactionResult } from '@/services/smsParserService';

export const SAMPLE_GPAY_SUMMARY = ${JSON.stringify(summary, null, 2)};

export const SAMPLE_GPAY_TRANSACTIONS: ParsedTransactionResult[] = ${JSON.stringify(transactions, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/sampleGpayData.ts'), code, 'utf-8');
console.log(`Generated src/data/sampleGpayData.ts with ${transactions.length} items. Sent: ₹${totalSent.toFixed(2)}, Received: ₹${totalReceived.toFixed(2)}`);
