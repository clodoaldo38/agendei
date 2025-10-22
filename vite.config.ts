import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/agendei/',
  build: {
    outDir: 'docs',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg', 'brand-agendei.png'],
      devOptions: {
        enabled: false // Desabilita SW em desenvolvimento para evitar erros de TrustedHTML
      },
      manifest: {
        name: 'Agendei',
        short_name: 'Agendei',
        description: 'PWA de agendamento para salão e barbearia',
        theme_color: '#0ea5e9',
        background_color: '#ffffff',
        display: 'standalone',
        lang: 'pt-BR',
        start_url: '/agendei/',
        scope: '/agendei/',
        icons: [
          {
            src: '/brand-agendei.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/brand-agendei.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
    }),
  ],
})
