import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { requireEnv } from './data/env';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: requireEnv('BASE_URL'),
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
