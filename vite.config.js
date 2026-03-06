import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'public/robots.txt', dest: '' },
        { src: 'public/sitemap.xml', dest: '' }
      ]
    }),
    // Анализ бандла при ANALYZE=true
    process.env.ANALYZE === 'true' && visualizer({
      open: true,
      filename: 'bundle-analysis.html'
    })
  ].filter(Boolean),

  server: {
    host: true,
    open: process.env.VITE_OPEN_BROWSER !== 'false',
    port: parseInt(process.env.VITE_DEV_PORT || '5173', 10),
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop()
          if (/png|jpe?g|gif|svg|webp|ico/i.test(ext)) {
            return 'assets/img/[name]-[hash][extname]'
          }
          if (/woff2?|ttf|eot/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (/css/i.test(ext)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/misc/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',

        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
            return 'react-vendor'
          }
          if (id.includes('/node_modules/react-router-dom/')) {
            return 'routing'
          }
          if (id.includes('/node_modules/axios/')) {
            return 'http'
          }
          if (id.includes('/node_modules/zod/')) {
            return 'validation'
          }
          if (id.includes('/node_modules/react-hook-form/') || id.includes('/node_modules/@hookform/resolvers/')) {
            return 'forms'
          }
          if (id.includes('/node_modules/socket.io-client/')) {
            return 'socket'
          }
          if (id.includes('/node_modules/react-input-mask/')) {
            return 'input'
          }
          if (id.includes('/node_modules/date-fns/')) {
            return 'date'
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2
      },
      format: {
        comments: false
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    target: 'es2015'
  }
})
