import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Todavía lo necesitas para 'build.outDir'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 5173, 
  },
})