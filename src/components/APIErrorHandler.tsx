import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface APIErrorHandlerProps {
  error: Error | null
  onRetry: () => void
  onReset: () => void
}

const APIErrorHandler = ({ error, onRetry, onReset }: APIErrorHandlerProps) => {
  const { themeConfig } = useTheme()
  const [isRetrying, setIsRetrying] = useState(false)

  if (!error) return null

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorMessage = (error: Error): string => {
    const message = error.message
    
    if (message.includes('429')) {
      return 'API 請求過於頻繁，請稍後再試'
    } else if (message.includes('402')) {
      return 'API 信用額度不足，請檢查您的 OpenRouter 帳戶'
    } else if (message.includes('404')) {
      return 'API 模型不可用，請稍後再試'
    } else if (message.includes('400')) {
      return 'API 請求格式錯誤，請檢查配置'
    } else if (message.includes('所有 API 模型都不可用')) {
      return '所有免費模型都暫時不可用，請稍後再試'
    }
    
    return message
  }

  const getErrorIcon = (error: Error): string => {
    const message = error.message
    
    if (message.includes('429')) return '⏰'
    if (message.includes('402')) return '💳'
    if (message.includes('404')) return '🔍'
    if (message.includes('400')) return '⚠️'
    if (message.includes('所有 API 模型都不可用')) return '🤖'
    
    return '❌'
  }

  return (
    <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-lg p-4 backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className="text-2xl">{getErrorIcon(error)}</div>
        <div className="flex-1">
          <h3 className={`${themeConfig.colors.text.accent} font-semibold mb-2`}>API 錯誤</h3>
          <p className={`${themeConfig.colors.text.tertiary} text-sm mb-3`}>
            {getErrorMessage(error)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} hover:${themeConfig.colors.background.cardHover} ${themeConfig.colors.text.accent} font-medium py-2 px-4 rounded-lg transition-all duration-200 border ${themeConfig.colors.border.accent} flex items-center gap-2`}
            >
              {isRetrying ? (
                <>
                  <div className={`w-4 h-4 border-2 ${themeConfig.colors.border.accent} border-t-transparent rounded-full animate-spin`}></div>
                  重試中...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  重試
                </>
              )}
            </button>
            <button
              onClick={onReset}
              className={`bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border ${themeConfig.colors.border.accent}`}
            >
              <span>🔄</span>
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default APIErrorHandler
