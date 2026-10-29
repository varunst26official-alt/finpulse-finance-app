import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Full Application Comprehensive User Walkthrough & Audit', () => {
  const screenshotsDir = path.resolve('reports/application-audit/screenshots');

  test('walks through entire application lifecycle as an end-user', async ({ page }) => {
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
      else consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // =========================================================================
    // 1. FIRST-TIME USER JOURNEY: LANDING & REGISTRATION
    // =========================================================================
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotsDir}/01_auth_screen_landing.png`, fullPage: true });

    // Verify Auth elements
    await expect(page.getByText('One Operating System for Your Whole Life')).toBeVisible();
    await page.getByRole('button', { name: /First-Time Register/i }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotsDir}/02_auth_register_form.png`, fullPage: true });

    // Fill registration
    await page.getByPlaceholder('Enter your full name').fill('Auditor Alex');
    await page.getByPlaceholder('name@example.com').fill('auditor.alex@quantra.io');
    await page.getByPlaceholder('Phone number').fill('9876543299');
    await page.getByPlaceholder('Password (min 6 chars)').fill('AuditSecure123');
    await page.getByPlaceholder('Confirm password').fill('AuditSecure123');
    await page.getByRole('button', { name: 'Complete Registration & Open Dashboard' }).click();

    // Verify Dashboard Landing
    await expect(page.getByText('QUANTRA')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${screenshotsDir}/03_first_time_dashboard_tour.png`, fullPage: true });

    // Close or skip tour guide
    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
    if (await skipTourBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourBtn.click();
      await page.waitForTimeout(500);
    }

    // =========================================================================
    // 2. WORKSPACE 1: LIFE OVERVIEW
    // =========================================================================
    await page.screenshot({ path: `${screenshotsDir}/04_life_overview_workspace.png`, fullPage: true });

    // Verify Overview Components
    await expect(page.getByText(/Finance net worth|Active goals|At a glance/i).first()).toBeVisible();
    await expect(page.getByText(/Income & Spending Intelligence|Cash Flow/i).first()).toBeVisible();

    // =========================================================================
    // 3. WORKSPACE 2: FINANCE WORKSPACE (All 7 Sub-tabs)
    // =========================================================================
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/05_finance_overview.png`, fullPage: true });

    // Sub-tab 2: Bank & UPI Statements
    await page.getByRole('button', { name: /Bank & UPI Statements/i }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotsDir}/06_finance_bank_statements_hub.png`, fullPage: true });

    // Test Ingestion: Import Statement
    const importBtn = page.getByRole('button', { name: /Import Statement|⚡ Auto-Import/i }).first();
    await importBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotsDir}/07_smart_ingestion_hub_modal.png`, fullPage: true });

    // Load Google Pay statement demo
    const loadGpayBtn = page.locator('[data-testid="load-gpay-btn"]');
    if (await loadGpayBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loadGpayBtn.click();
      await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
      await page.screenshot({ path: `${screenshotsDir}/08_gpay_parsed_review.png`, fullPage: true });
      await page.getByRole('button', { name: /Confirm & Import/i }).click();
      await page.waitForTimeout(1500);
    }

    // Sub-tab 3: Financial Calendar (3rd in section)
    await page.getByRole('button', { name: 'Financial Calendar', exact: true }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/09_finance_calendar_3rd_tab.png`, fullPage: true });

    // Sub-tab 4: Holdings & Allocation
    await page.getByRole('button', { name: /Holdings & Allocation/i }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotsDir}/11_finance_holdings_allocation.png`, fullPage: true });

    // Sub-tab 5: Debts, Protection & Vault (Combined)
    await page.getByRole('button', { name: /Debts, Protection & Vault/i }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotsDir}/12_finance_commitments_vault_combined.png`, fullPage: true });

    // Sub-tab 6: Transactions Ledger
    await page.getByRole('button', { name: /Transactions Ledger/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/13_finance_transactions_ledger.png`, fullPage: true });

    // Test Record Trade Modal
    await page.getByRole('button', { name: /Record Trade/i }).first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotsDir}/14_add_trade_modal.png`, fullPage: true });
    // Cancel modal
    await page.getByRole('button', { name: /Cancel/i }).first().click();
    await page.waitForTimeout(300);

    // =========================================================================
    // 4. WORKSPACE 3: FITNESS & WELLNESS
    // =========================================================================
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Fitness & Wellness/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/15_wellness_workspace.png`, fullPage: true });

    // Test Water Hydration + Bottle
    const addBottleBtn = page.getByRole('button', { name: /Bottle/i });
    if (await addBottleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addBottleBtn.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${screenshotsDir}/16_wellness_water_logged.png`, fullPage: true });
    }

    // =========================================================================
    // 5. WORKSPACE 4: PRODUCTIVITY & TASKS
    // =========================================================================
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Productivity/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/17_productivity_workspace.png`, fullPage: true });

    // Add a Task
    const addTaskBtn = page.getByRole('button', { name: '+ Add a Task' }).first();
    if (await addTaskBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addTaskBtn.click();
      const taskInput = page.getByPlaceholder('e.g., Review weekly project milestones');
      await taskInput.fill('Audit Test: Verify Pomodoro focus timer');
      await page.locator('form').getByRole('button', { name: 'Add Task' }).click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${screenshotsDir}/18_productivity_task_added.png`, fullPage: true });
    }

    // =========================================================================
    // 6. WORKSPACE 5: LEARNING & CAREER
    // =========================================================================
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Learning & Career/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/19_learning_workspace.png`, fullPage: true });

    // =========================================================================
    // 7. WORKSPACE 6: LIFE ADMINISTRATION
    // =========================================================================
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Life Administration/i }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${screenshotsDir}/20_life_admin_workspace.png`, fullPage: true });

    // =========================================================================
    // 8. CROSS-CUTTING AI & BLUEPRINT MODALS
    // =========================================================================
    // Open AI Blueprint Modal
    const blueprintBtn = page.getByRole('button', { name: /AI Blueprint/i }).first();
    if (await blueprintBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await blueprintBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${screenshotsDir}/21_ai_blueprint_modal.png`, fullPage: true });
      // Close modal
      const closeBlueprint = page.locator('button:has-text("✕"), button:has-text("Close"), button[aria-label="Close"]').first();
      if (await closeBlueprint.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBlueprint.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(400);
    }

    // Open Floating AI Chat Copilot
    const chatTrigger = page.locator('button[title*="Copilot"], button:has-text("Ask LifeOS")').first();
    if (await chatTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chatTrigger.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${screenshotsDir}/22_floating_ai_copilot_opened.png`, fullPage: true });
    }

    // =========================================================================
    // 9. RESPONSIVE VIEWPORT CHECKS
    // =========================================================================
    // Tablet Viewport (768 x 1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotsDir}/23_responsive_tablet_768px.png`, fullPage: true });

    // Mobile Viewport (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshotsDir}/24_responsive_mobile_390px.png`, fullPage: true });

    console.log(`[AUDIT COMPLETE] Logged ${consoleLogs.length} events and ${consoleErrors.length} errors.`);
  });
});
