import { test, expect } from '@playwright/test';

test.describe('Production-Grade Auth Security & Strict User Isolation Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and session storage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test('UX: Ensures email and password fields are completely blank with NO prefilled values', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Verify fields are strictly blank with no prefilled values
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('SECURITY: Rejects incorrect password for existing account without leaking session', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Sign In (Existing)')).toBeVisible();

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    await emailInput.fill('investor@quantra.io');
    await passwordInput.fill('WRONG_PASSWORD_XYZ!123');

    // Submit login
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // Verify rejection error message is displayed
    await expect(page.getByText(/Invalid email or password|Incorrect password/i)).toBeVisible({ timeout: 5000 });

    // Verify that session was NOT created and user profile button is not present
    await expect(page.locator('[data-testid="user-profile-button"]')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to LifeOS/i })).toBeVisible();
  });

  test('SECURITY: Rejects non-existent email on login and prevents auto-creating accounts', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    const ghostEmail = `nonexistent_user_${Date.now()}@ghostdomain.org`;
    await emailInput.fill(ghostEmail);
    await passwordInput.fill('SomeValidLookingPass123!');

    // Submit login
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // Verify rejection alert
    await expect(page.getByText(/Invalid email or password|Account not found/i)).toBeVisible({ timeout: 5000 });

    // Verify session was NOT created
    await expect(page.locator('[data-testid="user-profile-button"]')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to LifeOS/i })).toBeVisible();
  });

  test('SECURITY: Logs in successfully with verified credentials and cleanly signs out', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    await emailInput.fill('investor@quantra.io');
    await passwordInput.fill('password123');

    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // Verify Command Centre loaded
    const profileBtn = page.locator('[data-testid="user-profile-button"]');
    await expect(profileBtn).toBeVisible({ timeout: 10000 });

    // Dismiss tour if open
    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
    if (await skipTourBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipTourBtn.click();
    }

    // Sign out cleanly
    await profileBtn.click();

    const signOutBtn = page.getByRole('button', { name: 'Sign Out' });
    await expect(signOutBtn).toBeVisible();
    await signOutBtn.click();

    // Verify redirected to AuthScreen
    await expect(page.getByText('Sign In (Existing)')).toBeVisible({ timeout: 5000 });
  });

  test('CROSS-USER ISOLATION: Strict data separation between User A (Alice) and User B (Bob)', async ({ page }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const aliceEmail = `alice_${timestamp}@quantra.io`;
    const alicePass = 'AliceSecurePass99!';
    const aliceLoanTitle = `Alice Car Loan ${timestamp}`;

    const bobEmail = `bob_${timestamp}@quantra.io`;
    const bobPass = 'BobSecurePass88!';
    const bobLoanTitle = `Bob Education Loan ${timestamp}`;

    // Helper to dismiss tour
    const dismissTour = async () => {
      const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
      if (await skipTourBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
        await skipTourBtn.click();
      }
    };

    // Helper to navigate to Commitments / Debts section
    const navigateToDebts = async () => {
      // 1. Click Finance section
      const financeNav = page.locator('#tour-section-switcher').getByRole('button', { name: /Finance/i });
      if (await financeNav.isVisible().catch(() => false)) {
        await financeNav.click();
      }
      // 2. Click Debts, Protection & Vault sub-tab
      const vaultSubTab = page.getByRole('button', { name: /Debts, Protection & Vault/i }).or(page.getByRole('button', { name: 'Vault' })).first();
      await expect(vaultSubTab).toBeVisible({ timeout: 6000 });
      await vaultSubTab.click();
    };

    // Helper to sign out
    const performSignOut = async () => {
      const profileBtn = page.locator('[data-testid="user-profile-button"]');
      await expect(profileBtn).toBeVisible({ timeout: 6000 });
      await profileBtn.click();
      const signOutBtn = page.getByRole('button', { name: 'Sign Out' });
      await expect(signOutBtn).toBeVisible({ timeout: 4000 });
      await signOutBtn.click();
      await expect(page.getByText('Sign In (Existing)')).toBeVisible({ timeout: 6000 });
    };

    // =========================================================================
    // STEP 1: Register Alice & Add Her Custom Loan
    // =========================================================================
    await page.goto('/');
    await page.getByRole('button', { name: /First-Time Register/i }).click();

    await page.getByPlaceholder('Your full name').fill('Alice Montgomery');
    await page.getByPlaceholder('name@example.com').fill(aliceEmail);
    await page.getByPlaceholder('+91 98765 43210').fill('+91 98765 11111');
    await page.getByPlaceholder('Min 6 characters').fill(alicePass);
    await page.getByPlaceholder('Re-type password').fill(alicePass);

    await page.getByRole('button', { name: /Complete Registration/i }).click();
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 10000 });
    await dismissTour();

    // Navigate to Debts / Loans section
    await navigateToDebts();

    // Click "Add Loan / Debt" button
    const addLoanAliceBtn = page.getByRole('button', { name: /Add Loan \/ Debt/i }).first();
    await expect(addLoanAliceBtn).toBeVisible({ timeout: 5000 });
    await addLoanAliceBtn.click();

    // Fill Debt Form for Alice
    await page.getByPlaceholder('e.g. Home Mortgage, Auto Loan, Personal Loan').fill(aliceLoanTitle);
    await page.getByPlaceholder('e.g. Bank or Lending Institution').fill('HDFC Auto Finance');

    // Save Loan Record
    await page.getByRole('button', { name: 'Save Loan Record' }).click();

    // Verify Alice's debt appears in her debts list
    await expect(page.getByText(aliceLoanTitle).first()).toBeVisible({ timeout: 6000 });

    // Alice Signs Out cleanly
    await performSignOut();

    // =========================================================================
    // STEP 2: Register Bob & Verify Alice's Loan is ZERO LEAKED (Absent)
    // =========================================================================
    await page.getByRole('button', { name: /First-Time Register/i }).click();

    await page.getByPlaceholder('Your full name').fill('Bob Henderson');
    await page.getByPlaceholder('name@example.com').fill(bobEmail);
    await page.getByPlaceholder('+91 98765 43210').fill('+91 98765 22222');
    await page.getByPlaceholder('Min 6 characters').fill(bobPass);
    await page.getByPlaceholder('Re-type password').fill(bobPass);

    await page.getByRole('button', { name: /Complete Registration/i }).click();
    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 10000 });
    await dismissTour();

    // Navigate to Debts / Loans section
    await navigateToDebts();

    // CRITICAL SECURITY ASSERTION: Alice's loan MUST NOT appear in Bob's view
    await expect(page.getByText(aliceLoanTitle)).not.toBeVisible();

    // Bob adds his own loan
    const addLoanBobBtn = page.getByRole('button', { name: /Add Loan \/ Debt/i }).first();
    await expect(addLoanBobBtn).toBeVisible({ timeout: 5000 });
    await addLoanBobBtn.click();

    await page.getByPlaceholder('e.g. Home Mortgage, Auto Loan, Personal Loan').fill(bobLoanTitle);
    await page.getByPlaceholder('e.g. Bank or Lending Institution').fill('ICICI Education Finance');

    await page.getByRole('button', { name: 'Save Loan Record' }).click();

    // Verify Bob's loan is visible in Bob's view
    await expect(page.getByText(bobLoanTitle).first()).toBeVisible({ timeout: 6000 });
    // Verify Alice's loan is STILL NOT in Bob's view
    await expect(page.getByText(aliceLoanTitle)).not.toBeVisible();

    // Bob Signs Out cleanly
    await performSignOut();

    // =========================================================================
    // STEP 3: Alice logs back in & verifies her loan is intact and Bob's is absent
    // =========================================================================
    await page.getByPlaceholder('name@example.com').fill(aliceEmail);
    await page.getByPlaceholder('••••••••').fill(alicePass);
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 10000 });
    await dismissTour();

    // Navigate to Debts
    await navigateToDebts();

    // CRITICAL USER ISOLATION ASSERTIONS:
    // 1. Alice's loan MUST be preserved
    await expect(page.getByText(aliceLoanTitle).first()).toBeVisible({ timeout: 6000 });
    // 2. Bob's loan MUST NEVER be visible to Alice
    await expect(page.getByText(bobLoanTitle)).not.toBeVisible();

    // Alice Signs Out cleanly
    await performSignOut();
  });

  test('MOBILE / CAPACITOR SIMULATION: Rejects wrong credentials when backend returns HTML (Capacitor SPA fallback)', async ({ page }) => {
    // Intercept /api/auth/login and return 200 OK with HTML content-type (exact Capacitor Android behavior)
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><html><body>Capacitor SPA Fallback</body></html>',
      });
    });

    await page.goto('/');

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    // 1. Try with wrong password for existing investor
    await emailInput.fill('investor@quantra.io');
    await passwordInput.fill('totally_wrong_password_999');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // MUST REJECT!
    await expect(page.getByText(/Incorrect password|Invalid email or password/i)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="user-profile-button"]')).not.toBeVisible();

    // 2. Try with ghost email
    await emailInput.fill('random_hacker@nowhere.com');
    await passwordInput.fill('any_password_123');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // MUST REJECT!
    await expect(page.getByText(/Account not found|Invalid email or password/i)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="user-profile-button"]')).not.toBeVisible();
  });

  test('MOBILE / OFFLINE STANDALONE: Rejects wrong credentials and accepts correct ones with strict user isolation', async ({ page }) => {
    // Abort all network requests to simulate complete offline mobile mode
    await page.route('**/api/**', (route) => route.abort('failed'));

    await page.goto('/');

    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    // 1. Wrong password for investor@quantra.io
    await emailInput.fill('investor@quantra.io');
    await passwordInput.fill('wrongpassword123');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    await expect(page.getByText(/Incorrect password|Invalid email or password/i)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="user-profile-button"]')).not.toBeVisible();

    // 2. Wrong password for admin@quantra.io
    await emailInput.fill('admin@quantra.io');
    await passwordInput.fill('wrongadminpass');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    await expect(page.getByText(/Incorrect password|Invalid email or password/i)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="user-profile-button"]')).not.toBeVisible();

    // 3. Correct password for admin@quantra.io -> logs in as Super Admin
    await emailInput.fill('admin@quantra.io');
    await passwordInput.fill('admin123');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    await expect(page.locator('[data-testid="user-profile-button"]')).toBeVisible({ timeout: 10000 });
  });
});
