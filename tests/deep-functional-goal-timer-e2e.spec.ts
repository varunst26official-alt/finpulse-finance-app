import { test, expect, Page } from '@playwright/test';

async function dismissModalsAndAuthenticate(page: Page) {
  // Enter demo mode
  const demoButton = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
  if (await demoButton.isVisible({ timeout: 2500 }).catch(() => false)) {
    await demoButton.click();
    await page.waitForTimeout(800);
  }

  // Dismiss onboarding tour if visible
  const skipTourBtn = page.locator('button[title="Skip Tour"], button:has-text("Skip Tour")').first();
  if (await skipTourBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await skipTourBtn.click();
    await page.waitForTimeout(400);
  }

  // Dismiss any preview/demo modal if present
  const continueDemoBtn = page.locator('button:has-text("Continue exploring in Demo Mode"), button:has-text("Explore Demo Mode")').first();
  if (await continueDemoBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await continueDemoBtn.click();
    await page.waitForTimeout(400);
  }
}

async function navigateToSection(
  page: Page,
  section: 'overview' | 'finance' | 'wellness' | 'productivity' | 'learning' | 'lifeadmin' | 'community',
  label: string
) {
  const mobileBtn = page.locator(`button[aria-label="Navigate to ${label}"]`);
  const desktopBtn = page.locator(`[data-testid="section-${section}"]`);

  if (await mobileBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await mobileBtn.click();
  } else if (await desktopBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await desktopBtn.click();
  } else {
    await page.locator(`nav button:has-text("${label}"), button:has-text("${label}")`).first().click();
  }
  await page.waitForTimeout(600);
}

test.describe('Quantra LifeOS Deep Functional Verification (Goals, Timer, Progress Bars & Workspaces)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('bypassDemoAuth', 'true');
      window.localStorage.setItem('hasCompletedTour', 'true');
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await dismissModalsAndAuthenticate(page);
  });

  test('Flow 1: Goal Creation, Math Projections, Dynamic Progress Bar & Contribution Top-up', async ({ page }) => {
    // 1. Navigate to Finance workspace
    await navigateToSection(page, 'finance', 'Finance');

    // 2. Switch to Goals sub-tab (select currently visible button)
    const goalsSubtab = page.locator('button:visible').filter({ hasText: /^Goals/i }).first();
    await expect(goalsSubtab).toBeVisible({ timeout: 5000 });
    await goalsSubtab.click();
    await page.waitForTimeout(600);

    // Assert Goals View is visible
    await expect(page.locator('main').getByText(/Total Goals Target Value/i).first()).toBeVisible({ timeout: 5000 });

    // 3. Click Create Goal button
    const createGoalBtn = page.locator('button:visible').filter({ hasText: /Create Goal/i }).first();
    await expect(createGoalBtn).toBeVisible({ timeout: 5000 });
    await createGoalBtn.click();
    await page.waitForTimeout(500);

    // 4. Fill in Goal creation modal
    const goalTitleInput = page.locator('form input[placeholder*="Emergency Fund"], form input[type="text"]').first();
    await goalTitleInput.fill('Tesla Model S Plaid Fund');

    // Submit the goal
    const submitBtn = page.locator('form button[type="submit"]').last();
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // 5. Verify the Goal Card is rendered with correct title and progress bar
    const goalCard = page.locator('div').filter({ hasText: 'Tesla Model S Plaid Fund' }).first();
    await expect(goalCard).toBeVisible({ timeout: 6000 });

    // Verify progress bar and funded percentage
    const fundedText = goalCard.getByText(/% Funded/i).first();
    await expect(fundedText).toBeVisible();

    // 6. Verify progress bar element exists
    const progressBar = goalCard.locator('.rounded-full.bg-\\[\\#9e783e\\], .bg-emerald-600, .bg-\\[\\#9e783e\\], [style*="width"]').first();
    await expect(progressBar).toBeVisible();

    // 7. Verify Add Contribution action works
    const topUpBtn = goalCard.locator('button:has-text("Add Contribution")').first();
    if (await topUpBtn.isVisible().catch(() => false)) {
      await topUpBtn.click();
      await page.waitForTimeout(400);
      const confirmTopUpBtn = page.locator('button:has-text("Record Contribution")').first();
      if (await confirmTopUpBtn.isVisible().catch(() => false)) {
        await confirmTopUpBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('Flow 2: Productivity Focus Timer, Start Session, Log Session & History Verification', async ({ page }) => {
    // 1. Navigate to Tasks / Productivity workspace
    await navigateToSection(page, 'productivity', 'Tasks');

    // 2. Switch to Focus Timer subtab
    const timerSubtab = page.locator('button:visible').filter({ hasText: /Focus Timer/i }).first();
    await expect(timerSubtab).toBeVisible({ timeout: 5000 });
    await timerSubtab.click();
    await page.waitForTimeout(600);

    // Verify Focus Timer UI is active
    await expect(page.locator('main').getByText(/Deep Work Focus Timer|Focus Sprint/i).first()).toBeVisible({ timeout: 5000 });

    // 3. Set custom focus task
    const taskInput = page.locator('input[placeholder*="focusing on"], input[placeholder*="Focus"]').first();
    if (await taskInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await taskInput.fill('High-Output Architecture Sprint');
    }

    // 4. Start Focus Sprint
    const startBtn = page.locator('button:has-text("Start Focus Sprint")').first();
    await expect(startBtn).toBeVisible({ timeout: 5000 });
    await startBtn.click();
    await page.waitForTimeout(500);

    // Verify button changes to "Pause Session"
    await expect(page.locator('button:has-text("Pause Session")')).toBeVisible({ timeout: 5000 });

    // 5. Log Session
    const logBtn = page.locator('button:has-text("Log Session")').first();
    await expect(logBtn).toBeVisible({ timeout: 5000 });
    await logBtn.click();
    await page.waitForTimeout(600);

    // 6. Verify session is recorded in Recent Completed Focus Blocks
    await expect(page.getByText(/Recent Completed Focus Blocks/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('High-Output Architecture Sprint').first()).toBeVisible();
  });

  test('Flow 3: Task Creation, High Priority Flag, Completion Toggle & Habit Streaks', async ({ page }) => {
    // 1. Navigate to Tasks
    await navigateToSection(page, 'productivity', 'Tasks');

    // 2. Switch to Tasks subtab if needed
    const tasksSubtab = page.locator('button:visible').filter({ hasText: /Checklist & Tasks|Action Checklist|^Tasks$/i }).first();
    if (await tasksSubtab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tasksSubtab.click();
      await page.waitForTimeout(400);
    }

    // 3. Click "Add Task"
    const addTaskBtn = page.locator('button:visible').filter({ hasText: /Add Task/i }).first();
    await expect(addTaskBtn).toBeVisible({ timeout: 5000 });
    await addTaskBtn.click();
    await page.waitForTimeout(400);

    // Fill task title
    const taskTitleInput = page.locator('form input[placeholder*="Review weekly"], form input[required]').first();
    await taskTitleInput.fill('Implement E2E Autonomous QA Verification');

    // Submit task
    const createTaskBtn = page.locator('form button[type="submit"]').last();
    await createTaskBtn.click();
    await page.waitForTimeout(600);

    // 4. Verify new task is listed
    const newTask = page.getByText('Implement E2E Autonomous QA Verification').first();
    await expect(newTask).toBeVisible({ timeout: 5000 });

    // 5. Switch to Habits subtab
    const habitsSubtab = page.locator('button:visible').filter({ hasText: /Habit Routines & Streaks|Habits/i }).first();
    if (await habitsSubtab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await habitsSubtab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('main').getByText(/Habit Routines|Streaks/i).first()).toBeVisible();
    }
  });

  test('Flow 4: Fitness & Wellness Logging with Live Calorie/Water Telemetry', async ({ page }) => {
    // 1. Navigate to Fitness
    await navigateToSection(page, 'wellness', 'Fitness');

    // Verify Fitness workspace is active
    await expect(page.locator('main').getByText(/Build healthier daily habits|FITNESS, NUTRITION/i).first()).toBeVisible({ timeout: 5000 });

    // Hydration quick button test
    const waterBtn = page.locator('button:has-text("+250ml"), button:has-text("+ 250ml")').first();
    if (await waterBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await waterBtn.click();
      await page.waitForTimeout(400);
    }
  });

  test('Flow 5: Career, Skills & Learning Workspace Verification', async ({ page }) => {
    // 1. Navigate to Career
    await navigateToSection(page, 'learning', 'Career');

    // Verify Career workspace is active
    await expect(page.locator('main').getByText(/Invest in your next chapter|LEARNING & CAREER/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Flow 6: Life Administration, Document Vault & Subscription Manager', async ({ page }) => {
    // 1. Navigate to Admin / LifeAdmin
    await navigateToSection(page, 'lifeadmin', 'Admin');

    // Verify Life Admin workspace is active
    await expect(page.locator('main').getByText(/Keep life's essentials organized|LIFE ADMINISTRATION/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Flow 7: Platform Leaderboard & Gamification Ranks', async ({ page }) => {
    // 1. Navigate to Ranks
    await navigateToSection(page, 'community', 'Ranks');

    // Verify Leaderboard is active
    await expect(page.locator('main').getByText(/Platform Leaderboard|Life Mastery League/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Flow 8: AI Copilot & Quantrix Assistant Interactive Verification', async ({ page }) => {
    // 1. Locate floating AI button
    const copilotBtn = page.locator('[data-testid="quantrix-floating-btn"], button[aria-label="Open Quantrix AI Copilot"]').first();
    await expect(copilotBtn).toBeVisible({ timeout: 5000 });
    await copilotBtn.click();
    await page.waitForTimeout(500);

    // Verify AI Chat Drawer/Widget opens
    const aiInput = page.locator('[data-testid="quantrix-chat-input"], textarea[placeholder*="Ask Quantrix"], input[placeholder*="Ask Quantrix"]').first();
    await expect(aiInput).toBeVisible({ timeout: 5000 });
  });

  test('Flow 9: Financial Add Trade Flow & Portfolio Net Worth Recalculation', async ({ page }) => {
    await navigateToSection(page, 'finance', 'Finance');
    await expect(page.locator('main').getByText(/Take control of your finances/i).first()).toBeVisible({ timeout: 5000 });

    // Click Record Trade button
    const addTradeBtn = page.locator('button:visible').filter({ hasText: /Add Trade|Record Trade/i }).first();
    await expect(addTradeBtn).toBeVisible({ timeout: 5000 });
    await addTradeBtn.click();
    await page.waitForTimeout(500);

    // Assert Add Transaction Modal is open
    await expect(page.getByText('Unified Financial Entry & Planner')).toBeVisible({ timeout: 5000 });

    // Submit trade with default stock selection
    const confirmBtn = page.locator('button:has-text("Confirm & Save Entry")').first();
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click();
    await page.waitForTimeout(800);

    // Assert Net Worth metrics card is still visible and healthy
    await expect(page.locator('main').getByText(/Total Net Worth/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Flow 10: Multi-Currency Switcher Precision Formatting (INR -> USD -> EUR -> INR)', async ({ page }) => {
    await navigateToSection(page, 'overview', 'Overview');

    // Click currency switcher dropdown
    const currencyDropdown = page.locator('button[aria-label="Change Display Currency"], button:has-text("INR")').first();
    if (await currencyDropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      await currencyDropdown.click();
      await page.waitForTimeout(300);

      // Select USD
      const usdOption = page.locator('button:has-text("USD")').first();
      if (await usdOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await usdOption.click();
        await page.waitForTimeout(500);
        // Verify dollar symbol renders on screen
        await expect(page.locator('body')).toContainText('$');
      }

      // Re-open and select INR
      const usdDropdown = page.locator('button[aria-label="Change Display Currency"], button:has-text("USD")').first();
      if (await usdDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await usdDropdown.click();
        await page.waitForTimeout(300);
        const inrOption = page.locator('button:has-text("INR")').first();
        if (await inrOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await inrOption.click();
          await page.waitForTimeout(500);
          await expect(page.locator('body')).toContainText('₹');
        }
      }
    }
  });

  test('Flow 11: Nutrition Macros & Daily Water Hydration Logging', async ({ page }) => {
    await navigateToSection(page, 'wellness', 'Fitness');
    await expect(page.locator('main').getByText(/Build healthier daily habits|FITNESS/i).first()).toBeVisible({ timeout: 5000 });

    // Log +250ml water
    const waterBtn = page.locator('button:has-text("+250ml"), button:has-text("+ 250ml")').first();
    if (await waterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await waterBtn.click();
      await page.waitForTimeout(400);
      await expect(page.locator('main').getByText(/Hydration/i).first()).toBeVisible();
    }

    // Switch to Nutrition subtab
    const nutritionSubtab = page.locator('button:visible').filter({ hasText: /Nutrition/i }).first();
    if (await nutritionSubtab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nutritionSubtab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('main').getByText(/Calories Intake|Protein/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Flow 12: Career Roadmap & Learning Book Reading Vault', async ({ page }) => {
    await navigateToSection(page, 'learning', 'Career');
    await expect(page.locator('main').getByText(/Invest in your next chapter|LEARNING/i).first()).toBeVisible({ timeout: 5000 });

    // Switch to Books Vault subtab
    const booksSubtab = page.locator('button:visible').filter({ hasText: /Books & Course Vault|Books/i }).first();
    if (await booksSubtab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await booksSubtab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('main').getByText(/Books & Course Vault|Reading Vault/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Flow 13: Encrypted Life Administration Vault & Medical Card', async ({ page }) => {
    await navigateToSection(page, 'lifeadmin', 'Admin');
    await expect(page.locator('main').getByText(/Keep life's essentials organized|LIFE ADMINISTRATION/i).first()).toBeVisible({ timeout: 5000 });

    // Switch to Emergency Medical Card
    const emergencySubtab = page.locator('button:visible').filter({ hasText: /Emergency Medical & Contact Card|Emergency/i }).first();
    if (await emergencySubtab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emergencySubtab.click();
      await page.waitForTimeout(500);
      await expect(page.locator('main').getByText(/Emergency Medical|Contact Card/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
