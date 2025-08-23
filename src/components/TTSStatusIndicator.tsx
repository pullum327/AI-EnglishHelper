import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX, Smartphone, Monitor, CheckCircle } from 'lucide-react'
import { ttsService } from '../services/ttsService'

interface TTSStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

const TTSStatusIndicator: React.FC<TTSStatusIndicatorProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const [status, setStatus] = useState({ supported: false, device: 'desktop' as 'mobile' | 'desktop' })
  const [availableVoices, setAvailableVoices] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // 獲取TTS狀態
    const ttsStatus = ttsService.getSupportStatus()
    setStatus(ttsStatus)
    
    if (ttsStatus.supported) {
      // 獲取可用語音數量
      const voices = ttsService.getEnglishVoices()
      setAvailableVoices(voices.length)
      
      // 監聽播放狀態
      const checkPlayingStatus = () => {
        setIsPlaying(ttsService.isPlaying())
      }
      
      const interval = setInterval(checkPlayingStatus, 100)
      return () => clearInterval(interval)
    }
  }, [])

  if (!status.supported) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm ${className}`}>
        <VolumeX className="w-4 h-4" />
        <span>語音不支持</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* 主要狀態指示器 */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
        <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
        <span>語音就緒</span>
        {isPlaying && <span className="ml-1">• 播放中</span>}
      </div>

      {/* 設備類型指示器 */}
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-xs">
        {status.device === 'mobile' ? (
          <>
            <Smartphone className="w-3 h-3" />
            <span>移動</span>
          </>
        ) : (
          <>
            <Monitor className="w-3 h-3" />
            <span>桌面</span>
          </>
        )}
      </div>

      {/* 詳細信息 */}
      {showDetails && (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>{availableVoices} 個語音</span>
        </div>
      )}
    </div>
  )
}

export default TTSStatusIndicator
