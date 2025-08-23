
import HighlightText from './HighlightText'
import { useTheme } from '../contexts/ThemeContext'

interface Sentence {
  id: string
  english: string
  chinese: string
  addedAt: Date
}

interface SentenceCollectionProps {
  sentences: Sentence[]
  selectedSentence: Sentence | null
  dialogue: Array<{
    speaker: string
    text: string
    chinese?: string
    wordTranslations?: { [key: string]: string }
  }>
  onSelectSentence: (sentence: Sentence) => void
  onDeleteSentence: (id: string) => void
  onSpeakSentence: (text: string) => void
  onCollectWord: (word: string) => void
  onWordTranslate: (word: string, dialogue?: any[]) => Promise<string>
}

const SentenceCollection = ({
  sentences,
  selectedSentence,
  dialogue,
  onSelectSentence,
  onDeleteSentence,
  onSpeakSentence,
  onCollectWord,
  onWordTranslate
}: SentenceCollectionProps) => {
  const { themeConfig } = useTheme()

  return (
    <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-4 backdrop-blur-xl shadow-2xl`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 bg-gradient-to-br ${themeConfig.colors.gradient.emerald} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg">📄</span>
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
          </div>
          <div>
            <h2 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.emerald} bg-clip-text text-transparent`}>
              句子收藏
            </h2>
            <p className={`${themeConfig.colors.text.tertiary} text-xs`}>學習句子庫</p>
          </div>
        </div>
        <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} ${themeConfig.colors.text.accent} text-xs font-medium px-3 py-2 rounded-2xl backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            {sentences.length}
          </div>
        </div>
      </div>
      
      {sentences.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="text-7xl mb-2">📄</div>
            <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.gradient.emerald}/20 rounded-full blur-3xl`}></div>
          </div>
          <h3 className={`text-xl font-semibold ${themeConfig.colors.text.primary} mb-2`}>開始收集句子</h3>
          <p className={`${themeConfig.colors.text.tertiary} text-sm`}>點擊對話中的收藏按鈕來保存句子</p>
          <div className="mt-4 flex justify-center">
            <div className={`w-16 h-1 bg-gradient-to-r ${themeConfig.colors.gradient.emerald} rounded-full`}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto mb-6 pr-2">
          {sentences.map(sentence => (
            <div
              key={sentence.id}
              className={`group cursor-pointer transition-all duration-300 rounded-2xl p-3 border backdrop-blur-sm ${
                selectedSentence?.id === sentence.id
                  ? `bg-gradient-to-br ${themeConfig.colors.background.tertiary} ${themeConfig.colors.border.accent} shadow-lg`
                  : `bg-gradient-to-br ${themeConfig.colors.background.secondary} ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent} hover:shadow-lg`
              }`}
              onClick={() => onSelectSentence(sentence)}
            >
              <div className={`${themeConfig.colors.text.primary} text-sm line-clamp-2 group-hover:${themeConfig.colors.text.accent} transition-colors duration-200`}>
                {sentence.english}
              </div>
              <div className={`flex items-center gap-2 ${themeConfig.colors.text.tertiary} text-xs mt-2`}>
                <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full`}></div>
                {sentence.addedAt.toLocaleDateString('zh-TW')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 句子詳情 */}
      {selectedSentence && (
        <div className={`border-t ${themeConfig.colors.border.primary} pt-6`}>
          <div className="mb-4">
            <h3 className={`text-lg font-semibold ${themeConfig.colors.text.primary} mb-4 flex items-center gap-2`}>
              <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full`}></div>
              句子詳情
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium ${themeConfig.colors.text.accent} mb-3`}>原文</h4>
                <div className={`bg-gradient-to-br ${themeConfig.colors.background.secondary} rounded-2xl p-4 border ${themeConfig.colors.border.primary} backdrop-blur-sm`}>
                  <div className={`${themeConfig.colors.text.primary} leading-relaxed mb-3`}>
                    <HighlightText
                      text={selectedSentence.english}
                      prefix="sentence-detail"
                      dialogue={dialogue}
                      onWordClick={onCollectWord}
                      onWordTranslate={onWordTranslate}
                    />
                  </div>
                  <button
                    onClick={() => onSpeakSentence(selectedSentence.english)}
                    className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} hover:${themeConfig.colors.background.cardHover} ${themeConfig.colors.text.accent} hover:${themeConfig.colors.text.primary} text-sm px-4 py-2 rounded-xl transition-all duration-200 border ${themeConfig.colors.border.accent} hover:${themeConfig.colors.border.secondary} hover:scale-105 transform backdrop-blur-sm`}
                    title="播放發音"
                  >
                    🔊 播放發音
                  </button>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-medium ${themeConfig.colors.text.accent} mb-3`}>中文翻譯</h4>
                <div className={`bg-gradient-to-br ${themeConfig.colors.background.secondary} rounded-2xl p-4 border ${themeConfig.colors.border.primary} backdrop-blur-sm`}>
                  <div className={`${themeConfig.colors.text.primary}`}>{selectedSentence.chinese}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onDeleteSentence(selectedSentence.id)}
                  className={`bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white flex-1 py-3 px-4 rounded-xl transition-all duration-200 border ${themeConfig.colors.border.accent} hover:${themeConfig.colors.border.secondary} hover:scale-105 transform backdrop-blur-sm`}
                >
                  🗑️ 刪除句子
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 底部提示 */}
      {sentences.length > 0 && (
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center gap-2 ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} rounded-2xl px-4 py-2`}>
            <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            <span className={`${themeConfig.colors.text.tertiary} text-xs`}>點擊句子查看詳情 • 點擊單字繼續收藏</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SentenceCollection
