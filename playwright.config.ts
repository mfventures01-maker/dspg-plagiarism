import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './certifications/runtime',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 10000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Deterministic sequential execution
  reporter: [
    ['list'],
    ['json', { outputFile: 'certifications/evidence/playwright-results.json' }]
  ],
  globalTeardown: './certifications/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    contextOptions: {
      recordVideo: {
        dir: 'certifications/evidence/video/'
      }
    }
  },
  outputDir: 'certifications/evidence/traces-and-screenshots',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000/health/runtime',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: { NODE_ENV: 'production' }
  },
});

