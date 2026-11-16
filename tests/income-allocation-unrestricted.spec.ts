import { test, expect } from '@playwright/test';

test.describe('Monthly Income & Allocation Engine: Unrestricted Values & User Bills/Allocation', () => {
  test('verifies income accepts any value (e.g. 32000) without step restrictions and living/bills reflects user data', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1280, height: 900 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Enter demo mode or sign in
    const demoButton = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    if (await demoButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoButton.click();
    } else {
      const signInBtn = page.getByRole('button', { name: /Sign In to Command Centre/i });
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

    // 2. Navigate to Finance section
    const financeTab = page.locator('button:has-text("Finance")').first();
    await financeTab.click();
    await page.waitForTimeout(600);

    // Ensure we are on Overview / Summary subtab
    const summaryBtn = page.getByRole('button', { name: /^Overview$|^Summary$/i }).first();
    if (await summaryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await summaryBtn.click();
      await page.waitForTimeout(400);
    }

    // 3. Verify "Monthly Income & Allocation Engine" card is visible
    const engineHeading = page.getByText(/Monthly Income & Allocation Engine/i);
    await expect(engineHeading).toBeVisible({ timeout: 5000 });

    // 4. Test Unrestricted Income Input:
    // Click "Edit Monthly Income"
    const editIncomeBtn = page.getByRole('button', { name: /Edit Monthly Income/i });
    await expect(editIncomeBtn).toBeVisible();
    await editIncomeBtn.click();
    await page.waitForTimeout(400);

    // Find the income input
    const incomeInput = page.locator('input[placeholder="Monthly Inflow"]');
    await expect(incomeInput).toBeVisible();

    // Type 32000 - the exact value that was previously blocked by HTML5 step="500"
    await incomeInput.fill('32000');
    await page.waitForTimeout(200);

    // Submit form by clicking the submit check button
    const saveIncomeBtn = page.locator('form:has(input[placeholder="Monthly Inflow"]) button[type="submit"]');
    await saveIncomeBtn.click();
    await page.waitForTimeout(800);

    // Verify income is now updated to ₹32,000 without any browser step validation error!
    await expect(page.getByText('₹32,000').first()).toBeVisible();

    // 5. Test Living & Bills card:
    // Verify it shows "Living & Bills", Entered Bills, and Living Allocation
    const livingBillsCard = page.locator('[data-testid="living-bills-card"]');
    await expect(livingBillsCard).toBeVisible();

    // Click edit living budget button
    const editLivingBtn = page.getByRole('button', { name: /Edit Living Budget/i });
    if (await editLivingBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLivingBtn.click();
      await page.waitForTimeout(400);

      // Fill custom living allocation (e.g. 10000)
      const livingInput = page.locator('[data-testid="living-input"]');
      await expect(livingInput).toBeVisible();
      await livingInput.fill('10000');
      await page.waitForTimeout(200);

      // Click save living allocation button
      const saveLivingBtn = page.locator('[data-testid="save-living-btn"]');
      await saveLivingBtn.click();
      await page.waitForTimeout(800);

      // Verify living allocation is updated to 10,000
      await expect(livingBillsCard).toContainText(/10,000/);
    }

    // Capture visual confirmation screenshot
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/unrestricted_income_and_living_allocation.png',
    });
  });
});
