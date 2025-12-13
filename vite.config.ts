import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // ⬅️ The 'server' object is required here
  server: { 
    // ⬅️ 'allowedHosts' must be inside the 'server' object
    allowedHosts: [
      'boycott-thailand.com',
    ],
  },
});
