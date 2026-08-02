import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Telegram Mini App: served inside the Telegram webview. Base './' so the
// built bundle works from any subpath (static hosting, GitHub Pages, etc.).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
