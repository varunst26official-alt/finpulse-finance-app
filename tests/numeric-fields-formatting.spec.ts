import { test, expect } from '@playwright/test';

test.describe('Numeric Fields: Preceding Zero Removal and Exact Amount Text Display', () => {
  test('verifies no leading zeros and exact formatted text is shown below numeric fields', async ({ page }) => {
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

    // 2. Navigate to Finance section if not already there
    const financeTab = page.getByRole('button', { name: 'Finance' }).first();
    if (await financeTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await financeTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // 3. Open Goals & Milestones subtab
    const goalsTab = page.getByRole('button', { name: /Goals & Milestones/i }).first();
    await expect(goalsTab).toBeVisible({ timeout: 10000 });
    await goalsTab.click({ force: true });
    await page.waitForTimeout(600);

    // 4. Click "Create Goal" button
    const createGoalBtn = page.getByRole('button', { name: /Create Goal/i }).first();
    await expect(createGoalBtn).toBeVisible({ timeout: 8000 });
    await createGoalBtn.click({ force: true });
    await page.waitForTimeout(500);

    // 5. Verify modal opened: "Create New Life Goal"
    await expect(page.getByText('Create New Life Goal')).toBeVisible({ timeout: 5000 });

    // 6. Test Target Amount input:
    // Attempt to type with leading zero: '0150000'
    const targetInput = page.locator('[data-testid="target-amount-input"]');
    await expect(targetInput).toBeVisible();
    await targetInput.click();
    await targetInput.fill('');
    await targetInput.fill('0150000');
    await page.waitForTimeout(200);

    // Verify input value has NO PRECEDING ZERO: must be '150000' or whatever is typed without '0'
    const targetVal = await targetInput.inputValue();
    expect(targetVal.startsWith('0')).toBe(false);
    expect(targetVal).toBe('150000');

    // Verify exact amount text appears below target field: "₹1,50,000 (1.5 Lakhs)"
    await expect(page.getByText(/₹1,50,000/)).toBeVisible();

    // Now test typing 1500000 (15 Lakhs as in user screenshot)
    await targetInput.fill('01500000');
    await page.waitForTimeout(200);
    const targetValLakhs = await targetInput.inputValue();
    expect(targetValLakhs).toBe('1500000');
    await expect(page.getByText(/₹15,00,000/)).toBeVisible();
    await expect(page.getByText(/15 Lakhs/)).toBeVisible();

    // 7. Test Monthly Contribution (SIP) input:
    const sipInput = page.locator('[data-testid="monthly-sip-input"]');
    await expect(sipInput).toBeVisible();
    await sipInput.fill('020000');
    await page.waitForTimeout(200);
    const sipVal = await sipInput.inputValue();
    expect(sipVal).toBe('20000');
    await expect(page.getByText(/₹20,000/)).toBeVisible();
    await expect(page.getByText(/20 Thousand/)).toBeVisible();

    // 8. Test Current Saved input:
    const savedInput = page.locator('[data-testid="current-saved-input"]');
    await expect(savedInput).toBeVisible();
    await savedInput.fill('01000000');
    await page.waitForTimeout(200);
    const savedVal = await savedInput.inputValue();
    expect(savedVal).toBe('1000000');
    await expect(page.getByText(/₹10,00,000/)).toBeVisible();
    await expect(page.getByText(/10 Lakhs/)).toBeVisible();

    // Fill title
    const titleInput = page.locator('input[placeholder*="Emergency Fund, Home Downpayment"]');
    if (await titleInput.isVisible()) {
      await titleInput.fill('Iphone');
    }

    // Capture visual screenshot matching the user's modal
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/modal_numeric_exact_text_verified.png',
    });
  });
});
