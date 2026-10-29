import { test, expect } from '@playwright/test';
import { setupAuthenticatedUser } from './fixtures/authHelper';
import fs from 'fs';
import path from 'path';

test.describe('Deep File Ingestion & Real-World Statement Parsers', () => {
  const sbiSamplePath = path.resolve('sample-test-files/sample_sbi_bank_statement.csv');
  const smsDumpPath = path.resolve('sample-test-files/sample_indian_bank_sms_dump.txt');

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedUser(page);
    await page.goto('/');
    await expect(page.getByText('QUANTRA')).toBeVisible();

    await page.getByRole('button', { name: /Finance/i }).first().click();
    await expect(page.getByText('⚡ Auto-Import (Demat & UPI)')).toBeVisible();
  });

  test('ingests SBI Bank CSV Statement and maps fuel, medical and insurance expenses', async ({ page }) => {
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();

    // Upload SBI CSV statement
    const fileInput = page.locator('input[data-testid="statement-file-input"]');
    await fileInput.setInputFiles(sbiSamplePath);

    // Verify parsing review
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });
    
    // IOCL / Apollo / Starbucks transactions from SBI CSV
    await expect(page.getByText(/STARBUCKS|IOCL|APOLLO/i).first()).toBeVisible();

    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible();
  });

  test('parses multi-message Indian Bank SMS dump pasted into text area', async ({ page }) => {
    const rawSmsDump = fs.readFileSync(smsDumpPath, 'utf-8');

    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();
    await page.getByRole('button', { name: /UPI SMS & Notifications/i }).click();

    // Fill multi-line raw SMS batch
    const textarea = page.locator('textarea');
    await textarea.fill(rawSmsDump);

    // Trigger local batch parsing
    await page.getByRole('button', { name: /Parse SMS Locally/i }).click();

    // Verify batch parsed results
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('SWIGGY', { exact: true })).toBeVisible();
    await expect(page.getByText('APOLLO PHARMACY', { exact: true })).toBeVisible();
    await expect(page.getByText('RELIANCE DIGITAL', { exact: true })).toBeVisible();

    const confirmBtn = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtn.click();
    await expect(page.getByText(/Successfully imported/i)).toBeVisible();
  });
});
