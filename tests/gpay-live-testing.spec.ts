import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';
import path from 'path';

test.describe('Real-World Google Pay UPI Statement Testing (73 Pages, 726 Txns)', () => {
  const gpayPdfPath = path.resolve('sample-test-files/google_pay_statement.pdf');
  const gpayCsvPath = path.resolve('sample-test-files/google_pay_statement.csv');

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible();

    // Navigate to Finance Workspace
    await page.getByRole('button', { name: /Finance/i }).first().click();
    await expect(page.getByText('⚡ Auto-Import (Demat & UPI)')).toBeVisible();
  });

  test('parses and imports the complete 726-transaction Google Pay UPI statement', async ({ page }) => {
    // Open Smart Ingestion Modal
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();
    await expect(page.getByRole('button', { name: /Demat & Bank Statements/i })).toBeVisible();

    // Verify Google Pay Quick Action button is present
    const loadGpayBtn = page.locator('[data-testid="load-gpay-btn"]');
    await expect(loadGpayBtn).toBeVisible();

    // Trigger on-device simulated scan and parse of the 726 transactions
    await loadGpayBtn.click();

    // Wait for the complete 726 transactions to render in the review area
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Loaded Google Pay Statement: 726 transactions/i)).toBeVisible();

    // Verify key real merchants from the statement
    await expect(page.getByText('PERIYASAMY C').first()).toBeVisible();
    await expect(page.getByText('KONAAR BRIYANI').first()).toBeVisible();
    await expect(page.getByText('THE MADRAS SILKS').first()).toBeVisible();
    await expect(page.getByText('KAUVERY HOSPITAL').first()).toBeVisible();
    await expect(page.getByText('ANGEL ONE SECURITIES').first()).toBeVisible();
    await expect(page.getByText('AIRTEL').first()).toBeVisible();

    // Verify category categorization
    await expect(page.getByText('FOOD_DINING').first()).toBeVisible();
    await expect(page.getByText('SHOPPING_LIFESTYLE').first()).toBeVisible();
    await expect(page.getByText('TRAVEL_COMMUTE').first()).toBeVisible();
    await expect(page.getByText('HEALTHCARE_INSURANCE').first()).toBeVisible();
    await expect(page.getByText('UTILITIES_BILLS').first()).toBeVisible();

    // Verify Confirm & Import button has selected all items
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await expect(confirmBtn).toBeEnabled();
    await expect(confirmBtn).toContainText('726 Selected');

    // Commit import into Quantra SQLite / local storage
    await confirmBtn.click();

    // Verify success banner with imported count
    await expect(page.getByText(/Successfully imported 726 items into your Quantra portfolio!/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('ingests Google Pay CSV statement via drag-and-drop file upload', async ({ page }) => {
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();

    // Upload generated CSV statement
    const fileInput = page.locator('input[data-testid="statement-file-input"]');
    await fileInput.setInputFiles(gpayCsvPath);

    // Verify review area appears
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Parsed \d+ transactions/i)).toBeVisible();

    // Confirm & import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    await expect(page.getByText(/Successfully imported/i)).toBeVisible();
  });
});
