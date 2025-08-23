import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // 手動控制 chunk 分割
        manualChunks: (id) => {
          // React 核心庫
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          // UI 組件庫
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-vendor'
          }
          // 工具庫
          if (id.includes('node_modules/axios')) {
            return 'utils-vendor'
          }
          // AI 服務相關
          if (id.includes('node_modules/@mistralai') || id.includes('node_modules/@azure')) {
            return 'ai-services'
          }
          // 頁面組件
          if (id.includes('components/HomePage')) {
            return 'home-page'
          }
          if (id.includes('components/PracticeExercises')) {
            return 'practice-page'
          }
          if (id.includes('components/WordCollection')) {
            return 'words-page'
          }
          if (id.includes('components/SentenceCollection')) {
            return 'sentences-page'
          }
          // 其他組件
          if (id.includes('components/') && !id.includes('components/HomePage') && !id.includes('components/PracticeExercises') && !id.includes('components/WordCollection') && !id.includes('components/SentenceCollection')) {
            return 'common-components'
          }
        },
        // 優化 chunk 命名
        chunkFileNames: 'js/[name]-[hash].js',
        // 優化資源命名
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name
          if (!name) return 'assets/[name]-[hash].[ext]'
          
          const info = name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/.test(name)) {
            return `css/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `images/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    // 啟用代碼分割
    chunkSizeWarningLimit: 800
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
})
