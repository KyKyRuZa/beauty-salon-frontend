import { test, expect } from '@playwright/test'

test.describe('Создание записи', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.fill('input[type="email"]', 'ivan.petrov@example.com')
    await page.fill('input[type="password"]', 'ClientPass123!')
    await page.click('button:has-text("Войти")')
    await page.waitForURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(2000)
  })

  test('должен перейти на страницу записи', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/.*booking.*/, { timeout: 5000 })
    await expect(page.locator('text=/запис/i, text=/бронировани/i, h1, h2')).toBeVisible({ timeout: 5000 })
  })

  test('должен показать форму записи', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForTimeout(2000)

    // Проверка что форма загрузилась
    const formElements = page.locator('form, .booking-form, input, select, button')
    await expect(formElements.first()).toBeVisible({ timeout: 5000 })
  })

  test('должен показать календарь', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForTimeout(2000)

    const calendar = page.locator('.calendar, .date-picker, .date-selector')
    await expect(calendar.first()).toBeVisible({ timeout: 5000 })
  })

  test('должен показать слоты времени', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForTimeout(2000)

    const timeSlots = page.locator('.time-slot, .time-slot-item, .time-slots')
    await expect(timeSlots.first()).toBeVisible({ timeout: 5000 })
  })

  test('должен показать подтверждение', async ({ page }) => {
    await page.goto('/booking')
    await page.waitForTimeout(2000)

    const confirmButton = page.locator('button:has-text("Подтвердить"), button:has-text("Записаться")')
    await expect(confirmButton.first()).toBeVisible({ timeout: 5000 })
  })
})
