import { useTheme } from '../contexts/ThemeContext'

interface Word {
  id: string
  word: string
  translation: string
  addedAt: Date
}

interface WordCollectionProps {
  words: Word[]
  onSpeakWord: (word: string) => void
  onDeleteWord: (id: string) => void
}

const WordCollection = ({ words, onSpeakWord, onDeleteWord }: WordCollectionProps) => {
  const { themeConfig } = useTheme()

  return (
    <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-4 backdrop-blur-xl shadow-2xl`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${themeConfig.colors.gradient.purple} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg">📚</span>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h2 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.purple} bg-clip-text text-transparent`}>
              單字本
            </h2>
            <p className={`${themeConfig.colors.text.tertiary} text-xs`}>詞彙收藏庫</p>
          </div>
        </div>
        <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} ${themeConfig.colors.text.primary} text-xs font-medium px-3 py-2 rounded-2xl backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            {words.length}
          </div>
        </div>
      </div>
      
      {words.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="text-7xl mb-2">📖</div>
            <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.gradient.purple}/20 rounded-full blur-3xl`}></div>
          </div>
          <h3 className={`text-xl font-semibold ${themeConfig.colors.text.primary} mb-2`}>開始建立詞彙庫</h3>
          <p className={`${themeConfig.colors.text.tertiary} text-sm`}>點擊對話中的單字來收藏學習</p>
          <div className="mt-4 flex justify-center">
            <div className={`w-16 h-1 bg-gradient-to-r ${themeConfig.colors.gradient.purple} rounded-full`}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {words.map(word => (
            <div 
              key={word.id} 
              className={`group relative bg-gradient-to-br ${themeConfig.colors.background.secondary} rounded-2xl p-4 border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent} hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className={`text-lg font-semibold ${themeConfig.colors.text.primary} mb-1 group-hover:${themeConfig.colors.text.accent} transition-colors duration-200`}>
                    {word.word}
                  </div>
                  <div className={`${themeConfig.colors.text.secondary} text-sm mb-2`}>{word.translation}</div>
                  <div className={`flex items-center gap-2 ${themeConfig.colors.text.tertiary} text-xs`}>
                    <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full`}></div>
                    {word.addedAt.toLocaleDateString('zh-TW')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSpeakWord(word.word)}
                    className={`p-3 bg-gradient-to-r ${themeConfig.colors.background.tertiary} hover:${themeConfig.colors.background.cardHover} ${themeConfig.colors.text.primary} hover:${themeConfig.colors.text.accent} rounded-xl transition-all duration-200 border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.secondary} hover:scale-105 transform backdrop-blur-sm`}
                    title="播放發音"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => onDeleteWord(word.id)}
                    className={`p-3 bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white rounded-xl transition-all duration-200 border ${themeConfig.colors.border.accent} hover:${themeConfig.colors.border.secondary} hover:scale-105 transform backdrop-blur-sm`}
                    title="刪除單字"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* 底部裝飾線 */}
              <div className={`mt-3 pt-3 border-t ${themeConfig.colors.border.primary}`}>
                <div className={`flex items-center gap-2 text-xs ${themeConfig.colors.text.tertiary}`}>
                  <div className={`w-1 h-1 ${themeConfig.colors.text.accent} rounded-full`}></div>
                  <div className={`w-1 h-1 ${themeConfig.colors.text.accent} rounded-full`}></div>
                  <div className={`w-1 h-1 ${themeConfig.colors.text.accent} rounded-full`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 底部提示 */}
      {words.length > 0 && (
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-2xl px-4 py-2`}>
            <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            <span className={`${themeConfig.colors.text.tertiary} text-xs`}>點擊🔊播放發音 • 點擊🗑️刪除單字</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WordCollection
