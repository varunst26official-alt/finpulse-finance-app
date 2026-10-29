import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';

test.describe('Workspace Navigation & Cross-Module Switching', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    // Wait for the app shell to mount
    await expect(page.getByText('QUANTRA')).toBeVisible();
  });

  test('navigates seamlessly across all 6 Quantra life dimensions', async ({ page }) => {
    // 1. Life Overview (Default)
    await expect(page.getByRole('button', { name: /Life Overview/i })).toBeVisible();
    await expect(page.getByText('Your life, in one clear view')).toBeVisible();

    // 2. Finance Workspace
    await page.getByRole('button', { name: /Finance/i }).first().click();
    await expect(page.getByText('Take control of your finances')).toBeVisible();
    await expect(page.getByText('⚡ Auto-Import (Demat & UPI)')).toBeVisible();

    // 3. Fitness & Wellness Workspace
    await page.getByRole('button', { name: /Fitness & Wellness/i }).click();
    await expect(page.getByText('Build healthier daily habits')).toBeVisible();

    // 4. Productivity Workspace
    await page.getByRole('button', { name: /Productivity/i }).click();
    await expect(page.getByText('Make space for what matters')).toBeVisible();

    // 5. Learning & Career Workspace
    await page.getByRole('button', { name: /Learning & Career/i }).click();
    await expect(page.getByText('Invest in your next chapter')).toBeVisible();

    // 6. Life Administration Workspace
    await page.getByRole('button', { name: /Life Administration/i }).click();
    await expect(page.getByText("Keep life's essentials organized")).toBeVisible();

    // Return to Life Overview
    await page.getByRole('button', { name: /Life Overview/i }).click();
    await expect(page.getByText('Your life, in one clear view')).toBeVisible();
  });
});
