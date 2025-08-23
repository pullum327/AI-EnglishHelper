# 滑動導航功能說明

## 概述

本應用已新增手機左右滑動切換分頁功能，讓用戶可以通過直觀的觸控手勢在不同頁面間快速導航。

## 主要特性

### 📱 觸控手勢支持
- **向左滑動**：切換到下一頁
- **向右滑動**：切換到上一頁
- **智能識別**：自動區分水平和垂直滑動
- **觸控優化**：專為移動設備設計

### 🎯 頁面導航順序
滑動導航遵循以下頁面順序：
1. 首頁 (Home)
2. 對話練習 (Dialogue)
3. 單字本 (Words)
4. 句子收藏 (Sentences)
5. 練習題 (Practice)
6. 設定 (Settings)

### ⚡ 滑動參數配置
- **最小滑動距離**：50px（防止誤觸）
- **最大滑動時間**：300ms（確保快速響應）
- **防誤觸**：智能識別滑動方向

## 使用方法

### 基本滑動操作
1. **向左滑動**：從當前頁面切換到下一頁
2. **向右滑動**：從當前頁面切換到上一頁
3. **滑動提示**：頁面底部會顯示滑動提示

### 滑動反饋
- **視覺指示器**：滑動時會顯示方向箭頭和提示文字
- **動畫效果**：流暢的滑動動畫和狀態反饋
- **即時響應**：滑動完成後立即切換頁面

## 技術實現

### 核心Hook
```typescript
import { useSwipeNavigation } from './hooks/useSwipeNavigation'

const { isSwiping, swipeDirection, attachSwipeListeners } = useSwipeNavigation({
  onSwipeLeft: () => {
    // 向左滑動處理邏輯
  },
  onSwipeRight: () => {
    // 向右滑動處理邏輯
  }
})
```

### 觸控事件處理
- **touchstart**：記錄觸控開始位置和時間
- **touchmove**：追蹤觸控移動軌跡
- **touchend**：計算滑動距離和方向

### 滑動檢測算法
1. 計算觸控起點和終點的距離
2. 判斷滑動方向（水平/垂直）
3. 驗證滑動距離和時間是否符合要求
4. 觸發相應的滑動回調函數

## 組件說明

### SwipeNavigationIndicator
滑動導航指示器，顯示：
- 滑動方向箭頭
- 頁面切換提示
- 滑動狀態反饋

### SwipeHint
滑動提示組件，在頁面底部顯示：
- 滑動操作提示
- 觸控圖標
- 方向指示箭頭

## 移動設備優化

### 觸控體驗
- **防誤觸**：設置最小滑動距離閾值
- **快速響應**：優化觸控事件處理
- **視覺反饋**：即時顯示滑動狀態

### 性能優化
- **事件節流**：避免過度觸發滑動事件
- **內存管理**：自動清理事件監聽器
- **平滑動畫**：使用CSS動畫提升性能

## 瀏覽器兼容性

| 瀏覽器 | 觸控支持 | 備註 |
|--------|----------|------|
| Chrome Mobile | ✅ 完全支持 | 最佳體驗 |
| Safari iOS | ✅ 完全支持 | 良好體驗 |
| Firefox Mobile | ✅ 完全支持 | 良好體驗 |
| Edge Mobile | ✅ 完全支持 | 良好體驗 |

## 自定義配置

### 滑動參數調整
```typescript
const { isSwiping, swipeDirection } = useSwipeNavigation({
  onSwipeLeft: handleSwipeLeft,
  onSwipeRight: handleSwipeRight,
  config: {
    minSwipeDistance: 60,    // 最小滑動距離
    maxSwipeTime: 250,       // 最大滑動時間
    preventDefault: true      // 阻止默認觸控行為
  }
})
```

### 頁面順序自定義
```typescript
const pageOrder: PageType[] = [
  'home', 'dialogue', 'words', 'sentences', 'practice', 'settings'
]

const handleSwipeLeft = () => {
  const currentIndex = pageOrder.indexOf(currentPage)
  if (currentIndex < pageOrder.length - 1) {
    setCurrentPage(pageOrder[currentIndex + 1])
  }
}
```

## 故障排除

### 常見問題

1. **滑動無響應**
   - 檢查觸控設備是否支持
   - 確認滑動距離是否足夠
   - 檢查滑動時間是否過長

2. **滑動方向錯誤**
   - 檢查觸控事件是否被其他元素攔截
   - 確認滑動檢測算法配置
   - 檢查頁面佈局是否影響觸控

3. **性能問題**
   - 檢查事件監聽器是否正確清理
   - 確認動畫是否過於複雜
   - 檢查觸控事件處理邏輯

### 調試信息
```typescript
// 檢查滑動狀態
console.log('滑動狀態:', { isSwiping, swipeDirection })

// 檢查觸控事件
element.addEventListener('touchstart', (e) => {
  console.log('觸控開始:', e.touches[0])
})
```

## 更新日誌

### v2.1.0
- ✨ 新增滑動導航功能
- 📱 新增觸控手勢支持
- 🎯 新增頁面切換邏輯
- 🔧 新增滑動參數配置
- 📊 新增滑動狀態指示器

### v2.0.0
- 🎯 基礎TTS語音功能
- 📚 跨瀏覽器兼容性
- 🎮 設備自適應優化
