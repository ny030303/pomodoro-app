// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // path 모듈 import
import { nodePolyfills } from 'vite-plugin-node-polyfills' // 1. 플러그인 import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills(),],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // '@'를 src 폴더의 절대 경로로 설정
    },
  },
  define: {
    global: 'window',
  },
  server: {
    fs: {
      // 프로젝트 루트와 node_modules 폴더까지 접근을 허용해줍니다.
      allow: ['.', 'node_modules'],
    },
  },
})