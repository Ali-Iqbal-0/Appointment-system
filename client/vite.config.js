import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    allowedHosts: [
      'localhost', // Allow connections from localhost
      '.ngrok-free.app',
      '.serveo.net'// Allow connections from all ngrok subdomains
    ],
  },
})