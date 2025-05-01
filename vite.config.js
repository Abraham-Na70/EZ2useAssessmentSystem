import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Ganti ke port yang kamu mau
    open: true, // (opsional) buka otomatis di browser
    historyApiFallback: true // penting untuk react-router
  }
})