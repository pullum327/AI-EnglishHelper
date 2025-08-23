import React, { useState } from 'react'
import { mistralService } from '../services/mistralService'
import type { DialogueMessage, DifficultyLevel } from '../types'

export const SSEDemo: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingDialogue, setStreamingDialogue] = useState<DialogueMessage[]>([])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner')
  const [status, setStatus] = useState('就緒')

  const generateStreamingDialogue = async () => {
    setIsGenerating(true)
    setStreamingDialogue([])
    setStatus('開始生成...')

    try {
      const streamGenerator = mistralService.generateDialogueStream(
        difficulty,
        (chunk, type) => {
          setStatus(`收到 ${type} 片段...`)
          
          if (type === 'dialogue') {
            setStreamingDialogue(prev => {
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
          setStreamingDialogue(finalDialogue)
          setStatus('生成完成！')
          break
        }
      }
    } catch (error) {
      console.error('生成失敗:', error)
      setStatus(`錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const clearDialogue = () => {
    setStreamingDialogue([])
    setStatus('已清空')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
        🚀 SSE 串流對話演示
      </h2>
      
      {/* 控制面板 */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
        <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
          <label className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">難度等級:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="px-4 py-2 text-lg border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="beginner">初級 🟢</option>
              <option value="intermediate">中級 🟡</option>
              <option value="advanced">高級 🔴</option>
            </select>
          </label>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={generateStreamingDialogue}
            disabled={isGenerating}
            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            {isGenerating ? '🔄 生成中...' : '✨ 開始生成對話'}
          </button>
          
          <button
            onClick={clearDialogue}
            className="px-6 py-3 text-lg font-semibold bg-gray-500 text-white rounded-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🗑️ 清空對話
          </button>
        </div>
      </div>

      {/* 狀態指示器 */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className={`w-4 h-4 rounded-full ${isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {status}
          </span>
        </div>
      </div>

      {/* 串流對話顯示 */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
          💬 實時對話內容
        </h3>
        
        {streamingDialogue.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              點擊上方按鈕開始生成對話
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              支持實時串流輸出，體驗流暢的AI對話生成
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {streamingDialogue.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl ${
                  message.speaker === 'AI' 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                    : 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    message.speaker === 'AI' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {message.speaker === 'AI' ? '🤖' : '👤'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">
                      {message.speaker}
                    </div>
                    
                    <div className="text-lg text-gray-800 dark:text-gray-200 mb-3">
                      {message.text}
                    </div>
                    
                    {message.chinese && message.chinese !== '生成中...' && (
                      <div className="text-base text-gray-600 dark:text-gray-400 border-t pt-2">
                        <span className="font-medium">中文:</span> {message.chinese}
                      </div>
                    )}
                    
                    {message.wordTranslations && Object.keys(message.wordTranslations).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">單字翻譯:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(message.wordTranslations).map(([word, translation]) => (
                            <span
                              key={word}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm"
                            >
                              <strong>{word}</strong>: {translation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 功能說明 */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
          💡 SSE 串流功能特點
        </h4>
        <ul className="space-y-2 text-yellow-700 dark:text-yellow-300">
          <li>• 🚀 <strong>實時串流:</strong> 對話內容逐字顯示，提供流暢的生成體驗</li>
          <li>• 🔄 <strong>自動回退:</strong> 如果串流失敗，自動使用普通API並模擬串流效果</li>
          <li>• 📱 <strong>響應式設計:</strong> 支持深色模式，適配各種設備</li>
          <li>• ⚡ <strong>性能優化:</strong> 智能狀態管理，避免不必要的重渲染</li>
          <li>• 🛡️ <strong>錯誤處理:</strong> 完善的錯誤處理和用戶反饋機制</li>
        </ul>
      </div>
    </div>
  )
}
