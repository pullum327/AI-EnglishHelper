import { useState } from 'react'
import HighlightText from './HighlightText'

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
  const [showChinese, setShowChinese] = useState(false)

  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-cyan-500/30 rounded-3xl p-4 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
      {/* 標題欄 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/30">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI 對話練習
            </h2>
            <p className="text-cyan-300/70 text-xs">智能英語學習助手</p>
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
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/50 shadow-lg shadow-green-500/20'
                  : 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-400/50 hover:border-slate-300/50'
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
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-medium px-3 py-2 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
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
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">準備開始學習</h3>
          <p className="text-slate-400 text-sm">點擊上方按鈕生成您的第一個 AI 對話</p>
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {dialogue.map((message, index) => (
            <div 
              key={index} 
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-4 border border-slate-600/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 backdrop-blur-sm"
            >
              {/* 對話標題行 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    message.speaker.toLowerCase().includes('alice') || message.speaker.toLowerCase().includes('sarah')
                      ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
                      : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white'
                  }`}>
                    {message.speaker.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-slate-200 font-semibold text-sm">{message.speaker}</span>
                    <div className="text-cyan-400/60 text-xs">Speaker {index + 1}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => onCollectSentence(message)}
                  className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-cyan-200 text-xs px-3 py-2 rounded-xl transition-all duration-200 border border-cyan-400/30 hover:border-cyan-400/50 hover:scale-105 transform backdrop-blur-sm"
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
                <div className="text-slate-200 leading-relaxed text-sm font-medium">
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
                  <div className="mt-3 p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-emerald-300 text-xs font-medium">中文翻譯</span>
                    </div>
                    <div className="text-emerald-200 text-sm leading-relaxed">
                      {message.chinese}
                    </div>
                  </div>
                )}
                
                {/* 懸停效果指示器 */}
                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                </div>
              </div>
              
              {/* 底部裝飾線 */}
              <div className="mt-3 pt-3 border-t border-slate-600/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">#{index + 1}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
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
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-600/30 rounded-2xl px-4 py-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-xs">點擊單字查看翻譯 • 點擊收藏按鈕保存句子 • 使用右上角按鈕切換中文翻譯</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DialogueDisplay
