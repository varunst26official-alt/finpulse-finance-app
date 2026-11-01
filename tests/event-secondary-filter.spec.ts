import { test, expect } from '@playwright/test';

test.describe('Financial Event Schedule Secondary Filter & Digital Pie Graph', () => {
  test('verifies dynamic secondary merchant filter and digital expense pie breakdown', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1280, height: 950 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Enter demo mode
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

    // 2. Navigate to Finance section
    const financeTab = page.locator('button:has-text("Finance")').first();
    await financeTab.click();
    await page.waitForTimeout(600);

    // 3. Navigate to Calendar & Ledger subtab
    const calendarSubTab = page.locator('button:has-text("Calendar & Ledger"), button:has-text("Calendar")').first();
    await expect(calendarSubTab).toBeVisible({ timeout: 5000 });
    await calendarSubTab.click();
    await page.waitForTimeout(800);

    // 4. Verify "Financial Report & Event Schedule" section is visible
    const reportHeading = page.getByText(/Financial Report & Event Schedule/i);
    await expect(reportHeading).toBeVisible({ timeout: 5000 });
    await reportHeading.scrollIntoViewIfNeeded();

    // 5. Verify the Primary Filter exists and has Event Categories
    const primarySelect = page.locator('select[title*="Event Category"]').first();
    await expect(primarySelect).toBeVisible();

    // 6. Verify the Secondary Filter (calculated dynamically from transactions) exists
    const secondarySelect = page.locator('select[title*="Payee or Merchant"]').first();
    await expect(secondarySelect).toBeVisible();

    // Verify secondary select has options populated from transactions
    const optionCount = await secondarySelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(1);

    // 7. Verify Digital Expense Breakdown card is rendered
    const breakdownHeader = page.getByText(/Digital Expense Breakdown/i);
    await expect(breakdownHeader).toBeVisible();

    // Verify Donut Pie and Bar Breakdown switcher buttons
    const donutBtn = page.getByRole('button', { name: /Donut Pie/i });
    const barBtn = page.getByRole('button', { name: /Bar Breakdown/i });
    await expect(donutBtn).toBeVisible();
    await expect(barBtn).toBeVisible();

    // 8. Test Secondary Filter interaction
    // Get second option value (first actual merchant after "All Payees / Merchants")
    const secondOptionVal = await secondarySelect.locator('option').nth(1).getAttribute('value');
    if (secondOptionVal && secondOptionVal !== 'ALL') {
      await secondarySelect.selectOption(secondOptionVal);
      await page.waitForTimeout(400);

      // Verify clear button appears with selected merchant name
      const resetTag = page.locator('button[title="Clear Payee filter"]');
      await expect(resetTag).toBeVisible();

      // Clear the filter
      await resetTag.click();
      await page.waitForTimeout(400);
      await expect(secondarySelect).toHaveValue('ALL');
    }

    // 9. Switch to Bar Breakdown mode
    await barBtn.click();
    await page.waitForTimeout(300);

    // 10. Switch back to Donut Pie mode
    await donutBtn.click();
    await page.waitForTimeout(300);

    // Scroll breakdown card into view and capture element screenshot
    const chartCard = page.locator('#digital-expense-breakdown-card, [data-testid="digital-expense-breakdown-card"]').first();
    await chartCard.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    const targetCard = (await chartCard.isVisible().catch(() => false))
      ? chartCard
      : page.locator('div').filter({ hasText: 'Digital Expense Breakdown' }).filter({ has: page.getByRole('button', { name: /Donut Pie/i }) }).last();
    await targetCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Capture visual element screenshot of the new chart and filter controls
    await targetCard.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/financial_event_filter_and_pie_chart.png',
    });
  });
});
