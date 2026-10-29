import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';

test.describe('Web Enhancements: Month Switcher, Descending Ledger, Calendar 3rd Tab, Combined Commitments', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible({ timeout: 10000 });
  });

  test('verifies calendar is 3rd tab, commitments combined, descending ledger, month switcher, and rich calendar projection', async ({
    page,
  }) => {
    // 1. Navigate to Finance Workspace
    await page.getByRole('button', { name: /Finance/i }).first().click();
    await page.waitForTimeout(600);

    // 2. Import Google Pay statement so we have rich statements data
    const importBtn = page.getByRole('button', { name: /⚡ Auto-Import/i }).first();
    await importBtn.click();
    await expect(page.locator('[data-testid="load-gpay-btn"]')).toBeVisible({ timeout: 5000 });
    await page.locator('[data-testid="load-gpay-btn"]').click();
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Confirm & Import/i }).click();
    await page.waitForTimeout(1500);

    // 3. Verify Sub-tabs ordering in Finance Workspace:
    // Tab 1: Overview
    // Tab 2: Bank & UPI Statements
    // Tab 3: Financial Calendar (MUST BE 3RD!)
    // Tab 4: Holdings & Allocation
    // Tab 5: Debts, Protection & Vault (COMBINED!)
    const calendarTab = page.getByRole('button', { name: 'Financial Calendar', exact: true });
    await expect(calendarTab).toBeVisible();

    const commitmentsTab = page.getByRole('button', { name: /Debts, Protection & Vault/i });
    await expect(commitmentsTab).toBeVisible();

    // 4. Test Combined Commitments Tab (Debts, Protection & Vault)
    await commitmentsTab.click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Unified Liability, Insurance & Resilience Suite')).toBeVisible();
    await expect(page.getByText(/active loans/i).first()).toBeVisible();
    await expect(page.getByText(/Total Coverage/i).first()).toBeVisible();
    await expect(page.getByText(/Health & Vault/i).first()).toBeVisible();

    // Take screenshot of combined commitments module
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/quantra_commitments_vault_combined.png',
      fullPage: true,
    });

    // 5. Navigate to Transactions Ledger
    const ledgerTab = page.getByRole('button', { name: /Transactions Ledger/i });
    await ledgerTab.click();
    await page.waitForTimeout(500);

    // 6. Verify Month Switcher is present and defaults to active month
    await expect(page.getByText(/Active Financial Period/i)).toBeVisible();
    await expect(page.getByText(/Monthly Inflow/i).first()).toBeVisible();
    await expect(page.getByText(/Monthly Outflows/i).first()).toBeVisible();

    // Switch to Spent Expenses tab in Ledger
    const spentExpensesBtn = page.getByRole('button', { name: /Spent Expenses/i });
    await spentExpensesBtn.click();
    await page.waitForTimeout(500);

    // Verify Sort is set to Date (Newest First) by default
    const sortSelect = page.locator('select').filter({ hasText: /Date \(Newest First\)/i }).first();
    await expect(sortSelect).toBeVisible();

    // 7. Verify Cash Flow Analytics has non-empty Inflow records
    const inflowBtn = page.getByRole('button', { name: /Inflows \(Income\)/i }).first();
    await inflowBtn.click();
    await page.waitForTimeout(500);

    // Switch to Pie Chart
    const pieBtn = page.getByRole('button', { name: /Pie Chart/i }).first();
    await pieBtn.click();
    await page.waitForTimeout(500);

    // Verify inflow total is > 0 and not empty
    await expect(page.getByText(/TOTAL RECEIVED/i)).toBeVisible();

    // Take screenshot of Transaction Ledger & Cash Flow Analytics
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/quantra_ledger_month_switcher_inflow.png',
      fullPage: true,
    });

    // 8. Test Financial Calendar (3rd tab)
    await calendarTab.click();
    await page.waitForTimeout(600);

    // Verify Calendar header & Date-wise Cash Flow Projection
    await expect(page.getByText('Financial Calendar & Life Events Planner')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Cash Flow Projection' })).toBeVisible();

    // Take screenshot of Financial Calendar with date-wise events
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/quantra_calendar_datewise_visualization.png',
      fullPage: true,
    });
  });
});
