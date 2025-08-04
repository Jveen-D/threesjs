import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    hmr: {
      overlay: false  // 如果热更新仍然有问题，可以尝试禁用错误覆盖层
    }
  }
})
