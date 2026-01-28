import { defineConfig } from '@playwright/test';
import 'dotenv/config'; // load env variables from .env

export default defineConfig({
  testDir: './tests',          // where your test files are
  fullyParallel: true,         // run tests in parallel
  forbidOnly: !!process.env.CI, // fail build if test.only is left
  retries: process.env.CI ? 2 : 0, // retry only on CI
  workers: process.env.CI ? 1 : undefined, // single worker on CI

  reporter: 'html',            // HTML report
  use: {
    baseURL: process.env.BASE_URL, // your API base URL
    trace: 'on-first-retry',       // trace only on first retry
    // You can also set default headers, timeout, etc. if needed:
    // extraHTTPHeaders: { 'Authorization': `Bearer ${process.env.API_TOKEN}` },
    // timeout: 30000
  },

  // No browser projects needed for API-only testing
  projects: [
    {
      name: 'api', // just a placeholder project for API tests
      use: {},     // empty because no browser is used
    },
  ],
});
