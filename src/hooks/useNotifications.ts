import { useState, useCallback } from 'react'
import type { Notification } from '../types'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now()
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // 3秒後自動移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
    }, 3000)
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  }
}
