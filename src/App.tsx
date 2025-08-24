import { useState, useEffect, lazy, Suspense } from 'react'
import { Home, MessageSquare, BookOpen, Settings } from 'lucide-react'
import DifficultySelector from './components/DifficultySelector'
import ModelSelector from './components/ModelSelector'
import DialogueDisplay from './components/DialogueDisplay'
import ThemeToggle from './components/ThemeToggle'
import TTSController from './components/TTSController'
import SwipeNavigationIndicator from './components/SwipeNavigationIndicator'
import SwipeHint from './components/SwipeHint'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import BottomNavigation from './components/BottomNavigation'
import NotificationSystem from './components/NotificationSystem'
import DynamicBackground from './components/DynamicBackground'
import { MistralService } from './services/mistralService'
import { type DifficultyLevel } from './services/mistralService'
import { useTheme } from './contexts/ThemeContext'
import { ttsService } from './services/ttsService'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'
import { useNotifications } from './hooks/useNotifications'
import DatabaseService from './services/databaseService'
import type { PageType, MenuItem, Word, Sentence, DialogueMessage } from './types'

// 懶加載頁面組件
const HomePage = lazy(() => import('./components/HomePage'))
const PracticeExercises = lazy(() => import('./components/PracticeExercises'))
const WordCollection = lazy(() => import('./components/WordCollection'))
const SentenceCollection = lazy(() => import('./components/SentenceCollection'))

// 加載中組件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">載入中...</span>
  </div>
)

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
  
  // 通知系統
  const { notifications, showNotification, removeNotification } = useNotifications()
  
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
    },
    config: {
      minSwipeDistance: 80,
      maxSwipeTime: 500,
      preventDefault: false
    }
  })

  // 預加載策略：當用戶懸停在導航項目上時預加載相關組件
  const preloadComponent = (page: PageType) => {
    switch (page) {
      case 'home':
        import('./components/HomePage')
        break
      case 'practice':
        import('./components/PracticeExercises')
        break
      case 'words':
        import('./components/WordCollection')
        break
      case 'sentences':
        import('./components/SentenceCollection')
        break
      default:
        break
    }
  }
  
  // 對話相關狀態
  const [dialogue, setDialogue] = useState<DialogueMessage[]>([])
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
  // @ts-ignore
  const [words, setWords] = useState<Word[]>([])
  // @ts-ignore
  const [sentences, setSentences] = useState<Sentence[]>([])
  // @ts-ignore
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
      // 調用自定義對話生成 API
      const newDialogue = await mistralService.generateCustomDialogue(customInput, selectedDifficulty)
      setDialogue(newDialogue)
      setCooldownSeconds(30)
      setCustomInput('')
      setCurrentPage('dialogue')
      showNotification('✅ 自定義對話生成成功！', 'success')
    } catch (error) {
      console.error('生成自定義對話失敗:', error)
      showNotification('❌ 自定義對話生成失敗，請稍後再試', 'error')
    } finally {
      setIsGeneratingDialogue(false)
    }
  }

  // 翻譯文本
  const handleTranslate = async () => {
    if (!customInput.trim()) return
    
    setIsTranslating(true)
    try {
      // 調用翻譯 API
      const translation = await mistralService.translateText(customInput)
      setTranslationResult(translation)
      showNotification('✅ 翻譯完成！', 'success')
    } catch (error) {
      console.error('翻譯失敗:', error)
      setTranslationResult('翻譯失敗，請稍後再試')
      showNotification('❌ 翻譯失敗，請稍後再試', 'error')
    } finally {
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
    if (cleanWord) {
      try {
        // 檢查單字是否已經存在
        const existingWords = await DatabaseService.getWords()
        if (existingWords.success && existingWords.data) {
          const wordExists = existingWords.data.find(w => w.word.toLowerCase() === cleanWord)
          if (wordExists) {
            showNotification(`ℹ️ "${cleanWord}" 已在單字本中`, 'info')
            return
          }
        }

        // 獲取翻譯
        const translation = await mistralService.translateWord(cleanWord, dialogue)
        
        // 使用 DatabaseService 創建單字
        const result = await DatabaseService.createWord({
          word: cleanWord,
          translation,
          difficulty: 'BEGINNER' // 默認設為初級
        })

        if (result.success && result.data) {
          // 更新本地狀態 - 轉換為 App 中使用的 Word 類型
          const appWord: Word = {
            id: result.data.id,
            word: result.data.word,
            translation: result.data.translation,
            phonetic: result.data.phonetic,
            partOfSpeech: result.data.partOfSpeech,
            difficulty: result.data.difficulty,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt
          }
          setWords(prev => [appWord, ...prev])
          showNotification(`✅ "${cleanWord}" 已收藏到單字本`, 'success')
        } else {
          showNotification(`❌ 收藏 "${cleanWord}" 失敗: ${result.error}`, 'error')
        }
      } catch (error) {
        console.error('收藏單字失敗:', error)
        showNotification(`❌ 收藏 "${cleanWord}" 失敗`, 'error')
      }
    }
  }

  // 收藏句子
  const collectSentence = async (message: { speaker: string; text: string; chinese?: string }) => {
    try {
      // 檢查句子是否已經存在
      const existingSentences = await DatabaseService.getSentences()
      if (existingSentences.success && existingSentences.data) {
        const sentenceExists = existingSentences.data.find(s => s.english.toLowerCase() === message.text.toLowerCase())
        if (sentenceExists) {
          showNotification(`ℹ️ 句子已在收藏中`, 'info')
          return
        }
      }

      const chineseTranslation = message.chinese || await translateSentence(message.text)
      
      // 使用 DatabaseService 創建句子
      const result = await DatabaseService.createSentence({
        english: message.text,
        chinese: chineseTranslation,
        difficulty: 'BEGINNER' // 默認設為初級
      })

      if (result.success && result.data) {
        // 更新本地狀態 - 轉換為 App 中使用的 Sentence 類型
        const appSentence: Sentence = {
          id: result.data.id,
          english: result.data.english,
          chinese: result.data.chinese,
          difficulty: result.data.difficulty,
          category: result.data.category,
          tags: result.data.tags,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        }
        setSentences(prev => [appSentence, ...prev])
        showNotification(`✅ 句子已收藏成功`, 'success')
      } else {
        showNotification(`❌ 收藏句子失敗: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('收藏句子失敗:', error)
      showNotification(`❌ 收藏句子失敗`, 'error')
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
    <Suspense fallback={<LoadingSpinner />}>
      <HomePage
        selectedDifficulty={selectedDifficulty}
        selectedModel={selectedModel}
        customInput={customInput}
        isGeneratingDialogue={isGeneratingDialogue}
        cooldownSeconds={cooldownSeconds}
        inputMode={inputMode}
        translationResult={translationResult}
        isTranslating={isTranslating}
        dialogue={dialogue}
        onDifficultyClick={handleDifficultyClick}
        onGenerateDialogue={handleGenerateDialogue}
        onCustomInputChange={setCustomInput}
        onInputModeChange={setInputMode}
        onCustomDialogue={handleCustomDialogue}
        onTranslate={handleTranslate}
        onClearTranslation={handleClearTranslation}
        onNavigate={setCurrentPage}
      />
    </Suspense>
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
    <Suspense fallback={<LoadingSpinner />}>
      <WordCollection
        onSpeakWord={speakWord}
      />
    </Suspense>
  )

  // 渲染句子收藏頁面
  const renderSentencesPage = () => (
    <Suspense fallback={<LoadingSpinner />}>
      <SentenceCollection
        dialogue={dialogue}
        onSpeakSentence={speakSentence}
        onCollectWord={collectWord}
        onWordTranslate={translateWord}
      />
    </Suspense>
  )

  // 渲染練習頁面
  const renderPracticePage = () => (
    <Suspense fallback={<LoadingSpinner />}>
      <PracticeExercises
        dialogue={dialogue}
        onExerciseComplete={handleExerciseComplete}
      />
    </Suspense>
  )

  // 渲染設定頁面
  const renderSettingsPage = () => (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-4">
        <div className="relative mb-4">
          <div className="text-5xl mb-2">⚙️</div>
          <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-full blur-3xl`}></div>
        </div>
        <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.slate} bg-clip-text text-transparent`}>設定</h2>
        <p className={`${themeConfig.colors.text.tertiary}`}>調整學習參數和偏好設定</p>
        <div className="flex justify-center">
          <div className={`w-12 h-1 bg-gradient-to-r ${themeConfig.colors.gradient.slate} rounded-full`}></div>
        </div>
      </div>

      <div className="space-y-6">
        {/* 難度設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
          <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.slate} bg-clip-text text-transparent mb-4`}>學習難度</h3>
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            difficultyConfigs={mistralService.getDifficultyConfigs()}
            onDifficultyClick={handleDifficultyClick}
          />
        </div>

        {/* 模型設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
          <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.slate} bg-clip-text text-transparent mb-4`}>AI 模型</h3>
          <ModelSelector
            currentModel={selectedModel}
            availableModels={mistralService.getAvailableModels()}
            onModelChange={setSelectedModel}
          />
        </div>

        {/* 語音設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
          <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.slate} bg-clip-text text-transparent mb-4`}>語音設定</h3>
          <TTSController />
        </div>

        {/* 其他設定 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
          <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.slate} bg-clip-text text-transparent mb-4`}>其他設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`${themeConfig.colors.text.primary} font-medium`}>主題切換</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className={`${themeConfig.colors.text.primary} font-medium`}>滑動導航</span>
              <div className="flex items-center gap-2">
                <span className={`${themeConfig.colors.text.tertiary} text-sm`}>啟用</span>
                <div className={`w-3 h-3 ${themeConfig.colors.text.accent} rounded-full`}></div>
              </div>
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
    <div className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.background.primary} ${themeConfig.colors.background.secondary} relative overflow-hidden`}>
      {/* 動態背景 */}
      <DynamicBackground />

      {/* 通知系統 */}
      <NotificationSystem 
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />

      {/* 頂部導航欄 */}
      <Header 
        currentPage={currentPage}
        onShowSidebar={() => setShowSidebar(true)}
        onNavigateHome={() => setCurrentPage('home')}
      />

      {/* 側邊欄 */}
      <Sidebar 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        menuItems={menuItems}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onPreload={preloadComponent}
      />

      {/* 主要內容區域 */}
      <main className="pb-20 min-h-screen overflow-y-auto">
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
      <BottomNavigation 
        menuItems={menuItems}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onPreload={preloadComponent}
      />
    </div>
  )
}

export default App