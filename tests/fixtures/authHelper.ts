import { Page } from '@playwright/test';

export async function setupAuthenticatedUser(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'lifeos-auth-storage',
      JSON.stringify({
        state: {
          user: {
            id: 'usr_playwright_test',
            fullName: 'Varun Test',
            email: 'test@quantra.io',
            investorType: 'RETAIL',
            joinedDate: 'Oct 2026',
          },
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      })
    );

    window.localStorage.setItem(
      'lifeos-tour-storage',
      JSON.stringify({
        state: {
          hasSeenTour: true,
          seenUserIds: ['usr_playwright_test'],
        },
        version: 0,
      })
    );
  });
}
