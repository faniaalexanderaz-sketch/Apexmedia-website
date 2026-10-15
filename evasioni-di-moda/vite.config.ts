import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// pubblicato alla radice di un dominio dedicato (Vercel): due pagine, / e /presentazione/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        presentazione: resolve(import.meta.dirname, 'presentazione/index.html'),
      },
    },
  },
})
