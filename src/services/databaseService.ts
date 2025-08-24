// 瀏覽器安全的數據庫服務
// 使用本地存儲來模擬數據庫功能

export interface WordData {
  word: string;
  translation: string;
  phonetic?: string;
  partOfSpeech?: string;
}

export interface SentenceData {
  english: string;
  chinese: string;
  category?: string;
  tags?: string[];
}

export interface Word {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  partOfSpeech?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sentence {
  id: string;
  english: string;
  chinese: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 本地存儲鍵
const WORDS_STORAGE_KEY = 'learn_english_words';
const SENTENCES_STORAGE_KEY = 'learn_english_sentences';

// 生成唯一 ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 從本地存儲獲取數據
function getFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      // 將字符串日期轉換回 Date 對象
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    }
  } catch (error) {
    console.error(`從本地存儲讀取 ${key} 失敗:`, error);
  }
  return [];
}

// 保存數據到本地存儲
function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`保存到本地存儲 ${key} 失敗:`, error);
  }
}

export class DatabaseService {
  // 單字相關操作
  static async createWord(wordData: WordData) {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const newWord: Word = {
        id: generateId(),
        ...wordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      words.unshift(newWord);
      saveToStorage(WORDS_STORAGE_KEY, words);
      
      return { success: true, data: newWord };
    } catch (error) {
      console.error('創建單字失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async getWords() {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      return { success: true, data: words };
    } catch (error) {
      console.error('獲取單字失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async getWordById(id: string) {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const word = words.find(w => w.id === id);
      if (word) {
        return { success: true, data: word };
      } else {
        return { success: false, error: '單字不存在' };
      }
    } catch (error) {
      console.error('獲取單字失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async updateWord(id: string, wordData: Partial<WordData>) {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const index = words.findIndex(w => w.id === id);
      if (index !== -1) {
        words[index] = {
          ...words[index],
          ...wordData,
          updatedAt: new Date(),
        };
        saveToStorage(WORDS_STORAGE_KEY, words);
        return { success: true, data: words[index] };
      } else {
        return { success: false, error: '單字不存在' };
      }
    } catch (error) {
      console.error('更新單字失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async deleteWord(id: string) {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const filteredWords = words.filter(w => w.id !== id);
      saveToStorage(WORDS_STORAGE_KEY, filteredWords);
      return { success: true };
    } catch (error) {
      console.error('刪除單字失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  // 句子相關操作
  static async createSentence(sentenceData: SentenceData) {
    try {
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      const newSentence: Sentence = {
        id: generateId(),
        ...sentenceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      sentences.unshift(newSentence);
      saveToStorage(SENTENCES_STORAGE_KEY, sentences);
      
      return { success: true, data: newSentence };
    } catch (error) {
      console.error('創建句子失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async getSentences() {
    try {
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      return { success: true, data: sentences };
    } catch (error) {
      console.error('獲取句子失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async getSentenceById(id: string) {
    try {
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      const sentence = sentences.find(s => s.id === id);
      if (sentence) {
        return { success: true, data: sentence };
      } else {
        return { success: false, error: '句子不存在' };
      }
    } catch (error) {
      console.error('獲取句子失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async updateSentence(id: string, sentenceData: Partial<SentenceData>) {
    try {
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      const index = sentences.findIndex(s => s.id === id);
      if (index !== -1) {
        sentences[index] = {
          ...sentences[index],
          ...sentenceData,
          updatedAt: new Date(),
        };
        saveToStorage(SENTENCES_STORAGE_KEY, sentences);
        return { success: true, data: sentences[index] };
      } else {
        return { success: false, error: '句子不存在' };
      }
    } catch (error) {
      console.error('更新句子失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async deleteSentence(id: string) {
    try {
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      const filteredSentences = sentences.filter(s => s.id !== id);
      saveToStorage(SENTENCES_STORAGE_KEY, filteredSentences);
      return { success: true };
    } catch (error) {
      console.error('刪除句子失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  // 搜索功能
  static async searchWords(query: string) {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const filteredWords = words.filter(word => 
        word.word.toLowerCase().includes(query.toLowerCase()) ||
        word.translation.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, data: filteredWords };
    } catch (error) {
      console.error('搜索單字失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  static async searchSentences(query: string) {
    try {
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      const filteredSentences = sentences.filter(sentence => 
        sentence.english.toLowerCase().includes(query.toLowerCase()) ||
        sentence.chinese.toLowerCase().includes(query.toLowerCase())
      );
      return { success: true, data: filteredSentences };
    } catch (error) {
      console.error('搜索句子失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }



  // 統計功能
  static async getStatistics() {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      
      return {
        success: true,
        data: {
          totalWords: words.length,
          totalSentences: sentences.length,
        },
      };
    } catch (error) {
      console.error('獲取統計信息失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }

  // 初始化示例數據
  static async initializeSampleData() {
    try {
      const words = getFromStorage<Word>(WORDS_STORAGE_KEY);
      const sentences = getFromStorage<Sentence>(SENTENCES_STORAGE_KEY);
      
      // 如果已經有數據，不重複初始化
      if (words.length > 0 || sentences.length > 0) {
        return { success: true, message: '數據已存在，跳過初始化' };
      }

      // 創建示例單字
      const sampleWords: WordData[] = [
        { word: 'hello', translation: '你好', phonetic: 'həˈloʊ', partOfSpeech: 'interjection' },
        { word: 'world', translation: '世界', phonetic: 'wɜːld', partOfSpeech: 'noun' },
        { word: 'beautiful', translation: '美麗的', phonetic: 'ˈbjuːtɪfʊl', partOfSpeech: 'adjective' },
        { word: 'knowledge', translation: '知識', phonetic: 'ˈnɒlɪdʒ', partOfSpeech: 'noun' },
        { word: 'sophisticated', translation: '複雜的，精密的', phonetic: 'səˈfɪstɪkeɪtɪd', partOfSpeech: 'adjective' },
      ];

      // 創建示例句子
      const sampleSentences: SentenceData[] = [
        { english: 'Hello, how are you today?', chinese: '你好，你今天過得怎麼樣？', category: '日常對話', tags: ['問候', '日常'] },
        { english: 'The world is a beautiful place.', chinese: '世界是一個美麗的地方。', category: '描述', tags: ['世界', '美麗'] },
        { english: 'Knowledge is power.', chinese: '知識就是力量。', category: '名言', tags: ['知識', '力量'] },
        { english: 'This is a sophisticated piece of technology.', chinese: '這是一個精密的技術產品。', category: '技術', tags: ['技術', '精密'] },
      ];

      // 保存示例數據
      for (const wordData of sampleWords) {
        await this.createWord(wordData);
      }

      for (const sentenceData of sampleSentences) {
        await this.createSentence(sentenceData);
      }

      return { success: true, message: '示例數據初始化成功' };
    } catch (error) {
      console.error('初始化示例數據失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
    }
  }
}

export default DatabaseService;
