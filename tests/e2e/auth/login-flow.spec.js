import { test, expect } from '@playwright/test'

// Реальные данные из seed_test_data.js
const TEST_USERS = {
  admin: {
    email: 'admin@beauty-vite.ru',
    password: 'AdminPass123!',
  },
  client: {
    email: 'ivan.petrov@example.com',
    password: 'ClientPass123!',
  },
  master: {
    email: 'ekaterina.volkova@example.com',
    password: 'MasterPass123!',
  },
  salon: {
    email: 'beauty.salon@example.com',
    password: 'SalonPass123!',
  },
}

test.describe('Вход - реальные данные', () => {
  test('должен войти как клиент', async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.waitForSelector('input[type="email"]', { state: 'visible' })

    await page.fill('input[type="email"]', TEST_USERS.client.email)
    await page.waitForTimeout(100)
    await page.fill('input[type="password"]', TEST_USERS.client.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    // Проверяем что страница профиля загрузилась - используем более специфичный селектор
    await expect(page.locator('.profile-page')).toBeVisible({ timeout: 5000 })
  })

  test('должен войти как мастер', async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.waitForSelector('input[type="email"]', { state: 'visible' })

    await page.fill('input[type="email"]', TEST_USERS.master.email)
    await page.waitForTimeout(100)
    await page.fill('input[type="password"]', TEST_USERS.master.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await expect(page.locator('.profile-page')).toBeVisible({ timeout: 5000 })
  })

  test('должен войти как салон', async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.waitForSelector('input[type="email"]', { state: 'visible' })

    await page.fill('input[type="email"]', TEST_USERS.salon.email)
    await page.waitForTimeout(100)
    await page.fill('input[type="password"]', TEST_USERS.salon.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await expect(page.locator('.profile-page')).toBeVisible({ timeout: 5000 })
  })

  test('должен войти как админ', async ({ page }) => {
    await page.goto('/admin/auth?tab=login')
    await page.waitForSelector('input[type="email"]', { state: 'visible' })

    await page.fill('input[type="email"]', TEST_USERS.admin.email)
    await page.waitForTimeout(100)
    await page.fill('input[type="password"]', TEST_USERS.admin.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 })
    await expect(page.locator('.admin-panel, .admin-dashboard, .admin-container')).toBeVisible({ timeout: 5000 })
  })

  test('должен показать ошибку при неверных данных', async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.waitForSelector('input[type="email"]', { state: 'visible' })

    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.waitForTimeout(100)
    await page.fill('input[type="password"]', 'WrongPass123')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    await expect(page.locator('.error-message')).toBeVisible({ timeout: 10000 })
  })
})
