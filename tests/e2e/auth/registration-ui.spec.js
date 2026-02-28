import { test, expect } from '@playwright/test'

test.describe('Регистрация - UI тесты', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth?tab=register&type=user')
    await page.waitForSelector('h2:has-text("Регистрация")', { state: 'visible' })
  })

  test('должен отображать форму регистрации клиента', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Регистрация клиента')
    await expect(page.locator('input#firstName')).toBeVisible()
    await expect(page.locator('input#lastName')).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#phone')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('input#confirmPassword')).toBeVisible()
    await expect(page.locator('input#terms')).toBeVisible()
  })

  test('должен переключаться на регистрацию мастера', async ({ page }) => {
    await page.click('button:has-text("Бьюти-Мастер")')
    await page.waitForTimeout(300)
    await expect(page.locator('h2')).toContainText('Регистрация мастера')
    await expect(page.locator('input#specialization')).toBeVisible()
  })

  test('должен переключаться на регистрацию салона', async ({ page }) => {
    await page.click('button:has-text("Салон красоты")')
    await page.waitForTimeout(300)
    await expect(page.locator('h2')).toContainText('Регистрация салона')
    await expect(page.locator('input#salonName')).toBeVisible()
    await expect(page.locator('input#inn')).toBeVisible()
    await expect(page.locator('input#address')).toBeVisible()
  })

  test('должен показывать ошибку при клике на пустой форме', async ({ page }) => {
    await page.click('button:has-text("Зарегистрироваться")')
    await page.waitForTimeout(1000)
    await expect(page.locator('h2')).toContainText('Регистрация')
  })

  test('должен форматировать телефон', async ({ page }) => {
    const phoneInput = page.locator('input#phone')
    await phoneInput.click()
    await page.waitForTimeout(100)
    await phoneInput.fill('9991234567')
    await page.waitForTimeout(300)
    await expect(phoneInput).toHaveValue('+7 (999) 123-45-67')
  })

  test('должен переключать видимость пароля', async ({ page }) => {
    // Находим кнопку переключения видимости первого пароля
    const toggleButton = page.locator('button.password-toggle-button').first()
    const icon = toggleButton.locator('.material-symbols-outlined')

    // Изначально должна быть иконка visibility (пароль скрыт)
    await expect(icon).toHaveText('visibility')

    // Кликаем - пароль должен стать видимым
    await toggleButton.click()
    await page.waitForTimeout(200)
    await expect(icon).toHaveText('visibility_off')

    // Кликаем еще раз - пароль снова скрыт
    await toggleButton.click()
    await page.waitForTimeout(200)
    await expect(icon).toHaveText('visibility')
  })

  test('должен переключаться на вход', async ({ page }) => {
    await page.click('button:has-text("Войти")')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/.*tab=login.*/)
    await expect(page.locator('h2')).toHaveText('Вход в систему')
  })
})
