import React, { useState, useEffect } from 'react'
import { VolumeX, Play, Pause, Square, Settings, TestTube } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { ttsService, type TTSVoice } from '../services/ttsService'

interface TTSControllerProps {
  className?: string
}

const TTSController: React.FC<TTSControllerProps> = ({ className = '' }) => {
  const { themeConfig } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<TTSVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [rate, setRate] = useState(0.8)
  const [pitch, setPitch] = useState(1.0)
  const [volume, setVolume] = useState(0.8)
  const [supportStatus, setSupportStatus] = useState({ supported: false, device: 'desktop' as 'mobile' | 'desktop' })
  const [testText, setTestText] = useState('Hello World')

  useEffect(() => {
    // 初始化TTS服務狀態
    const status = ttsService.getSupportStatus()
    setSupportStatus(status)
    
    if (status.supported) {
      // 加載語音列表
      const voices = ttsService.getEnglishVoices()
      setAvailableVoices(voices)
      
      // 設置默認語音
      const defaultVoice = ttsService.getDefaultEnglishVoice()
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name)
      }
      
      // 根據設備類型設置默認參數
      if (status.device === 'mobile') {
        setRate(0.9)
        setVolume(0.8)
      } else {
        setRate(0.8)
        setVolume(1.0)
      }
    }
  }, [])

  // 測試語音
  const handleTestVoice = async () => {
    try {
      await ttsService.speak({
        text: testText,
        lang: 'en-US',
        rate,
        pitch,
        volume,
        voice: selectedVoice
      })
    } catch (error) {
      console.error('語音測試失敗:', error)
    }
  }

  // 播放測試文本
  const handlePlay = async () => {
    try {
      setIsPlaying(true)
      setIsPaused(false)
      
      await ttsService.speak({
        text: testText,
        lang: 'en-US',
        rate,
        pitch,
        volume,
        voice: selectedVoice
      })
      
      setIsPlaying(false)
      setIsPaused(false)
    } catch (error) {
      console.error('播放失敗:', error)
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  // 暫停播放
  const handlePause = () => {
    ttsService.pause()
    setIsPaused(true)
  }

  // 恢復播放
  const handleResume = () => {
    ttsService.resume()
    setIsPaused(false)
  }

  // 停止播放
  const handleStop = () => {
    ttsService.stop()
    setIsPlaying(false)
    setIsPaused(false)
  }

  // 更新語音設置
  const updateVoiceSettings = () => {
    // 這裡可以保存設置到localStorage或發送到後端
    console.log('語音設置已更新:', { selectedVoice, rate, pitch, volume })
  }

  if (!supportStatus.supported) {
    return (
              <div className={`${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 ${themeConfig.colors.text.accent}">
          <VolumeX className="w-5 h-5" />
          <span className="text-sm font-medium">此瀏覽器不支持語音合成</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要控制區域 */}
      <div className={`bg-gradient-to-r ${themeConfig.colors.background.card} border ${themeConfig.colors.border.primary} rounded-xl p-4 backdrop-blur-sm`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${themeConfig.colors.text.primary}`}>語音控制</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${themeConfig.colors.text.tertiary} px-2 py-1 ${themeConfig.colors.background.tertiary} rounded-lg`}>
              {supportStatus.device === 'mobile' ? '📱 移動設備' : '💻 桌面設備'}
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 hover:${themeConfig.colors.background.secondary} rounded-lg transition-colors`}
            >
              <Settings className={`w-4 h-4 ${themeConfig.colors.text.tertiary}`} />
            </button>
          </div>
        </div>

        {/* 測試文本輸入 */}
        <div className="mb-4">
          <label className={`block text-sm font-medium ${themeConfig.colors.text.secondary} mb-2`}>測試文本</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className={`flex-1 bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-lg px-3 py-2 ${themeConfig.colors.text.primary} placeholder-${themeConfig.colors.text.tertiary} focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent`}
              placeholder="輸入要測試的文本..."
            />
            <button
              onClick={handleTestVoice}
              className={`px-3 py-2 bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} text-white rounded-lg transition-all duration-200 flex items-center gap-2`}
            >
              <TestTube className="w-4 h-4" />
              測試
            </button>
          </div>
        </div>

        {/* 播放控制按鈕 */}
        <div className="flex items-center justify-center gap-3">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className={`p-3 bg-gradient-to-r ${themeConfig.colors.gradient.emerald} hover:${themeConfig.colors.gradient.teal} text-white rounded-full transition-all duration-200 shadow-lg`}
            >
              <Play className="w-6 h-6" />
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className={`p-3 bg-gradient-to-r ${themeConfig.colors.gradient.blue} hover:${themeConfig.colors.gradient.cyan} text-white rounded-full transition-all duration-200 shadow-lg`}
                >
                  <Play className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className={`p-3 bg-gradient-to-r ${themeConfig.colors.gradient.purple} hover:${themeConfig.colors.gradient.pink} text-white rounded-full transition-all duration-200 shadow-lg`}
                >
                  <Pause className="w-6 h-6" />
                </button>
              )}
              <button
                onClick={handleStop}
                className={`p-3 bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white rounded-full transition-all duration-200 shadow-lg`}
              >
                <Square className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* 播放狀態指示 */}
        {isPlaying && (
          <div className="mt-3 text-center">
            <div className={`inline-flex items-center gap-2 text-sm ${themeConfig.colors.text.tertiary}`}>
              <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
              {isPaused ? '已暫停' : '播放中...'}
            </div>
          </div>
        )}
      </div>

      {/* 語音設置面板 */}
      {showSettings && (
        <div className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} rounded-xl p-4 backdrop-blur-sm space-y-4`}>
          <h4 className={`text-md font-semibold ${themeConfig.colors.text.primary}`}>語音設置</h4>
          
          {/* 語音選擇 */}
          <div>
            <label className={`block text-sm font-medium ${themeConfig.colors.text.secondary} mb-2`}>選擇語音</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className={`w-full bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-lg px-3 py-2 ${themeConfig.colors.text.primary} focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent`}
            >
              {availableVoices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.default ? ' - 默認' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 語速控制 */}
          <div>
            <label className={`block text-sm font-medium ${themeConfig.colors.text.secondary} mb-2`}>
              語速: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className={`w-full h-2 ${themeConfig.colors.background.tertiary} rounded-lg appearance-none cursor-pointer slider`}
            />
            <div className={`flex justify-between text-xs ${themeConfig.colors.text.tertiary} mt-1`}>
              <span>慢</span>
              <span>正常</span>
              <span>快</span>
            </div>
          </div>

          {/* 音調控制 */}
          <div>
            <label className={`block text-sm font-medium ${themeConfig.colors.text.secondary} mb-2`}>
              音調: {pitch.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className={`w-full h-2 ${themeConfig.colors.background.tertiary} rounded-lg appearance-none cursor-pointer slider`}
            />
            <div className={`flex justify-between text-xs ${themeConfig.colors.text.tertiary} mt-1`}>
              <span>低</span>
              <span>正常</span>
              <span>高</span>
            </div>
          </div>

          {/* 音量控制 */}
          <div>
            <label className={`block text-sm font-medium ${themeConfig.colors.text.secondary} mb-2`}>
              音量: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className={`w-full h-2 ${themeConfig.colors.background.tertiary} rounded-lg appearance-none cursor-pointer slider`}
            />
            <div className={`flex justify-between text-xs ${themeConfig.colors.text.tertiary} mt-1`}>
              <span>靜音</span>
              <span>適中</span>
              <span>最大</span>
            </div>
          </div>

          {/* 保存設置按鈕 */}
          <button
            onClick={updateVoiceSettings}
            className={`w-full bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} text-white py-2 rounded-lg transition-all duration-200 font-medium`}
          >
            保存設置
          </button>
        </div>
      )}
    </div>
  )
}

export default TTSController
