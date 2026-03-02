import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!globalThis.process?.env?.CI,
  retries: globalThis.process?.env?.CI ? 2 : 0,
  workers: 8,
  reporter: 'html',
  timeout: 300000,  // 5 минут на тест
  expect: {
    timeout: 20000  // 20 секунд на ожидание
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 60000,  // 1 минута на действие
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  outputDir: 'test-results/'
})
