import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for Electron compatibility
  esbuild: {
    // Strip console.log, console.warn, console.error in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
