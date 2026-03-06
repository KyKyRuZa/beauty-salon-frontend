export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:5000',

  // Timeouts
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Feature Flags
  debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  maintenanceMode: import.meta.env.VITE_MAINTENANCE_MODE === 'true',

  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Бьюти Окна',
  itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,

  // Third-party Keys
  mapsApiKey: import.meta.env.VITE_MAPS_API_KEY || '',
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',

  // Environment
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// Валидация обязательных переменных в production
if (config.isProd) {
  const requiredVars = ['VITE_API_BASE_URL'];
  const missing = requiredVars.filter(
    key => !import.meta.env[key]
  );

  if (missing.length > 0) {
    // Используем console.warn, так как logger может быть ещё не доступен
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
