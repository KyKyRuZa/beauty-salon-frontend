# Frontend — Beauty Vite

[![Tests](https://img.shields.io/badge/tests-240%20passed-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-64.31%25%20branch-yellow)]()
[![React](https://img.shields.io/badge/react-19.1.1-blue)]()
[![Vite](https://img.shields.io/badge/vite-7.1.7-purple)]()

Фронтенд-приложение для платформы записи в салоны красоты и к мастерам. Построено на **React 19** + **Vite 7** с современной архитектурой и покрытием тестов.

---

## 📊 Метрики проекта

| Метрика                | Значение | Статус |
| ----------------------------- | ---------------- | ------------ |
| **Тесты**          | 240 passed       | ✅           |
| **Branch Coverage**     | 64.31%           | ✅           |
| **Statements Coverage** | 86.45%           | ✅           |
| **Lines Coverage**      | 88.6%            | ✅           |
| **Functions Coverage**  | 76.28%           | ✅           |
| **Lint Errors**         | 0                | ✅           |

---

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск dev-сервера

```bash
npm run dev
```

Сервер запустится на `http://localhost:5173` с автоматическим открытием браузера.

### Сборка production

```bash
npm run build
```

### Запуск тестов

```bash
# Unit + Integration тесты
npm run test

# С покрытием
npm run test:coverage

# E2E тесты (Playwright)
npm run test:e2e
```

---

## 📁 Структура проекта

```
frontend/
├── src/
│   ├── api/              # API клиенты (axios)
│   │   ├── api.js        # Базовый axios instance
│   │   ├── auth.js       # Аутентификация
│   │   ├── catalog.js    # Каталог услуг
│   │   ├── booking.js    # Бронирования
│   │   ├── user.js       # Профиль пользователя
│   │   ├── admin.js      # Админ-панель
│   │   ├── favorites.js  # Избранное
│   │   ├── reviews.js    # Отзывы
│   │   └── timeslots.js  # Временные слоты
│   │
│   ├── components/       # React компоненты
│   │   ├── admin/        # Компоненты админки
│   │   ├── auth/         # Формы входа/регистрации
│   │   ├── booking/      # Бронирование
│   │   ├── catalog/      # Каталог услуг
│   │   ├── form/         # Формы
│   │   ├── ui/           # UI компоненты
│   │   └── *.jsx         # Общие компоненты
│   │
│   ├── context/          # React Context (состояние)
│   ├── pages/            # Страницы приложения
│   │   ├── private/      # Защищённые страницы
│   │   ├── public/       # Публичные страницы
│   │   └── catalog/      # Страницы каталога
│   │
│   ├── utils/            # Утилиты
│   │   └── logger.js     # Логгер (DEV/PROD)
│   │
│   ├── validations/      # Zod схемы валидации
│   │   ├── auth.js       # Валидация форм auth
│   │   ├── catalog.js    # Валидация каталога
│   │   ├── base.js       # Базовые схемы
│   │   └── zodResolver.js # Резолвер для react-hook-form
│   │
│   ├── styles/           # Глобальные стили
│   ├── assets/           # Статические ресурсы
│   │
│   ├── App.jsx           # Корневой компонент
│   ├── main.jsx          # Точка входа
│   └── config.js         # Конфигурация
│
├── tests/
│   ├── unit/             # Unit тесты
│   │   ├── api/          # Тесты API клиентов
│   │   ├── services/     # Тесты сервисов
│   │   ├── validations/  # Тесты валидаций
│   │   └── context/      # Тесты context
│   │
│   ├── integration/      # Integration тесты
│   │   └── auth/         # Тесты форм
│   │
│   ├── e2e/              # E2E тесты (Playwright)
│   │   └── auth/         # Сценарии авторизации
│   │
│   ├── fixtures/         # Тестовые данные
│   └── setup.js          # Setup для тестов
│
├── public/
│   ├── robots.txt        # SEO robots
│   └── sitemap.xml       # SEO sitemap
│
├── package.json
├── vite.config.js        # Конфиг Vite
├── vitest.config.js      # Конфиг тестов
├── playwright.config.js  # Конфиг E2E
└── eslint.config.js      # Конфиг линтера
```

---

## 🛠 Технологический стек

### Core

| Технология       | Версия | Назначение               |
| -------------------------- | ------------ | ---------------------------------- |
| **React**            | 19.1.1       | UI библиотека            |
| **Vite**             | 7.1.7        | Сборщик и dev-сервер |
| **React Router DOM** | 7.9.3        | Роутинг                     |

### State & Forms

| Технология          | Версия | Назначение                |
| ----------------------------- | ------------ | ----------------------------------- |
| **React Hook Form**     | 7.64.0       | Управление формами |
| **@hookform/resolvers** | 5.2.2        | Валидация форм         |
| **Zod**                 | 4.3.6        | Схемы валидации       |

### HTTP & Real-time

| Технология       | Версия | Назначение |
| -------------------------- | ------------ | -------------------- |
| **Axios**            | 1.13.2       | HTTP клиент    |
| **Socket.IO Client** | 4.8.1        | WebSocket            |

### UI & Utilities

| Технология       | Версия | Назначение         |
| -------------------------- | ------------ | ---------------------------- |
| **React DatePicker** | 8.7.0        | Календарь дат    |
| **React Input Mask** | 2.0.4        | Маски ввода        |
| **date-fns**         | 4.1.0        | Работа с датами |
| **Prop Types**       | 15.8.1       | Проверка типов  |

### Testing

| Технология      | Версия | Назначение                    |
| ------------------------- | ------------ | --------------------------------------- |
| **Vitest**          | 4.0.18       | Unit/Integration тесты             |
| **Playwright**      | 1.58.2       | E2E тесты                          |
| **Testing Library** | 16.3.2       | Утилиты тестирования |
| **jsdom**           | 28.1.0       | DOM окружение                  |

---

## 📦 Сборка и оптимизация

### Code Splitting

Проект настроен на автоматическое разделение кода на чанки:

```javascript
// vite.config.js
manualChunks(id) {
  if (id.includes('node_modules/react/')) {
    return 'react-vendor';  // ~320 KB
  }
  if (id.includes('node_modules/react-router-dom/')) {
    return 'routing';       // ~37 KB
  }
  if (id.includes('node_modules/zod/')) {
    return 'validation';    // ~66 KB
  }
  if (id.includes('node_modules/react-hook-form/')) {
    return 'forms';         // ~26 KB
  }
}
```

### Результат сборки

```
dist/
├── index.html                              4.28 KB │ gzip: 1.33 KB
├── assets/js/react-vendor-[hash].js       320 KB   │ gzip: 97 KB
├── assets/js/index-[hash].js              374 KB   │ gzip: 53 KB
├── assets/js/validation-[hash].js          66 KB   │ gzip: 17 KB
├── assets/js/routing-[hash].js             37 KB   │ gzip: 13 KB
├── assets/css/index-[hash].css             72 KB   │ gzip: 12 KB
└── assets/img/                             images
```

### Оптимизации

- ✅ **Terser minification** — 2 прохода сжатия
- ✅ **CSS code splitting** — разделение CSS по чанкам
- ✅ **Console removal** — удаление console.log в production
- ✅ **SEO files copy** — автоматическое копирование robots.txt, sitemap.xml

---

## 🧪 Тестирование

### Запуск тестов

```bash
# Все тесты
npm run test

# С покрытием
npm run test:coverage

# E2E тесты
npm run test:e2e

# E2E в браузере
npm run test:e2e -- --headed

# E2E только Chromium
npm run test:e2e -- --project=chromium
```

### Покрытие тестами

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|---------
All files          |   86.45 |    64.31 |   76.28 |    88.6
 api               |   84.63 |    64.21 |   74.39 |   87.16
  auth.js          |   82.17 |     52.1 |      70 |   82.17
  catalog.js       |   82.35 |    73.52 |   66.66 |    88.6
  user.js          |   95.65 |    93.75 |      80 |     100
 validations       |   96.61 |    68.42 |     100 |   96.55
  auth.js          |   93.75 |       75 |     100 |   93.75
  catalog.js       |     100 |      100 |     100 |     100
```

### Структура тестов

```
tests/
├── unit/             # 180+ тестов
│   ├── api/          # API клиенты
│   ├── services/     # Сервисы
│   ├── validations/  # Zod схемы
│   └── context/      # Context
│
├── integration/      # 10+ тестов
│   └── auth/         # Формы
│
└── e2e/              # 50+ тестов
    └── auth/         # Сценарии
```

---

## 🔧 Конфигурация

### Переменные окружения

```bash
# .env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_BASE_URL=ws://localhost:5000
```

### Прокси в dev

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

---

## 📈 Производительность

### Lighthouse (production)

| Метрика | Score |
| -------------- | ----- |
| Performance    | 90+   |
| Accessibility  | 95+   |
| Best Practices | 95+   |
| SEO            | 100   |

### Bundle size

| Chunk           | Size              | Gzip              |
| --------------- | ----------------- | ----------------- |
| react-vendor    | 320 KB            | 97 KB             |
| index           | 374 KB            | 53 KB             |
| validation      | 66 KB             | 17 KB             |
| routing         | 37 KB             | 13 KB             |
| **Total** | **~800 KB** | **~180 KB** |

---

## 🎯 Архитектурные решения

### 1. API Layer

```javascript
// src/api/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Interceptor для токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);
```

### 2. Валидация через Zod

```javascript
// src/validations/auth.js
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

// Использование в форме
const { register, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### 3. Logger для DEV/PROD

```javascript
// src/utils/logger.js
const isDev = import.meta.env.DEV;

export const logger = {
  debug: isDev ? console.debug.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};
```

---

## 🚀 Docker

### Dev режим

```bash
docker compose -f docker-compose.dev.yml up -d
```

### Production

```bash
docker compose up -d
```

---

## 📝 Чек-лист разработки

### Перед коммитом

- [ ] `npm run lint` — 0 ошибок
- [ ] `npm run test` — все тесты зелёные
- [ ] `npm run build` — сборка без ошибок

### Новый компонент

1. Создать в `src/components/`
2. Добавить PropTypes или TypeScript типы
3. Написать unit тест
4. Экспортировать в index.js

### Новая страница

1. Создать в `src/pages/`
2. Добавить роут в `App.jsx`
3. Проверить права доступа (private/public)

### Новый API метод

1. Добавить в `src/api/*.js`
2. Написать unit тест
3. Обработать ошибки (400, 401, 500, network)

---

## 🔗 Ссылки

- [Документация React](https://react.dev)
- [Документация Vite](https://vitejs.dev)
- [Документация Zod](https://zod.dev)
- [Документация Playwright](https://playwright.dev)
