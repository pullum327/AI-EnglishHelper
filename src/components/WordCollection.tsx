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
  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 border border-purple-500/30 rounded-3xl p-4 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-400/30">
              <span className="text-white text-lg">📚</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              單字本
            </h2>
            <p className="text-purple-300/70 text-xs">詞彙收藏庫</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 text-purple-300 text-xs font-medium px-3 py-2 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            {words.length}
          </div>
        </div>
      </div>
      
      {words.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="text-7xl mb-2">📖</div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">開始建立詞彙庫</h3>
          <p className="text-slate-400 text-sm">點擊對話中的單字來收藏學習</p>
          <div className="mt-4 flex justify-center">
            <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {words.map(word => (
            <div 
              key={word.id} 
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-2xl p-4 border border-slate-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-purple-200 transition-colors duration-200">
                    {word.word}
                  </div>
                  <div className="text-slate-300 text-sm mb-2">{word.translation}</div>
                  <div className="flex items-center gap-2 text-purple-400/60 text-xs">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    {word.addedAt.toLocaleDateString('zh-TW')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSpeakWord(word.word)}
                    className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 hover:text-purple-200 rounded-xl transition-all duration-200 border border-purple-400/30 hover:border-purple-400/50 hover:scale-105 transform backdrop-blur-sm"
                    title="播放發音"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => onDeleteWord(word.id)}
                    className="p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-300 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-400/30 hover:border-red-400/50 hover:scale-105 transform backdrop-blur-sm"
                    title="刪除單字"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* 底部裝飾線 */}
              <div className="mt-3 pt-3 border-t border-slate-600/30">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                  <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 底部提示 */}
      {words.length > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-600/30 rounded-2xl px-4 py-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-xs">點擊🔊播放發音 • 點擊🗑️刪除單字</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WordCollection
