import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Split large vendor libs so the main chunk stays small
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'firebase';
          if (id.includes('node_modules/react-router-dom')) return 'router';
          if (id.includes('node_modules/react')) return 'react-vendor';
        },
      },
    },
  }
})
