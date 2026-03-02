import { test, expect } from '@playwright/test'

test.describe('Просмотр каталога', () => {
  test('должен загрузить список категорий', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForTimeout(2000)

    await expect(page.locator('.service-category')).toHaveCount({ min: 1 })
    await expect(page.locator('.service-category:first-child .category-title')).toBeVisible({ timeout: 5000 })
  })

  test('должен показать услуги категории', async ({ page }) => {
    await page.goto('/catalog')
    await page.waitForTimeout(2000)

    await page.click('.service-category:first-child .btn-select')
    await page.waitForTimeout(2000)

    await expect(page).toHaveURL(/.*masters|.*salons|.*category.*/, { timeout: 10000 })
  })

  test('должен показать детали услуги', async ({ page }) => {
    await page.goto('/catalog/1')
    await page.waitForTimeout(2000)

    await expect(page.locator('.service-title, h1')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('.service-description, .service-price')).toBeVisible({ timeout: 5000 })
  })

  test('должен показать мастеров для услуги', async ({ page }) => {
    await page.goto('/catalog/service/1/masters')
    await page.waitForTimeout(2000)

    await expect(page.locator('.master-card, .specialist-card')).toHaveCount({ min: 1 })
    await expect(page.locator('.master-name:first-child')).toBeVisible({ timeout: 5000 })
  })
})
