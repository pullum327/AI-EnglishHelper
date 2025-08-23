import { useState, useEffect } from 'react'
import { Home, MessageSquare, BookOpen, Settings, Menu, X } from 'lucide-react'
import DifficultySelector from './components/DifficultySelector'
import ModelSelector from './components/ModelSelector'
import DialogueDisplay from './components/DialogueDisplay'
import PracticeExercises from './components/PracticeExercises'
import WordCollection from './components/WordCollection'
import SentenceCollection from './components/SentenceCollection'
import ThemeToggle from './components/ThemeToggle'
import TTSController from './components/TTSController'
import SwipeNavigationIndicator from './components/SwipeNavigationIndicator'
import SwipeHint from './components/SwipeHint'
import ReplyLetterGenerator from './components/ReplyLetterGenerator'
import { MistralService } from './services/mistralService'
import { type DifficultyLevel } from './services/mistralService'
import { useTheme } from './contexts/ThemeContext'
import { ttsService } from './services/ttsService'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'

// 接口定義
interface Word {
  id: string
  word: string
  translation: string
  addedAt: Date
}

interface Sentence {
  id: string
  english: string
  chinese: string
  addedAt: Date
}

// 頁面類型
type PageType = 'home' | 'dialogue' | 'words' | 'sentences' | 'practice' | 'settings'

// 側邊欄菜單項
interface MenuItem {
  id: PageType
  label: string
  icon: React.ReactNode
  description: string
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: '首頁',
    icon: <Home className="w-6 h-6" />,
    description: '快速生成對話和練習'
  },
  {
    id: 'dialogue',
    label: '對話練習',
    icon: <MessageSquare className="w-6 h-6" />,
    description: '查看和管理 AI 對話'
  },
  {
    id: 'words',
    label: '單字本',
    icon: <BookOpen className="w-6 h-6" />,
    description: '管理收藏的單字'
  },
  {
    id: 'sentences',
    label: '句子收藏',
    icon: <BookOpen className="w-6 h-6" />,
    description: '管理收藏的句子'
  },
  {
    id: 'practice',
    label: '練習題',
    icon: <BookOpen className="w-6 h-6" />,
    description: '互動式英語練習'
  },
  {
    id: 'settings',
    label: '設定',
    icon: <Settings className="w-6 h-6" />,
    description: '調整難度和模型設定'
  }
]

function App() {
  // 主題 Hook
  const { themeConfig } = useTheme()
  
  // 頁面狀態
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  const [showSidebar, setShowSidebar] = useState(false)
  
  // 滑動導航
  const { isSwiping, swipeDirection, attachSwipeListeners } = useSwipeNavigation({
    onSwipeLeft: () => {
      // 向左滑動：下一頁
      const pageOrder: PageType[] = ['home', 'dialogue', 'words', 'sentences', 'practice', 'settings']
      const currentIndex = pageOrder.indexOf(currentPage)
      if (currentIndex < pageOrder.length - 1) {
        setCurrentPage(pageOrder[currentIndex + 1])
      }
    },
    onSwipeRight: () => {
      // 向右滑動：上一頁
      const pageOrder: PageType[] = ['home', 'dialogue', 'words', 'sentences', 'practice', 'settings']
      const currentIndex = pageOrder.indexOf(currentPage)
      if (currentIndex > 0) {
        setCurrentPage(pageOrder[currentIndex - 1])
      }
    }
  })
  
  // 對話相關狀態
  const [dialogue, setDialogue] = useState<Array<{
    speaker: string
    text: string
    chinese?: string
    wordTranslations?: { [key: string]: string }
  }>>([])
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('beginner')
  const [selectedModel, setSelectedModel] = useState('mistral-large-latest')
  
  // 自定義輸入和翻譯狀態
  const [customInput, setCustomInput] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState('')
  const [inputMode, setInputMode] = useState<'dialogue' | 'translation' | 'reply-letter'>('dialogue')

  // 單字和句子收藏狀態
  const [words, setWords] = useState<Word[]>([])
  const [sentences, setSentences] = useState<Sentence[]>([])
  const [selectedSentence, setSelectedSentence] = useState<Sentence | null>(null)

  // 冷卻計時器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldownSeconds])

  // 設置滑動手勢監聽器
  useEffect(() => {
    const mainElement = document.querySelector('main')
    if (mainElement) {
      const cleanup = attachSwipeListeners(mainElement)
      return cleanup
    }
  }, [attachSwipeListeners])

  // 初始化 Mistral 服務
  const mistralService = new MistralService(import.meta.env.VITE_MISTRAL_TOKEN || '6BjrhFY5nFujgMhUOKX2QujWCaDBXiTV')

  // 生成對話
  const handleGenerateDialogue = async () => {
    if (cooldownSeconds > 0) return
    
    setIsGeneratingDialogue(true)
    try {
      const newDialogue = await mistralService.generateDialogue(selectedDifficulty)
      setDialogue(newDialogue)
      setCooldownSeconds(30) // 30秒冷卻
      // 自動跳轉到對話頁面
      setCurrentPage('dialogue')
    } catch (error) {
      console.error('生成對話失敗:', error)
    } finally {
      setIsGeneratingDialogue(false)
    }
  }

  // 自定義對話生成
  const handleCustomDialogue = async () => {
    if (!customInput.trim() || cooldownSeconds > 0) return
    
    setIsGeneratingDialogue(true)
    try {
      // 這裡需要調用自定義對話生成 API
      // 暫時使用預設生成
      const newDialogue = await mistralService.generateDialogue(selectedDifficulty)
      setDialogue(newDialogue)
      setCooldownSeconds(30)
      setCustomInput('')
      setCurrentPage('dialogue')
    } catch (error) {
      console.error('生成自定義對話失敗:', error)
    } finally {
      setIsGeneratingDialogue(false)
    }
  }

  // 翻譯文本
  const handleTranslate = async () => {
    if (!customInput.trim()) return
    
    setIsTranslating(true)
    try {
      // 這裡需要調用翻譯 API
      // 暫時模擬翻譯結果
      setTimeout(() => {
        setTranslationResult(`翻譯結果: ${customInput}`)
        setIsTranslating(false)
      }, 1000)
    } catch (error) {
      console.error('翻譯失敗:', error)
      setIsTranslating(false)
    }
  }

  // 清空翻譯
  const handleClearTranslation = () => {
    setCustomInput('')
    setTranslationResult('')
  }

  // 難度點擊處理
  const handleDifficultyClick = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty)
    // 移除自動生成，讓用戶手動點擊生成按鈕
  }

  // 練習完成回調
  const handleExerciseComplete = (exerciseId: string, isCorrect: boolean, userAnswer: string) => {
    console.log('練習完成:', { exerciseId, isCorrect, userAnswer })
  }

  // 收藏單字
  const collectWord = async (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
    if (cleanWord && !words.find(w => w.word.toLowerCase() === cleanWord)) {
      const translation = await mistralService.translateWord(cleanWord, dialogue)
      const newWord: Word = {
        id: Date.now().toString(),
        word: cleanWord,
        translation,
        addedAt: new Date()
      }
      setWords(prev => [newWord, ...prev])
    }
  }

  // 收藏句子
  const collectSentence = async (message: { speaker: string; text: string; chinese?: string }) => {
    if (!sentences.find(s => s.english.toLowerCase() === message.text.toLowerCase())) {
      const chineseTranslation = message.chinese || await translateSentence(message.text)
      
      const newSentence: Sentence = {
        id: `${Date.now()}-${message.speaker}`,
        english: message.text,
        chinese: chineseTranslation,
        addedAt: new Date()
      }
      
      setSentences(prev => [newSentence, ...prev])
    }
  }

  // 使用 AI 生成的句子翻譯
  const translateSentence = async (sentence: string): Promise<string> => {
    // 首先檢查當前對話中是否已有翻譯
    const messageWithTranslation = dialogue.find(msg => msg.text === sentence)
    if (messageWithTranslation && messageWithTranslation.chinese) {
      return messageWithTranslation.chinese
    }
    
    // 如果沒有，使用預設翻譯
    const fallbackTranslations: { [key: string]: string } = {
      "Good morning! How are you today?": "早安！你今天過得如何？",
      "I'm doing well, thank you! How about you?": "我過得很好，謝謝！你呢？",
      "I'm great! What are your plans for today?": "我很棒！你今天有什麼計劃？",
      "I'm going to the library to study. Would you like to join me?": "我要去圖書館讀書。你想和我一起去嗎？",
      "That sounds like a good idea! Let's go together.": "聽起來是個好主意！我們一起去吧。"
    }
    
    return fallbackTranslations[sentence] || "待翻譯"
  }

  // 刪除單字
  const deleteWord = (id: string) => {
    setWords(prev => prev.filter(w => w.id !== id))
  }

  // 刪除句子
  const deleteSentence = (id: string) => {
    setSentences(prev => prev.filter(s => s.id !== id))
    if (selectedSentence?.id === id) {
      setSelectedSentence(null)
    }
  }

  // 播放單字發音
  const speakWord = async (word: string) => {
    try {
      await ttsService.speakWord(word)
    } catch (error) {
      console.error('播放單字失敗:', error)
    }
  }

  // 播放句子發音
  const speakSentence = async (sentence: string) => {
    try {
      await ttsService.speakSentence(sentence)
    } catch (error) {
      console.error('播放句子失敗:', error)
    }
  }

  // 翻譯單字
  const translateWord = async (word: string): Promise<string> => {
    return await mistralService.translateWord(word, dialogue)
  }

  // 渲染首頁
  const renderHomePage = () => (
    <div className="space-y-6 p-4">
      {/* 歡迎標題 */}
      <div className="text-center space-y-4">
        <div className="relative mb-6">
          <div className="text-7xl mb-2">🎯</div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          英語學習助手
        </h1>
        <p className={`${themeConfig.colors.text.secondary} text-lg font-medium`}>AI 驅動的個性化英語學習體驗</p>
        <div className="flex justify-center">
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 gap-4">
        {/* 快速生成對話 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-cyan-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 relative overflow-hidden group`}>
          {/* 卡片背景裝飾 */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" style={{transitionDelay: '0.2s'}}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-400/30">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                快速生成對話
              </h3>
              <p className={`${themeConfig.colors.text.tertiary} text-sm font-medium`}>AI 智能生成英語對話練習</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => handleDifficultyClick(level as DifficultyLevel)}
                  disabled={isGeneratingDialogue || cooldownSeconds > 0}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedDifficulty === level
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                      : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:from-slate-600/50 hover:to-slate-500/50 border ${themeConfig.colors.border.primary} hover:border-cyan-400/40`
                  } ${isGeneratingDialogue || cooldownSeconds > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level === 'beginner' ? '🟢 初級' : level === 'intermediate' ? '🟡 中級' : '🔴 高級'}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleGenerateDialogue}
              disabled={isGeneratingDialogue || cooldownSeconds > 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transform hover:scale-105"
            >
              {isGeneratingDialogue ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  生成中...
                </>
              ) : cooldownSeconds > 0 ? (
                `冷卻中 (${cooldownSeconds}s)`
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  開始生成
                </>
              )}
            </button>
          </div>
          </div>
        </div>

        {/* 自定義輸入 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-emerald-500/10`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                自定義內容
              </h3>
                              <p className={`${themeConfig.colors.text.tertiary} text-sm font-medium`}>輸入您想要練習的內容</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode('dialogue')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === 'dialogue'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:from-slate-600/50 hover:to-slate-500/50 border ${themeConfig.colors.border.primary} hover:border-emerald-400/40`
                }`}
              >
                生成對話
              </button>
              <button
                onClick={() => setInputMode('translation')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === 'translation'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:from-slate-600/50 hover:to-slate-500/50 border ${themeConfig.colors.border.primary} hover:border-emerald-400/40`
                }`}
              >
                翻譯文本
              </button>
              <button
                onClick={() => setInputMode('reply-letter')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === 'reply-letter'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:from-slate-600/50 hover:to-slate-500/50 border ${themeConfig.colors.border.primary} hover:border-emerald-400/40`
                }`}
              >
                回覆信件
              </button>
            </div>
            
            {inputMode === 'reply-letter' ? (
              <ReplyLetterGenerator />
            ) : (
              <>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder={inputMode === 'dialogue' ? '輸入您想要練習的主題或情境...' : '輸入要翻譯的文本...'}
                  className="w-full bg-gradient-to-r from-slate-900/60 to-slate-800/60 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400/70 transition-all duration-200 resize-none backdrop-blur-sm shadow-lg"
                  rows={3}
                />
                
                <button
                  onClick={inputMode === 'dialogue' ? handleCustomDialogue : handleTranslate}
                  disabled={!customInput.trim() || (inputMode === 'dialogue' ? isGeneratingDialogue : isTranslating)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transform hover:scale-105"
                >
                  {inputMode === 'dialogue' ? (
                    isGeneratingDialogue ? '生成中...' : '生成對話'
                  ) : (
                    isTranslating ? '翻譯中...' : '開始翻譯'
                  )}
                </button>
              </>
            )}
            
                          {translationResult && (
                <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 rounded-xl p-4 backdrop-blur-sm shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-200 text-sm font-medium">翻譯結果</span>
                  </div>
                  <div className="text-white mb-3 font-medium">{translationResult}</div>
                  <button
                    onClick={handleClearTranslation}
                    className="text-emerald-300 hover:text-emerald-200 text-sm hover:underline transition-all duration-200 font-medium"
                  >
                    清空結果
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* 練習題入口 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-purple-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-purple-500/10`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-400/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                互動練習
              </h3>
              <p className={`${themeConfig.colors.text.tertiary} text-sm font-medium`}>基於對話內容的練習題</p>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentPage('practice')}
            disabled={dialogue.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transform hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            {dialogue.length === 0 ? '請先生成對話' : '開始練習'}
          </button>
        </div>
      </div>
    </div>
  )

  // 渲染對話頁面
  const renderDialoguePage = () => (
    <div className="space-y-4 p-4">
      <DialogueDisplay 
        dialogue={dialogue}
        onCollectSentence={collectSentence}
        onCollectWord={collectWord}
        onWordTranslate={translateWord}
      />
    </div>
  )

  // 渲染單字本頁面
  const renderWordsPage = () => (
    <div className="space-y-4 p-4">
      <WordCollection
        words={words}
        onSpeakWord={speakWord}
        onDeleteWord={deleteWord}
      />
    </div>
  )

  // 渲染句子收藏頁面
  const renderSentencesPage = () => (
    <div className="space-y-4 p-4">
      <SentenceCollection
        sentences={sentences}
        selectedSentence={selectedSentence}
        dialogue={dialogue}
        onSelectSentence={setSelectedSentence}
        onDeleteSentence={deleteSentence}
        onSpeakSentence={speakSentence}
        onCollectWord={collectWord}
        onWordTranslate={translateWord}
      />
    </div>
  )

  // 渲染練習頁面
  const renderPracticePage = () => (
    <div className="space-y-4 p-4">
      <PracticeExercises
        dialogue={dialogue}
        onExerciseComplete={handleExerciseComplete}
      />
    </div>
  )

  // 渲染設定頁面
  const renderSettingsPage = () => (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-4">
        <div className="relative mb-4">
          <div className="text-5xl mb-2">⚙️</div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-400/20 to-gray-500/20 rounded-full blur-3xl"></div>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent">設定</h2>
        <p className={`${themeConfig.colors.text.tertiary}`}>調整學習參數和偏好設定</p>
        <div className="flex justify-center">
          <div className="w-12 h-1 bg-gradient-to-r from-slate-400 to-gray-500 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 難度設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-slate-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-slate-500/10`}>
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-transparent mb-4">學習難度</h3>
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            difficultyConfigs={mistralService.getDifficultyConfigs()}
            onDifficultyClick={handleDifficultyClick}
          />
        </div>

        {/* 模型設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-slate-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-slate-500/10`}>
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-transparent mb-4">AI 模型</h3>
          <ModelSelector
            currentModel={selectedModel}
            availableModels={mistralService.getAvailableModels()}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* 語音設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-slate-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-slate-500/10`}>
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-transparent mb-4">語音設定</h3>
          <TTSController />
        </div>

        {/* 其他設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border border-slate-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-2xl shadow-slate-500/10`}>
          <h3 className="text-xl font-bold bg-gradient-to-r from-slate-300 to-gray-300 bg-clip-text text-transparent mb-4">其他設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${themeConfig.colors.text.secondary}`}>自動播放語音</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gradient-to-r from-slate-600 to-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-slate-500 peer-checked:from-slate-500 peer-checked:to-gray-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className={`${themeConfig.colors.text.secondary}`}>顯示中文翻譯</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gradient-to-r from-slate-600 to-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-slate-500 peer-checked:to-gray-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染當前頁面內容
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return renderHomePage()
      case 'dialogue':
        return renderDialoguePage()
      case 'words':
        return renderWordsPage()
      case 'sentences':
        return renderSentencesPage()
      case 'practice':
        return renderPracticePage()
      case 'settings':
        return renderSettingsPage()
      default:
        return renderHomePage()
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.background.primary} ${themeConfig.colors.text.primary} relative overflow-hidden`}>
      {/* 動態背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 左上角光暈 */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* 右上角光暈 */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* 左下角光暈 */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* 右下角光暈 */}
        <div className="absolute -bottom-40 -right-40 w-64 h-64 bg-gradient-to-br from-orange-500/20 via-yellow-500/20 to-amber-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '6s'}}></div>
        
        {/* 中央光暈 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-slate-600/10 via-slate-500/10 to-slate-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* 網格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* 動態粒子效果 */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      {/* 頂部導航欄 */}
      <header className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} backdrop-blur-xl border-b ${themeConfig.colors.border.primary} sticky top-0 z-50 shadow-lg`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className={`p-2 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-500/30`}
            >
              <Menu className={`w-6 h-6 ${themeConfig.colors.text.secondary}`} />
            </button>
            <h1 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>
              英語學習助手
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentPage !== 'home' && (
              <button
                onClick={() => setCurrentPage('home')}
                className={`p-2 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-500/30`}
              >
                <Home className={`w-6 h-6 ${themeConfig.colors.text.secondary}`} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 側邊欄 */}
      {showSidebar && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className={`absolute left-0 top-0 h-full w-80 bg-gradient-to-b ${themeConfig.colors.background.tertiary} border-r ${themeConfig.colors.border.primary} shadow-2xl backdrop-blur-xl`}>
            <div className={`flex items-center justify-between p-4 border-b ${themeConfig.colors.border.primary}`}>
              <h2 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>導航選單</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className={`p-2 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-500/30`}
              >
                <X className={`w-6 h-6 ${themeConfig.colors.text.secondary}`} />
              </button>
            </div>
            
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setShowSidebar(false)
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                      : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/40 hover:text-slate-200 border border-transparent hover:border-slate-500/30'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-cyan-400/20 to-blue-400/20'
                      : 'bg-gradient-to-r from-slate-700/40 to-slate-600/40'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-slate-300">{item.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* 主要內容區域 */}
      <main className="pb-20">
        {renderCurrentPage()}
      </main>

      {/* 滑動導航指示器 */}
      <SwipeNavigationIndicator 
        swipeDirection={swipeDirection}
        isSwiping={isSwiping}
      />

      {/* 滑動提示 */}
      <SwipeHint />

      {/* 底部導航欄 */}
      <nav className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${themeConfig.colors.background.tertiary} backdrop-blur-xl border-t ${themeConfig.colors.border.primary} z-40 shadow-lg`}>
        <div className="flex justify-around py-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                currentPage === item.id
                  ? 'text-cyan-200 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-gradient-to-r hover:from-slate-700/40 hover:to-slate-600/40 border border-transparent hover:border-slate-500/30'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App