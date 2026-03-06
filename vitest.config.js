import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/**/index.js',
        'src/pages/**',
        'src/components/**',
        'src/config.js',
        'src/api/api.js',
        'src/api/geocoding.js',
        'src/api/providers.js',
        'src/api/salonLocations.js',
        'src/utils/geolocation.js'
      ],
      threshold: {
        lines: 50,
        functions: 40,
        branches: 30,
        statements: 50
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./tests', import.meta.url)),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
})
