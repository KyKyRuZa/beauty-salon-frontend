import { test, expect } from '@playwright/test'

test.describe('Вход - UI тесты', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.waitForSelector('input[type="email"]', { state: 'visible' })
  })

  test('должен отображать форму входа', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Вход в систему')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Войти")')).toBeVisible()
  })

  test('должен показывать ошибку при пустой форме', async ({ page }) => {
    await page.click('button:has-text("Войти")')
    await page.waitForTimeout(500)

    // Проверяем что форма не отправилась (остались на той же странице)
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('должен показывать/скрывать пароль', async ({ page }) => {
    const passwordInput = page.locator('input#password')
    const toggleButton = page.locator('button[aria-label="Показать пароль"]')

    // Заполняем пароль сначала
    await passwordInput.click()
    await page.waitForTimeout(100)
    await passwordInput.fill('TestPass123')
    await page.waitForTimeout(200)

    // Проверяем что изначально пароль скрыт
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Кликаем для показа пароля
    await toggleButton.click()
    await page.waitForTimeout(200)
    // Теперь ищем кнопку "Скрыть пароль"
    const hideToggleButton = page.locator('button[aria-label="Скрыть пароль"]')
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Кликаем обратно для скрытия
    await hideToggleButton.click()
    await page.waitForTimeout(200)
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('должен переключаться на регистрацию', async ({ page }) => {
    await page.click('button:has-text("Зарегистрироваться")')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/.*tab=register.*/)
    await expect(page.locator('h2')).toContainText('Регистрация')
  })

  test('должен показывать ошибку при неверных данных', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.waitForTimeout(100)
    await page.fill('input[type="password"]', 'WrongPass123')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    // Ожидание ошибки от сервера
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 10000 })
  })
})
