import { test, expect } from '@playwright/test';

test.describe('Intelligent Debt Payoff Suggestion & Deficit Advisory System', () => {
  test('verifies surplus accelerator and deficit advisory with expense reduction areas and extra income', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1280, height: 950 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Enter demo mode
    const demoButton = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    if (await demoButton.isVisible({ timeout: 4000 }).catch(() => false)) {
      await demoButton.click();
    } else {
      const signInBtn = page.getByRole('button', { name: /Sign In to LifeOS|Sign In to Command Centre/i });
      if (await signInBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await signInBtn.click();
      }
    }
    await page.waitForTimeout(1000);

    // Dismiss onboarding tour if visible
    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
    if (await skipTourBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await skipTourBtn.click({ force: true });
    }
    await page.waitForTimeout(500);

    // Navigate to Finance section
    const financeNav = page.locator('button:has-text("Finance")').first();
    if (await financeNav.isVisible().catch(() => false)) {
      await financeNav.click();
      await page.waitForTimeout(500);
    }

    // 2. Navigate to Debts, Protection & Vault (Default state has surplus: Income ~₹1.52L > EMI ₹27K)
    const commitmentsTab = page.locator('button:has-text("Debts, Protection & Vault"):visible');
    await expect(commitmentsTab).toBeVisible({ timeout: 5000 });
    await commitmentsTab.click();
    await page.waitForTimeout(800);

    // Verify Surplus Payoff Accelerator is rendered
    const surplusHeading = page.locator('text=Surplus Payoff Accelerator');
    await expect(surplusHeading).toBeVisible({ timeout: 10000 });

    const positiveBadge = page.locator('text=Positive Free Cashflow');
    await expect(positiveBadge).toBeVisible();

    const speedupCard = page.locator('text=Payoff Speedup');
    await expect(speedupCard).toBeVisible();

    const interestEliminated = page.locator('text=Interest Eliminated');
    await expect(interestEliminated).toBeVisible();

    // Test Deploy 100% Surplus button
    const deploy100Btn = page.getByRole('button', { name: /Deploy 100% Surplus/i });
    await expect(deploy100Btn).toBeVisible();
    await deploy100Btn.click();
    await page.waitForTimeout(500);

    // Scroll into view and capture Surplus Accelerator screenshot
    await surplusHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/debt_surplus_accelerator_verified.png' });

    // 3. Switch to Overview to adjust Monthly Net Income to ₹20,000 (creating a deficit)
    const overviewTab = page.getByRole('button', { name: 'Overview', exact: true });
    await expect(overviewTab).toBeVisible({ timeout: 5000 });
    await overviewTab.click();
    await page.waitForTimeout(600);

    const editIncomeBtn = page.locator('[data-testid="edit-income-btn"]');
    await expect(editIncomeBtn).toBeVisible({ timeout: 5000 });
    await editIncomeBtn.click();
    await page.waitForTimeout(300);

    const incomeInput = page.locator('[data-testid="income-input"]');
    await expect(incomeInput).toBeVisible();
    await incomeInput.fill('20000');
    await page.waitForTimeout(200);

    const saveIncomeBtn = page.locator('[data-testid="save-income-btn"]');
    await saveIncomeBtn.click();
    await page.waitForTimeout(800);

    // 4. Return to Debts, Protection & Vault to verify Cashflow Shortfall Advisory
    await commitmentsTab.click();
    await page.waitForTimeout(800);

    // Verify Deficit Advisory is displayed
    const deficitHeading = page.locator('text=No Free Surplus Detected');
    await expect(deficitHeading).toBeVisible({ timeout: 10000 });

    const expenseReductionArea = page.locator('text=Areas of Expense to Reduce');
    await expect(expenseReductionArea).toBeVisible();

    const extraIncomeArea = page.locator('text=Extra Monthly Income Needed');
    await expect(extraIncomeArea).toBeVisible();

    const breakevenTarget = page.locator('text=Minimum Breakeven Target');
    await expect(breakevenTarget).toBeVisible();

    const fastTrackTarget = page.locator('text=Fast-Track Payoff');
    await expect(fastTrackTarget).toBeVisible();

    // Scroll into view and capture Deficit Advisory screenshot
    await deficitHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/debt_deficit_advisory_verified.png' });
  });
});
