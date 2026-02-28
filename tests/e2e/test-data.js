/**
 * Скрипт для запуска e2e тестов
 * 
 * Перед запуском убедитесь что:
 * 1. Docker контейнеры запущены: docker-compose -f docker-compose.dev.yml up -d
 * 2. Сервер доступен на localhost:5000
 * 3. Фронтенд доступен на localhost:5173
 * 
 * Использование:
 *   npm run test:e2e                    # все тесты
 *   npm run test:e2e -- --headed        # в режиме браузера
 *   npm run test:e2e -- --ui            # UI режим
 *   npm run test:e2e -- --project=chromium  # только chromium
 */

// Тестовые учетные данные (из seed_test_data.js)
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@beauty-vite.ru',
    password: 'AdminPass123!',
    role: 'admin',
  },
  client: {
    email: 'ivan.petrov@example.com',
    password: 'ClientPass123!',
    role: 'client',
  },
  master: {
    email: 'ekaterina.volkova@example.com',
    password: 'MasterPass123!',
    role: 'master',
  },
  salon: {
    email: 'beauty.salon@example.com',
    password: 'SalonPass123!',
    role: 'salon',
  },
}

// Новые пользователи для тестов регистрации
export function getNewTestUser(type) {
  const timestamp = Date.now()
  const users = {
    client: {
      email: `e2e-client-${timestamp}@example.com`,
      password: 'TestPass123!',
      firstName: 'E2E',
      lastName: 'Client',
      phone: '+7 (999) 000-00-01',
    },
    master: {
      email: `e2e-master-${timestamp}@example.com`,
      password: 'TestPass123!',
      firstName: 'E2E',
      lastName: 'Master',
      phone: '+7 (999) 000-00-02',
      specialization: 'Парикмахер',
    },
    salon: {
      email: `e2e-salon-${timestamp}@example.com`,
      password: 'TestPass123!',
      salonName: 'E2E Salon',
      phone: '+7 (999) 000-00-03',
      inn: '1234567890',
      address: 'ул. Тестовая, 1',
    },
    admin: {
      email: `e2e-admin-${timestamp}@example.com`,
      password: 'TestPass123!',
      firstName: 'E2E',
      lastName: 'Admin',
      phone: '+7 (999) 000-00-04',
    },
  }
  return users[type] || users.client
}
