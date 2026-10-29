import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';

test.describe('Zero-API Smart Ingestion Hub', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible();

    // Navigate to Finance Workspace
    await page.getByRole('button', { name: /Finance/i }).first().click();
    await expect(page.getByText('⚡ Auto-Import (Demat & UPI)')).toBeVisible();
  });

  test('opens ingestion hub modal and parses Demat CAS statements with laser scanning', async ({ page }) => {
    // Open Smart Ingestion Modal
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();

    // Verify Modal Header & Badges
    await expect(page.getByText('100% On-Device & Zero-API')).toBeVisible();
    await expect(page.getByRole('button', { name: /Demat & Bank Statements/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /UPI SMS & Notifications/i })).toBeVisible();

    // Run Demo CAS Statement
    const demoCasBtn = page.getByRole('button', { name: /Run Demo CAS Statement/i });
    await expect(demoCasBtn).toBeVisible();
    await demoCasBtn.click();

    // Verify Scanning Progress Indicator
    await expect(page.getByText(/DEMAT Parser Engine/i)).toBeVisible();

    // Verify Parsed Results Review Section appears after scanning completes
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('RELIANCE', { exact: true })).toBeVisible();
    await expect(page.getByText('TCS', { exact: true })).toBeVisible();
    await expect(page.getByText('HDFCBANK', { exact: true })).toBeVisible();
    await expect(page.getByText('PPFAS_FLEXI', { exact: true })).toBeVisible();

    // Verify Holdings Category Badges
    await expect(page.getByText('EQUITY').first()).toBeVisible();
    await expect(page.getByText('MUTUAL_FUNDS').first()).toBeVisible();

    // Check Confirm Button state
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await expect(confirmBtn).toBeEnabled();

    // Commit import
    await confirmBtn.click();

    // Verify success banner
    await expect(page.getByText(/Successfully imported/i)).toBeVisible();
  });

  test('parses Indian Bank & UPI SMS into categorized expenses with confidence scoring', async ({ page }) => {
    // Open Smart Ingestion Modal
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();

    // Switch to UPI SMS & Notifications Tab
    await page.getByRole('button', { name: /UPI SMS & Notifications/i }).click();

    // Verify Native Android notice
    await expect(page.getByText(/Native Android Auto-Detection/i)).toBeVisible();

    // Click quick sample button for HDFC Swiggy
    const swiggySampleBtn = page.getByRole('button', { name: /Swiggy/i });
    await expect(swiggySampleBtn).toBeVisible();
    await swiggySampleBtn.click();

    // Verify textarea populated with SMS text
    const textarea = page.locator('textarea');
    await expect(textarea).toHaveValue(/SWIGGY/i);

    // Trigger local parsing
    await page.getByRole('button', { name: /Parse SMS Locally/i }).click();

    // Verify scanning indicator
    await expect(page.getByText(/SMS Parser Engine/i)).toBeVisible();

    // Wait for parse results
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });

    // Verify parsed entity details
    await expect(page.getByText('SWIGGY', { exact: true })).toBeVisible();
    await expect(page.getByText('FOOD_DINING', { exact: true })).toBeVisible();
    await expect(page.getByText(/% Match/)).toBeVisible();

    // Commit to portfolio
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Verify success notification
    await expect(page.getByText(/Successfully imported 1 items into your Quantra portfolio!/i)).toBeVisible();
  });
});
