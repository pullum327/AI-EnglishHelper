# 英語學習應用數據庫設置說明

## 概述
本項目使用本地存儲來模擬數據庫功能，確保在瀏覽器環境中安全運行。數據庫通過 Prisma ORM 進行管理，但在前端使用本地存儲模擬。

## 架構說明

### 前端（瀏覽器）
- **本地存儲**: 使用 `localStorage` 來保存單字和句子數據
- **數據庫服務**: `DatabaseService` 類提供完整的 CRUD 操作
- **類型安全**: 使用 TypeScript 接口確保數據類型安全

### 後端（可選）
- **Neon PostgreSQL**: 如果需要真實數據庫，可以設置後端 API
- **Prisma ORM**: 用於數據庫 schema 管理和查詢

## 數據結構

### 單字表 (words)
- `id`: 唯一標識符 (自動生成)
- `word`: 英文單字
- `translation`: 中文翻譯
- `phonetic`: 音標 (可選)
- `partOfSpeech`: 詞性 (可選)
- `difficulty`: 難度等級 (BEGINNER/INTERMEDIATE/ADVANCED)
- `createdAt`: 創建時間
- `updatedAt`: 更新時間

### 句子表 (sentences)
- `id`: 唯一標識符 (自動生成)
- `english`: 英文句子
- `chinese`: 中文翻譯
- `difficulty`: 難度等級
- `category`: 分類 (可選)
- `tags`: 標籤數組 (可選)
- `createdAt`: 創建時間
- `updatedAt`: 更新時間

## 安裝和設置

### 1. 安裝依賴
```bash
npm install
```

### 2. 本地存儲
本地存儲會自動創建，無需額外配置。數據會保存在瀏覽器的 `localStorage` 中。

### 3. 示例數據
應用會自動初始化示例數據，包括：
- 5 個示例單字（不同難度）
- 4 個示例句子（不同難度）

## 使用方法

### 導入數據庫服務
```typescript
import DatabaseService from './services/databaseService';
```

### 單字操作示例

#### 創建單字
```typescript
const result = await DatabaseService.createWord({
  word: 'hello',
  translation: '你好',
  phonetic: 'həˈloʊ',
  partOfSpeech: 'interjection',
  difficulty: 'BEGINNER'
});

if (result.success) {
  console.log('單字創建成功:', result.data);
} else {
  console.error('創建失敗:', result.error);
}
```

#### 獲取所有單字
```typescript
const result = await DatabaseService.getWords();
if (result.success) {
  console.log('單字列表:', result.data);
}
```

#### 搜索單字
```typescript
const result = await DatabaseService.searchWords('hello');
if (result.success) {
  console.log('搜索結果:', result.data);
}
```

### 句子操作示例

#### 創建句子
```typescript
const result = await DatabaseService.createSentence({
  english: 'Hello, how are you today?',
  chinese: '你好，你今天過得怎麼樣？',
  difficulty: 'BEGINNER',
  category: '日常對話',
  tags: ['問候', '日常']
});
```

#### 按難度獲取句子
```typescript
const result = await DatabaseService.getSentencesByDifficulty('BEGINNER');
if (result.success) {
  console.log('初級句子:', result.data);
}
```

## 測試數據庫功能

### 使用測試組件
```typescript
import DatabaseTest from './components/DatabaseTest';

// 在應用中使用
<DatabaseTest />
```

### 手動測試
```typescript
// 初始化示例數據
await DatabaseService.initializeSampleData();

// 獲取統計信息
const stats = await DatabaseService.getStatistics();
console.log('統計信息:', stats);
```

## 數據庫管理

### 查看數據
數據保存在瀏覽器的 `localStorage` 中，可以通過開發者工具查看：
1. 按 F12 打開開發者工具
2. 切換到 Application/Storage 標籤
3. 查看 Local Storage 中的 `learn_english_words` 和 `learn_english_sentences`

### 清空數據
```typescript
// 清空單字數據
localStorage.removeItem('learn_english_words');

// 清空句子數據
localStorage.removeItem('learn_english_sentences');
```

### 導出/導入數據
```typescript
// 導出數據
const words = JSON.parse(localStorage.getItem('learn_english_words') || '[]');
const sentences = JSON.parse(localStorage.getItem('learn_english_sentences') || '[]');
const data = { words, sentences };

// 下載為 JSON 文件
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'learn_english_data.json';
a.click();
```

## 組件集成

### WordCollection 組件
- 自動載入單字數據
- 支持添加、刪除、搜索、篩選
- 顯示難度標籤和創建時間

### SentenceCollection 組件
- 自動載入句子數據
- 支持添加、刪除、搜索、篩選
- 顯示難度標籤和創建時間

## 注意事項

1. **瀏覽器兼容性**: 本地存儲需要現代瀏覽器支持
2. **數據持久性**: 數據會保存在瀏覽器中，清除瀏覽器數據會丟失
3. **存儲限制**: 本地存儲有大小限制（通常 5-10MB）
4. **安全性**: 本地存儲的數據對用戶可見，不適合存儲敏感信息

## 未來擴展

### 後端 API 集成
如果需要真實數據庫，可以：
1. 創建後端 API 服務
2. 修改 `DatabaseService` 使用 fetch 調用 API
3. 保持相同的接口，只改變數據來源

### 數據同步
可以添加功能來：
1. 在線同步數據到雲端
2. 多設備數據同步
3. 數據備份和恢復

## 故障排除

### 常見問題

1. **數據不顯示**: 檢查瀏覽器是否支持 localStorage
2. **操作失敗**: 檢查瀏覽器控制台的錯誤信息
3. **數據丟失**: 檢查是否清除了瀏覽器數據

### 調試命令
```typescript
// 檢查本地存儲
console.log('單字數據:', localStorage.getItem('learn_english_words'));
console.log('句子數據:', localStorage.getItem('learn_english_sentences'));

// 檢查數據庫服務
const words = await DatabaseService.getWords();
console.log('單字服務結果:', words);
```

## 更新日誌

- **v2.0.0**: 重構為瀏覽器安全架構
  - 使用本地存儲替代 Prisma 客戶端
  - 添加示例數據自動初始化
  - 創建測試組件
  - 完整的錯誤處理和類型安全

- **v1.0.0**: 初始數據庫結構設置
  - 支持單字和句子的 CRUD 操作
  - 包含搜索和按難度篩選功能
  - 完整的錯誤處理和類型安全
