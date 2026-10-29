import fs from 'fs';
import path from 'path';

const textPath = path.resolve('sample-test-files/google_pay_extracted_text.txt');
const csvPath = path.resolve('sample-test-files/google_pay_statement.csv');

const text = fs.readFileSync(textPath, 'utf-8');

const dateRegex = /^(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s+\d{4})$/i;
const timeRegex = /^(\d{2}:\d{2}\s*(?:AM|PM))$/i;
const upiRegex = /^UPI\s*Transaction\s*ID:\s*([0-9]+)$/i;

const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const txns = [];
let current = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (dateRegex.test(line) && lines[i + 1] && timeRegex.test(lines[i + 1])) {
    if (current && current.amount > 0) txns.push(current);
    current = {
      date: line,
      time: lines[i + 1],
      details: '',
      upiId: '',
      paymentInfo: '',
      amount: 0,
      type: 'DEBIT',
    };
    i++;
    continue;
  }
  if (!current) continue;
  if (
    !current.details &&
    (line.startsWith('Paid to ') || line.startsWith('Received from ') || line.startsWith('Self transfer to '))
  ) {
    current.details = line;
    current.type = line.startsWith('Received from ') ? 'CREDIT' : 'DEBIT';
  } else if (upiRegex.test(line)) {
    current.upiId = line.match(upiRegex)[1];
  } else if (line.startsWith('Paid by ') || (current.details && line.startsWith('Paid to '))) {
    current.paymentInfo = line;
  } else if (/[0-9]/.test(line) && !current.amount) {
    const num = parseFloat(line.replace(/[^0-9.]/g, ''));
    if (!isNaN(num) && num > 0) current.amount = num;
  }
}
if (current && current.amount > 0) txns.push(current);

let csv = 'Txn Date,Particulars,Withdrawal (Debit),Deposit (Credit)\n';
for (const t of txns) {
  const isDebit = t.type === 'DEBIT';
  const cleanNarration = (t.details + ' | ' + t.paymentInfo).replace(/,/g, ' ');
  csv += `${t.date} ${t.time},${cleanNarration},${isDebit ? t.amount : 0},${!isDebit ? t.amount : 0}\n`;
}

fs.writeFileSync(csvPath, csv, 'utf-8');
console.log(`Successfully generated ${csvPath} with ${txns.length} records.`);
