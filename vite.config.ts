import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';
import postcssCascadeLayers from '@csstools/postcss-cascade-layers';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcssCascadeLayers(),
      ],
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['chrome >= 53', 'android >= 7'],
      additionalLegacyPolyfills: [
        'regenerator-runtime/runtime',
        'abortcontroller-polyfill/dist/abortcontroller-polyfill-only',
      ],
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
