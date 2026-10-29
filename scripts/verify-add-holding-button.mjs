import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(500);

  // Register fresh user or click demo
  const regBtn = page.getByRole('button', { name: 'First-Time Register' });
  if (await regBtn.isVisible()) {
    await regBtn.click();
    await page.locator('input[placeholder="Enter your full name"]').fill('Dr. Fresh TestUser');
    await page.locator('input[placeholder="name@example.com"]').fill(`holding_${Date.now()}@test.local`);
    await page.locator('input[placeholder="Password (min 6 chars)"]').fill('SecurePass123!');
    await page.locator('input[placeholder="Confirm password"]').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Complete Registration & Open Dashboard' }).click();
    await page.waitForTimeout(1500);
  }

  // Dismiss tour if present
  const skipTourBtn = page.locator('button[title="Skip Tour"]');
  if (await skipTourBtn.isVisible()) {
    await skipTourBtn.click();
    await page.waitForTimeout(500);
  }

  // Navigate to Finance
  await page.locator('button', { hasText: 'Finance' }).first().click();
  await page.waitForTimeout(800);

  // Switch to Holdings & Allocation
  await page.locator('button', { hasText: 'Holdings & Allocation' }).first().click();
  await page.waitForTimeout(800);

  // Capture screenshot of Holdings & Allocation
  await page.screenshot({ path: 'reports/application-audit/screenshots/33_holdings_with_add_button.png' });
  console.log('Captured 33_holdings_with_add_button.png');

  // Verify clicking "+ Add Holding" opens the Add Trade modal
  const addHoldingBtn = page.locator('button', { hasText: '+ Add Holding' }).first();
  console.log('Found + Add Holding button:', await addHoldingBtn.isVisible());
  await addHoldingBtn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'reports/application-audit/screenshots/34_add_holding_modal_opened.png' });
  console.log('Captured 34_add_holding_modal_opened.png');

  await browser.close();
})();
