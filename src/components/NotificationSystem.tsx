import React, { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, Bookmark } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  timestamp: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemoveNotification: (id: string) => void
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onRemoveNotification
}) => {
  const { themeConfig } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  // 檢測是否為移動設備
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (notifications.length === 0) return null

  // 獲取通知圖標
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Bookmark className="w-5 h-5" />
    }
  }

  // 獲取通知樣式
  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: `bg-gradient-to-r ${themeConfig.colors.gradient.emerald}`,
          border: 'border-emerald-400/30',
          icon: 'text-emerald-100',
          text: 'text-white'
        }
      case 'error':
        return {
          bg: `bg-gradient-to-r ${themeConfig.colors.gradient.pink}`,
          border: 'border-pink-400/30',
          icon: 'text-pink-100',
          text: 'text-white'
        }
      case 'info':
        return {
          bg: `bg-gradient-to-r ${themeConfig.colors.gradient.blue}`,
          border: 'border-blue-400/30',
          icon: 'text-blue-100',
          text: 'text-white'
        }
      default:
        return {
          bg: `bg-gradient-to-r ${themeConfig.colors.gradient.slate}`,
          border: 'border-slate-400/30',
          icon: 'text-slate-100',
          text: 'text-white'
        }
    }
  }

  return (
    <div className={`fixed z-50 space-y-3 ${
      isMobile 
        ? 'top-4 left-4 right-4' 
        : 'top-4 right-4 max-w-sm'
    }`}>
      {notifications.map((notification, index) => {
        // 移動端使用簡化設計
        if (isMobile) {
          const styles = getNotificationStyles(notification.type)
          
          return (
            <div
              key={notification.id}
              className={`${styles.bg} ${styles.border} backdrop-blur-xl border rounded-2xl shadow-xl transform transition-all duration-300 animate-in slide-in-from-top-5 w-full`}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="p-3">
                <div className="flex items-center gap-3">
                  {/* 圖標 */}
                  <div className={`flex-shrink-0 ${styles.icon}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* 內容 */}
                  <div className="flex-1 min-w-0">
                    <div className={`${styles.text} text-sm font-medium leading-relaxed break-words`}>
                      {notification.message}
                    </div>
                  </div>
                  
                  {/* 關閉按鈕 */}
                  <button
                    onClick={() => onRemoveNotification(notification.id)}
                    className={`flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 ${styles.text} hover:scale-110 active:scale-95`}
                    aria-label="關閉通知"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        }
        
        // 桌面端使用原有設計
        const styles = getNotificationStyles(notification.type)
        
        return (
          <div
            key={notification.id}
            className={`${styles.bg} ${styles.border} backdrop-blur-xl border rounded-2xl shadow-2xl transform transition-all duration-300 animate-in slide-in-from-right-5 w-80`}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* 圖標 */}
                <div className={`flex-shrink-0 ${styles.icon}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* 內容 */}
                <div className="flex-1 min-w-0">
                  <div className={`${styles.text} text-sm font-medium leading-relaxed break-words`}>
                    {notification.message}
                  </div>
                </div>
                
                {/* 關閉按鈕 */}
                <button
                  onClick={() => onRemoveNotification(notification.id)}
                  className={`flex-shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200 ${styles.text} hover:scale-110 active:scale-95`}
                  aria-label="關閉通知"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* 桌面端懸停效果 */}
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none" />
          </div>
        )
      })}
      
      {/* 移動端批量操作 */}
      {isMobile && notifications.length > 1 && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => notifications.forEach(n => onRemoveNotification(n.id))}
            className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            關閉所有通知
          </button>
        </div>
      )}
      
      {/* 自定義動畫樣式 */}
      <style>{`
        @keyframes notification-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default NotificationSystem
