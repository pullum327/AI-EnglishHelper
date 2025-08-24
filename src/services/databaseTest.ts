import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function testDatabaseConnection() {
  try {
    // 測試數據庫連接
    await prisma.$connect();
    console.log('✅ 數據庫連接成功！');
    
    // 測試查詢
    const wordCount = await prisma.word.count();
    const sentenceCount = await prisma.sentence.count();
    
    console.log(`📊 數據庫統計:`);
    console.log(`   單字數量: ${wordCount}`);
    console.log(`   句子數量: ${sentenceCount}`);
    
    return { success: true, wordCount, sentenceCount };
  } catch (error) {
    console.error('❌ 數據庫連接失敗:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
  } finally {
    await prisma.$disconnect();
  }
}

export async function createSampleData() {
  try {
    await prisma.$connect();
    
    // 創建示例單字
    const sampleWord = await prisma.word.create({
      data: {
        word: 'hello',
        translation: '你好',
        phonetic: 'həˈloʊ',
        partOfSpeech: 'interjection',
        difficulty: 'BEGINNER',
      },
    });
    
    // 創建示例句子
    const sampleSentence = await prisma.sentence.create({
      data: {
        english: 'Hello, how are you today?',
        chinese: '你好，你今天過得怎麼樣？',
        difficulty: 'BEGINNER',
        category: '日常對話',
        tags: ['問候', '日常'],
      },
    });
    
    console.log('✅ 示例數據創建成功！');
    console.log('創建的單字:', sampleWord);
    console.log('創建的句子:', sampleSentence);
    
    return { success: true, word: sampleWord, sentence: sampleSentence };
  } catch (error) {
    console.error('❌ 創建示例數據失敗:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知錯誤' };
  } finally {
    await prisma.$disconnect();
  }
}

// 主函數
async function main() {
  try {
    console.log('🚀 開始測試數據庫連接...');
    await testDatabaseConnection();
    
    console.log('\n📝 開始創建示例數據...');
    await createSampleData();
    
    console.log('\n🎉 所有測試完成！');
  } catch (error) {
    console.error('💥 測試過程中發生錯誤:', error);
    process.exit(1);
  }
}

// 如果直接運行此文件，執行主函數
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
