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
        // Vendor chunks are pinned by name. Per-portal chunking happens in
        // the function below so admin users don't ship landing-page code
        // (and vice-versa) on first visit.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // react-router-dom v7 re-exports from `react-router`; match both.
            if (/[\\/]react-router(-dom)?[\\/]/.test(id)) return 'react-router'

            // ── react-core ──
            // Anything that touches React.Component / hooks at module init
            // time MUST share a chunk with React itself — otherwise the
            // chunk loads before react-core executes and we get
            //   "Cannot read properties of undefined (reading 'Component')"
            // Add new React-dependent vendors to this list when they show
            // up here (look at vendor-*.js after build).
            if (
              /[\\/]react-dom[\\/]/.test(id) ||
              /[\\/]react[\\/]/.test(id) ||
              /[\\/]scheduler[\\/]/.test(id) ||
              /[\\/]@vercel[\\/]speed-insights[\\/]/.test(id) ||
              /[\\/]@vercel[\\/]analytics[\\/]/.test(id) ||
              /[\\/]react-easy-crop[\\/]/.test(id)
            ) return 'react-core'

            // supabase-js pulls in @supabase/{auth,realtime,postgrest,storage,functions}-js
            // — keep them in one chunk so the catch-all `vendor` stays small.
            if (/[\\/]@supabase[\\/]/.test(id)) return 'supabase'
            if (id.includes('react-hot-toast')) return 'toast'
            return 'vendor'
          }
          // Per-page chunks happen automatically via the lazy() imports in
          // App.jsx — Rollup splits each dynamic import into its own chunk.
          // No per-portal grouping here: a client visiting /client never
          // downloads the unused pages in the same portal until navigated to.
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
