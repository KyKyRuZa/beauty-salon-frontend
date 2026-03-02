import { test, expect } from '@playwright/test'

test.describe('Отмена записи', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.fill('input[type="email"]', 'ivan.petrov@example.com')
    await page.fill('input[type="password"]', 'ClientPass123!')
    await page.click('button:has-text("Войти")')
    await page.waitForURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(2000)
  })

  test('должен показать историю записей', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(2000)

    // Клик на "Мои заказы"
    const ordersBtn = page.locator('button:has-text("Мои заказы")')
    await ordersBtn.click()
    await page.waitForTimeout(2000)

    await expect(page.locator('.booking-history-container, .booking-item, text=/мои запис/i')).toBeVisible({ timeout: 10000 })
  })

  test('должен показать фильтры записей', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(2000)

    const ordersBtn = page.locator('button:has-text("Мои заказы")')
    await ordersBtn.click()
    await page.waitForTimeout(2000)

    const filterButtons = page.locator('.booking-filters button, .filter-btn')
    await expect(filterButtons.first()).toBeVisible({ timeout: 5000 })
  })

  test('должен отфильтровать записи', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(2000)

    const ordersBtn = page.locator('button:has-text("Мои заказы")')
    await ordersBtn.click()
    await page.waitForTimeout(2000)

    const activeFilter = page.locator('button:has-text("Активные"), button:has-text("Все")')
    await activeFilter.click()
    await page.waitForTimeout(1000)

    await expect(page.locator('.booking-item, .booking-card')).toBeVisible({ timeout: 5000 })
  })

  test('должен показать детали записи', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(2000)

    const ordersBtn = page.locator('button:has-text("Мои заказы")')
    await ordersBtn.click()
    await page.waitForTimeout(2000)

    const bookingItems = page.locator('.booking-item, .booking-card')
    const count = await bookingItems.count()

    if (count > 0) {
      await bookingItems.first().click()
      await page.waitForTimeout(1000)

      const details = page.locator('.booking-details, .master-name, .service-name')
      await expect(details.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('должен отменить запись', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(2000)

    const ordersBtn = page.locator('button:has-text("Мои заказы")')
    await ordersBtn.click()
    await page.waitForTimeout(2000)

    const bookingItems = page.locator('.booking-item, .booking-card')
    const count = await bookingItems.count()

    if (count > 0) {
      const cancelButton = bookingItems.first().locator('button:has-text("Отменить")')
      const cancelCount = await cancelButton.count()

      if (cancelCount > 0) {
        await cancelButton.first().click()
        await page.waitForTimeout(500)

        const confirmButton = page.locator('button:has-text("Да, отменить"), button:has-text("Подтвердить")')
        await confirmButton.first().click()
        await page.waitForTimeout(1000)

        await expect(page.locator('.success-message, .alert-success')).toBeVisible({ timeout: 5000 })
      }
    }
  })
})
