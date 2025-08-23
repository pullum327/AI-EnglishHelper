import React from 'react'
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react'

interface SwipeHintProps {
  className?: string
  showHint?: boolean
}

const SwipeHint: React.FC<SwipeHintProps> = ({ 
  className = '', 
  showHint = true 
}) => {
  if (!showHint) return null

  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none ${className}`}>
      <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 animate-pulse">
        <Smartphone className="w-4 h-4 text-white/80" />
        <div className="flex items-center gap-1 text-white/80 text-xs">
          <ChevronLeft className="w-3 h-3" />
          <span>滑動切換</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  )
}

export default SwipeHint
