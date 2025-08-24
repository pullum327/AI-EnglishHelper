import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import DatabaseService, { type WordData } from '../services/databaseService'

interface Word {
  id: string
  word: string
  translation: string
  phonetic?: string
  partOfSpeech?: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  createdAt: Date
  updatedAt: Date
}

interface WordCollectionProps {
  onSpeakWord: (word: string) => void
}

const WordCollection = ({ onSpeakWord }: WordCollectionProps) => {
  const { themeConfig } = useTheme()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWord, setNewWord] = useState<Partial<WordData>>({
    word: '',
    translation: '',
    difficulty: 'BEGINNER'
  })

  // 載入單字數據
  useEffect(() => {
    const initializeData = async () => {
      // 初始化示例數據
      await DatabaseService.initializeSampleData()
      // 載入單字
      await loadWords()
    }
    initializeData()
  }, [])

  const loadWords = async () => {
    try {
      setLoading(true)
      const result = await DatabaseService.getWords()
      if (result.success && result.data) {
        setWords(result.data)
        setError(null)
      } else {
        setError(result.error || '載入單字失敗')
      }
    } catch (err) {
      setError('載入單字時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  // 添加新單字
  const handleAddWord = async () => {
    if (!newWord.word || !newWord.translation) {
      setError('請填寫單字和翻譯')
      return
    }

    try {
      const result = await DatabaseService.createWord(newWord as WordData)
      if (result.success && result.data) {
        setWords(prev => [result.data, ...prev])
        setNewWord({ word: '', translation: '', difficulty: 'BEGINNER' })
        setShowAddForm(false)
        setError(null)
      } else {
        setError(result.error || '添加單字失敗')
      }
    } catch (err) {
      setError('添加單字時發生錯誤')
    }
  }

  // 刪除單字
  const handleDeleteWord = async (id: string) => {
    try {
      const result = await DatabaseService.deleteWord(id)
      if (result.success) {
        setWords(prev => prev.filter(word => word.id !== id))
        setError(null)
      } else {
        setError(result.error || '刪除單字失敗')
      }
    } catch (err) {
      setError('刪除單字時發生錯誤')
    }
  }

  // 搜索單字
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      await loadWords()
      return
    }

    try {
      const result = await DatabaseService.searchWords(query)
      if (result.success && result.data) {
        setWords(result.data)
        setError(null)
      } else {
        setError(result.error || '搜索失敗')
      }
    } catch (err) {
      setError('搜索時發生錯誤')
    }
  }

  // 按難度篩選
  const handleFilterByDifficulty = async (difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL') => {
    try {
      if (difficulty === 'ALL') {
        await loadWords()
      } else {
        const result = await DatabaseService.getWordsByDifficulty(difficulty)
        if (result.success && result.data) {
          setWords(result.data)
          setError(null)
        } else {
          setError(result.error || '篩選失敗')
        }
      }
    } catch (err) {
      setError('篩選時發生錯誤')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'text-green-500'
      case 'INTERMEDIATE': return 'text-yellow-500'
      case 'ADVANCED': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return '初級'
      case 'INTERMEDIATE': return '中級'
      case 'ADVANCED': return '高級'
      default: return '未知'
    }
  }

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

      {/* 搜索和篩選區域 */}
      <div className="mb-6 space-y-3">
        {/* 搜索框 */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="搜索單字或翻譯..."
            className={`flex-1 px-4 py-2 rounded-xl border ${themeConfig.colors.border.primary} ${themeConfig.colors.background.secondary} ${themeConfig.colors.text.primary} placeholder-${themeConfig.colors.text.tertiary} focus:outline-none focus:border-${themeConfig.colors.border.accent} transition-colors`}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 bg-gradient-to-r ${themeConfig.colors.gradient.purple} text-white rounded-xl hover:scale-105 transition-transform`}
          >
            {showAddForm ? '取消' : '添加'}
          </button>
        </div>

        {/* 難度篩選 */}
        <div className="flex gap-2">
          {(['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => handleFilterByDifficulty(difficulty)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                difficulty === 'ALL' 
                  ? `${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary}`
                  : `${themeConfig.colors.background.secondary} ${themeConfig.colors.text.secondary} hover:${themeConfig.colors.text.primary}`
              }`}
            >
              {difficulty === 'ALL' ? '全部' : getDifficultyText(difficulty)}
            </button>
          ))}
        </div>
      </div>

      {/* 添加單字表單 */}
      {showAddForm && (
        <div className={`mb-6 p-4 bg-gradient-to-br ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} rounded-2xl`}>
          <h3 className={`text-lg font-semibold ${themeConfig.colors.text.primary} mb-4`}>添加新單字</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="英文單字"
              value={newWord.word}
              onChange={(e) => setNewWord(prev => ({ ...prev, word: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${themeConfig.colors.border.primary} ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} focus:outline-none focus:border-${themeConfig.colors.border.accent}`}
            />
            <input
              type="text"
              placeholder="中文翻譯"
              value={newWord.translation}
              onChange={(e) => setNewWord(prev => ({ ...prev, translation: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${themeConfig.colors.border.primary} ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} focus:outline-none focus:border-${themeConfig.colors.border.accent}`}
            />
            <input
              type="text"
              placeholder="音標 (可選)"
              value={newWord.phonetic || ''}
              onChange={(e) => setNewWord(prev => ({ ...prev, phonetic: e.target.value }))}
              className={`px-3 py-2 rounded-lg border ${themeConfig.colors.border.primary} ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} focus:outline-none focus:border-${themeConfig.colors.border.accent}`}
            />
            <select
              value={newWord.difficulty}
              onChange={(e) => setNewWord(prev => ({ ...prev, difficulty: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }))}
              className={`px-3 py-2 rounded-lg border ${themeConfig.colors.border.primary} ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} focus:outline-none focus:border-${themeConfig.colors.border.accent}`}
            >
              <option value="BEGINNER">初級</option>
              <option value="INTERMEDIATE">中級</option>
              <option value="ADVANCED">高級</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddWord}
              className={`px-4 py-2 bg-gradient-to-r ${themeConfig.colors.gradient.purple} text-white rounded-lg hover:scale-105 transition-transform`}
            >
              添加單字
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className={`px-4 py-2 ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.secondary} rounded-lg hover:${themeConfig.colors.text.primary} transition-colors`}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 錯誤提示 */}
      {error && (
        <div className={`mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm`}>
          {error}
        </div>
      )}
      
      {/* 載入中 */}
      {loading ? (
        <div className="text-center py-16">
          <div className={`text-4xl mb-4 animate-spin`}>⏳</div>
          <p className={`${themeConfig.colors.text.secondary}`}>載入中...</p>
        </div>
      ) : words.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <div className="text-7xl mb-2">📖</div>
            <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.gradient.purple}/20 rounded-full blur-3xl`}></div>
          </div>
          <h3 className={`text-xl font-semibold ${themeConfig.colors.text.primary} mb-2`}>開始建立詞彙庫</h3>
          <p className={`${themeConfig.colors.text.tertiary} text-sm`}>點擊上方「添加」按鈕來收藏新單字</p>
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
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`text-lg font-semibold ${themeConfig.colors.text.primary} group-hover:${themeConfig.colors.text.accent} transition-colors duration-200`}>
                      {word.word}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(word.difficulty)} bg-${getDifficultyColor(word.difficulty)}/10`}>
                      {getDifficultyText(word.difficulty)}
                    </span>
                  </div>
                  <div className={`${themeConfig.colors.text.secondary} text-sm mb-2`}>{word.translation}</div>
                  {word.phonetic && (
                    <div className={`${themeConfig.colors.text.tertiary} text-xs mb-2`}>音標: {word.phonetic}</div>
                  )}
                  {word.partOfSpeech && (
                    <div className={`${themeConfig.colors.text.tertiary} text-xs mb-2`}>詞性: {word.partOfSpeech}</div>
                  )}
                  <div className={`flex items-center gap-2 ${themeConfig.colors.text.tertiary} text-xs`}>
                    <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full`}></div>
                    {new Date(word.createdAt).toLocaleDateString('zh-TW')}
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
                    onClick={() => handleDeleteWord(word.id)}
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
            <span className={`${themeConfig.colors.text.tertiary} text-xs`}>點擊🔊播放發音 • 點擊🗑️刪除單字 • 使用搜索和篩選功能</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default WordCollection
