import { useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'

interface DialogueMessage {
  speaker: string
  text: string
  chinese?: string
  wordTranslations?: { [key: string]: string }
}

interface HighlightTextProps {
  text: string
  prefix?: string
  dialogue?: DialogueMessage[]
  onWordClick: (word: string) => void
  onWordTranslate: (word: string, dialogue?: DialogueMessage[]) => Promise<string>
}

const HighlightText = ({ 
  text, 
  prefix = 'highlight',
  dialogue,
  onWordClick, 
  onWordTranslate 
}: HighlightTextProps) => {
  const { themeConfig } = useTheme()
  const [hoveredWordId, setHoveredWordId] = useState('')
  const [hoveredTranslation, setHoveredTranslation] = useState('')
  const [clickedWordId, setClickedWordId] = useState('')
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top')
  const [tooltipOffset, setTooltipOffset] = useState(0)
  const wordRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({})

  // 檢測是否為移動設備
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // 計算工具提示的最佳位置
  const calculateTooltipPosition = (wordId: string) => {
    const wordElement = wordRefs.current[wordId]
    if (!wordElement) return

    const rect = wordElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    
    // 檢查水平位置
    const tooltipWidth = isMobile ? 140 : 120 // 手機端稍微寬一點
    const leftSpace = rect.left
    const rightSpace = viewportWidth - rect.right
    
    let horizontalOffset = 0
    if (leftSpace < tooltipWidth / 2) {
      // 左邊空間不足，向右偏移
      horizontalOffset = tooltipWidth / 2 - leftSpace + 15
    } else if (rightSpace < tooltipWidth / 2) {
      // 右邊空間不足，向左偏移
      horizontalOffset = -(tooltipWidth / 2 - rightSpace + 15)
    }
    
    // 檢查垂直位置 - 優先顯示在上方
    const tooltipHeight = isMobile ? 50 : 40 // 手機端稍微高一點
    const topSpace = rect.top
    
    if (topSpace < tooltipHeight + 15) {
      // 上方空間不足，改為下方顯示
      setTooltipPosition('bottom')
    } else {
      // 優先上方顯示
      setTooltipPosition('top')
    }
    
    setTooltipOffset(horizontalOffset)
  }

  // 處理點擊收藏
  const handleWordClick = (word: string, wordId: string) => {
    onWordClick(word)
    // 顯示收藏提示
    setClickedWordId(wordId)
    setTimeout(() => {
      setClickedWordId('')
    }, 1500) // 1.5秒後隱藏提示
  }

  // 清除懸停狀態
  const clearHoverState = () => {
    setHoveredWordId('')
    setHoveredTranslation('')
  }

  return (
    <>
      {text.split(/(\w+)/).map((part, index) => {
        if (/\w+/.test(part) && part.length > 2) {
          const wordId = `${prefix}-${index}-${part}`
          const isHovered = hoveredWordId === wordId
          const isClicked = clickedWordId === wordId
          
          return (
            <span
              key={index}
              ref={(el) => { wordRefs.current[wordId] = el }}
              className={`inline-block px-2 py-1 mx-1 cursor-pointer transition-all duration-300 relative select-none ${
                isClicked
                  ? `bg-gradient-to-r ${themeConfig.colors.gradient.emerald} text-white border ${themeConfig.colors.border.accent} shadow-lg scale-105` 
                  : isHovered 
                  ? `bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} shadow-md scale-105` 
                  : `bg-gradient-to-r ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent} hover:bg-gradient-to-r hover:${themeConfig.colors.background.tertiary}`
              } rounded-lg ${isClicked || isHovered ? 'text-white' : themeConfig.colors.text.primary} hover:${themeConfig.colors.text.accent} font-medium`}
              onClick={async () => {
                if (isMobile) {
                  // 手機端：第一次點擊顯示翻譯，第二次點擊收藏
                  if (isHovered) {
                    handleWordClick(part, wordId)
                    clearHoverState()
                  } else {
                    setHoveredWordId(wordId)
                    calculateTooltipPosition(wordId)
                    try {
                      const translation = await onWordTranslate(part, dialogue)
                      setHoveredTranslation(translation)
                      // 2秒後自動隱藏翻譯，為收藏提示留出空間
                      setTimeout(() => {
                        clearHoverState()
                      }, 2000)
                    } catch (error) {
                      console.error('Translation error:', error)
                      setHoveredTranslation('翻譯失敗')
                    }
                  }
                } else {
                  // 桌面端：直接收藏
                  handleWordClick(part, wordId)
                }
              }}
              onMouseEnter={async () => {
                if (!isMobile) {
                  setHoveredWordId(wordId)
                  calculateTooltipPosition(wordId)
                  try {
                    const translation = await onWordTranslate(part, dialogue)
                    setHoveredTranslation(translation)
                  } catch (error) {
                    console.error('Translation error:', error)
                    setHoveredTranslation('翻譯失敗')
                  }
                }
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  clearHoverState()
                }
              }}
              title={isMobile ? `點擊查看翻譯，再點擊收藏: ${part}` : `懸停查看翻譯，點擊收藏: ${part}`}
            >
              {part}
              
              {/* 美化的翻譯提示 - 一行顯示所有文字 */}
              {isHovered && hoveredTranslation && !isMobile && (
                <div 
                  className={`absolute z-50 animate-in fade-in-0 zoom-in-95 duration-200 ${
                    tooltipPosition === 'top' 
                      ? 'bottom-full mb-2' 
                      : 'top-full mt-2'
                  }`}
                  style={{
                    left: `calc(50% + ${tooltipOffset}px)`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className={`bg-gradient-to-r ${themeConfig.colors.gradient.blue} backdrop-blur-xl border border-blue-400/30 rounded-2xl px-4 py-2.5 shadow-2xl text-center whitespace-nowrap`}>
                    <div className="text-white text-sm font-medium">
                      {hoveredTranslation}
                    </div>
                    
                    {/* 箭頭指示器 */}
                    <div className={`absolute ${tooltipPosition === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                      tooltipPosition === 'top' 
                        ? 'border-t-blue-500' 
                        : 'border-b-blue-500 rotate-180'
                    }`}></div>
                  </div>
                </div>
              )}
              
              {/* 收藏成功提示 - 右上角顯示 */}
              {isClicked && (
                <div className="absolute -top-2 -right-2 z-50">
                  <div className={`bg-gradient-to-r ${themeConfig.colors.gradient.emerald} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-in slide-in-from-right-2 duration-300 whitespace-nowrap`}>
                    ✓ 收藏成功
                  </div>
                </div>
              )}
              
              {/* 手機端美化的翻譯提示 */}
              {isMobile && isHovered && hoveredTranslation && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 backdrop-blur-xl border border-blue-400/30 rounded-2xl px-4 py-2.5 shadow-2xl text-center whitespace-nowrap">
                    <div className="text-white text-sm font-medium">
                      {hoveredTranslation}
                    </div>
                    
                    {/* 箭頭指示器 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500"></div>
                  </div>
                </div>
              )}
              
              {/* 懸停時的發光效果 */}
              {isHovered && (
                <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-lg blur-sm -z-10`}></div>
              )}
            </span>
          )
        }
        return part
      })}
    </>
  )
}

export default HighlightText
