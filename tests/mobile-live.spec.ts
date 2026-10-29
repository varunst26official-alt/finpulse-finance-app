import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';
import path from 'path';

test.describe('Mobile Android Live Viewport Testing (Pixel 7)', () => {
  const hdfcSamplePath = path.resolve('sample-test-files/sample_hdfc_bank_statement.csv');

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible();
  });

  test('executes full mobile life dimension navigation and statement ingestion on Android Pixel 7', async ({ page }) => {
    // 1. Mobile Header Verification
    await expect(page.getByText('QUANTRA')).toBeVisible();
    await expect(page.getByText('PRO', { exact: true })).toBeVisible();

    // 2. Navigate Section Switcher on Mobile
    const switcher = page.locator('nav#tour-section-switcher');
    await expect(switcher).toBeVisible();

    // Switch to Finance on Mobile
    await switcher.getByRole('button', { name: /Finance/i }).click();
    await expect(page.getByText('Take control of your finances')).toBeVisible();

    // 3. Test In-Workspace Sub-module Navigation
    await page.getByRole('button', { name: 'Holdings & Allocation' }).click();
    await expect(page.getByText('Asset Portfolio & Holdings')).toBeVisible();

    await page.getByRole('button', { name: /Debts, Protection & Vault/i }).click();
    await expect(page.getByText('Unified Liability, Insurance & Resilience Suite')).toBeVisible();

    await page.getByRole('button', { name: 'Goals & Milestones' }).click();
    await expect(page.getByText(/Goals/i).first()).toBeVisible();

    // 4. Open Mobile Smart Ingestion Hub
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();
    await expect(page.getByRole('button', { name: 'Demat & Bank Statements' })).toBeVisible();

    // Upload Bank Statement
    const fileInput = page.locator('input[data-testid="statement-file-input"]');
    await fileInput.setInputFiles(hdfcSamplePath);

    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('SWIGGY', { exact: true })).toBeVisible();
    await expect(page.getByText('ZOMATO', { exact: true })).toBeVisible();

    // Commit Import on Mobile
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible();
    await expect(page.getByText('Review & Verify Parsed Items')).not.toBeVisible({ timeout: 5000 });

    // 5. Navigate to Fitness & Wellness
    await switcher.getByRole('button', { name: /Fitness & Wellness/i }).click();
    await expect(page.getByText('Build healthier daily habits')).toBeVisible();

    // 6. Navigate to Productivity
    await switcher.getByRole('button', { name: /Productivity/i }).click();
    await expect(page.getByText('Make space for what matters')).toBeVisible();

    // 7. Navigate to Learning & Career
    await switcher.getByRole('button', { name: /Learning & Career/i }).click();
    await expect(page.getByText('Invest in your next chapter')).toBeVisible();

    // 8. Navigate to Life Administration
    await switcher.getByRole('button', { name: /Life Administration/i }).click();
    await expect(page.getByText("Keep life's essentials organized")).toBeVisible();
  });
});
