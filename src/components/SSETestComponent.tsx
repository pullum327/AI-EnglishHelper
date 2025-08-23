import React, { useState } from 'react'
import { mistralService } from '../services/mistralService'
import { sseService } from '../services/sseService'
import type { DifficultyLevel } from '../types'

export const SSETestComponent: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // 測試 Mistral 串流對話生成
  const testMistralStream = async () => {
    setIsGenerating(true)
    setStreamingContent('')
    addLog('開始測試 Mistral 串流對話生成...')

    try {
      const streamGenerator = mistralService.generateDialogueStream(
        difficulty,
        (chunk, type) => {
          addLog(`收到 ${type} 片段: ${chunk.substring(0, 50)}...`)
          setStreamingContent(prev => prev + chunk)
        }
      )

      for await (const update of streamGenerator) {
        if (update.type === 'complete') {
          addLog('串流生成完成！')
          break
        }
      }
    } catch (error) {
      addLog(`錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // 測試 Mistral 串流閱讀理解生成


  // 測試原生 EventSource
  const testNativeEventSource = () => {
    addLog('測試原生 EventSource...')
    
    try {
      const eventSource = sseService.createEventSource('/api/sse-test')
      
      sseService.onOpen(eventSource, () => {
        addLog('EventSource 連接已打開')
      })
      
      sseService.onMessage(eventSource, (event) => {
        addLog(`收到消息: ${JSON.stringify(event.data)}`)
      })
      
      sseService.onError(eventSource, (error) => {
        addLog(`EventSource 錯誤: ${error}`)
      })
      
      // 5秒後關閉連接
      setTimeout(() => {
        sseService.close()
        addLog('EventSource 連接已關閉')
      }, 5000)
      
    } catch (error) {
      addLog(`EventSource 錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  // 測試 sse.js
  const testSSEJS = () => {
    addLog('測試 sse.js...')
    
    try {
      const sse = sseService.createSSEConnection({
        url: '/api/sse-test',
        method: 'POST',
        payload: { test: 'data' }
      })
      
      sseService.onOpen(sse, () => {
        addLog('SSE.js 連接已打開')
      })
      
      sseService.onMessage(sse, (event) => {
        addLog(`收到 SSE.js 消息: ${JSON.stringify(event.data)}`)
      })
      
      sseService.onError(sse, (error) => {
        addLog(`SSE.js 錯誤: ${error}`)
      })
      
      // 5秒後關閉連接
      setTimeout(() => {
        sseService.close()
        addLog('SSE.js 連接已關閉')
      }, 5000)
      
    } catch (error) {
      addLog(`SSE.js 錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        SSE 串流功能測試
      </h2>
      
      {/* 控制面板 */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">難度:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">高級</option>
            </select>
          </label>
          
          <button
            onClick={testMistralStream}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '測試對話串流'}
          </button>
          

        </div>
        
        <div className="flex gap-4">
          <button
            onClick={testNativeEventSource}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            測試原生 EventSource
          </button>
          
          <button
            onClick={testSSEJS}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            測試 sse.js
          </button>
        </div>
      </div>
      
      {/* 串流內容顯示 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          串流內容
        </h3>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
            {streamingContent || '等待生成內容...'}
          </pre>
        </div>
      </div>
      
      {/* 日誌顯示 */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          操作日誌
        </h3>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">尚未開始測試...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 狀態指示器 */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className={`w-3 h-3 rounded-full ${isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isGenerating ? '正在生成...' : '就緒'}
          </span>
        </div>
      </div>
    </div>
  )
}
