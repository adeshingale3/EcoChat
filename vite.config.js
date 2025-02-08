import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  define: {
    'process.env': {
      VITE_SPEECHIFY_API_KEY: JSON.stringify(process.env.VITE_SPEECHIFY_API_KEY),
      VITE_SPEECHIFY_API_URL: JSON.stringify(process.env.VITE_SPEECHIFY_API_URL)
    }
  }
})
