import { test, expect } from '@playwright/test';

test.describe('Demo Mode & Auth Wall Interceptor', () => {
  test('User can explore via Instant Demo Access and gets prompted to sign in when triggering guarded actions', async ({ page }) => {
    await page.goto('/');

    // 1. Verify Login Screen Carousel and Demo Access Button
    const demoButton = page.locator('button:has-text("Instant Demo Access (Preloaded Portfolio)")');
    await expect(demoButton).toBeVisible();

    // 2. Click Demo Access
    await demoButton.click();

    // 3. Verify Demo Mode Banner is displayed
    const demoBanner = page.locator('text=Demo Preview');
    await expect(demoBanner.first()).toBeVisible();

    // Dismiss tour if present
    const skipTourBtn = page.locator('button[title="Skip Tour"]');
    if (await skipTourBtn.isVisible()) {
      await skipTourBtn.click();
    }

    // 4. Try clicking a guarded action like "+ Quick Add Task"
    const addActionBtn = page.locator('button:has-text("+ Quick Add Task")').first();
    await expect(addActionBtn).toBeVisible();
    await addActionBtn.click();
      
    // 5. Verify Auth Modal pops up
    const modalHeading = page.locator('text=read-only preview mode');
    await expect(modalHeading).toBeVisible();

    // Verify modal has Sign In and Register tabs
    await expect(page.locator('button:has-text("Sign In")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Register")').first()).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(modalHeading).not.toBeVisible();
    }
  });
});
