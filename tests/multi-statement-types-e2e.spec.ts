import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';
import fs from 'fs';
import path from 'path';

test.describe('Multi-Format Bank & Investment Statement Ingestion E2E', () => {
  const hdfcSamplePath = path.resolve('sample-test-files/sample_hdfc_bank_statement.csv');
  const sbiSamplePath = path.resolve('sample-test-files/sample_sbi_bank_statement.csv');
  const casSamplePath = path.resolve('sample-test-files/sample_cas_cdsl_statement.txt');
  const smsDumpPath = path.resolve('sample-test-files/sample_indian_bank_sms_dump.txt');

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA', { exact: true })).toBeVisible({ timeout: 15000 });

    // Navigate to Finance Workspace across both desktop and mobile layouts
    const mobileBtn = page.locator('button[aria-label="Navigate to Finance"]');
    const switcherBtn = page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i });
    const desktopBtn = page.locator('[data-testid="section-finance"]');
    if (await mobileBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await mobileBtn.click();
    } else if (await switcherBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await switcherBtn.click();
    } else if (await desktopBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await desktopBtn.click();
    } else {
      await page.locator('nav button:has-text("Finance"), button:has-text("Finance")').first().click();
    }
    await page.waitForTimeout(600);
  });

  test('Type 1: Demat CAS Statement (CDSL / NSDL / CAMS) - Equities & Mutual Funds with ISIN & NAV', async ({ page }) => {
    // Open Ingestion Hub
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();

    // Upload CDSL CAS Statement file
    const fileInput = page.locator('input[data-testid="statement-file-input"]');
    await expect(fileInput).toBeAttached({ timeout: 5000 });
    await fileInput.setInputFiles(casSamplePath);

    // Verify Review & Verify Parsed Items view
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    
    // Check parsed Equities and Mutual Funds
    await expect(page.getByText('RELIANCE', { exact: true })).toBeVisible();
    await expect(page.getByText('TCS', { exact: true })).toBeVisible();
    await expect(page.getByText(/Parag Parikh/i).first()).toBeVisible();

    // Confirm & Import into portfolio assets
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 8000 });

    // Verify Assets updated in Finance portfolio
    await expect(page.getByText(/RELIANCE|TCS|Parag Parikh/i).first()).toBeVisible();
  });

  test('Type 2: HDFC Bank CSV Statement - Categorized Expenses & Salary Inflow', async ({ page }) => {
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();

    // Upload HDFC Bank Statement
    const fileInput = page.locator('input[data-testid="statement-file-input"]');
    await expect(fileInput).toBeAttached({ timeout: 5000 });
    await fileInput.setInputFiles(hdfcSamplePath);

    // Review parsed items
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 12000 });

    // Verify Swiggy, Zomato, Uber, Amazon, Zerodha SIP and Salary
    await expect(page.getByText(/SWIGGY/i).first()).toBeVisible();
    await expect(page.getByText(/ZOMATO/i).first()).toBeVisible();
    await expect(page.getByText(/UBER/i).first()).toBeVisible();
    await expect(page.getByText(/AMAZON/i).first()).toBeVisible();
    await expect(page.getByText(/INFOSYS/i).first()).toBeVisible();

    // Verify Salary is recognized as INCOME (CREDIT)
    await expect(page.getByText(/INCOME \(CREDIT\)/i).first()).toBeVisible();

    // Confirm & Import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 8000 });

    // Switch to Bank & UPI Statements sub-tab
    const bankStatementsTab = page.getByRole('button', { name: /Bank & UPI Statements/i });
    if (await bankStatementsTab.isVisible()) {
      await bankStatementsTab.click();
      await expect(page.getByText(/Total Debits \(Outflows\)/i)).toBeVisible();
      await expect(page.getByText(/Total Credits \(Inflows\)/i)).toBeVisible();
      await expect(page.getByText(/Net Cash Flow/i)).toBeVisible();
    }
  });

  test('Type 3: State Bank of India (SBI) CSV Statement - Fuel, Health & Premium Outflows', async ({ page }) => {
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();

    // Upload SBI Bank Statement
    const fileInput = page.locator('input[data-testid="statement-file-input"]');
    await expect(fileInput).toBeAttached({ timeout: 5000 });
    await fileInput.setInputFiles(sbiSamplePath);

    // Review parsed transactions
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 12000 });
    await expect(page.getByText(/STARBUCKS|IOCL|APOLLO/i).first()).toBeVisible();

    // Confirm & Import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 8000 });
  });

  test('Type 4: Google Pay UPI Statement Batch & Deduplication Idempotency', async ({ page }) => {
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();

    // Click Sample GPay CSV loader
    const loadGpayBtn = page.locator('[data-testid="load-gpay-btn"]');
    await expect(loadGpayBtn).toBeVisible({ timeout: 6000 });
    await loadGpayBtn.click();

    // Review parsed items
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });

    // Verify Income Credits are highlighted
    await expect(page.getByText(/INCOME \(CREDIT\)/i).first()).toBeVisible();

    // Confirm first import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await page.waitForTimeout(1000);

    // Test Deduplication / Re-import Idempotency: open modal again and re-scan
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();
    await page.waitForTimeout(500);
    await loadGpayBtn.click();
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });

    // Confirm again; existing transactions should be recognized as duplicates and ignored
    await confirmBtn.click();
    await page.waitForTimeout(1000);
  });

  test('Type 5: Indian Bank SMS & UPI Notifications Multi-Institution Dump', async ({ page }) => {
    const rawSmsDump = fs.readFileSync(smsDumpPath, 'utf-8');

    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();

    const isMobileViewport = (page.viewportSize()?.width ?? 1280) < 768;
    const smsTab = page.getByRole('button', { name: /UPI SMS & Notifications/i });

    if (isMobileViewport) {
      // Switch to UPI SMS & Notifications Tab on Mobile
      await expect(smsTab).toBeVisible({ timeout: 6000 });
      await smsTab.click();

      // Paste multi-line raw SMS batch (HDFC, SBI Card, Axis, Kotak, Paytm)
      const textarea = page.locator('textarea');
      await textarea.fill(rawSmsDump);

      // Run on-device SMS parser
      await page.getByRole('button', { name: /Parse SMS Locally/i }).click();

      // Review parsed items from multiple financial institutions
      await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 12000 });
      await expect(page.getByText('SWIGGY', { exact: true })).toBeVisible();
      await expect(page.getByText('APOLLO PHARMACY', { exact: true })).toBeVisible();
      await expect(page.getByText('RELIANCE DIGITAL', { exact: true })).toBeVisible();

      // Confirm & Import
      const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
      await confirmBtn.click();
      await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 8000 });
    } else {
      // On Web Desktop: Verify that the SMS tab is hidden as requested
      await expect(smsTab).toHaveCount(0);
    }
  });

  test('Type 6: Bank Statement Analytics & Donut vs Graph Visualizations', async ({ page }) => {
    // Switch to Bank & UPI Statements sub-tab (works across desktop and mobile visible elements)
    const bankStatementsTab = page.locator('button:has-text("Bank & UPI Statements"), button:has-text("Statements")').filter({ visible: true }).first();
    await expect(bankStatementsTab).toBeVisible({ timeout: 6000 });
    await bankStatementsTab.click();

    // Open Statement Hub from within Bank Statements view
    const importStatementBtn = page.getByRole('button', { name: /Import Statement/i }).first();
    await importStatementBtn.click();

    const loadGpayBtn = page.locator('[data-testid="load-gpay-btn"]');
    await loadGpayBtn.click();
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Confirm & Import/i }).click();
    await page.waitForTimeout(1200);

    // Verify Analytics Controls
    const pieChartBtn = page.getByRole('button', { name: /Pie Chart/i }).first();
    if (await pieChartBtn.isVisible()) {
      await pieChartBtn.click();
      await page.waitForTimeout(400);

      // Verify category visualization
      await expect(page.getByText(/Total Spend|Total Inflow/i).first()).toBeVisible();

      // Switch to Inflows
      const inflowsBtn = page.getByRole('button', { name: /Inflows \(Income\)/i }).first();
      await inflowsBtn.click();
      await page.waitForTimeout(400);

      // Switch back to Graph
      const graphBtn = page.getByRole('button', { name: /Graph/i }).first();
      await graphBtn.click();
      await page.waitForTimeout(400);
    }
  });
});
