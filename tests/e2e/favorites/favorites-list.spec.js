import { test, expect } from '@playwright/test'

test.describe('Избранное', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth?tab=login')
    await page.fill('input[type="email"]', 'ivan.petrov@example.com')
    await page.fill('input[type="password"]', 'ClientPass123!')
    await page.click('button:has-text("Войти")')
    await page.waitForURL(/.*profile.*/, { timeout: 15000 })
    await page.waitForTimeout(3000)
  })

  test('должен показать секцию избранного', async ({ page }) => {
    await page.waitForSelector('.sidebar-btn', { state: 'visible', timeout: 10000 })
    
    const favoritesBtn = page.locator('.sidebar-btn:has-text("Избранное")')
    await favoritesBtn.click()
    await page.waitForTimeout(2000)

    await expect(page.locator('text=/избранн/i, .favorites-section, .favorite-card, .no-favorites')).toBeVisible({ timeout: 10000 })
  })

  test('должен показать список избранных мастеров', async ({ page }) => {
    await page.waitForSelector('.sidebar-btn', { state: 'visible', timeout: 10000 })
    
    const favoritesBtn = page.locator('.sidebar-btn:has-text("Избранное")')
    await favoritesBtn.click()
    await page.waitForTimeout(2000)

    const favoritesCards = page.locator('.favorite-card')
    const noFavorites = page.locator('.no-favorites, text=/нет избранных/i')
    
    const cardsCount = await favoritesCards.count()
    const noFavoritesCount = await noFavorites.count()
    
    expect(cardsCount > 0 || noFavoritesCount > 0).toBeTruthy()
  })

  test('должен перейти в профиль мастера из избранного', async ({ page }) => {
    await page.waitForSelector('.sidebar-btn', { state: 'visible', timeout: 10000 })
    
    const favoritesBtn = page.locator('.sidebar-btn:has-text("Избранное")')
    await favoritesBtn.click()
    await page.waitForTimeout(2000)

    const favoriteCards = page.locator('.favorite-card')
    const count = await favoriteCards.count()

    if (count > 0) {
      const viewProfileBtn = favoriteCards.first().locator('button:has-text("Перейти"), button:has-text("Профиль")')
      const btnCount = await viewProfileBtn.count()

      if (btnCount > 0) {
        await viewProfileBtn.first().click()
        await page.waitForTimeout(1000)
        await expect(page).toHaveURL(/.*provider.*/, { timeout: 10000 })
      }
    }
  })
})
