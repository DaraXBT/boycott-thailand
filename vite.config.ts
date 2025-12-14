import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const requestLogger = () => ({
  name: 'request-logger',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      console.log(`[Vite Request] ${req.method} ${req.url}`)
      next()
    })
  },
})

export default defineConfig({
  plugins: [
    react(),
    requestLogger(),
  ],
  server: {
    allowedHosts: [
      'boycott-thailand.com',
    ],
    host: true, // allows external access
  },
})
