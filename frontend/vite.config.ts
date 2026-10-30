import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://3.25.130.67:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://3.25.130.67:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
