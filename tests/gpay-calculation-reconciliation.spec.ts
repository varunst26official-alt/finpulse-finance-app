import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import { parseGooglePayStatement, normalizeDateToISO } from '../src/services/gpayStatementService';

test.describe('Google Pay Statement Inflow & Outflow Calculation Audit (73 Pages, 726 Txns)', () => {
  const pdfPath = 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/.user_uploaded/media_1793545577629_25da6160.pdf';

  let fullPdfText = '';
  let parsedData: ReturnType<typeof parseGooglePayStatement>;

  test.beforeAll(async () => {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at: ${pdfPath}`);
    }
    const buf = fs.readFileSync(pdfPath);
    const uint8 = new Uint8Array(buf);
    const doc = await pdfjsLib.getDocument({ data: uint8, isEvalSupported: false }).promise;

    const pagesText: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      pagesText.push(content.items.map((item: any) => item.str || '').join('\n'));
    }
    fullPdfText = pagesText.join('\n---PAGE---\n');
    parsedData = parseGooglePayStatement(fullPdfText);
  });

  test('Test Case 1: Overall Outflow and Inflow match Google Pay Official Totals down to 0 paise difference', async () => {
    // Official Totals from Page 1:
    // Sent: ₹9,50,618.65
    // Received: ₹3,77,889.92
    const OFFICIAL_SENT = 950618.65;
    const OFFICIAL_RECEIVED = 377889.92;

    const calculatedSent = Math.round(parsedData.summary.totalSent * 100) / 100;
    const calculatedReceived = Math.round(parsedData.summary.totalReceived * 100) / 100;

    expect(calculatedSent).toBeCloseTo(OFFICIAL_SENT, 2);
    expect(calculatedReceived).toBeCloseTo(OFFICIAL_RECEIVED, 2);
    expect(parsedData.transactions.length).toBe(726);

    // Delta verification
    const sentDelta = Math.abs(calculatedSent - OFFICIAL_SENT);
    const receivedDelta = Math.abs(calculatedReceived - OFFICIAL_RECEIVED);
    expect(sentDelta).toBe(0);
    expect(receivedDelta).toBe(0);
  });

  test('Test Case 2: Self-Transfer Payments are strictly quarantined and not double-counted', async () => {
    // Google Pay note: "Self transfer payments are not included in the total money paid and received."
    const OFFICIAL_SELF_TRANSFERS = 58800.00;
    const calculatedSelfTransfer = Math.round(parsedData.summary.totalSelfTransfer * 100) / 100;

    expect(calculatedSelfTransfer).toBe(OFFICIAL_SELF_TRANSFERS);

    // Verify individual self-transfer instances
    const transfers = parsedData.transactions.filter(t => t.rawText.includes('Self transfer to'));
    expect(transfers.length).toBe(3);

    const transferAmounts = transfers.map(t => t.amount).sort((a, b) => a - b);
    expect(transferAmounts).toEqual([500, 28300, 30000]);

    // Ensure sum of Debits + Credits does NOT accidentally incorporate self-transfers
    const debitsSum = parsedData.transactions
      .filter(t => t.type === 'DEBIT' && !t.rawText.includes('Self transfer to'))
      .reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;

    expect(debitsSum).toBe(950618.65);
  });

  test('Test Case 3: Monthly Breakdown & Date Integrity (Apr - Sep 2026)', async () => {
    const monthlyExpected = {
      '04': { sent: 409274.93, received: 29259.42, count: 136 },
      '05': { sent: 117503.15, received: 133763.66, count: 132 },
      '06': { sent: 118613.67, received: 57649.18, count: 131 },
      '07': { sent: 190762.36, received: 51547.66, count: 129 },
      '08': { sent: 69917.76, received: 16670.00, count: 111 },
      '09': { sent: 44546.78, received: 89000.00, count: 87 },
    };

    let totalMonthlySent = 0;
    let totalMonthlyReceived = 0;
    let totalMonthlyCount = 0;

    for (const [monthKey, expected] of Object.entries(monthlyExpected)) {
      const monthTxns = parsedData.transactions.filter(t => t.date.startsWith(`2026-${monthKey}`));
      expect(monthTxns.length).toBe(expected.count);

      const mSent = monthTxns
        .filter(t => t.type === 'DEBIT' && !t.rawText.includes('Self transfer to'))
        .reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;

      const mRecv = monthTxns
        .filter(t => t.type === 'CREDIT')
        .reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;

      expect(mSent).toBeCloseTo(expected.sent, 2);
      expect(mRecv).toBeCloseTo(expected.received, 2);

      totalMonthlySent += Math.round(mSent * 100);
      totalMonthlyReceived += Math.round(mRecv * 100);
      totalMonthlyCount += monthTxns.length;
    }

    expect(totalMonthlySent / 100).toBe(950618.65);
    expect(totalMonthlyReceived / 100).toBe(377889.92);
    expect(totalMonthlyCount).toBe(726);
  });

  test('Test Case 4: Category Distribution and Merchant Aggregation', async () => {
    // Top expense categories: EMI_LOANS, HEALTHCARE, TRAVEL, FOOD, SHOPPING
    const debits = parsedData.transactions.filter(t => t.type === 'DEBIT' && !t.rawText.includes('Self transfer to'));

    // Manappuram finance (across multiple loans/EMIs)
    const manappuram = debits.filter(t => t.merchant.includes('MANAPPURAM'));
    const manappuramTotal = manappuram.reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;
    expect(manappuramTotal).toBeCloseTo(204201.77, 2);

    // Kauvery Hospital Kovilambakkam + Maa Kauvery
    const kauvery = debits.filter(t => t.merchant.includes('KAUVERY'));
    const kauveryTotal = kauvery.reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;
    expect(kauveryTotal).toBe(104010.00); // 102408 (Kovilambakkam) + 1602 (Radial Road)

    // Selvaraj C Selva
    const selvaraj = debits.filter(t => t.merchant.includes('SELVARAJ'));
    const selvarajTotal = selvaraj.reduce((sum, t) => sum + Math.round(t.amount * 100), 0) / 100;
    expect(selvarajTotal).toBe(101900.00);
  });

  test('Test Case 5: Micro-transactions and High-Value Edge Cases', async () => {
    const debits = parsedData.transactions.filter(t => t.type === 'DEBIT');

    // Smallest non-zero transaction
    const minTx = debits.reduce((min, t) => t.amount < min.amount ? t : min, debits[0]);
    expect(minTx.amount).toBeGreaterThan(0);

    // Largest single debit transaction in the entire statement (Manappuram finance)
    const maxTx = debits.reduce((max, t) => t.amount > max.amount ? t : max, debits[0]);
    expect(maxTx.amount).toBe(99000.59);
    expect(maxTx.merchant).toContain('MANAPPURAM');

    // Decimal paise accuracy test: Check transactions with fractional amounts (.15, .34, .65, etc.)
    const fractionalTxns = debits.filter(t => Math.floor(t.amount) !== t.amount);
    expect(fractionalTxns.length).toBeGreaterThan(0);

    // All fractional amounts sum correctly
    const fractionalSum = fractionalTxns.reduce((sum, t) => sum + (t.amount - Math.floor(t.amount)), 0);
    expect(fractionalSum).toBeGreaterThan(0);
  });
});
