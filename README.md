# 英語學習助手 🌟

一個現代化、AI 驅動的英語學習應用程序，採用 React + Vite + TypeScript 構建，具有智能對話生成、互動練習和優化的性能表現。

## ✨ 核心功能

### 🤖 AI 對話生成
- **智能對話創建**：基於 Mistral AI 的多難度對話生成
- **實時翻譯**：支援中英文即時翻譯
- **單字標記**：自動識別和翻譯重點單字
- **情境練習**：根據不同主題生成對話場景

### 📚 學習管理
- **單字本**：收藏和管理學習單字
- **句子收藏**：保存有用的句型和表達
- **難度分級**：初級、中級、高級三個學習等級
- **語音播放**：TTS 支援英語發音練習

### 🎯 互動練習
- **填空題**：基於對話內容的互動填空練習
- **翻譯練習**：中英文翻譯能力測試
- **閱讀理解**：AI 生成的閱讀材料和問題
- **進度追蹤**：學習成果記錄和分析

### 🎨 現代 UI/UX
- **響應式設計**：支援桌面和移動設備
- **深色/淺色主題**：自適應主題切換
- **滑動導航**：流暢的頁面切換體驗
- **動態背景**：現代化的視覺效果

## 🚀 性能優化

### 代碼分割 (Code Splitting)
我們實施了全面的代碼分割策略來優化應用性能：

#### 智能 Chunk 分割
- **React 核心庫** (`react-vendor`): ~182KB
- **UI 組件庫** (`ui-vendor`): ~14KB  
- **AI 服務** (`ai-services`): ~915KB
- **通用組件** (`common-components`): ~76KB
- **頁面組件**: 按需懶加載
  - 首頁 (`home-page`): ~9KB
  - 練習頁面 (`practice-page`): ~22KB
  - 單字本 (`words-page`): ~5KB
  - 句子收藏 (`sentences-page`): ~6KB

#### 懶加載策略
- **組件懶加載**：主要頁面組件按需加載
- **預加載優化**：滑鼠懸停時預加載相關組件
- **Suspense 支援**：優雅的加載狀態顯示

#### Bundle 分析
```bash
# 分析 bundle 大小和組成
npm run analyze

# 或者單獨運行
npm run build
.\analyze-bundle.ps1  # Windows PowerShell
# 或
node analyze-bundle.js  # Node.js (如果支持)
```

## 🛠️ 技術棧

- **前端框架**: React 19 + TypeScript
- **構建工具**: Vite 7.1
- **樣式框架**: Tailwind CSS
- **AI 服務**: Mistral AI API
- **語音服務**: Web Speech API (TTS)
- **狀態管理**: React Hooks + Context
- **路由管理**: 自定義頁面路由系統

## 📦 安裝和運行

### 環境要求
- Node.js 18+
- npm 9+

### 快速開始
```bash
# 克隆項目
git clone <repository-url>
cd learn-english

# 安裝依賴
npm install

# 開發模式運行
npm run dev

# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

### 環境配置
創建 `.env` 文件並配置 API 金鑰：
```env
VITE_MISTRAL_API_KEY=your_mistral_api_key_here
```

## 🔧 開發指南

### 項目結構
```
src/
├── components/          # React 組件
│   ├── HomePage.tsx    # 首頁組件 (懶加載)
│   ├── PracticeExercises.tsx  # 練習組件 (懶加載)
│   ├── WordCollection.tsx     # 單字本 (懶加載)
│   └── SentenceCollection.tsx # 句子收藏 (懶加載)
├── services/           # API 服務
│   ├── mistralService.ts      # AI 服務
│   └── ttsService.ts          # 語音服務
├── hooks/              # 自定義 Hooks
├── contexts/           # React Context
├── types/              # TypeScript 類型定義
└── App.tsx            # 主應用組件
```

### 性能優化最佳實踐

#### 1. 代碼分割
- 使用 `React.lazy()` 進行組件懶加載
- 配置 Vite 的 `manualChunks` 優化 bundle 分割
- 實施預加載策略提升用戶體驗

#### 2. 組件優化
- 使用 `React.memo()` 避免不必要的重渲染
- 合理使用 `useMemo` 和 `useCallback`
- 優化大型列表的渲染性能

#### 3. 資源優化
- CSS 按需加載和壓縮
- 圖片資源優化和懶加載
- 字體子集化減少加載時間

### Bundle 分析工具
項目包含 bundle 分析腳本用於分析構建產物：

- `analyze-bundle.ps1` - Windows PowerShell 版本
- `analyze-bundle.js` - Node.js 版本

```bash
# 一鍵分析（推薦）
npm run analyze

# 手動運行
npm run build
.\analyze-bundle.ps1
```

分析報告包含：
- 各 chunk 文件大小詳情
- 總體 bundle 大小統計
- 性能優化建議

## 🎯 使用指南

### 基本學習流程
1. **選擇難度**：根據英語水平選擇初級、中級或高級
2. **生成對話**：點擊生成按鈕創建 AI 對話
3. **學習單字**：點擊單字查看翻譯並收藏
4. **收藏句子**：保存有用的句型表達
5. **練習鞏固**：完成基於對話的互動練習

### 高級功能
- **自定義對話**：輸入特定主題生成相關對話
- **翻譯功能**：快速翻譯任意文本
- **語音播放**：練習標準英語發音
- **進度跟蹤**：查看學習統計和成果

## 🔮 未來計劃

### 功能擴展
- [ ] 語音識別 (STT) 口語練習
- [ ] 個性化學習路徑推薦
- [ ] 學習進度可視化圖表
- [ ] 多人協作學習功能
- [ ] 離線模式支援

### 技術優化
- [ ] PWA 支援
- [ ] 服務端渲染 (SSR)
- [ ] 更細粒度的 Tree Shaking
- [ ] WebAssembly 性能優化
- [ ] 邊緣計算部署

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！請確保：

1. 遵循項目的代碼風格
2. 添加適當的測試用例
3. 更新相關文檔
4. 確保構建通過

## 📄 許可證

MIT License

## 🙏 致謝

- [Mistral AI](https://mistral.ai/) - 提供強大的 AI 語言模型
- [React](https://react.dev/) - 優秀的前端框架
- [Vite](https://vitejs.dev/) - 快速的構建工具
- [Tailwind CSS](https://tailwindcss.com/) - 實用的 CSS 框架

---

**⭐ 如果這個項目對您有幫助，請給我們一個 Star！**