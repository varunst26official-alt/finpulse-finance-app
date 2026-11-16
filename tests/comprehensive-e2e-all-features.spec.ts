import { test, expect, Page } from '@playwright/test';

test.describe('Quantra LifeOS Comprehensive E2E Feature Test Suite (All 7 Workspaces & Core Systems)', () => {
  const TEST_EMAIL = 'varun123@gmail.com';
  const TEST_PASSWORD = '112233';

  async function goToSection(page: Page, sectionId: string, mobileLabel: string) {
    const mobileNav = page.locator('nav[aria-label="Mobile Bottom Navigation"]');
    if (await mobileNav.isVisible({ timeout: 1000 }).catch(() => false)) {
      await mobileNav.getByText(mobileLabel, { exact: true }).click();
    } else {
      await page.locator(`[data-testid="section-${sectionId}"]`).click();
    }
  }

  test.beforeEach(async ({ page }) => {
    // Disable automatic onboarding tour from intercepting test clicks
    await page.addInitScript(() => {
      localStorage.setItem('disable-tour', 'true');
    });

    // Navigate to app
    await page.goto('/');
    
    // Check if on login screen
    const emailInput = page.getByPlaceholder('name@example.com');
    if (await emailInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await emailInput.fill(TEST_EMAIL);
      await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
      await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();
    }

    // Wait for main dashboard to be visible
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 15000 });
  });

  test('Module 1: Authentication, Currency Switcher & Profile Dropdown', async ({ page }) => {
    // 1. Verify Profile Name
    const profileBtn = page.locator('[data-testid="user-profile-button"]');
    await expect(profileBtn).toContainText('Varun');

    // 2. Test Currency Switcher
    const currencyBtn = page.locator('#tour-currency-switcher button').first();
    await expect(currencyBtn).toBeVisible();
    await currencyBtn.click();
    
    // Select USD
    const usdOption = page.locator('button:has-text("USD")');
    if (await usdOption.isVisible({ timeout: 2000 })) {
      await usdOption.click();
      await expect(currencyBtn).toContainText('USD');
    }

    // Switch back to INR
    await currencyBtn.click();
    const inrOption = page.locator('button:has-text("INR")');
    if (await inrOption.isVisible({ timeout: 2000 })) {
      await inrOption.click();
      await expect(currencyBtn).toContainText('INR');
    }

    // 3. Test Profile Dropdown (Verify Retail Options & Absence of Admin)
    await profileBtn.click();
    await expect(page.getByText('Restart LifeOS Tour')).toBeVisible();
    await expect(page.getByText('Reset to Fresh (₹0 Portfolio)')).toBeVisible();
    await expect(page.getByText('Application Admin Page')).not.toBeVisible();
    await profileBtn.click(); // Close dropdown
  });

  test('Module 2: Workspace 1 - Life Overview & Daily Plan', async ({ page }) => {
    await goToSection(page, 'overview', 'Overview');
    await expect(page.getByText('Your life, in one clear view')).toBeVisible();

    // Verify Metric cards
    await expect(page.getByText('Net Worth')).toBeVisible();
    await expect(page.getByRole('heading', { name: /At a glance/i })).toBeVisible();
  });

  test('Module 3: Workspace 2 - Financial Portfolio & Add Trade Flow', async ({ page }) => {
    await goToSection(page, 'finance', 'Finance');
    await expect(page.getByText('Take control of your finances')).toBeVisible();

    // Verify Financial Sub-tabs (matches desktop 'Holdings & Allocation' and mobile 'Holdings')
    await expect(page.getByRole('main').getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: /Holdings/i })).toBeVisible();

    // Test Open Add Trade Modal
    const addTradeBtn = page.getByRole('button', { name: /\+ Add Trade|\+ Record Trade/i }).first();
    await expect(addTradeBtn).toBeVisible();
    await addTradeBtn.click();

    // Verify modal appeared
    await expect(page.getByText('Unified Financial Entry & Planner')).toBeVisible({ timeout: 5000 });
    
    // Close modal
    const closeBtn = page.getByRole('button', { name: 'Close' });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('Module 4: Workspace 3 - Fitness, Wellness & Clinical Biometrics', async ({ page }) => {
    await goToSection(page, 'wellness', 'Fitness');
    await expect(page.getByText('Build healthier daily habits')).toBeVisible();
    await expect(page.getByText(/Adaptive Metabolic Health|Clinical Biometrics|Hydration/i).first()).toBeVisible();
  });

  test('Module 5: Workspace 4 - Productivity & Tasks', async ({ page }) => {
    await goToSection(page, 'productivity', 'Tasks');
    await expect(page.getByText('Make space for what matters')).toBeVisible();
  });

  test('Module 6: Workspace 5 - Learning & Career', async ({ page }) => {
    await goToSection(page, 'learning', 'Career');
    await expect(page.getByText('Invest in your next chapter')).toBeVisible();
  });

  test('Module 7: Workspace 6 - Life Administration & Vault', async ({ page }) => {
    await goToSection(page, 'lifeadmin', 'Admin');
    await expect(page.getByText("Keep life's essentials organized")).toBeVisible();
  });

  test('Module 8: Workspace 7 - Community & Platform Leaderboard', async ({ page }) => {
    await goToSection(page, 'community', 'Ranks');
    await expect(page.getByText('Life Mastery League & Community')).toBeVisible();
    await expect(page.getByText('Your Section-Wise Mastery Index')).toBeVisible();
  });

  test('Module 9: AI Copilot & Quantrix Floating Assistant', async ({ page }) => {
    const copilotBtn = page.getByRole('button', { name: 'Open Quantrix AI Copilot' });
    await expect(copilotBtn).toBeVisible();
    await copilotBtn.click();
    await expect(page.getByText('Quantrix 2.0')).toBeVisible();
  });
});
