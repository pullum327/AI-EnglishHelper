import { useState } from 'react'

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
  const [hoveredWordId, setHoveredWordId] = useState('')
  const [hoveredTranslation, setHoveredTranslation] = useState('')

  return (
    <>
      {text.split(/(\w+)/).map((part, index) => {
        if (/\w+/.test(part) && part.length > 2) {
          const wordId = `${prefix}-${index}-${part}`
          const isHovered = hoveredWordId === wordId
          
          return (
            <span
              key={index}
              className={`inline-block px-2 py-1 mx-1 cursor-pointer transition-all duration-300 relative group ${
                isHovered 
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 scale-105' 
                  : 'bg-gradient-to-r from-slate-700/40 to-slate-600/40 border border-slate-600/30 hover:border-cyan-400/40 hover:bg-gradient-to-r hover:from-slate-600/50 hover:to-slate-500/50'
              } rounded-lg text-slate-200 hover:text-cyan-200 font-medium`}
              onClick={() => onWordClick(part)}
              onMouseEnter={async () => {
                setHoveredWordId(wordId)
                try {
                  const translation = await onWordTranslate(part, dialogue)
                  setHoveredTranslation(translation)
                } catch (error) {
                  console.error('Translation error:', error)
                  setHoveredTranslation('翻譯失敗')
                }
              }}
              onMouseLeave={() => {
                setHoveredTranslation('')
                setHoveredWordId('')
              }}
              title={`點擊收藏單字: ${part}`}
            >
              {part}
              
              {/* 現代化懸停翻譯提示 */}
              {isHovered && hoveredTranslation && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-cyan-400/50 rounded-2xl p-4 shadow-2xl shadow-cyan-500/30 min-w-[140px] text-center">
                    {/* 頂部裝飾線 */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                    
                    {/* 單字 */}
                    <div className="text-cyan-300 font-bold text-sm mb-2">{part}</div>
                    
                    {/* 翻譯 */}
                    <div className="text-slate-200 text-xs mb-3">{hoveredTranslation}</div>
                    
                    {/* 底部提示 */}
                    <div className="text-cyan-400/60 text-xs">點擊收藏</div>
                    
                    {/* 箭頭指示器 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800/95"></div>
                  </div>
                </div>
              )}
              
              {/* 懸停時的發光效果 */}
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-lg blur-sm -z-10"></div>
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
