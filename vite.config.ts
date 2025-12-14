import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only request logger
function devRequestLogger() {
  return {
    name: 'dev-request-logger',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        console.log(`[DEV] ${req.method} ${req.url}`)
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    devRequestLogger(), // logs requests locally
  ],
  server: {
    allowedHosts: ['boycott-thailand.com'], // dev only
  },
})
