import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'your_api_domain',
        changeOrigin: true,
        secure: true
      }
    }
  },
  build: {
    // 确保静态文件被正确复制
    copyPublicDir: true
  }
})

