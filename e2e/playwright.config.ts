import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { requireEnv } from './data/env';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  globalTeardown: './data/report-hint.ts',
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['allure-playwright', { resultsDir: 'allure-results' }]],
  use: {
    baseURL: requireEnv('BASE_URL'),
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // SLOWMO=<ms> pauses after every action, for watching headed runs
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    { name: 'chromium', testIgnore: /auth\.setup\.ts/, dependencies: ['setup'] },
  ],
});
