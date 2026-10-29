import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';

test.describe('Finance Workspace & Multi-Currency Controls', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible();

    // Navigate to Finance Workspace
    await page.getByRole('button', { name: /Finance/i }).first().click();
    await expect(page.getByText('Take control of your finances')).toBeVisible();
  });

  test('switches through all Finance sub-modules', async ({ page }) => {
    // 1. Overview (Default)
    await expect(page.getByText('12-Month Net Worth Trajectory')).toBeVisible();

    // 2. Holdings & Allocation
    await page.getByRole('button', { name: 'Holdings & Allocation' }).click();
    await expect(page.getByText('12-Month Net Worth Trajectory')).toBeVisible();

    // 3. Combined Commitments: Debts, Protection & Vault
    await page.getByRole('button', { name: /Debts, Protection & Vault/i }).click();
    await expect(page.getByText('Unified Liability, Insurance & Resilience Suite')).toBeVisible();

    // Switch between internal sub-tabs
    await page.getByRole('button', { name: /Protection & Insurance/i }).first().click();
    await expect(page.getByText(/Total Coverage/i).first()).toBeVisible();

    await page.getByRole('button', { name: /Health Score & Vault/i }).first().click();
    await expect(page.getByText(/Health & Vault/i).first()).toBeVisible();

    // 4. Financial Calendar (3rd tab in top bar)
    await page.getByRole('button', { name: 'Financial Calendar', exact: true }).click();
    await expect(page.getByText('Financial Calendar & Life Events Planner')).toBeVisible();

    // 5. Transactions Ledger
    await page.getByRole('button', { name: 'Transactions Ledger' }).click();
    await expect(page.getByText(/Active Financial Period/i)).toBeVisible();

    // 6. Goals & Milestones
    await page.getByRole('button', { name: 'Goals & Milestones' }).click();
    await expect(page.getByText(/Goals/i).first()).toBeVisible();
  });

  test('switches currency dynamically via header dropdown', async ({ page }) => {
    const trigger = page.locator('#tour-currency-switcher button').first();
    await trigger.click();

    // Select USD from dropdown
    await page.locator('#tour-currency-switcher').getByRole('button', { name: /USD/i }).click();
    await expect(trigger).toContainText('USD');

    // Switch back to INR
    await trigger.click();
    await page.locator('#tour-currency-switcher').getByRole('button', { name: /INR/i }).click();
    await expect(trigger).toContainText('INR');
  });

  test('opens and cancels Record Trade modal', async ({ page }) => {
    // Click Record Trade button
    await page.getByRole('button', { name: /Record Trade/i }).first().click();

    // Modal should be visible
    const modalHeading = page.getByRole('heading', { name: 'Unified Financial Entry & Planner' });
    await expect(modalHeading).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(modalHeading).not.toBeVisible();
  });
});
