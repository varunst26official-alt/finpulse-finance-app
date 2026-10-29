import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Multi-Account Registration, Real Statement Ingestion & Data Isolation', () => {
  const casSamplePath = path.resolve('sample-test-files/sample_cas_cdsl_statement.txt');
  const hdfcSamplePath = path.resolve('sample-test-files/sample_hdfc_bank_statement.csv');

  test('executes end-to-end multi-persona lifecycle with full data isolation and persistence', async ({ page }) => {
    // =========================================================================
    // 1. PERSONA A: RAJESH VERMA (Wealth & Demat CAS Ingestion)
    // =========================================================================
    await page.goto('/');

    // Register Rajesh
    await page.getByRole('button', { name: /First-Time Register/i }).click();
    await page.getByPlaceholder('Enter your full name').fill('Rajesh Verma');
    await page.getByPlaceholder('name@example.com').fill('rajesh.verma@quantra.io');
    await page.getByPlaceholder('Phone number').fill('9876543210');
    await page.getByPlaceholder('Password (min 6 chars)').fill('RajeshPass123');
    await page.getByPlaceholder('Confirm password').fill('RajeshPass123');
    await page.getByRole('button', { name: 'Complete Registration & Open Dashboard' }).click();

    await expect(page.getByText('QUANTRA')).toBeVisible();

    const skipTourBtn = page.getByRole('button', { name: /Skip Tour/i });
    try {
      await skipTourBtn.waitFor({ state: 'visible', timeout: 3000 });
      await skipTourBtn.click();
    } catch (_) {}

    // Open Smart Ingestion Hub and upload CDSL CAS statement
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i }).click();
    await expect(page.getByText('⚡ Auto-Import (Demat & UPI)')).toBeVisible();
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();

    const fileInputA = page.locator('input[data-testid="statement-file-input"]');
    await fileInputA.setInputFiles(casSamplePath);

    // Verify Laser scan & parsed holdings
    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('RELIANCE', { exact: true })).toBeVisible();
    await expect(page.getByText('TCS', { exact: true })).toBeVisible();
    await expect(page.getByText('INFY', { exact: true })).toBeVisible();
    await expect(page.getByText('TATAMOTORS', { exact: true })).toBeVisible();

    // Commit import
    const confirmBtnA = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtnA.click();
    await expect(page.getByText('Review & Verify Parsed Items')).not.toBeVisible({ timeout: 5000 });

    // Verify holdings rendered in Rajesh's portfolio
    await page.getByRole('button', { name: 'Holdings & Allocation' }).click();
    await expect(page.getByText('RELIANCE', { exact: true })).toBeVisible();
    await expect(page.getByText('TATAMOTORS', { exact: true })).toBeVisible();

    // Log out Rajesh
    await page.locator('[data-testid="user-profile-button"]').click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('One Operating System for Your Whole Life')).toBeVisible();

    // =========================================================================
    // 2. PERSONA B: PRIYA SHARMA (Wellness, Workouts & Daily Tasks)
    // =========================================================================
    await page.getByRole('button', { name: /First-Time Register/i }).click();
    await page.getByPlaceholder('Enter your full name').fill('Priya Sharma');
    await page.getByPlaceholder('name@example.com').fill('priya.sharma@quantra.io');
    await page.getByPlaceholder('Phone number').fill('9876543211');
    await page.getByPlaceholder('Password (min 6 chars)').fill('PriyaPass123');
    await page.getByPlaceholder('Confirm password').fill('PriyaPass123');
    await page.getByRole('button', { name: 'Complete Registration & Open Dashboard' }).click();

    await expect(page.getByText('QUANTRA')).toBeVisible();

    try {
      await skipTourBtn.waitFor({ state: 'visible', timeout: 3000 });
      await skipTourBtn.click();
    } catch (_) {}

    // Verify Zero Leakage: Priya MUST have a fresh portfolio (0 Demat holdings)
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i }).click();
    await page.getByRole('button', { name: 'Holdings & Allocation' }).click();
    await expect(page.getByText('RELIANCE', { exact: true })).not.toBeVisible();
    await expect(page.getByText('TATAMOTORS', { exact: true })).not.toBeVisible();

    // Explore Fitness & Wellness Workspace
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Fitness & Wellness/i }).click();
    await expect(page.getByText('Build healthier daily habits')).toBeVisible();

    // Test Water Logging
    const addBottleBtn = page.getByRole('button', { name: /Bottle/i });
    if (await addBottleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBottleBtn.click();
      await expect(page.getByText(/Daily Water Hydration Station/i)).toBeVisible();
    }

    // Switch to Workouts Catalog
    await page.getByRole('button', { name: /Workouts & Movement Catalog/i }).click();
    await expect(page.getByText('Barbell Flat Bench Press', { exact: true })).toBeVisible();
    await expect(page.getByText('Barbell Back Squat', { exact: true })).toBeVisible();

    // Explore Productivity Workspace & Create Task
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Productivity/i }).click();
    await expect(page.getByText('Make space for what matters')).toBeVisible();

    await page.getByRole('button', { name: '+ Add a Task' }).first().click();
    const taskInput = page.getByPlaceholder('e.g., Review weekly project milestones');
    await taskInput.fill('Priya: Complete Clinical Nutrition Review');
    await page.locator('form').getByRole('button', { name: 'Add Task' }).click();

    await expect(page.getByText('Priya: Complete Clinical Nutrition Review', { exact: true })).toBeVisible();

    // Log out Priya
    await page.locator('[data-testid="user-profile-button"]').click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('One Operating System for Your Whole Life')).toBeVisible();

    // =========================================================================
    // 3. PERSONA C: ANAND KUMAR (HDFC CSV Ingestion & Skill Roadmaps)
    // =========================================================================
    await page.getByRole('button', { name: /First-Time Register/i }).click();
    await page.getByPlaceholder('Enter your full name').fill('Anand Kumar');
    await page.getByPlaceholder('name@example.com').fill('anand.kumar@quantra.io');
    await page.getByPlaceholder('Phone number').fill('9876543212');
    await page.getByPlaceholder('Password (min 6 chars)').fill('AnandPass123');
    await page.getByPlaceholder('Confirm password').fill('AnandPass123');
    await page.getByRole('button', { name: 'Complete Registration & Open Dashboard' }).click();

    await expect(page.getByText('QUANTRA')).toBeVisible();

    try {
      await skipTourBtn.waitFor({ state: 'visible', timeout: 3000 });
      await skipTourBtn.click();
    } catch (_) {}

    // Ingest HDFC Bank CSV Statement
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i }).click();
    await page.getByText('⚡ Auto-Import (Demat & UPI)').click();

    const fileInputC = page.locator('input[data-testid="statement-file-input"]');
    await fileInputC.setInputFiles(hdfcSamplePath);

    await expect(page.getByText('Review & Verify Parsed Items')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('SWIGGY', { exact: true })).toBeVisible();
    await expect(page.getByText('ZOMATO', { exact: true })).toBeVisible();

    const confirmBtnC = page.getByRole('button', { name: /Confirm & Import/i });
    await confirmBtnC.click();
    await expect(page.getByText('Review & Verify Parsed Items')).not.toBeVisible({ timeout: 5000 });

    // Explore Learning & Career
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Learning & Career/i }).click();
    await expect(page.getByText('Invest in your next chapter')).toBeVisible();
    await expect(page.getByRole('button', { name: /Skill Roadmaps/i })).toBeVisible();

    // Explore Life Administration
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Life Administration/i }).click();
    await expect(page.getByText("Keep life's essentials organized")).toBeVisible();
    await expect(page.getByRole('button', { name: /Encrypted Document Vault/i })).toBeVisible();

    // Log out Anand
    await page.locator('[data-testid="user-profile-button"]').click();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page.getByText('One Operating System for Your Whole Life')).toBeVisible();

    // =========================================================================
    // 4. CROSS-ACCOUNT PERSISTENCE & DATA ISOLATION VERIFICATION
    // =========================================================================
    // Re-login as Rajesh Verma
    await page.getByPlaceholder('name@example.com').fill('rajesh.verma@quantra.io');
    await page.getByPlaceholder('••••••••').fill('RajeshPass123');
    await page.getByRole('button', { name: /Sign In to LifeOS/i }).click();

    await expect(page.getByText('QUANTRA')).toBeVisible();

    try {
      await skipTourBtn.waitFor({ state: 'visible', timeout: 3000 });
      await skipTourBtn.click();
    } catch (_) {}

    // Verify Rajesh's Demat assets were preserved!
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Finance/i }).click();
    await expect(page.getByText('Take control of your finances')).toBeVisible();
    await page.getByRole('button', { name: 'Holdings & Allocation' }).click();

    await expect(page.getByText('RELIANCE', { exact: true })).toBeVisible();
    await expect(page.getByText('TATAMOTORS', { exact: true })).toBeVisible();

    // Verify Priya's task is NOT in Rajesh's task list (No data cross-contamination)
    await page.locator('nav#tour-section-switcher').getByRole('button', { name: /Productivity/i }).click();
    await expect(page.getByText('Priya: Complete Clinical Nutrition Review', { exact: true })).not.toBeVisible();
  });
});
