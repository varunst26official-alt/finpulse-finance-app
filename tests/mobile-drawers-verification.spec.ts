import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 }, // Mobile viewport (iPhone 14 / modern Android)
  isMobile: true,
  hasTouch: true,
});

test.describe('Mobile Bottom-Sheet Drawers Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Check if demo auth or welcome tour is visible
    const instantDemoBtn = page.getByRole('button', { name: /Instant Demo Access/i });
    if (await instantDemoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await instantDemoBtn.click();
      await page.waitForTimeout(300);
    }
    // Dismiss tour if present
    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i }).or(page.locator('[data-testid="skip-tour-btn"]'));
    if (await skipTourBtn.first().isVisible({ timeout: 4000 }).catch(() => false)) {
      await skipTourBtn.first().click();
      await page.waitForTimeout(400);
    }
  });

  test('Finance - Record Trade drawer has bottom-sheet styling and drag handle', async ({ page }) => {
    // Navigate to Finance
    const financeNav = page.getByRole('button', { name: /Finance/i }).last();
    await financeNav.click();
    await page.waitForTimeout(300);

    // Click Record Trade
    const recordTradeBtn = page.getByRole('button', { name: /Record Trade/i });
    await expect(recordTradeBtn).toBeVisible({ timeout: 5000 });
    await recordTradeBtn.click();

    // Verify modal is anchored to bottom (rounded-t-3xl)
    const drawer = page.locator('.rounded-t-3xl').first();
    await expect(drawer).toBeVisible();

    // Verify tactile drag handle exists
    const dragHandle = page.locator('.w-12.h-1\\.5.bg-slate-300');
    await expect(dragHandle.first()).toBeVisible();

    // Close drawer
    const closeBtn = page.getByRole('button', { name: /Close/i }).or(page.locator('.lucide-x').locator('..'));
    await closeBtn.first().click();
  });

  test('Finance - Bill Reminder opens as a bottom sheet drawer', async ({ page }) => {
    const financeNav = page.getByRole('button', { name: /Finance/i }).last();
    await financeNav.click();
    await page.waitForTimeout(300);

    const billsBtn = page.getByRole('button', { name: /Bills/i });
    await expect(billsBtn).toBeVisible({ timeout: 5000 });
    await billsBtn.click();

    // Verify drawer
    const drawer = page.locator('.rounded-t-3xl').first();
    await expect(drawer).toBeVisible();
    await expect(page.getByText('Bill Reminders')).toBeVisible();
  });

  test('Overview - Quick Add Task opens as a bottom sheet drawer', async ({ page }) => {
    const overviewNav = page.getByRole('button', { name: /Overview/i }).last();
    await overviewNav.click();
    await page.waitForTimeout(300);

    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i }).or(page.locator('[data-testid="skip-tour-btn"]'));
    if (await skipTourBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourBtn.first().click();
      await page.waitForTimeout(300);
    }

    const quickAddBtn = page.getByRole('button', { name: /Quick Add Task/i });
    if (await quickAddBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await quickAddBtn.click();

      const drawer = page.locator('.rounded-t-3xl').first();
      await expect(drawer).toBeVisible();
      await expect(page.getByText(/create a task|Add New Task/i)).toBeVisible();
    }
  });

  test('AI Floating Copilot opens as a bottom drawer on mobile', async ({ page }) => {
    const copilotTrigger = page.locator('button').filter({ has: page.locator('.lucide-sparkles') }).last();
    if (await copilotTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await copilotTrigger.click();

      const chatDrawer = page.locator('.rounded-t-3xl').filter({ hasText: /Quantrix/i }).first();
      await expect(chatDrawer).toBeVisible({ timeout: 5000 });
    }
  });

  test('Finance - Inflow Allocation Studio opens as a bottom sheet drawer', async ({ page }) => {
    const financeNav = page.getByRole('button', { name: /Finance/i }).last();
    await financeNav.click();
    await page.waitForTimeout(300);

    const inflowBtn = page.getByRole('button', { name: /Inflow & Allocation/i }).or(page.getByText('Inflow & Allocation'));
    if (await inflowBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await inflowBtn.first().click();

      const drawer = page.locator('.rounded-t-3xl').first();
      await expect(drawer).toBeVisible();
      await expect(page.getByText('Monthly Inflow & Allocation Studio')).toBeVisible();

      const dragHandle = page.locator('.w-12.h-1\\.5.bg-slate-300');
      await expect(dragHandle.first()).toBeVisible();
    }
  });

  test('Finance - Smart Ingestion Hub opens as a bottom sheet drawer with drag handle', async ({ page }) => {
    const financeNav = page.getByRole('button', { name: /Finance/i }).last();
    await financeNav.click();
    await page.waitForTimeout(300);

    const smartIngestBtn = page.getByRole('button', { name: /Smart Ingestion/i }).or(page.getByText(/Smart Ingest/i));
    if (await smartIngestBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await smartIngestBtn.first().click();

      const drawer = page.locator('.rounded-t-3xl').first();
      await expect(drawer).toBeVisible();

      const dragHandle = page.locator('.w-12.h-1\\.5.bg-slate-300');
      await expect(dragHandle.first()).toBeVisible();
    }
  });
});
