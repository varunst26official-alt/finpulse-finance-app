import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';
import path from 'path';

test.describe('Receipt & Screenshot OCR Ingestion E2E', () => {
  const receiptImgPath = path.resolve('sample-test-files/sample_receipt_screen.png');

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA', { exact: true })).toBeVisible({ timeout: 15000 });

    // Navigate to Finance Workspace
    const mobileBtn = page.locator('button[aria-label="Navigate to Finance"]');
    const switcherBtn = page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i });
    const desktopBtn = page.locator('[data-testid="section-finance"]');
    if (await mobileBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await mobileBtn.click();
    } else if (await switcherBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await switcherBtn.click();
    } else if (await desktopBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await desktopBtn.click();
    } else {
      await page.locator('nav button:has-text("Finance"), button:has-text("Finance")').first().click();
    }
    await page.waitForTimeout(600);
  });

  test('Test Sample Receipt OCR: Extracts Fuel & UPI details into review card', async ({ page }) => {
    // Open Ingestion Hub
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();
    await expect(page.getByText('Demat & Bank Statements')).toBeVisible({ timeout: 10000 });

    // Switch to Invoice / Screenshot OCR Tab
    const ocrTab = page.getByRole('button', { name: /Invoice \/ Screenshot OCR/i });
    await expect(ocrTab).toBeVisible();
    await ocrTab.click();

    // Click "Test Sample Receipt OCR"
    const testOcrBtn = page.locator('[data-testid="test-sample-ocr-btn"]');
    await expect(testOcrBtn).toBeVisible();
    await testOcrBtn.click();

    // Verify extracted review items
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 12000 });
    await expect(page.getByText('FUEL PUMP IOCL BANGALORE', { exact: true })).toBeVisible();
    await expect(page.getByText(/₹850\.00/i).first()).toBeVisible();

    // Confirm & Import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 8000 });
  });

  test('File Upload OCR: Uploads payment receipt image and commits to ledger', async ({ page }) => {
    // Open Ingestion Hub
    await page.locator('button:has-text("Auto-Import"), button:has-text("Statement Hub")').first().click();
    await expect(page.getByText('Demat & Bank Statements')).toBeVisible({ timeout: 10000 });

    // Switch to Invoice / Screenshot OCR Tab
    const ocrTab = page.getByRole('button', { name: /Invoice \/ Screenshot OCR/i });
    await ocrTab.click();

    // Upload receipt image file
    const fileInput = page.locator('input[data-testid="receipt-image-input"]');
    await fileInput.setInputFiles(receiptImgPath);

    // Verify extracted details from image
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('SAMPLE RECEIPT SCREEN', { exact: true })).toBeVisible();

    // Confirm & Import
    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible({ timeout: 8000 });
  });
});
