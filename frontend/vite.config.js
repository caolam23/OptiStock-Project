import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Cấu hình Proxy để chuyển hướng các request API từ Vite (5173) sang Spring Boot (8080)
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Địa chỉ Backend của bạn
        changeOrigin: true,              // Cần thiết cho virtual hosted sites
        secure: false,                   // Cho phép các request đến http (không phải https)
      }
    }
  }
})