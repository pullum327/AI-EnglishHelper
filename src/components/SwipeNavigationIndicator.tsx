import React from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface SwipeNavigationIndicatorProps {
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
  isSwiping: boolean
  className?: string
}

const SwipeNavigationIndicator: React.FC<SwipeNavigationIndicatorProps> = ({
  swipeDirection,
  isSwiping,
  className = ''
}) => {
  const { themeConfig } = useTheme()

  if (!swipeDirection || !isSwiping) return null

  const getDirectionIcon = () => {
    switch (swipeDirection) {
      case 'left':
        return <ChevronLeft className="w-6 h-6" />
      case 'right':
        return <ChevronRight className="w-6 h-6" />
      case 'up':
        return <ChevronUp className="w-6 h-6" />
      case 'down':
        return <ChevronDown className="w-6 h-6" />
      default:
        return null
    }
  }

  const getDirectionText = () => {
    switch (swipeDirection) {
      case 'left':
        return '下一頁'
      case 'right':
        return '上一頁'
      case 'up':
        return '向上滑動'
      case 'down':
        return '向下滑動'
      default:
        return ''
    }
  }

  const getDirectionColor = () => {
    switch (swipeDirection) {
      case 'left':
        return themeConfig.colors.text.accent
      case 'right':
        return themeConfig.colors.text.accent
      case 'up':
        return themeConfig.colors.text.accent
      case 'down':
        return themeConfig.colors.text.accent
      default:
        return themeConfig.colors.text.accent
    }
  }

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none ${className}`}>
      <div className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} backdrop-blur-sm border ${themeConfig.colors.border.primary} rounded-2xl px-6 py-4 flex flex-col items-center gap-3 animate-in fade-in duration-200`}>
        <div className={`${getDirectionColor()} animate-bounce`}>
          {getDirectionIcon()}
        </div>
        <div className={`${themeConfig.colors.text.primary} text-sm font-medium text-center`}>
          {getDirectionText()}
        </div>
        <div className={`${themeConfig.colors.text.tertiary} text-xs text-center`}>
          滑動切換頁面
        </div>
      </div>
    </div>
  )
}

export default SwipeNavigationIndicator
