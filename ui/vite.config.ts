import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'react-spring'],
          charts: ['reactflow'],
          utils: ['zod', 'clsx', 'tailwind-merge'],
        },
      },
    },
    chunkSizeWarningLimit: 250, // 250KB limit
  },
  
  server: {
    port: 5173,
    host: true,
  },
  
  preview: {
    port: 4173,
    host: true,
  },
  
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-i18next',
      'i18next',
      'framer-motion',
      'react-spring',
      'reactflow',
      'zod',
      'clsx',
      'tailwind-merge',
    ],
  },
}); 