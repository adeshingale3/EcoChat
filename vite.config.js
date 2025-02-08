import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: []
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_SPEECHIFY_API_KEY': JSON.stringify(process.env.VITE_SPEECHIFY_API_KEY)
  }
})
