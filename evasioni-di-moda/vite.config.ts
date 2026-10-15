import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: la demo funziona sia su un dominio dedicato sia in una sottocartella
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { cssCodeSplit: false },
})
