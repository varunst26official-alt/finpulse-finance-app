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

    // 3. Debts & Repayments
    await page.getByRole('button', { name: 'Debts & Repayments' }).click();
    await expect(page.getByText('Debt & Repayment Engine')).toBeVisible();

    // 4. Protection & Insurance
    await page.getByRole('button', { name: 'Protection & Insurance' }).click();
    await expect(page.getByText(/Insurance/i).first()).toBeVisible();

    // 5. Health Score & Vault
    await page.getByRole('button', { name: 'Health Score & Vault' }).click();
    await expect(page.getByText(/Emergency Vault/i).first()).toBeVisible();

    // 6. Transactions Ledger
    await page.getByRole('button', { name: 'Transactions Ledger' }).click();
    await expect(page.getByText('Date')).toBeVisible();

    // 7. Goals & Milestones
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
