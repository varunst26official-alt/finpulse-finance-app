import { test, expect } from '@playwright/test';

test.describe('Application Admin Command Page & Platform Governance Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage and start fresh session with tour disabled
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('disable-tour', 'true');
      localStorage.setItem('lifeos-tour-storage', JSON.stringify({ state: { hasSeenTour: true, isTourOpen: false, seenUserIds: ['*'] }, version: 0 }));
    });
    await page.reload();
  });

  test('ADMIN: Successfully navigates to Application Admin Page and verifies Users, Data, and System tabs', async ({ page }) => {
    test.setTimeout(90000);

    // 1. Log in with investor account
    await page.getByPlaceholder('name@example.com').fill('investor@quantra.io');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // Verify logged in
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 10000 });

    // Dismiss tour if present
    const skipTourLocator = page.locator('[data-testid="skip-tour-btn"]');
    if (await skipTourLocator.isVisible().catch(() => false)) {
      await skipTourLocator.click();
    }

    // 2. Open Application Admin Page via Section Switcher or Profile Shortcut
    const appAdminBtn = page.locator('[data-testid="section-appadmin"]');
    await appAdminBtn.scrollIntoViewIfNeeded();
    await appAdminBtn.click();

    // 3. Verify Admin Hero Header & KPI Cards
    await expect(page.getByText('Application Admin Command Center')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('ROOT GOVERNANCE')).toBeVisible();
    await expect(page.getByText('SQLITE PERSISTENT')).toBeVisible();
    await expect(page.getByText('Registered Accounts')).toBeVisible();
    await expect(page.getByText('Database Tables')).toBeVisible();

    // 4. Verify Pillar 1: User Accounts Management
    await expect(page.getByRole('button', { name: /User Accounts Management/i })).toBeVisible();
    await expect(page.getByPlaceholder('Search accounts by name, email, or user ID...')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create User Account/i })).toBeVisible();

    // Verify existing users rendered in table (guarantees initial async fetch completed)
    await expect(page.getByText('investor@quantra.io')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // 5. Switch to Pillar 2: Application Data Tables Explorer
    const dataTab = page.locator('[data-testid="admin-tab-data"]');
    await expect(dataTab).toBeVisible({ timeout: 6000 });
    await dataTab.click();

    await expect(page.getByText('SQLite Application Database Explorer')).toBeVisible({ timeout: 8000 });
    // Verify table pills exist
    await expect(page.getByRole('button', { name: /users/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /assets/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /debts/i }).first()).toBeVisible();

    // Click 'assets' table pill to view asset records
    const assetsPill = page.getByRole('button', { name: /^assets\s+\d+/i }).or(page.getByRole('button', { name: /assets/i }).first());
    await assetsPill.click();

    // 6. Switch to Pillar 3: System Telemetry & Health
    const systemTab = page.locator('[data-testid="admin-tab-system"]');
    await expect(systemTab).toBeVisible({ timeout: 6000 });
    await systemTab.click();

    await expect(page.getByText('Node.js Backend Engine Diagnostics')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('SQLite WASM Storage & Health')).toBeVisible();
    await expect(page.getByText('ONLINE (Port 5001)')).toBeVisible();

    // 7. Switch to Pillar 4: Security Audit Logs
    const auditTab = page.locator('[data-testid="admin-tab-audit"]');
    await expect(auditTab).toBeVisible({ timeout: 6000 });
    await auditTab.click();

    await expect(page.getByText('Immutable Security & Operations Audit Trail')).toBeVisible({ timeout: 6000 });

    // 8. Verify 1-Click Profile Shortcut opens Admin Page
    // Switch to Overview first
    const overviewNav = page.locator('#tour-section-switcher').getByRole('button', { name: /Life Overview/i });
    await overviewNav.click();
    await expect(page.getByText('Application Admin Command Center')).not.toBeVisible();

    // Open User Profile Dropdown
    await page.locator('[data-testid="user-profile-button"]').click();
    const adminShortcut = page.getByRole('button', { name: /Application Admin Page/i });
    await expect(adminShortcut).toBeVisible({ timeout: 4000 });
    await adminShortcut.click();

    // Verify redirected back to Application Admin Command Center
    await expect(page.getByText('Application Admin Command Center')).toBeVisible({ timeout: 6000 });
  });
});
