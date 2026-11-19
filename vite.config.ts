
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/App/',

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],

        manifest: {
          id: '/App/',
          start_url: '/App/',
          scope: '/App/',

          name: 'ARCANA — Pixel RPG Habit Tracker',
          short_name: 'ARCANA',
          description:
            'Offline pixel RPG habit tracker where daily habits fuel hero gear, boss battles, companions, and your personal sanctuary.',

          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#0d0d0f',
          background_color: '#0d0d0f',

          icons: [
            {
              src: '/App/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/App/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/App/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        },

        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),

      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',

        closeBundle(error?: Error): void {
          if (error) return;

          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');

          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {
              recursive: true,
              force: true,
            });
          }
        },
      },
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
