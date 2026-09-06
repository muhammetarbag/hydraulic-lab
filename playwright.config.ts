import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

const staticBuild = process.env.HYDRAULIC_TEST_STATIC === 'true';
const remoteUrl = process.env.HYDRAULIC_TEST_URL;
const localUrl = staticBuild
  ? 'http://127.0.0.1:3030/hydraulic-lab/'
  : 'http://localhost:3029/';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 12000 },
  reporter: 'list',
  use: {
    baseURL: remoteUrl ?? localUrl,
    headless: true,
    viewport: { width: 1440, height: 1100 },
    launchOptions: existsSync('/usr/bin/chromium')
      ? { executablePath: '/usr/bin/chromium' }
      : {},
    screenshot: 'only-on-failure',
  },
  webServer: remoteUrl
    ? undefined
    : {
        command: staticBuild
          ? 'python3 -m http.server 3030 --bind 127.0.0.1 --directory dist/client'
          : 'npm run dev -- --host 127.0.0.1 --port 3029',
        url: localUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 60000,
      },
});
