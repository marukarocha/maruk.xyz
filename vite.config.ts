import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages publica este repositório em /maruk.xyz/.
  // Vercel (e dev) servem na raiz, então o base só muda no build do Pages.
  base: process.env.GITHUB_PAGES ? '/maruk.xyz/' : '/',
  plugins: [react()],
})
