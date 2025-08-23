# TTS語音合成功能說明

## 概述

本應用已升級TTS（Text-to-Speech）語音合成功能，提供跨瀏覽器兼容的語音播放體驗，自動適配手機和電腦不同的瀏覽器環境。

## 主要特性

### 🌐 跨瀏覽器兼容
- 支持所有現代瀏覽器的Web Speech API
- 自動檢測瀏覽器支持狀態
- 優雅降級處理不支持的瀏覽器

### 📱 設備自適應
- **移動設備優化**：語速0.9x，音量80%，適合移動環境
- **桌面設備優化**：語速0.8x，音量100%，便於學習
- 自動檢測設備類型並應用最佳設置

### 🎛️ 語音控制
- 語速控制：0.5x - 2.0x
- 音調控制：0.5x - 2.0x  
- 音量控制：0% - 100%
- 語音選擇：自動選擇最佳英語語音

### 🎯 學習優化
- 單字播放：較慢語速（0.7x）便於聽清發音
- 句子播放：適中語速（0.8x）保持自然流暢
- 練習題語音：可調節語速配合學習進度

## 使用方法

### 1. 基本語音播放
```typescript
import { ttsService } from './services/ttsService'

// 播放單字
await ttsService.speakWord('Hello')

// 播放句子
await ttsService.speakSentence('How are you today?')

// 自定義播放
await ttsService.speak({
  text: 'Custom text',
  rate: 0.8,
  pitch: 1.0,
  volume: 0.9
})
```

### 2. 語音控制
```typescript
// 停止播放
ttsService.stop()

// 暫停播放
ttsService.pause()

// 恢復播放
ttsService.resume()

// 檢查播放狀態
const isPlaying = ttsService.isPlaying()
const isPaused = ttsService.isPaused()
```

### 3. 獲取語音信息
```typescript
// 獲取支持狀態
const status = ttsService.getSupportStatus()
// { supported: true, device: 'mobile' | 'desktop' }

// 獲取可用語音列表
const voices = ttsService.getAvailableVoices()

// 獲取英語語音
const englishVoices = ttsService.getEnglishVoices()
```

## 組件使用

### TTSController
完整的語音控制面板，包含：
- 語音測試功能
- 播放控制（播放/暫停/停止）
- 語音設置（語速/音調/音量/語音選擇）

### TTSStatusIndicator
狀態指示器，顯示：
- 語音支持狀態
- 設備類型
- 播放狀態
- 可用語音數量

## 瀏覽器支持

| 瀏覽器 | 支持狀態 | 備註 |
|--------|----------|------|
| Chrome | ✅ 完全支持 | 最佳體驗 |
| Firefox | ✅ 完全支持 | 良好體驗 |
| Safari | ✅ 完全支持 | 良好體驗 |
| Edge | ✅ 完全支持 | 良好體驗 |
| IE | ❌ 不支持 | 建議升級 |

## 移動設備優化

### Android
- 支持Google TTS引擎
- 自動選擇最佳語音
- 優化電池使用

### iOS
- 支持iOS內建語音合成
- 高質量英語發音
- 流暢的語音播放

## 故障排除

### 常見問題

1. **語音無法播放**
   - 檢查瀏覽器是否支持Web Speech API
   - 確認音頻設備正常工作
   - 檢查瀏覽器權限設置

2. **語音播放中斷**
   - 檢查網絡連接穩定性
   - 確認瀏覽器標籤頁處於活動狀態
   - 檢查系統音頻設置

3. **語音質量問題**
   - 調整語速設置
   - 選擇不同的語音
   - 檢查設備音頻驅動

### 調試信息
```typescript
// 測試語音功能
const isWorking = await ttsService.testVoice()

// 獲取詳細狀態
const status = ttsService.getSupportStatus()
console.log('TTS狀態:', status)
```

## 技術實現

### 核心服務
- `TTSService`：語音合成核心服務
- 自動設備檢測和優化
- 語音列表管理和選擇
- 錯誤處理和降級策略

### 事件處理
- 語音播放開始/結束/錯誤事件
- 播放狀態監聽
- 語音列表加載監聽

### 性能優化
- 語音實例重用
- 自動清理資源
- 異步操作處理

## 更新日誌

### v2.0.0
- ✨ 新增跨瀏覽器TTS支持
- 📱 新增移動設備優化
- 🎛️ 新增語音控制面板
- 🔧 新增語音設置功能
- 📊 新增狀態指示器

### v1.0.0
- 🎯 基礎語音合成功能
- 📚 單字和句子播放
- 🎮 練習題語音支持
