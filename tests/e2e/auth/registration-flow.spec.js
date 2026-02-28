import { test, expect } from '@playwright/test'

// Валидные тестовые данные согласно validation схемам
// Пароль: минимум 8 символов, заглавная, строчная, цифра
// Имя: минимум 2 символа, кириллица/латиница
// Телефон: формат +7 (XXX) XXX-XX-XX

const TEST_DATA = {
  client: {
    firstName: 'Иван',
    lastName: 'Иванов',
    email: `e2e-client-${Date.now()}@test.ru`,
    phone: '+7 (999) 123-45-67',
    password: 'TestPass123',  // Заглавная + строчная + цифра, 11 символов
    confirmPassword: 'TestPass123',
  },
  master: {
    firstName: 'Петр',
    lastName: 'Петров',
    email: `e2e-master-${Date.now()}@test.ru`,
    phone: '+7 (999) 234-56-78',
    specialization: 'Парикмахер',
    password: 'MasterPass456',
    confirmPassword: 'MasterPass456',
  },
  salon: {
    salonName: 'Салон Красоты',
    email: `e2e-salon-${Date.now()}@test.ru`,
    phone: '+7 (999) 345-67-89',
    inn: '1234567890',
    address: 'ул. Ленина, д. 1',
    password: 'SalonPass789',
    confirmPassword: 'SalonPass789',
  },
}

test.describe('Регистрация - новые пользователи', () => {
  test('должен зарегистрировать нового клиента', async ({ page }) => {
    const data = TEST_DATA.client

    await page.goto('/auth?tab=register&type=user')

    // Ждем загрузки формы
    await page.waitForSelector('input#firstName', { state: 'visible' })

    // Заполнение полей с задержками
    await page.fill('input#firstName', data.firstName)
    await page.waitForTimeout(200)
    await page.fill('input#lastName', data.lastName)
    await page.waitForTimeout(200)
    await page.fill('input#email', data.email)
    await page.waitForTimeout(200)
    await page.fill('input#phone', data.phone)
    await page.waitForTimeout(200)
    await page.fill('input#password', data.password)
    await page.waitForTimeout(300)
    await page.fill('input#confirmPassword', data.confirmPassword)
    await page.waitForTimeout(300)

    // Принятие условий
    await page.check('input#terms')
    await page.waitForTimeout(200)

    // Клик по кнопке регистрации
    await page.click('button:has-text("Зарегистрироваться")')
    
    // Ждём перехода
    await page.waitForTimeout(1000)

    // Ожидание перехода в профиль
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
  })

  test('должен зарегистрировать нового мастера', async ({ page }) => {
    const data = TEST_DATA.master

    await page.goto('/auth?tab=register&type=master')
    await page.waitForSelector('input#firstName', { state: 'visible' })

    await page.fill('input#firstName', data.firstName)
    await page.waitForTimeout(100)
    await page.fill('input#lastName', data.lastName)
    await page.waitForTimeout(100)
    await page.fill('input#email', data.email)
    await page.waitForTimeout(100)
    await page.fill('input#phone', data.phone)
    await page.waitForTimeout(100)
    await page.fill('input#specialization', data.specialization)
    await page.waitForTimeout(100)
    await page.fill('input#password', data.password)
    await page.waitForTimeout(100)
    await page.fill('input#confirmPassword', data.confirmPassword)
    await page.waitForTimeout(100)
    await page.check('input#terms')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Зарегистрироваться")')

    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
  })

  test('должен зарегистрировать новый салон', async ({ page }) => {
    const data = TEST_DATA.salon

    await page.goto('/auth?tab=register&type=salon')
    await page.waitForSelector('input#salonName', { state: 'visible' })

    await page.fill('input#salonName', data.salonName)
    await page.waitForTimeout(100)
    await page.fill('input#email', data.email)
    await page.waitForTimeout(100)
    await page.fill('input#phone', data.phone)
    await page.waitForTimeout(100)
    await page.fill('input#inn', data.inn)
    await page.waitForTimeout(100)
    await page.fill('input#address', data.address)
    await page.waitForTimeout(100)
    await page.fill('input#password', data.password)
    await page.waitForTimeout(100)
    await page.fill('input#confirmPassword', data.confirmPassword)
    await page.waitForTimeout(100)
    await page.check('input#terms')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Зарегистрироваться")')

    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
  })
})
