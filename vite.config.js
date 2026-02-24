import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-seo-files',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist')
        try {
          mkdirSync(distDir, { recursive: true })
          copyFileSync(resolve(__dirname, 'public/robots.txt'), resolve(distDir, 'robots.txt'))
          copyFileSync(resolve(__dirname, 'public/sitemap.xml'), resolve(distDir, 'sitemap.xml'))
          console.log('✅ SEO файлы скопированы в dist (robots.txt, sitemap.xml)')
        } catch (error) {
          console.error('❌ Ошибка копирования SEO файлов:', error.message)
        }
      }
    }
  ],

  server: {
    host: true,
    open: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

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
          return `assets/${extType || 'misc'}/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',

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
        passes: 2,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        pure_getters: true,
        keep_fargs: false
      },
      format: {
        comments: false 
      },
      mangle: {
        properties: {
          regex: /^__/
        }
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    target: 'es2015'
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
      'socket.io-client',
      'date-fns',
      'react-input-mask',
      'react-datepicker',
      'prop-types'
    ],
    exclude: []
  }
})
