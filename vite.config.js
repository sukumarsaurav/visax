import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      include: ['src/pages/admin/**', 'src/lib/auditLog.js'],
    },
  },
  plugins: [
    react(),
    // Brotli — modern browsers, ~70% smaller than raw JS
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    // Gzip — fallback for older hosts/CDNs
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
  ],
  build: {
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks so the browser can cache them independently
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          toast: ['react-hot-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
  esbuild: {
    // Strip all console.* and debugger statements from production bundles
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
