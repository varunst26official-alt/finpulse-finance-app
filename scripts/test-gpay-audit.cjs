const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/build/pdf.js');

async function testExtraction() {
  const pdfPath = 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/.user_uploaded/media_1793545577629_25da6160.pdf';
  const buf = fs.readFileSync(pdfPath);
  const uint8 = new Uint8Array(buf);
  const doc = await pdfjsLib.getDocument({ data: uint8, isEvalSupported: false }).promise;

  const pagesText = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str || '');
    pagesText.push(strings.join('\n'));
  }
  const fullText = pagesText.join('\n---PAGE---\n');

  console.log(`Extracted text from ${doc.numPages} pages, total chars: ${fullText.length}`);

  // Test with gpayStatementService logic
  const dateRegex = /^(\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec),?\s+\d{4})$/i;
  const timeRegex = /^(\d{2}:\d{2}\s*(?:AM|PM))$/i;
  const upiRegex = /^UPI\s*Transaction\s*ID:\s*([0-9]+)$/i;

  const lines = fullText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let totalSent = 0;
  let totalReceived = 0;
  let totalSelfTransfer = 0;
  let txCount = 0;
  let debitCount = 0;
  let creditCount = 0;
  let transferCount = 0;

  const txns = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (dateRegex.test(line) && lines[i + 1] && timeRegex.test(lines[i + 1])) {
      if (current && current.amount > 0) {
        txns.push(current);
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
    txns.push(current);
  }

  const byMonth = {};

  txns.forEach((tx) => {
    txCount++;
    if (tx.type === 'DEBIT') {
      debitCount++;
      totalSent += tx.amount;
    } else if (tx.type === 'CREDIT') {
      creditCount++;
      totalReceived += tx.amount;
    } else if (tx.type === 'TRANSFER') {
      transferCount++;
      totalSelfTransfer += tx.amount;
    }

    const m = tx.date.split(',')[0].slice(3).trim(); // e.g. "Apr"
    if (!byMonth[m]) byMonth[m] = { sent: 0, received: 0, transfer: 0, count: 0 };
    byMonth[m].count++;
    if (tx.type === 'DEBIT') byMonth[m].sent += tx.amount;
    if (tx.type === 'CREDIT') byMonth[m].received += tx.amount;
    if (tx.type === 'TRANSFER') byMonth[m].transfer += tx.amount;
  });

  console.log('\n=======================================');
  console.log('--- RECONCILIATION SUMMARY RESULTS ---');
  console.log('=======================================');
  console.log(`Total transactions parsed: ${txCount}`);
  console.log(`Debits (Paid to): ${debitCount}, Sum: ₹${totalSent.toFixed(2)}`);
  console.log(`Credits (Received from): ${creditCount}, Sum: ₹${totalReceived.toFixed(2)}`);
  console.log(`Self Transfers: ${transferCount}, Sum: ₹${totalSelfTransfer.toFixed(2)}`);
  console.log('---------------------------------------');
  console.log('OFFICIAL STATEMENT HEADERS:');
  console.log('Official Sent:     ₹9,50,618.65');
  console.log('Official Received: ₹3,77,889.92');
  console.log('---------------------------------------');
  console.log(`Sent Difference:     ₹${(totalSent - 950618.65).toFixed(2)}`);
  console.log(`Received Difference: ₹${(totalReceived - 377889.92).toFixed(2)}`);
  console.log('---------------------------------------');
  console.log('MONTH-BY-MONTH BREAKDOWN:');
  console.log(JSON.stringify(byMonth, null, 2));

  // Check if any transaction failed to parse amount or action
  const unparsedAction = txns.filter(t => !t.action);
  console.log(`Transactions missing action: ${unparsedAction.length}`);
}

testExtraction().catch(console.error);
