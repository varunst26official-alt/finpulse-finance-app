import { test, expect } from '@playwright/test';

test.describe('User Data Persistence Across Logout and Login', () => {
  test('User goals created in UI persist after logout and are restored on login', async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 1280, height: 800 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // 1. Visit Login Page with fresh storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(800);

    // 2. Switch to registration form and register a unique user
    const switchRegisterBtn = page.locator('button:has-text("Create one now")');
    await expect(switchRegisterBtn).toBeVisible({ timeout: 5000 });
    await switchRegisterBtn.click();
    await page.waitForTimeout(400);

    const uniqueEmail = `persist_ui_${Date.now()}@quantratest.com`;
    const nameInput = page.locator('input[placeholder*="Varun" i], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[placeholder*="email" i], input[type="email"]').first();
    const phoneInput = page.locator('input[placeholder*="98765" i], input[type="tel"]').first();
    const passwordInputs = page.locator('input[type="password"]');

    await nameInput.fill('Persistence Tester');
    await emailInput.fill(uniqueEmail);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('+91 98765 22222');
    }
    await passwordInputs.nth(0).fill('Password123!');
    await passwordInputs.nth(1).fill('Password123!');

    const submitBtn = page.locator('button[type="submit"]:has-text("Complete Registration")');
    await submitBtn.click();

    // Wait for the main dashboard to mount
    await page.waitForSelector('button:has-text("Finance")', { timeout: 12000 });
    await page.waitForTimeout(800);

    // Dismiss tour modal if visible
    const skipTour = page.locator('button[title="Skip Tour"], button:has-text("Skip Tour")').first();
    if (await skipTour.isVisible().catch(() => false)) {
      await skipTour.click({ force: true });
      await page.waitForTimeout(400);
    }

    // 3. Navigate to Finance workspace
    const financeNav = page.locator('button:has-text("Finance"), nav button:has-text("Finance")').first();
    if (await financeNav.isVisible()) {
      await financeNav.click();
      await page.waitForTimeout(600);
    }

    // 4. Click Goals & Milestones subtab
    const goalsTab = page.locator('button:has-text("Goals"):visible').first();
    await expect(goalsTab).toBeVisible({ timeout: 5000 });
    await goalsTab.click();
    await page.waitForTimeout(600);

    // 5. Open Create Goal Modal
    const createGoalBtn = page.locator('button:has-text("Create First Goal"), button:has-text("Create Goal")').first();
    await expect(createGoalBtn).toBeVisible({ timeout: 5000 });
    await createGoalBtn.click();
    await page.waitForTimeout(400);

    // 6. Fill in goal details
    const testGoalTitle = 'Buy Dream Villa 2028';
    const goalTitleInput = page.locator('input[placeholder*="Dream Home" i], input[placeholder*="Fund" i], input[type="text"]').last();
    await goalTitleInput.fill(testGoalTitle);

    const saveGoalBtn = page.locator('button[type="submit"]:has-text("Save Life Goal"), button:has-text("Save Life Goal")');
    await saveGoalBtn.click();
    await page.waitForTimeout(1000);

    // Verify goal is visible in UI
    await expect(page.locator(`text=${testGoalTitle}`).first()).toBeVisible({ timeout: 5000 });
    console.log('[Persistence Test] Goal successfully created in UI:', testGoalTitle);

    // 7. Verify localStorage contains the goal before logout
    const preLogoutState = await page.evaluate((email) => {
      const userKey = `lifeos_usr_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const fin = JSON.parse(localStorage.getItem(`${userKey}_finance`) || '{}');
      return {
        goalsCount: fin.goals?.length || 0,
        goalTitle: fin.goals?.[0]?.title,
      };
    }, uniqueEmail);
    console.log('[Persistence Test] Goals in storage before logout:', preLogoutState.goalsCount);
    expect(preLogoutState.goalsCount).toBeGreaterThanOrEqual(1);

    // 8. Log out
    const profileBtn = page.locator('[data-testid="user-profile-button"]').first();
    await profileBtn.click({ force: true });
    await page.waitForTimeout(400);

    const logoutBtn = page.locator('button:has-text("Sign Out")').first();
    await logoutBtn.click({ force: true });
    await page.waitForSelector('text=Welcome Back', { timeout: 8000 });
    await page.waitForTimeout(800);

    // 9. VERIFY that after logout, localStorage STILL has the user's data!
    const postLogoutState = await page.evaluate((email) => {
      const userKey = `lifeos_usr_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const fin = JSON.parse(localStorage.getItem(`${userKey}_finance`) || '{}');
      return {
        goalsCount: fin.goals?.length || 0,
        goalTitle: fin.goals?.[0]?.title,
      };
    }, uniqueEmail);

    console.log('[Persistence Test] Goals in storage after logout:', postLogoutState.goalsCount);
    expect(postLogoutState.goalsCount).toBeGreaterThanOrEqual(1);
    expect(postLogoutState.goalTitle).toBe(testGoalTitle);

    // 10. Log back in with the same credentials
    const emailLoginInput = page.locator('input[placeholder*="email" i], input[type="email"]').first();
    const passwordLoginInput = page.locator('input[type="password"]').first();
    await emailLoginInput.fill(uniqueEmail);
    await passwordLoginInput.fill('Password123!');

    const signInBtn = page.locator('button[type="submit"]:has-text("Sign In to LifeOS")').first();
    await signInBtn.click();
    await page.waitForSelector('button:has-text("Finance")', { timeout: 12000 });
    await page.waitForTimeout(1000);

    // Dismiss tour if presented
    const skipTourPost = page.locator('button[title="Skip Tour"], button:has-text("Skip Tour")').first();
    if (await skipTourPost.isVisible().catch(() => false)) {
      await skipTourPost.click({ force: true });
      await page.waitForTimeout(400);
    }

    // 11. Navigate to Finance -> Goals and verify the goal is visibly rendered on the page!
    const financeNavPost = page.locator('button:has-text("Finance"), nav button:has-text("Finance")').first();
    if (await financeNavPost.isVisible()) {
      await financeNavPost.click();
      await page.waitForTimeout(600);
    }

    const goalsTabPost = page.locator('button:has-text("Goals"):visible').first();
    await goalsTabPost.click();
    await page.waitForTimeout(600);

    const goalElement = page.locator(`text=${testGoalTitle}`).first();
    await expect(goalElement).toBeVisible({ timeout: 8000 });

    console.log('[Persistence Test] PASS: Goal successfully persisted across logout and restored on login!');
  });
});
