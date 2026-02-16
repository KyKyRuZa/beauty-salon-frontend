import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],

  // Оптимизация для разработки
  server: {
    host: true,
    open: true,
    port: 5173,
    proxy: {
      // Прокси для API запросов во время разработки
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Оптимизация для сборки
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1)
          if (/png|jpe?g|gif|svg|webp|ico/i.test(extType)) {
            extType = 'img'
          } else if (/woff2?|ttf|eot/i.test(extType)) {
            extType = 'fonts'
          } else if (/css/i.test(extType)) {
            extType = 'css'
          }
          // Все остальные файлы (включая JS) будут в misc, но JS файлы обрабатываются отдельно
          // через chunkFileNames и entryFileNames
          return `assets/${extType || 'misc'}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',

        // Разделение бандлов для лучшей кешируемости
        manualChunks(id) {
          if (id.includes('node_modules/react/') && !id.includes('react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom/')) {
            return 'routing';
          }
          if (id.includes('node_modules/axios/')) {
            return 'http';
          }
          if (id.includes('node_modules/zod/')) {
            return 'validation';
          }
          if (id.includes('node_modules/react-hook-form/') || id.includes('node_modules/@hookform/resolvers/')) {
            return 'forms';
          }
          if (id.includes('node_modules/socket.io-client/')) {
            return 'socket';
          }
          if (id.includes('node_modules/react-input-mask/')) {
            return 'input';
          }
          if (id.includes('node_modules/date-fns/')) {
            return 'date';
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // Дополнительные оптимизации
        passes: 2,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        pure_getters: true,
        keep_fargs: false
        // unsafe_undefined убран для безопасности
      },
      format: {
        comments: false // Удаление комментариев
      },
      mangle: {
        properties: {
          regex: /^__/ // Mangle только свойства, начинающиеся с __
        }
      }
    },
    // Увеличиваем порог для кода вне основного бандла
    cssCodeSplit: true,
    sourcemap: false, // Отключаем sourcemaps для продакшена
    target: 'es2015' // Устанавливаем целевую версию ES

    // brotliSize и reportCompressedSize по умолчанию true, не указываем явно
  },
  
  // Оптимизация загрузки зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'zod', // Только Zod, без Yup
      'react-hook-form',
      '@hookform/resolvers', // Поддерживает Zod
      'socket.io-client',
      'date-fns',
      'react-input-mask',
      'react-datepicker',
      'prop-types'
    ],
    // Исключаем из оптимизации большие библиотеки, которые редко меняются
    exclude: []
  }
})
