// 通知組件 - 顯示 API 狀態和用戶提示
import { useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

function Notification({ message, type, onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500 text-green-50'
      case 'error':
        return 'bg-red-600 border-red-500 text-red-50'
      case 'info':
        return 'bg-blue-600 border-blue-500 text-blue-50'
      default:
        return 'bg-gray-600 border-gray-500 text-gray-50'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '💡'
    }
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-lg border shadow-2xl max-w-md w-full mx-4 ${getTypeStyles()} animate-fade-in`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{getIcon()}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-current/80 hover:text-current transition-colors duration-200 p-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default Notification
