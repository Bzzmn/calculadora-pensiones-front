import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Asegura que las variables de entorno estén disponibles en el cliente
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'process.env.VITE_N8N_WEBHOOK_URL': JSON.stringify(env.VITE_N8N_WEBHOOK_URL),
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true
        },
      },

      allowedHosts: [
        '49f3f15d3be0.ngrok.app',
        'localhost',
        '127.0.0.1',
      ]
    },
  };
});
