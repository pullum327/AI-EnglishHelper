import React from 'react'
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface SwipeHintProps {
  className?: string
  showHint?: boolean
}

const SwipeHint: React.FC<SwipeHintProps> = ({ 
  className = '', 
  showHint = true 
}) => {
  const { themeConfig } = useTheme()

  if (!showHint) return null

  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none ${className}`}>
      <div className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} backdrop-blur-sm border ${themeConfig.colors.border.primary} rounded-full px-4 py-2 flex items-center gap-2 animate-pulse`}>
        <Smartphone className={`w-4 h-4 ${themeConfig.colors.text.primary}`} />
        <div className={`flex items-center gap-1 ${themeConfig.colors.text.primary} text-xs`}>
          <ChevronLeft className="w-3 h-3" />
          <span>滑動切換</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

export default SwipeHint
