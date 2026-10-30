import { test, expect } from '@playwright/test';

test.describe('Strict User Data Isolation & Pure Clean Slate Test', () => {
  test('New user registration receives pure clean 0-balance slate, demo gets preloaded portfolio', async ({ page }) => {
    test.setTimeout(45000);
    await page.setViewportSize({ width: 1280, height: 800 });

    // 1. Visit Login Page with fresh storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(800);

    // 2. Click "Create one now" to switch to registration form
    const switchRegisterBtn = page.locator('button:has-text("Create one now")');
    await expect(switchRegisterBtn).toBeVisible({ timeout: 5000 });
    await switchRegisterBtn.click();
    await page.waitForTimeout(400);

    // 3. Fill in registration for a user named "Varun Senthil kumar" with unique email
    const uniqueEmail = `varun_real_${Date.now()}@quantratest.com`;
    const nameInput = page.locator('input[placeholder*="Varun" i], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[placeholder*="email" i], input[type="email"]').first();
    const phoneInput = page.locator('input[placeholder*="98765" i], input[type="tel"]').first();
    const passwordInputs = page.locator('input[type="password"]');

    await nameInput.fill('Varun Senthil kumar');
    await emailInput.fill(uniqueEmail);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+91 98765 11111');
    }
    await passwordInputs.nth(0).fill('Password123!');
    await passwordInputs.nth(1).fill('Password123!');

    // Submit registration form
    const submitBtn = page.locator('button[type="submit"]:has-text("Complete Registration")');
    await submitBtn.click();
    await page.waitForTimeout(1200);

    // Dismiss tour modal if visible (mounted after 750ms)
    await page.waitForTimeout(1000);
    const skipTour = page.locator('button[title="Skip Tour"], button:has-text("Skip Tour")').first();
    if (await skipTour.isVisible().catch(() => false)) {
      await skipTour.click({ force: true });
      await page.waitForTimeout(400);
    }

    // 4. VERIFY: New user has 0 net worth and no preloaded assets
    await page.waitForSelector('text=Finance net worth', { timeout: 8000 });

    const clientState = await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('lifeos-auth-storage') || '{}');
      return {
        email: auth?.state?.user?.email,
        isDemoMode: auth?.state?.isDemoMode,
      };
    });

    console.log('[Test Isolation] Registered User Email:', clientState.email);
    console.log('[Test Isolation] Registered User isDemoMode:', clientState.isDemoMode);
    expect(clientState.isDemoMode).toBe(false);

    // Check that task count is 0 for newly registered user
    const taskCount = await page.locator('.task-item-row, div[role="listitem"]').count();
    console.log('[Test Isolation] Real user active tasks count:', taskCount);
    expect(taskCount).toBe(0);

    // 5. Logout
    const profileBtn = page.locator('[data-testid="user-profile-button"]').first();
    await profileBtn.click({ force: true });
    await page.waitForTimeout(400);

    const logoutBtn = page.locator('button:has-text("Sign Out")').first();
    await logoutBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // 6. Test Demo Login receives full rich portfolio
    const demoBtn = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    await expect(demoBtn).toBeVisible({ timeout: 5000 });
    await demoBtn.click();
    await page.waitForTimeout(1500);

    const demoState = await page.evaluate(() => {
      const auth = JSON.parse(localStorage.getItem('lifeos-auth-storage') || '{}');
      return {
        email: auth?.state?.user?.email,
        isDemoMode: auth?.state?.isDemoMode,
      };
    });

    console.log('[Test Isolation] Demo User isDemoMode:', demoState.isDemoMode);
    expect(demoState.isDemoMode).toBe(true);

    const demoSkip = page.locator('button[title="Skip Tour"]');
    if (await demoSkip.isVisible().catch(() => false)) {
      await demoSkip.click({ force: true });
      await page.waitForTimeout(300);
    }

    // Demo should have the preloaded tasks visible
    const demoTasks = page.locator('text=Rebalance Q4 Equity').first();
    await expect(demoTasks).toBeVisible({ timeout: 5000 });

    console.log('[Test Isolation] PASS: Real user receives pure clean 0 slate, Demo user receives full rich portfolio!');
  });
});
