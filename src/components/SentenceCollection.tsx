import HighlightText from './HighlightText'

interface Sentence {
  id: string
  english: string
  chinese: string
  addedAt: Date
}

interface DialogueMessage {
  speaker: string
  text: string
  chinese?: string
  wordTranslations?: { [key: string]: string }
}

interface SentenceCollectionProps {
  sentences: Sentence[]
  selectedSentence: Sentence | null
  dialogue: DialogueMessage[]
  onSelectSentence: (sentence: Sentence) => void
  onDeleteSentence: (id: string) => void
  onSpeakSentence: (sentence: string) => void
  onCollectWord: (word: string) => void
  onWordTranslate: (word: string, dialogue?: DialogueMessage[]) => Promise<string>
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
  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-emerald-500/30 rounded-3xl p-4 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/30">
              <span className="text-white text-lg">📝</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              句子收藏
            </h2>
            <p className="text-emerald-300/70 text-xs">語句學習庫</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-medium px-3 py-2 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            {sentences.length}
          </div>
        </div>
      </div>
      
      {sentences.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="text-7xl mb-2">📄</div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl"></div>
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">開始收集句子</h3>
          <p className="text-slate-400 text-sm">點擊對話中的收藏按鈕來保存句子</p>
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto mb-6 pr-2">
          {sentences.map(sentence => (
            <div
              key={sentence.id}
              className={`group cursor-pointer transition-all duration-300 rounded-2xl p-3 border backdrop-blur-sm ${
                selectedSentence?.id === sentence.id
                  ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/50 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-slate-800/60 to-slate-700/40 border-slate-600/30 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20'
              }`}
              onClick={() => onSelectSentence(sentence)}
            >
              <div className="text-slate-200 text-sm line-clamp-2 group-hover:text-emerald-200 transition-colors duration-200">
                {sentence.english}
              </div>
              <div className="flex items-center gap-2 text-emerald-400/60 text-xs mt-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                {sentence.addedAt.toLocaleDateString('zh-TW')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 句子詳情 */}
      {selectedSentence && (
        <div className="border-t border-slate-600/30 pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              句子詳情
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-emerald-300 mb-3">原文</h4>
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm">
                  <div className="text-slate-200 leading-relaxed mb-3">
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
                    className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 hover:text-emerald-200 text-sm px-4 py-2 rounded-xl transition-all duration-200 border border-emerald-400/30 hover:border-emerald-400/50 hover:scale-105 transform backdrop-blur-sm"
                    title="播放發音"
                  >
                    🔊 播放發音
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-emerald-300 mb-3">中文翻譯</h4>
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm">
                  <div className="text-slate-200">{selectedSentence.chinese}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onDeleteSentence(selectedSentence.id)}
                  className="bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 hover:text-red-200 flex-1 py-3 px-4 rounded-xl transition-all duration-200 border border-red-400/30 hover:border-red-400/50 hover:scale-105 transform backdrop-blur-sm"
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
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-600/30 rounded-2xl px-4 py-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-xs">點擊句子查看詳情 • 點擊單字繼續收藏</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SentenceCollection
