import { useState } from 'react'
import HighlightText from './HighlightText'
import { useTheme } from '../contexts/ThemeContext'

interface DialogueMessage {
  speaker: string
  text: string
  chinese?: string
  wordTranslations?: { [key: string]: string }
}

interface DialogueDisplayProps {
  dialogue: DialogueMessage[]
  onCollectSentence: (message: DialogueMessage) => void
  onCollectWord: (word: string) => void
  onWordTranslate: (word: string, dialogue?: DialogueMessage[]) => Promise<string>
}

const DialogueDisplay = ({
  dialogue,
  onCollectSentence,
  onCollectWord,
  onWordTranslate
}: DialogueDisplayProps) => {
  const { themeConfig } = useTheme()
  const [showChinese, setShowChinese] = useState(false)

  return (
    <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-4 backdrop-blur-xl shadow-2xl`}>
      {/* 標題欄 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${themeConfig.colors.gradient.cyan} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h2 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>
              AI 對話練習
            </h2>
            <p className={`${themeConfig.colors.text.tertiary} text-xs`}>智能英語學習助手</p>
          </div>
        </div>
        
        {/* 控制按鈕和對話數量指示器 */}
        <div className="flex items-center gap-3">
          {/* 中文翻譯切換按鈕 */}
          {dialogue.length > 0 && (
            <button
              onClick={() => setShowChinese(!showChinese)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border backdrop-blur-sm ${
                showChinese
                  ? `bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.accent} ${themeConfig.colors.border.accent} shadow-lg`
                  : `bg-gradient-to-r ${themeConfig.colors.background.secondary} ${themeConfig.colors.text.tertiary} ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.secondary}`
              }`}
              title={showChinese ? '隱藏中文翻譯' : '顯示中文翻譯'}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs">{showChinese ? '🇨🇳' : '🇺🇸'}</span>
                <span>{showChinese ? '隱藏中文' : '顯示中文'}</span>
              </div>
            </button>
          )}
          
          {/* 對話數量指示器 */}
          {dialogue.length > 0 && (
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} ${themeConfig.colors.text.accent} text-xs font-medium px-3 py-2 rounded-2xl backdrop-blur-sm`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
                {dialogue.length} 條對話
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 對話內容 */}
      {dialogue.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="text-7xl mb-2">🤖</div>
            <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.gradient.cyan}/20 rounded-full blur-3xl`}></div>
          </div>
          <h3 className={`text-xl font-semibold ${themeConfig.colors.text.primary} mb-2`}>準備開始學習</h3>
          <p className={`${themeConfig.colors.text.tertiary} text-sm`}>點擊上方按鈕生成您的第一個 AI 對話</p>
          <div className="mt-4 flex justify-center">
            <div className={`w-16 h-1 bg-gradient-to-r ${themeConfig.colors.gradient.cyan} rounded-full`}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {dialogue.map((message, index) => (
            <div 
              key={index} 
              className={`group relative bg-gradient-to-br ${themeConfig.colors.background.secondary} rounded-2xl p-4 border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent} hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}
            >
              {/* 對話標題行 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    message.speaker.toLowerCase().includes('alice') || message.speaker.toLowerCase().includes('sarah')
                      ? `bg-gradient-to-br ${themeConfig.colors.gradient.purple} text-white`
                      : `bg-gradient-to-br ${themeConfig.colors.gradient.blue} text-white`
                  }`}>
                    {message.speaker.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className={`${themeConfig.colors.text.primary} font-semibold text-sm`}>{message.speaker}</span>
                    <div className={`${themeConfig.colors.text.tertiary} text-xs`}>Speaker {index + 1}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => onCollectSentence(message)}
                  className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} hover:${themeConfig.colors.background.cardHover} ${themeConfig.colors.text.accent} hover:${themeConfig.colors.text.primary} text-xs px-3 py-2 rounded-xl transition-all duration-200 border ${themeConfig.colors.border.accent} hover:${themeConfig.colors.border.secondary} hover:scale-105 transform backdrop-blur-sm`}
                  title="收藏這個句子"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs">💾</span>
                    <span>收藏</span>
                  </div>
                </button>
              </div>
              
              {/* 對話文本 */}
              <div className="relative">
                <div className={`${themeConfig.colors.text.primary} leading-relaxed text-sm font-medium`}>
                  <HighlightText
                    text={message.text}
                    prefix={`dialogue-${index}`}
                    dialogue={dialogue}
                    onWordClick={onCollectWord}
                    onWordTranslate={onWordTranslate}
                  />
                </div>
                
                {/* 中文翻譯 */}
                {showChinese && message.chinese && (
                  <div className={`mt-3 p-3 bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-xl`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full`}></div>
                      <span className={`${themeConfig.colors.text.accent} text-xs font-medium`}>中文翻譯</span>
                    </div>
                    <div className={`${themeConfig.colors.text.primary} text-sm leading-relaxed`}>
                      {message.chinese}
                    </div>
                  </div>
                )}
                
                {/* 懸停效果指示器 */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-ping`}></div>
                </div>
              </div>
              
              {/* 底部裝飾線 */}
              <div className={`mt-3 pt-3 border-t ${themeConfig.colors.border.primary}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`${themeConfig.colors.text.tertiary}`}>#{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 ${themeConfig.colors.text.accent} rounded-full`}></div>
                    <div className={`w-1 h-1 ${themeConfig.colors.text.accent} rounded-full`}></div>
                    <div className={`w-1 h-1 ${themeConfig.colors.text.accent} rounded-full`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 底部提示 */}
      {dialogue.length > 0 && (
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} rounded-2xl px-4 py-2`}>
            <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            <span className={`${themeConfig.colors.text.tertiary} text-xs`}>點擊單字查看翻譯 • 點擊收藏按鈕保存句子 • 使用右上角按鈕切換中文翻譯</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DialogueDisplay
