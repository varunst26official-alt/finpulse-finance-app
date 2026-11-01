import { test, expect } from '@playwright/test';

test.describe('Quantrix AI Copilot Enhanced Capabilities', () => {
  test('Quantrix Bot handles natural language action execution, interactive cards, and voice UI for authenticated user', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Visit Login Page and clear storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(800);

    // 2. Register fresh real user
    const switchRegisterBtn = page.locator('button:has-text("Create one now")');
    await expect(switchRegisterBtn).toBeVisible({ timeout: 5000 });
    await switchRegisterBtn.click();
    await page.waitForTimeout(400);

    const uniqueEmail = `quantrix_${Date.now()}@quantratest.com`;
    await page.locator('input[placeholder*="Varun" i], input[placeholder*="name" i]').first().fill('Quantrix Tester');
    await page.locator('input[placeholder*="email" i], input[type="email"]').first().fill(uniqueEmail);
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('Password123!');
    await passwordInputs.nth(1).fill('Password123!');
    await page.locator('button[type="submit"]:has-text("Complete Registration")').click();

    // Dismiss tour modal if visible
    await page.waitForTimeout(1000);
    const skipTourBtn = page.locator('button[title="Skip Tour"], button:has-text("Skip Tour")').first();
    if (await skipTourBtn.isVisible()) {
      await skipTourBtn.click();
    }
    await page.waitForTimeout(500);

    // 3. Open Quantrix AI floating widget
    const quantrixLauncher = page.locator('#tour-floating-copilot');
    await expect(quantrixLauncher).toBeVisible({ timeout: 5000 });
    await quantrixLauncher.click();

    // Verify chat window is open
    await expect(page.getByText('Quantrix 2.0')).toBeVisible({ timeout: 5000 });

    // 4. Test Mic / Voice button exists
    const micButton = page.locator('button[title*="voice" i], button[title*="Voice" i], button[title*="speech" i]').first();
    await expect(micButton).toBeVisible();

    // 5. Test Natural Language Action: "drink 500ml water"
    const inputField = page.getByRole('textbox');
    await expect(inputField).toBeVisible({ timeout: 5000 });
    await inputField.fill('drink 500ml water');
    await inputField.press('Enter');

    // Verify Action Slip Card appears with "Confirm & Execute Action" button
    const executeWaterBtn = page.getByRole('button', { name: /Confirm & Execute Action/i }).first();
    await expect(executeWaterBtn).toBeVisible({ timeout: 6000 });
    await executeWaterBtn.click();

    // Verify Action execution confirmation
    await expect(page.getByText(/Hydration Recorded!/i)).toBeVisible({ timeout: 6000 });

    // 6. Test Interactive Card: "fire calculator"
    await inputField.fill('fire calculator');
    await inputField.press('Enter');

    // Verify FIRE Gauge Card appears
    await expect(page.getByText(/FIRE Milestone Readiness|Financial Independence/i).first()).toBeVisible({ timeout: 6000 });

    // 7. Test Task creation: "remind me to review portfolio at 5pm"
    await inputField.fill('remind me to review portfolio at 5pm');
    await inputField.press('Enter');

    // Verify Action Slip for task creation
    const executeTaskBtn = page.getByRole('button', { name: /Confirm & Execute Action/i }).last();
    await expect(executeTaskBtn).toBeVisible({ timeout: 6000 });
    await executeTaskBtn.click();

    // Verify Task Created confirmation
    await expect(page.getByText(/Task Created and Added to Live Agenda!/i)).toBeVisible({ timeout: 6000 });

    // Capture screenshot of the chat window for visual verification
    await page.screenshot({ path: 'C:/Users/Admin/.gemini/antigravity/brain/9282e259-53be-4163-b3c8-d35c4935b146/chat_ui_verified.png' });
  });
});
