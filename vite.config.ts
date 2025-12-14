
import { defineConfig, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const requestLogger = () => ({
  name: 'request-logger',
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req: any, _res: any, next: () => void) => {
      console.log(`[Vite Request] ${req.method} ${req.url}`);
      next();
    });
  },
});

export default defineConfig({
  plugins: [
    react(),
    requestLogger(),
  ],
  server: {
    allowedHosts: [
      'boycott-thailand.com',
    ],
  },
});
