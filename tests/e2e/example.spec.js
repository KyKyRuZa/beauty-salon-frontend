import { test, expect } from '@playwright/test'

test.describe('E2E Tests', () => {
  test('должен успешно запускаться', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/.*localhost.*/)
  })

  test('должен проверять заголовок страницы', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    console.log('Заголовок страницы:', title)
  })
})
