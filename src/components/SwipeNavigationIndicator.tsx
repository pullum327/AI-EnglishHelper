import React from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'

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
        return 'text-blue-400'
      case 'right':
        return 'text-green-400'
      case 'up':
        return 'text-purple-400'
      case 'down':
        return 'text-orange-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none ${className}`}>
      <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 flex flex-col items-center gap-3 animate-in fade-in duration-200">
        <div className={`${getDirectionColor()} animate-bounce`}>
          {getDirectionIcon()}
        </div>
        <div className="text-white text-sm font-medium text-center">
          {getDirectionText()}
        </div>
        <div className="text-white/60 text-xs text-center">
          滑動切換頁面
        </div>
      </div>
    </div>
  )
}

export default SwipeNavigationIndicator
