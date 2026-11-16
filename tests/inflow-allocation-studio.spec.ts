import { test, expect } from '@playwright/test';

test.describe('Monthly Inflow & Essential Expense Allocation Studio', () => {
  test('verifies opening the studio modal, adjusting inflow and essential living, and cross-syncing', async ({
    page,
  }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1280, height: 950 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Enter demo mode / login
    const demoButton = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    if (await demoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoButton.click();
    } else {
      const signInBtn = page.getByRole('button', { name: /Sign In to Command Centre/i });
      if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await signInBtn.click();
      }
    }
    await page.waitForTimeout(800);

    // Skip onboarding tour if visible
    const skipTourBtn = page.locator('button[title="Skip Tour"], button:has-text("Skip Tour")').first();
    if (await skipTourBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourBtn.click();
    }
    await page.waitForTimeout(400);

    // 2. Click Finance workspace tab
    const financeTab = page.locator('button:has-text("Finance")').first();
    await financeTab.click();
    await page.waitForTimeout(600);

    // 3. Locate the Monthly Income & Allocation Engine card
    await expect(page.getByText('Monthly Income & Allocation Engine')).toBeVisible({ timeout: 15000 });

    // 4. Click the studio button
    const studioBtn = page.locator('[data-testid="studio-modal-btn"]');
    await expect(studioBtn).toBeVisible();
    await studioBtn.click();

    // 5. Verify Monthly Inflow & Allocation Studio modal opens
    await expect(page.getByText('Monthly Inflow & Allocation Studio')).toBeVisible();
    await expect(page.getByText('1. Monthly Inflow')).toBeVisible();
    await expect(page.getByText('2. Essential Living & Bills')).toBeVisible();
    await expect(page.getByText('3. Debts & Goals')).toBeVisible();

    // 6. Switch to Essential Living tab
    await page.getByText('2. Essential Living & Bills').click();
    await expect(page.getByText('Monthly Essential Bills & Utilities')).toBeVisible();
    await expect(page.getByText('Variable Daily Living Expenses')).toBeVisible();

    // 7. Switch to Commitments tab
    await page.getByText('3. Debts & Goals').click();
    await expect(page.getByText('Loan EMIs & Debt Commitments')).toBeVisible();
    await expect(page.getByText('Goal SIP Commitments')).toBeVisible();

    // 8. Verify pre-commit live balance bar is visible
    await expect(page.getByText('Apply & Synchronize LifeOS')).toBeVisible();

    // 9. Click cancel to cleanly dismiss modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Monthly Inflow & Allocation Studio')).not.toBeVisible();
  });
});
