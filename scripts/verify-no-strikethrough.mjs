import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(500);

  // Click Instant Demo Access
  const demoBtn = page.locator('button', { hasText: 'Instant Demo Access' });
  if (await demoBtn.isVisible()) {
    await demoBtn.click();
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

  // Switch to Calendar & Ledger
  await page.locator('button', { hasText: 'Calendar & Ledger' }).first().click();
  await page.waitForTimeout(800);

  // Switch calendar view to Report
  const reportBtn = page.locator('button', { hasText: 'Report' }).first();
  if (await reportBtn.isVisible()) {
    await reportBtn.click();
    await page.waitForTimeout(600);
  }

  // Scroll down to the report table
  const table = page.locator('table').first();
  if (await table.isVisible()) {
    await table.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await table.screenshot({ path: 'reports/application-audit/screenshots/32_table_without_strikethrough.png' });
    console.log('Captured 32_table_without_strikethrough.png');
  }

  await browser.close();
})();
