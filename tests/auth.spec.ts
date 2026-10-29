import { test, expect } from '@playwright/test';

test.describe('Authentication & Branding Tests', () => {
  test('displays login screen when unauthenticated and logs in successfully', async ({ page }) => {
    // Navigate without pre-authenticated session
    await page.goto('/');

    // Verify Auth Screen is visible
    await expect(page.getByText('Sign In (Existing)')).toBeVisible();
    await expect(page.getByText('Instant Demo Access (Preloaded Portfolio)')).toBeVisible();

    // Fill login form
    const emailInput = page.getByPlaceholder('name@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('tester@quantra.io');
    await passwordInput.fill('pass1234');

    // Submit form
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // Verify successful login into command centre
    await expect(page.getByText('QUANTRA')).toBeVisible();
    await expect(page.getByText('PRO', { exact: true })).toBeVisible();
    await expect(page.getByText('Quantitative Wealth & Life Engine')).toBeVisible();
  });

  test('verifies Quantra brand identity, vector logo, and profile logout', async ({ page }) => {
    await page.goto('/');
    
    // Log in
    await page.getByPlaceholder('name@example.com').fill('investor@quantra.io');
    await page.getByPlaceholder('••••••••').fill('secret123');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    // Verify Quantra Header Branding
    await expect(page.getByText('QUANTRA')).toBeVisible();

    // If initial onboarding tour dialog appears, dismiss it
    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
    if (await skipTourBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await skipTourBtn.click();
    }

    // Check user avatar profile button
    const profileBtn = page.locator('[data-testid="user-profile-button"]');
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    // Verify dropdown menu
    await expect(page.getByText('investor@quantra.io')).toBeVisible();
    const signOutBtn = page.getByRole('button', { name: 'Sign Out' });
    await expect(signOutBtn).toBeVisible();

    // Click Sign Out
    await signOutBtn.click();

    // Verify redirected back to AuthScreen
    await expect(page.getByText('Sign In (Existing)')).toBeVisible();
  });
});
