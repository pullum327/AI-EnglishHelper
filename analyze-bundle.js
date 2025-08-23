#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Bundle 分析腳本
function analyzeBundle() {
  try {
    const distPath = path.join(__dirname, 'dist')
    const jsPath = path.join(distPath, 'js')
    const cssPath = path.join(distPath, 'css')
    const assetsPath = path.join(distPath, 'assets')

    console.log('📊 Bundle 分析報告\n')

    // 分析 JS chunks
    if (fs.existsSync(jsPath)) {
      const jsFiles = fs.readdirSync(jsPath)
      console.log('📦 JavaScript Chunks:')
      let totalJsSize = 0
      
      jsFiles.forEach(file => {
        const filePath = path.join(jsPath, file)
        const stats = fs.statSync(filePath)
        const sizeInKb = (stats.size / 1024).toFixed(2)
        totalJsSize += stats.size
        
        console.log(`  ${file}: ${sizeInKb} KB`)
      })
      
      console.log(`\n  📊 總 JS 大小: ${(totalJsSize / 1024).toFixed(2)} KB`)
    } else {
      console.log('❌ JS 目錄不存在')
    }

    // 分析 CSS
    if (fs.existsSync(cssPath)) {
      const cssFiles = fs.readdirSync(cssPath)
      console.log('\n🎨 CSS 文件:')
      let totalCssSize = 0
      
      cssFiles.forEach(file => {
        const filePath = path.join(cssPath, file)
        const stats = fs.statSync(filePath)
        const sizeInKb = (stats.size / 1024).toFixed(2)
        totalCssSize += stats.size
        
        console.log(`  ${file}: ${sizeInKb} KB`)
      })
      
      console.log(`\n  📊 總 CSS 大小: ${(totalCssSize / 1024).toFixed(2)} KB`)
    } else {
      console.log('❌ CSS 目錄不存在')
    }

    // 分析其他資源
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath)
      if (assetFiles.length > 0) {
        console.log('\n🖼️ 其他資源:')
        let totalAssetSize = 0
        
        assetFiles.forEach(file => {
          const filePath = path.join(assetsPath, file)
          const stats = fs.statSync(filePath)
          const sizeInKb = (stats.size / 1024).toFixed(2)
          totalAssetSize += stats.size
          
          console.log(`  ${file}: ${sizeInKb} KB`)
        })
        
        console.log(`\n  📊 總資源大小: ${(totalAssetSize / 1024).toFixed(2)} KB`)
      } else {
        console.log('\n🖼️ 其他資源: 無')
      }
    } else {
      console.log('❌ Assets 目錄不存在')
    }

    // 優化建議
    console.log('\n💡 優化建議:')
    console.log('  1. 考慮使用 dynamic import() 進行更細粒度的代碼分割')
    console.log('  2. 檢查是否有未使用的依賴可以移除')
    console.log('  3. 考慮使用 tree-shaking 移除未使用的代碼')
    console.log('  4. 檢查圖片和字體資源是否可以優化')
    console.log('  5. 考慮使用 CDN 來分發靜態資源')
    
  } catch (error) {
    console.error('❌ 分析過程中發生錯誤:', error.message)
  }
}

// 執行分析
analyzeBundle()
