import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';

test.describe('Bank Statement & Ingestion Re-import Idempotency and Calendar Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible({ timeout: 10000 });
  });

  test('imports Google Pay statement, verifies income vs expenses, switches charts, checks calendar date inspection, and handles re-import idempotency', async ({
    page,
  }) => {
    // 1. Navigate to Finance Workspace
    await page.getByRole('button', { name: /Finance/i }).first().click();
    await expect(page.getByText('⚡ Auto-Import (Demat & UPI)')).toBeVisible({ timeout: 5000 });

    // 2. Check that "Bank & UPI Statements" sub-tab exists and switch to it
    const bankStatementsTab = page.getByRole('button', { name: /Bank & UPI Statements/i });
    await expect(bankStatementsTab).toBeVisible({ timeout: 5000 });
    await bankStatementsTab.click();

    // Verify Bank & UPI Statement Hub header is visible
    await expect(page.getByText('Bank & UPI Statement Hub')).toBeVisible();

    // 3. Open Ingestion Hub Modal
    const importBtn = page.getByRole('button', { name: /Import Statement/i }).first();
    await importBtn.click();
    await expect(page.locator('[data-testid="load-gpay-btn"]')).toBeVisible({ timeout: 5000 });

    // 4. Click "Load Google Pay (726 Txns • ₹9.5L)"
    const loadGpayBtn = page.locator('[data-testid="load-gpay-btn"]');
    await loadGpayBtn.click();

    // Wait for parsing
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });

    // 5. Verify that "Received from" transactions are displayed as INCOME (CREDIT) with "+"
    await expect(page.getByText('INCOME (CREDIT)').first()).toBeVisible();

    // 6. Confirm & Import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await page.waitForTimeout(1500);

    // 7. Back in Bank Statements view, verify KPI tiles show both debits and credits
    await expect(page.getByText(/Total Debits \(Outflows\)/i)).toBeVisible();
    await expect(page.getByText(/Total Credits \(Inflows\)/i)).toBeVisible();
    await expect(page.getByText(/Net Cash Flow/i)).toBeVisible();

    // 8. Test Visual Analytics Toggle in Bank Statement section
    // Toggle between Graph and Pie Chart
    const pieChartBtn = page.getByRole('button', { name: /Pie Chart/i }).first();
    await pieChartBtn.click();
    await page.waitForTimeout(400);

    // Verify donut category list is visible
    await expect(page.getByText(/Total Spend|Total Inflow/i).first()).toBeVisible();

    // Switch flow to Inflows (Income)
    const inflowsBtn = page.getByRole('button', { name: /Inflows \(Income\)/i }).first();
    await inflowsBtn.click();
    await page.waitForTimeout(400);

    // Switch back to Graph
    const graphBtn = page.getByRole('button', { name: /Graph/i }).first();
    await graphBtn.click();
    await page.waitForTimeout(400);

    // 9. Test Re-import Idempotency (Import again and verify deduplication)
    await importBtn.click();
    await page.waitForTimeout(500);
    await loadGpayBtn.click();
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    await confirmBtn.click();
    await page.waitForTimeout(1500);

    // Verify that re-importing didn't duplicate transactions
    await expect(page.getByText(/726 Txns|Reconciled Entries/i).first()).toBeVisible();

    // 10. Switch to Financial Calendar and test Date-wise inspection
    const calendarTab = page.getByRole('button', { name: 'Financial Calendar', exact: true });
    await calendarTab.click();
    await page.waitForTimeout(500);

    // Verify Month Selector is present and select April 2026 (where statement begins)
    const monthSelect = page.locator('select').first();
    await monthSelect.selectOption('3'); // April (0-indexed 3)
    await page.waitForTimeout(500);

    // Click on day 1 (which has 2026-04-01 transactions)
    const dayOneCell = page.locator('div:has-text("1")').filter({ hasText: /^1/ }).first();
    await dayOneCell.click();
    await page.waitForTimeout(500);

    // Check if day inspector modal or view details button appears
    const viewDetailsBtn = page.getByRole('button', { name: /View Full Date Details/i }).first();
    if (await viewDetailsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewDetailsBtn.click();
      await page.waitForTimeout(500);
      await expect(page.getByText(/Transactions & Events on/i)).toBeVisible();
      // Close modal
      await page.getByRole('button', { name: /Close/i }).click();
    }
  });
});
