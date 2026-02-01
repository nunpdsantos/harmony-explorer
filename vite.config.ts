import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/d3') || id.includes('node_modules/internmap') || id.includes('node_modules/delaunator') || id.includes('node_modules/robust-predicates')) {
            return 'vendor-d3';
          }
          if (id.includes('node_modules/tone') || id.includes('node_modules/standardized-audio-context') || id.includes('node_modules/automation-events')) {
            return 'vendor-tone';
          }
        },
      },
    },
  },
})
