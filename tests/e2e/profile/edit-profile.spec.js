import { test, expect } from '@playwright/test'

test.describe('Редактирование профиля', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.fill('input[type="email"]', 'ivan.petrov@example.com')
    await page.fill('input[type="password"]', 'ClientPass123!')
    await page.click('button:has-text("Войти")')
    await page.waitForURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(3000)
  })

  test('должен перейти на страницу редактирования', async ({ page }) => {
    await page.waitForSelector('.sidebar-btn', { state: 'visible', timeout: 10000 })
    
    const settingsBtn = page.locator('.sidebar-btn:has-text("Настройки")')
    await settingsBtn.click()
    await page.waitForTimeout(1000)

    const editBtn = page.locator('.link-btn:has-text("Изменить данные"), button:has-text("Изменить данные")')
    await editBtn.click()
    await page.waitForTimeout(1000)

    await expect(page).toHaveURL(/.*profile\/edit.*/, { timeout: 10000 })
  })

  test('должен показать страницу редактирования', async ({ page }) => {
    await page.goto('/profile/edit')
    await page.waitForTimeout(5000)

    // Просто проверяем что страница загрузилась
    await expect(page).toHaveURL(/.*profile\/edit.*/, { timeout: 10000 })
  })

  test('должен отменить редактирование', async ({ page }) => {
    await page.goto('/profile/edit')
    await page.waitForTimeout(3000)

    await page.click('button:has-text("Отмена")')
    await page.waitForTimeout(1000)

    await expect(page).toHaveURL(/.*profile.*/, { timeout: 10000 })
  })
})
