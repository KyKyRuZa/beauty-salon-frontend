import { test, expect } from '@playwright/test'

// Валидные данные согласно validation схемам
function getTestUser(type) {
  const timestamp = Date.now()
  return {
    client: {
      firstName: 'Иван',
      lastName: 'Иванов',
      email: `cycle-client-${timestamp}@test.ru`,
      phone: '+7 (999) 111-22-33',
      password: 'TestPass123',
    },
    master: {
      firstName: 'Петр',
      lastName: 'Петров',
      email: `cycle-master-${timestamp}@test.ru`,
      phone: '+7 (999) 222-33-44',
      specialization: 'Парикмахер',
      password: 'MasterPass456',
    },
    salon: {
      salonName: 'Салон Тест',
      email: `cycle-salon-${timestamp}@test.ru`,
      phone: '+7 (999) 333-44-55',
      inn: '1234567890',
      address: 'ул. Тестовая, д. 1',
      password: 'SalonPass789',
    },
    admin: {
      firstName: 'Админ',
      lastName: 'Тестов',
      email: `cycle-admin-${timestamp}@test.ru`,
      phone: '+7 (999) 444-55-66',
      password: 'AdminPass012',
    },
  }[type]
}

test.describe('Полный цикл - Регистрация, выход, вход', () => {
  test('должен пройти полный цикл для клиента', async ({ page }) => {
    const user = getTestUser('client')

    // 1. Заход на сайт
    await page.goto('/')
    await expect(page.locator('header')).toBeVisible()

    // 2. Переход на регистрацию через кнопку в хедере (иконка профиля)
    await page.click('button.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button:has-text("Регистрация")')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/.*auth.*tab=register.*/)

    // 3. Регистрация клиента
    await page.click('button:has-text("Клиент")')
    await page.waitForTimeout(200)

    await page.fill('input#firstName', user.firstName)
    await page.waitForTimeout(100)
    await page.fill('input#lastName', user.lastName)
    await page.waitForTimeout(100)
    await page.fill('input#email', user.email)
    await page.waitForTimeout(100)
    await page.fill('input#phone', user.phone)
    await page.waitForTimeout(100)
    await page.fill('input#password', user.password)
    await page.waitForTimeout(100)
    await page.fill('input#confirmPassword', user.password)
    await page.waitForTimeout(100)
    await page.check('input#terms')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Зарегистрироваться")')

    // 4. Проверка что в профиле
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // 5. Выход - сначала открываем dropdown профиля
    await page.click('.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button.profile-option.logout:has-text("Выйти")')
    // Ждём редиректа на главную
    await page.waitForURL(/.*\/$/, { timeout: 10000 })
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/.*\/$|.*auth.*/, { timeout: 10000 })

    // 6. Вход
    await page.goto('/auth?tab=login')
    await page.waitForSelector('input#email', { state: 'visible' })
    await page.waitForTimeout(1000)
    
    // Очищаем и заполняем заново
    await page.locator('input#email').clear()
    await page.waitForTimeout(100)
    await page.locator('input#email').fill(user.email)
    await page.waitForTimeout(100)
    await page.locator('input#password').clear()
    await page.waitForTimeout(100)
    await page.locator('input#password').fill(user.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')

    // 7. Проверка что снова в профиле
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // 8. Выход - сначала открываем dropdown профиля
    await page.click('.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button.profile-option.logout:has-text("Выйти")')
  })

  test('должен пройти полный цикл для мастера', async ({ page }) => {
    const user = getTestUser('master')

    await page.goto('/auth?tab=register&type=master')
    await page.waitForSelector('input#firstName', { state: 'visible' })

    await page.fill('input#firstName', user.firstName)
    await page.waitForTimeout(100)
    await page.fill('input#lastName', user.lastName)
    await page.waitForTimeout(100)
    await page.fill('input#email', user.email)
    await page.waitForTimeout(100)
    await page.fill('input#phone', user.phone)
    await page.waitForTimeout(100)
    await page.fill('input#specialization', user.specialization)
    await page.waitForTimeout(100)
    await page.fill('input#password', user.password)
    await page.waitForTimeout(100)
    await page.fill('input#confirmPassword', user.password)
    await page.waitForTimeout(100)
    await page.check('input#terms')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Зарегистрироваться")')
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Выход - открываем dropdown профиля
    await page.click('.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button.profile-option.logout:has-text("Выйти")')
    // Ждём редиректа
    await page.waitForURL(/.*\/$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    await page.goto('/auth?tab=login')
    await page.waitForSelector('input#email', { state: 'visible' })
    await page.waitForTimeout(1000)
    
    // Очищаем и заполняем заново
    await page.locator('input#email').clear()
    await page.waitForTimeout(100)
    await page.locator('input#email').fill(user.email)
    await page.waitForTimeout(100)
    await page.locator('input#password').clear()
    await page.waitForTimeout(100)
    await page.locator('input#password').fill(user.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Выход - открываем dropdown профиля
    await page.click('.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button.profile-option.logout:has-text("Выйти")')
  })

  test('должен пройти полный цикл для салона', async ({ page }) => {
    const user = getTestUser('salon')

    await page.goto('/auth?tab=register&type=salon')
    await page.waitForSelector('input#salonName', { state: 'visible' })

    await page.fill('input#salonName', user.salonName)
    await page.waitForTimeout(100)
    await page.fill('input#email', user.email)
    await page.waitForTimeout(100)
    await page.fill('input#phone', user.phone)
    await page.waitForTimeout(100)
    await page.fill('input#inn', user.inn)
    await page.waitForTimeout(100)
    await page.fill('input#address', user.address)
    await page.waitForTimeout(100)
    await page.fill('input#password', user.password)
    await page.waitForTimeout(100)
    await page.fill('input#confirmPassword', user.password)
    await page.waitForTimeout(100)
    await page.check('input#terms')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Зарегистрироваться")')
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Выход - открываем dropdown профиля
    await page.click('.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button.profile-option.logout:has-text("Выйти")')
    // Ждём редиректа
    await page.waitForURL(/.*\/$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    await page.goto('/auth?tab=login')
    await page.waitForSelector('input#email', { state: 'visible' })
    await page.waitForTimeout(1000)
    
    // Очищаем и заполняем заново
    await page.locator('input#email').clear()
    await page.waitForTimeout(100)
    await page.locator('input#email').fill(user.email)
    await page.waitForTimeout(100)
    await page.locator('input#password').clear()
    await page.waitForTimeout(100)
    await page.locator('input#password').fill(user.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')
    await expect(page).toHaveURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Выход - открываем dropdown профиля
    await page.click('.header-action-btn.profile-trigger')
    await page.waitForTimeout(300)
    await page.click('button.profile-option.logout:has-text("Выйти")')
  })

  test('должен пройти полный цикл для админа', async ({ page }) => {
    const user = getTestUser('admin')

    await page.goto('/admin/auth?tab=register')
    await page.waitForSelector('input#first_name', { state: 'visible' })

    await page.fill('input#first_name', user.firstName)
    await page.waitForTimeout(100)
    await page.fill('input#last_name', user.lastName)
    await page.waitForTimeout(100)
    await page.fill('input#email', user.email)
    await page.waitForTimeout(100)
    await page.fill('input#phone', user.phone)
    await page.waitForTimeout(100)
    await page.fill('input#password', user.password)
    await page.waitForTimeout(100)
    await page.fill('input#confirmPassword', user.password)
    await page.waitForTimeout(100)
    await page.check('input#terms')
    await page.waitForTimeout(100)
    await page.click('button:has-text("Зарегистрироваться")')
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Выход - используем кнопку в админ-панели
    await page.click('button.logout-btn:has-text("Выйти")')
    await page.waitForURL(/.*\/$/, { timeout: 10000 })
    await page.waitForTimeout(500)

    await page.goto('/admin/auth?tab=login')
    await page.waitForSelector('input#email', { state: 'visible' })
    await page.waitForTimeout(500)
    await page.fill('input#email', user.email)
    await page.waitForTimeout(100)
    await page.fill('input#password', user.password)
    await page.waitForTimeout(100)
    await page.click('button:has-text("Войти")')
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 })
    await page.waitForTimeout(1000)

    // Выход - используем кнопку в админ-панели
    await page.click('button.logout-btn:has-text("Выйти")')
  })
})
