import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test config for Serva web.
 * Assumes the dev server is already running on PORT=3333.
 * Start it with `PORT=3333 npm run dev` before running tests.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3333',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
