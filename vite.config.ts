import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false  // 如果热更新仍然有问题，可以尝试禁用错误覆盖层
    }
  }
})
