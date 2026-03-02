import { test, expect } from '@playwright/test'

test.describe('Поиск услуг', () => {
  test('должен найти услугу по названию', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForTimeout(2000)

    await page.fill('input[placeholder*="Поиск"]', 'стриж')
    await page.press('input[placeholder*="Поиск"]', 'Enter')
    await page.waitForTimeout(2000)

    await expect(page.locator('.service-item, .service-card')).toHaveCount({ min: 1 })
  })

  test('должен показать "ничего не найдено"', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForTimeout(2000)

    await page.fill('input[placeholder*="Поиск"]', 'xyz123abc')
    await page.press('input[placeholder*="Поиск"]', 'Enter')
    await page.waitForTimeout(2000)

    await expect(page.locator('.no-results, text=/ничего не найдено/i')).toBeVisible({ timeout: 5000 })
  })

  test('должен искать по мастеру', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForTimeout(2000)

    await page.fill('input[placeholder*="Поиск"]', 'Екатерина')
    await page.press('input[placeholder*="Поиск"]', 'Enter')
    await page.waitForTimeout(2000)

    await expect(page.locator('.master-name, text=/Екатерина/i')).toBeVisible({ timeout: 5000 })
  })

  test('должен очистить поиск', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForTimeout(2000)

    await page.fill('input[placeholder*="Поиск"]', 'стриж')
    await page.press('input[placeholder*="Поиск"]', 'Enter')
    await page.waitForTimeout(2000)

    const clearButton = page.locator('button[aria-label*="Очист"], button:has-text("×")')
    const count = await clearButton.count()

    if (count > 0) {
      await clearButton.first().click()
      await page.waitForTimeout(1000)

      await expect(page.locator('input[placeholder*="Поиск"]')).toHaveValue('')
    }
  })
})
