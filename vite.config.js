import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 5173,
    // SPA fallback — semua path kembali ke index.html
    proxy: {},
  },
  preview: {
    port: 4173,
  },
  // Vite dev server history API fallback diaktifkan via plugin custom
  appType: 'spa', // This enables history API fallback automatically
})
