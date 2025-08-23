# SSE 串流功能說明

## 概述

本項目已整合 SSE (Server-Sent Events) 串流功能，使用 `sse.js` 庫來處理實時串流輸出。這解決了之前無法叫喚API進行串流輸出的問題。

## 安裝的依賴

```bash
npm install sse.js
```

## 主要組件

### 1. SSEService (`src/services/sseService.ts`)

提供統一的SSE服務接口，支持：
- 原生 EventSource
- sse.js 進階功能（支持POST請求和自定義標頭）

```typescript
import { sseService } from './services/sseService'

// 創建原生 EventSource 連接
const eventSource = sseService.createEventSource('/api/sse-endpoint')

// 創建 sse.js 連接（支持POST）
const sse = sseService.createSSEConnection({
  url: '/api/sse-endpoint',
  method: 'POST',
  payload: { data: 'example' }
})

// 監聽事件
sseService.onMessage(sse, (event) => {
  console.log('收到消息:', event.data)
})

// 關閉連接
sseService.close()
```

### 2. 更新的 MistralService

新增了兩個串流方法：

#### `generateDialogueStream()`
串流生成對話內容，支持實時更新：

```typescript
const streamGenerator = mistralService.generateDialogueStream(
  'beginner',
  (chunk, type) => {
    console.log(`收到 ${type} 片段:`, chunk)
    // 實時更新UI
  }
)

for await (const update of streamGenerator) {
  if (update.type === 'complete') {
    const finalDialogue = update.data as DialogueMessage[]
    // 處理完成後的對話
    break
  }
}
```

#### `generateReadingComprehensionStream()`
串流生成閱讀理解內容：

```typescript
const streamGenerator = mistralService.generateReadingComprehensionStream(
  'intermediate',
  (chunk, type) => {
    console.log(`收到 ${type} 片段:`, chunk)
    // 實時更新UI
  }
)
```

## 使用方法

### 在組件中使用串流

```typescript
import React, { useState } from 'react'
import { mistralService } from '../services/mistralService'

const DialogueComponent: React.FC = () => {
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDialogue = async () => {
    setIsGenerating(true)
    
    try {
      const streamGenerator = mistralService.generateDialogueStream(
        'beginner',
        (chunk, type) => {
          // 實時更新對話內容
          if (type === 'dialogue') {
            setDialogue(prev => {
              if (prev.length === 0) {
                return [{
                  speaker: 'AI',
                  text: chunk,
                  chinese: '生成中...',
                  wordTranslations: {}
                }]
              } else {
                const lastMessage = prev[prev.length - 1]
                if (lastMessage.speaker === 'AI') {
                  return [...prev.slice(0, -1), {
                    ...lastMessage,
                    text: lastMessage.text + chunk
                  }]
                } else {
                  return [...prev, {
                    speaker: 'AI',
                    text: chunk,
                    chinese: '生成中...',
                    wordTranslations: {}
                  }]
                }
              }
            })
          }
        }
      )
      
      for await (const update of streamGenerator) {
        if (update.type === 'complete') {
          const finalDialogue = update.data as DialogueMessage[]
          setDialogue(finalDialogue)
          break
        }
      }
    } catch (error) {
      console.error('生成失敗:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <button onClick={generateDialogue} disabled={isGenerating}>
        {isGenerating ? '生成中...' : '生成對話'}
      </button>
      
      <div>
        {dialogue.map((message, index) => (
          <div key={index}>
            <strong>{message.speaker}:</strong> {message.text}
            {message.chinese && <div>中文: {message.chinese}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 測試組件

使用 `SSETestComponent` 來測試所有SSE功能：

```typescript
import { SSETestComponent } from './components/SSETestComponent'

// 在路由或頁面中添加
<SSETestComponent />
```

## 串流類型

### 對話生成串流
- `dialogue`: 英文對話內容
- `translation`: 中文翻譯
- `words`: 單字翻譯
- `complete`: 生成完成

### 閱讀理解串流
- `title`: 文章標題
- `content`: 文章內容
- `questions`: 題目內容
- `complete`: 生成完成

## 錯誤處理

串流API包含自動回退機制：
1. 首先嘗試使用真正的串流API
2. 如果失敗，自動回退到普通API調用並模擬串流效果
3. 提供詳細的錯誤日誌

## 性能優化

- 實時更新UI，提供更好的用戶體驗
- 支持取消和暫停操作
- 自動重連機制
- 內存管理（自動關閉連接）

## 注意事項

1. 確保API端點支持SSE
2. 處理網絡中斷和重連
3. 適當的錯誤處理和用戶反饋
4. 在組件卸載時關閉連接

## 故障排除

### 常見問題

1. **串流不工作**
   - 檢查API端點是否支持SSE
   - 確認網絡連接正常
   - 查看瀏覽器控制台錯誤

2. **內容顯示不完整**
   - 檢查串流解析邏輯
   - 確認數據格式正確

3. **性能問題**
   - 減少不必要的狀態更新
   - 使用適當的防抖/節流

### 調試技巧

```typescript
// 啟用詳細日誌
const streamGenerator = mistralService.generateDialogueStream(
  difficulty,
  (chunk, type) => {
    console.log(`[SSE] ${type}:`, chunk)
    // 處理內容
  }
)
```

## 更新日誌

- **v1.0.0**: 初始SSE串流實現
- **v1.1.0**: 添加sse.js支持
- **v1.2.0**: 改進錯誤處理和回退機制
- **v1.3.0**: 優化性能和用戶體驗
