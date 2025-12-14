
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    allowedHosts: [
      'boycott-thailand.com',
    ],
    host: true, // allows external access
  },
})
