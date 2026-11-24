import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Hosted on Vercel (root path). GitHub Pages deploy was retired.
  plugins: [react()],
})
