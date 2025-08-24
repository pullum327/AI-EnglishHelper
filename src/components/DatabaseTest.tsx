import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import DatabaseService from '../services/databaseService'

const DatabaseTest = () => {
  const { themeConfig } = useTheme()
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      addTestResult('🚀 開始測試數據庫功能...')
      
      // 測試初始化示例數據
      addTestResult('📝 測試初始化示例數據...')
      const initResult = await DatabaseService.initializeSampleData()
      if (initResult.success) {
        addTestResult(`✅ 初始化成功: ${initResult.message}`)
      } else {
        addTestResult(`❌ 初始化失敗: ${initResult.error}`)
      }
      
      // 測試獲取單字
      addTestResult('📚 測試獲取單字...')
      const wordsResult = await DatabaseService.getWords()
      if (wordsResult.success && wordsResult.data) {
        addTestResult(`✅ 獲取單字成功: ${wordsResult.data.length} 個單字`)
        wordsResult.data.forEach(word => {
          addTestResult(`   - ${word.word} (${word.translation}) - ${word.difficulty}`)
        })
      } else {
        addTestResult(`❌ 獲取單字失敗: ${wordsResult.error}`)
      }
      
      // 測試獲取句子
      addTestResult('📄 測試獲取句子...')
      const sentencesResult = await DatabaseService.getSentences()
      if (sentencesResult.success && sentencesResult.data) {
        addTestResult(`✅ 獲取句子成功: ${sentencesResult.data.length} 個句子`)
        sentencesResult.data.forEach(sentence => {
          addTestResult(`   - ${sentence.english.substring(0, 30)}... - ${sentence.difficulty}`)
        })
      } else {
        addTestResult(`❌ 獲取句子失敗: ${sentencesResult.error}`)
      }
      
      // 測試搜索功能
      addTestResult('🔍 測試搜索功能...')
      const searchResult = await DatabaseService.searchWords('hello')
      if (searchResult.success && searchResult.data) {
        addTestResult(`✅ 搜索成功: 找到 ${searchResult.data.length} 個結果`)
      } else {
        addTestResult(`❌ 搜索失敗: ${searchResult.error}`)
      }
      
      // 測試統計功能
      addTestResult('📊 測試統計功能...')
      const statsResult = await DatabaseService.getStatistics()
      if (statsResult.success && statsResult.data) {
        addTestResult(`✅ 統計成功: ${statsResult.data.totalWords} 個單字, ${statsResult.data.totalSentences} 個句子`)
      } else {
        addTestResult(`❌ 統計失敗: ${statsResult.error}`)
      }
      
      addTestResult('🎉 所有測試完成！')
      
    } catch (error) {
      addTestResult(`💥 測試過程中發生錯誤: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearData = () => {
    try {
      localStorage.removeItem('learn_english_words')
      localStorage.removeItem('learn_english_sentences')
      setTestResults([])
      addTestResult('🧹 本地存儲數據已清空')
    } catch (error) {
      addTestResult(`❌ 清空數據失敗: ${error}`)
    }
  }

  return (
    <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-4 backdrop-blur-xl shadow-2xl`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${themeConfig.colors.gradient.purple} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg">🧪</span>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h2 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.purple} bg-clip-text text-transparent`}>
              數據庫測試
            </h2>
            <p className={`${themeConfig.colors.text.tertiary} text-xs`}>測試本地存儲功能</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-4 py-2 bg-gradient-to-r ${themeConfig.colors.gradient.purple} text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRunning ? '測試中...' : '開始測試'}
        </button>
        <button
          onClick={clearData}
          className={`px-4 py-2 bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white rounded-xl hover:scale-105 transition-transform`}
        >
          清空數據
        </button>
      </div>

      <div className={`bg-gradient-to-br ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} rounded-2xl p-4 max-h-96 overflow-y-auto`}>
        <h3 className={`text-lg font-semibold ${themeConfig.colors.text.primary} mb-4`}>測試結果</h3>
        {testResults.length === 0 ? (
          <p className={`${themeConfig.colors.text.tertiary} text-center py-8`}>點擊「開始測試」按鈕來運行測試</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className={`text-sm ${themeConfig.colors.text.primary} font-mono`}>
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <div className={`inline-flex items-center gap-2 ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-2xl px-4 py-2`}>
          <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
          <span className={`${themeConfig.colors.text.tertiary} text-xs`}>使用本地存儲模擬數據庫功能 • 數據會保存在瀏覽器中</span>
        </div>
      </div>
    </div>
  )
}

export default DatabaseTest
