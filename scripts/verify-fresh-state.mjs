import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Visit application
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(500);

  // Switch to Register tab
  await page.getByRole('button', { name: 'First-Time Register' }).click();
  await page.waitForTimeout(300);

  const email = `testuser_${Date.now()}@quantra.local`;
  await page.locator('input[placeholder="Enter your full name"]').fill('Dr. Fresh TestUser');
  await page.locator('input[placeholder="name@example.com"]').fill(email);
  await page.locator('input[placeholder="Password (min 6 chars)"]').fill('SecurePass123!');
  await page.locator('input[placeholder="Confirm password"]').fill('SecurePass123!');

  console.log('Registering fresh account:', email);
  await page.getByRole('button', { name: 'Complete Registration & Open Dashboard' }).click();
  await page.waitForTimeout(1500);

  // Dismiss tour if present
  const skipTourBtn = page.locator('button[title="Skip Tour"]');
  if (await skipTourBtn.isVisible()) {
    console.log('Dismissing onboarding tour...');
    await skipTourBtn.click();
    await page.waitForTimeout(500);
  }

  // Screenshot 28: Clean ₹0 Fresh Dashboard
  await page.screenshot({ path: 'reports/application-audit/screenshots/28_fresh_user_dashboard.png', fullPage: true });
  console.log('Captured 28_fresh_user_dashboard.png');

  // 2. Click Finance & Wealth section in switcher
  const financeBtn = page.locator('button', { hasText: 'Finance' }).first();
  if (await financeBtn.isVisible()) {
    console.log('Navigating to Finance & Wealth...');
    await financeBtn.click();
    await page.waitForTimeout(800);

    const autoImportBtn = page.locator('button', { hasText: 'Auto-Import' }).first();
    if (await autoImportBtn.isVisible()) {
      console.log('Opening Smart Ingestion modal...');
      await autoImportBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'reports/application-audit/screenshots/29_clean_ingestion_modal.png' });
      console.log('Captured 29_clean_ingestion_modal.png');
      // Close modal
      const closeBtn = page.locator('button:has(svg.lucide-x)').first();
      if (await closeBtn.isVisible()) await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 3. Switch to Life Administration tab
  const lifeAdminBtn = page.locator('button', { hasText: 'Life Administration' }).first();
  if (await lifeAdminBtn.isVisible()) {
    console.log('Navigating to Life Administration...');
    await lifeAdminBtn.click();
    await page.waitForTimeout(800);

    const emBtn = page.locator('button', { hasText: 'Emergency Medical' }).first();
    if (await emBtn.isVisible()) {
      console.log('Opening Emergency Medical subtab...');
      await emBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: 'reports/application-audit/screenshots/30_fresh_emergency_profile.png' });
    console.log('Captured 30_fresh_emergency_profile.png');
  }

  // 4. Test "Reset to Fresh" button
  page.on('dialog', async (dialog) => {
    console.log('Confirm dialog triggered:', dialog.message());
    await dialog.accept();
  });
  const resetBtn = page.locator('button', { hasText: 'Reset to Fresh' }).first();
  if (await resetBtn.isVisible()) {
    console.log('Triggering Reset to Fresh...');
    await resetBtn.click();
    await page.waitForTimeout(1000);
  }

  await browser.close();
  console.log('All verification steps completed successfully!');
})();
