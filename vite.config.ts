import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60 // 5 минут
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Агрегатор новостей',
        short_name: 'Новости',
        description: 'Все важные новости из проверенных источников в одном месте',
        theme_color: '#d7131c',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon_192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      filename: 'sw.js',
      strategies: 'injectManifest',
      injectManifest: {
        injectionPoint: undefined
      }
    })
  ],
  define: {
    'process.env': {}
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  base: './',
})