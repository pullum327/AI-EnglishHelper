import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

// 初始單字數據
const initialWords = [
  {
    word: 'hello',
    translation: '你好',
    phonetic: 'həˈloʊ',
    partOfSpeech: 'interjection',
    difficulty: 'BEGINNER',
  },
  {
    word: 'world',
    translation: '世界',
    phonetic: 'wɜːld',
    partOfSpeech: 'noun',
    difficulty: 'BEGINNER',
  },
  {
    word: 'beautiful',
    translation: '美麗的',
    phonetic: 'ˈbjuːtɪfʊl',
    partOfSpeech: 'adjective',
    difficulty: 'INTERMEDIATE',
  },
  {
    word: 'knowledge',
    translation: '知識',
    phonetic: 'ˈnɒlɪdʒ',
    partOfSpeech: 'noun',
    difficulty: 'INTERMEDIATE',
  },
  {
    word: 'sophisticated',
    translation: '複雜的，精密的',
    phonetic: 'səˈfɪstɪkeɪtɪd',
    partOfSpeech: 'adjective',
    difficulty: 'ADVANCED',
  },
];

// 初始句子數據
const initialSentences = [
  {
    english: 'Hello, how are you today?',
    chinese: '你好，你今天過得怎麼樣？',
    difficulty: 'BEGINNER',
    category: '日常對話',
    tags: ['問候', '日常'],
  },
  {
    english: 'The world is a beautiful place.',
    chinese: '世界是一個美麗的地方。',
    difficulty: 'BEGINNER',
    category: '描述',
    tags: ['世界', '美麗'],
  },
  {
    english: 'Knowledge is power.',
    chinese: '知識就是力量。',
    difficulty: 'INTERMEDIATE',
    category: '名言',
    tags: ['知識', '力量'],
  },
  {
    english: 'This is a sophisticated piece of technology.',
    chinese: '這是一個精密的技術產品。',
    difficulty: 'ADVANCED',
    category: '技術',
    tags: ['技術', '精密'],
  },
];

async function initializeDatabase() {
  try {
    console.log('🚀 開始初始化數據庫...');
    
    // 清空現有數據
    console.log('🧹 清空現有數據...');
    await prisma.sentence.deleteMany();
    await prisma.word.deleteMany();
    
    // 創建初始單字
    console.log('📝 創建初始單字...');
    const createdWords = [];
    for (const wordData of initialWords) {
      const word = await prisma.word.create({ data: wordData });
      createdWords.push(word);
      console.log(`✅ 創建單字: ${word.word} - ${word.translation}`);
    }
    
    // 創建初始句子
    console.log('\n📝 創建初始句子...');
    const createdSentences = [];
    for (const sentenceData of initialSentences) {
      const sentence = await prisma.sentence.create({ data: sentenceData });
      createdSentences.push(sentence);
      console.log(`✅ 創建句子: ${sentence.english.substring(0, 30)}...`);
    }
    
    // 顯示統計信息
    const wordCount = await prisma.word.count();
    const sentenceCount = await prisma.sentence.count();
    
    console.log('\n📊 初始化完成！');
    console.log(`   單字數量: ${wordCount}`);
    console.log(`   句子數量: ${sentenceCount}`);
    
    return {
      success: true,
      words: createdWords,
      sentences: createdSentences,
    };
    
  } catch (error) {
    console.error('❌ 初始化數據庫失敗:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
    console.log('🔌 數據庫連接已關閉');
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 數據庫初始化成功！');
        process.exit(0);
      } else {
        console.error('\n💥 數據庫初始化失敗！');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 腳本執行錯誤:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
