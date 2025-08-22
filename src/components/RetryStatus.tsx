// 重試狀態顯示組件
import { useEffect, useState } from 'react'

interface RetryStatusProps {
  attempt: number
  maxAttempts: number
  error?: string | null
  onCancel?: () => void
}

function RetryStatus({ attempt, maxAttempts, error, onCancel }: RetryStatusProps) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const progressPercentage = ((attempt - 1) / maxAttempts) * 100

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-3">
            🔄 正在重試 API 請求
          </h3>
          <p className="text-gray-400 text-sm">
            第 {attempt} 次嘗試，共 {maxAttempts} 次
          </p>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary-500 h-2 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            進度: {Math.round(progressPercentage)}%
          </p>
        </div>

        {countdown > 0 && (
          <div className="mb-6">
            <div className="text-4xl font-bold text-primary-400 mb-2">
              {countdown}
            </div>
            <p className="text-gray-300 text-sm">
              秒後重試...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              <span className="font-semibold">錯誤:</span> {error}
            </p>
          </div>
        )}

        <div className="text-gray-400 text-xs mb-6 leading-relaxed">
          <p>💡 API 可能有速率限制</p>
          <p className="mt-1">系統會自動重試，請耐心等待</p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            取消重試
          </button>
        )}
      </div>
    </div>
  )
}

export default RetryStatus
