/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      overlay: false,
      typescript: true,
    }),
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/timeline/index.tsx'),
      name: 'react-svg-timeline',
      fileName: 'react-svg-timeline',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    deps: {
      inline: ['vitest-canvas-mock'],
    },
  },
})
