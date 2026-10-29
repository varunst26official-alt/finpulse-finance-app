import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'live',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          slowMo: 600,
        },
      },
    },
    {
      name: 'mobile-android',
      use: {
        ...devices['Pixel 7'],
      },
    },
    {
      name: 'mobile-live',
      use: {
        ...devices['Pixel 7'],
        launchOptions: {
          slowMo: 700,
        },
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
