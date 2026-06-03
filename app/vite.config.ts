import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const submitApiKey = env.VITE_SUBMIT_API_KEY || env.SUBMIT_API_KEY;

  return {
    plugins: [react()],
    define: submitApiKey
      ? {
          'import.meta.env.VITE_SUBMIT_API_KEY': JSON.stringify(submitApiKey),
        }
      : {},
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
