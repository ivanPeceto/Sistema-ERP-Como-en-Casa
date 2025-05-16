import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Todavía lo necesitas para 'build.outDir'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // root: path.resolve(__dirname, 'public'), // <--- COMENTA O ELIMINA ESTA LÍNEA
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})