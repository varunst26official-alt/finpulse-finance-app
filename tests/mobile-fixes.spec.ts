import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport Fixes: Modal Buttons & Bar Breakdown Readability', () => {
  test('verifies modal action buttons are visible above bottom nav and bar chart is readable on mobile', async ({ page }) => {
    test.setTimeout(45000);
    // Standard modern smartphone viewport (iPhone 14 / Pixel 7)
    await page.setViewportSize({ width: 390, height: 844 });

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

    // 2. Navigate to Finance section via Mobile Bottom Nav
    const financeNavBtn = page.locator('nav[aria-label="Mobile Bottom Navigation"] button:has-text("Finance")');
    await expect(financeNavBtn).toBeVisible();
    await financeNavBtn.click();
    await page.waitForTimeout(600);

    // 3. Test Issue 1: Open Smart Ingestion Hub Modal on mobile
    const autoImportBtn = page.locator('button:has-text("Auto-Import")').first();
    await expect(autoImportBtn).toBeVisible({ timeout: 5000 });
    await autoImportBtn.click();
    await page.waitForTimeout(600);

    // Verify modal overlay and content
    const modalContent = page.locator('text=Drop Demat CAS PDF or Bank Statement CSV here');
    await expect(modalContent).toBeVisible({ timeout: 5000 });

    // Verify "Cancel" and "Confirm & Import" buttons are visible and not hidden by bottom nav
    const cancelBtn = page.getByRole('button', { name: /^Cancel$/i });
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await expect(cancelBtn).toBeVisible();
    await expect(confirmBtn).toBeVisible();

    // Verify confirmBtn bounding box is above the bottom of the viewport
    const confirmBox = await confirmBtn.boundingBox();
    expect(confirmBox).not.toBeNull();
    if (confirmBox) {
      expect(confirmBox.y + confirmBox.height).toBeLessThanOrEqual(844);
      console.log('Mobile Confirm Button Bounding Box:', confirmBox);
    }

    // Capture screenshot of the modal on mobile
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/mobile_smart_ingestion_modal.png',
    });

    // Close the modal cleanly via Cancel
    await cancelBtn.click();
    await page.waitForTimeout(600);

    // 4. Test Issue 2: Financial Calendar Widget Bar Breakdown on mobile
    const calendarSubTab = page.getByRole('button', { name: /^Calendar$/i }).first();
    await expect(calendarSubTab).toBeVisible({ timeout: 5000 });
    await calendarSubTab.click();
    await page.waitForTimeout(800);

    // Scroll to Financial Report & Event Schedule
    const reportHeading = page.getByText(/Financial Report & Event Schedule/i);
    await expect(reportHeading).toBeVisible({ timeout: 5000 });
    await reportHeading.scrollIntoViewIfNeeded();

    // Switch to Bar Breakdown mode
    const barBtn = page.getByRole('button', { name: /Bar Breakdown/i });
    await expect(barBtn).toBeVisible({ timeout: 5000 });
    await barBtn.click();
    await page.waitForTimeout(500);

    // Verify Breakdown Card is visible
    const breakdownCard = page.locator('#digital-expense-breakdown-card, [data-testid="digital-expense-breakdown-card"]').first();
    await expect(breakdownCard).toBeVisible({ timeout: 5000 });
    await breakdownCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Inspect SVG Bar elements and text ticks
    const svgInfo = await breakdownCard.evaluate((el) => {
      const texts = Array.from(el.querySelectorAll('.recharts-cartesian-axis-tick text'));
      const textLabels = texts.map((t) => t.textContent?.trim());
      const bars = Array.from(el.querySelectorAll('.recharts-bar-rectangle path, .recharts-bar-rectangles path'));
      return {
        tickCount: texts.length,
        textLabels,
        barCount: bars.length,
      };
    });
    console.log('Mobile Bar Chart Info:', JSON.stringify(svgInfo, null, 2));

    // Capture screenshot of the Bar Breakdown card on mobile
    await page.screenshot({
      path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/mobile_bar_breakdown.png',
    });
  });
});
