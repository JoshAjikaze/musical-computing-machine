import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Custom service worker (src/sw.ts) — required because we need our own
      // push / notificationclick handlers and a hand-tuned audio caching
      // strategy. `generateSW` can't do either of those.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // Keep the precache list to real app-shell assets; don't let it
        // accidentally sweep up anything huge.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      // 'prompt' (not 'autoUpdate') so we control the UX — see
      // PWAUpdatePrompt.tsx, which asks the user before activating an update.
      registerType: 'prompt',
      injectRegister: false, // we register manually via virtual:pwa-register/react
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['favicon.png', 'pwa-icons/apple-touch-icon.png'],
      manifest: {
        name: 'Vibe Garage',
        short_name: 'Vibe Garage',
        description: 'Discover, share, and connect through music in a community where every sound matters.',
        // Installed shortcuts open straight into the listener app, not the
        // marketing page. ProtectedRoute bounces unauthenticated users to
        // /login automatically, so this is safe either way.
        start_url: '/listen',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0A0A0A', // vibe-onyx — splash screen backdrop
        theme_color: '#0A0A0A',      // vibe-onyx — browser/OS chrome color
        icons: [
          { src: '/pwa-icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/pwa-icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
