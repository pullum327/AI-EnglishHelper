// 瀏覽器安全的數據庫配置
// 注意：Prisma 客戶端不能在瀏覽器中運行，所以我們使用 API 調用

export interface DatabaseConfig {
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export const databaseConfig: DatabaseConfig = {
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  maxRetries: 3,
  retryDelay: 1000,
};

// 數據庫健康檢查（通過 API）
export async function checkDatabaseHealth() {
  try {
    // 這裡應該調用你的 API 端點來檢查數據庫健康狀態
    const response = await fetch('/api/health');
    if (response.ok) {
      const result = await response.json();
      return { healthy: true, message: '數據庫連接正常' };
    } else {
      return { 
        healthy: false, 
        message: '數據庫連接失敗', 
        error: 'API 響應錯誤' 
      };
    }
  } catch (error) {
    return { 
      healthy: false, 
      message: '數據庫連接失敗', 
      error: error instanceof Error ? error.message : '未知錯誤' 
    };
  }
}

// 優雅關閉（瀏覽器環境中不需要）
export async function closeDatabaseConnection() {
  // 瀏覽器環境中不需要關閉數據庫連接
  console.log('✅ 瀏覽器環境，無需關閉數據庫連接');
}

// 導出一個空的 prisma 對象，避免導入錯誤
export const prisma = {
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
  $queryRaw: () => Promise.resolve(),
  word: {
    create: () => Promise.resolve(),
    findMany: () => Promise.resolve(),
    findUnique: () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    count: () => Promise.resolve(),
    groupBy: () => Promise.resolve(),
  },
  sentence: {
    create: () => Promise.resolve(),
    findMany: () => Promise.resolve(),
    findUnique: () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    count: () => Promise.resolve(),
    groupBy: () => Promise.resolve(),
  },
};
