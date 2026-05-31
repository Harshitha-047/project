import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: false,  // Disable Vite's CORS to avoid conflicts with Django's CORS headers
  },
})
