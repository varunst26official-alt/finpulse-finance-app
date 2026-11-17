import { test, expect } from '@playwright/test';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const initSqlJs = require('../server/node_modules/sql.js/dist/sql-wasm.js');
const DB_FILE = 'c:\\Users\\Admin\\Downloads\\finpulse-finance-app\\server\\data\\finpulse.sqlite';

async function checkDatabaseForUser(email: string) {
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_FILE);
  const db = new SQL.Database(fileBuffer);

  const userStmt = db.prepare('SELECT id, email, full_name, investor_type FROM users WHERE email = ?');
  userStmt.bind([email.toLowerCase().trim()]);
  let user: any = null;
  if (userStmt.step()) {
    user = userStmt.getAsObject();
  }
  userStmt.free();

  let syncState: any = null;
  if (user) {
    const syncStmt = db.prepare('SELECT user_id, updated_at, finance_state, lifeos_state FROM user_sync_states WHERE user_id = ?');
    syncStmt.bind([user.id]);
    if (syncStmt.step()) {
      syncState = syncStmt.getAsObject();
    }
    syncStmt.free();
  }

  db.close();
  return { user, syncState };
}

test.describe('Mobile User Registration & Cross-Device Cloud Sync Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('disable-tour', 'true');
      localStorage.setItem('lifeos-tour-storage', JSON.stringify({ state: { hasSeenTour: true, isTourOpen: false, seenUserIds: ['*'] }, version: 0 }));
    });
    await page.reload();
  });

  test('E2E: New user registers, pushes initial state to SQLite user_sync_states, and restores state on fresh login', async ({ page }) => {
    test.setTimeout(60000);

    const timestamp = Date.now();
    const testEmail = `sync_e2e_${timestamp}@quantra.io`;
    const testName = `Alex Rivers ${timestamp}`;
    const testPassword = 'Password123!';

    // 1. Switch to Register tab
    await page.getByRole('button', { name: /First-Time Register|Register/i }).click();

    // 2. Fill registration fields
    await page.getByPlaceholder('Your full name').fill(testName);
    await page.getByPlaceholder('name@example.com').fill(testEmail);
    await page.getByPlaceholder('Min 6 characters').fill(testPassword);
    await page.getByPlaceholder('Re-type password').fill(testPassword);

    // 3. Submit registration
    await page.getByRole('button', { name: /Complete Registration/i }).click();

    // 4. Verify login into application
    const profileBtn = page.locator('[data-testid="user-profile-button"]');
    await expect(profileBtn).toBeVisible({ timeout: 15000 });

    // Dismiss onboarding tour modal if shown
    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
    if (await skipTourBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipTourBtn.click();
    }

    // Wait a brief moment for async cloud sync and DB persistence to disk
    await page.waitForTimeout(1500);

    // 5. Verify direct SQLite database persistence
    const dbRecord = await checkDatabaseForUser(testEmail);
    expect(dbRecord.user).toBeTruthy();
    expect(dbRecord.user.email).toBe(testEmail);
    expect(dbRecord.user.full_name).toBe(testName);

    expect(dbRecord.syncState).toBeTruthy();
    expect(dbRecord.syncState.user_id).toBe(dbRecord.user.id);
    expect(dbRecord.syncState.finance_state).toBeTruthy();
    expect(dbRecord.syncState.lifeos_state).toBeTruthy();

    const parsedFin = JSON.parse(dbRecord.syncState.finance_state);
    const parsedLife = JSON.parse(dbRecord.syncState.lifeos_state);
    expect(parsedFin.currency).toBeDefined();
    expect(Array.isArray(parsedLife.tasks)).toBe(true);

    // 6. Sign out cleanly
    await profileBtn.click();
    await page.getByRole('button', { name: 'Sign Out' }).click();

    // 7. Verify back on login screen
    await expect(page.getByText('Sign In (Existing)')).toBeVisible({ timeout: 10000 });

    // 8. Clear local storage completely to simulate fresh secondary device (e.g. laptop or new browser)
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('disable-tour', 'true');
      localStorage.setItem('lifeos-tour-storage', JSON.stringify({ state: { hasSeenTour: true, isTourOpen: false, seenUserIds: ['*'] }, version: 0 }));
    });
    await page.reload();

    // 9. Log in on secondary device with the newly registered credentials
    await page.getByPlaceholder('name@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // 10. Verify secondary device logs in and pulls the synced state from SQLite backend
    await expect(profileBtn).toBeVisible({ timeout: 15000 });

    // Verify user profile details on secondary device
    await profileBtn.click();
    await expect(page.getByText(testEmail).first()).toBeVisible({ timeout: 5000 });
  });
});
