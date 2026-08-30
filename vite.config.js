import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      // Firebase signInWithPopup needs popup ↔ opener communication.
      // 'same-origin' (browser default) blocks window.closed access → breaks OAuth.
      // 'same-origin-allow-popups' allows it while keeping other cross-origin isolation.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
