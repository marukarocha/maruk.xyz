import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages publica este repositório em /maruk.xyz/.
  base: '/maruk.xyz/',
  plugins: [react()],
})
