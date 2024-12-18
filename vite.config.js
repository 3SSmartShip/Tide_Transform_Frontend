import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // Support absolute imports
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api/v1/transform': {
          target: 'https://dl06f080-8080.inc1.devtunnels.ms',
          changeOrigin: true,
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: `assets/[name].[hash].[ext]`,
          chunkFileNames: `chunks/[name].[hash].js`,
          entryFileNames: `entry/[name].[hash].js`,
        },
      },
    },
  };
});
