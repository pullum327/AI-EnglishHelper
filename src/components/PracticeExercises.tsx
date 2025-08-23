import { useState } from 'react'
import { RotateCcw, Play, Pause, Volume2, CheckCircle, XCircle, Trophy, Star } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { ttsService } from '../services/ttsService'
import { mistralService } from '../services/mistralService'

interface PracticeExercise {
  id: string
  type: 'fill-blank' | 'listening' | 'word-matching' | 'sentence-reconstruction' | 'reading-comprehension'
  question: string
  answer: string
  options?: string[]
  audioText?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  points: number
}

interface ReadingPassage {
  id: string
  title: string
  content: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  questions: ReadingQuestion[]
}

interface ReadingQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

interface ExerciseResult {
  exerciseId: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  points: number
  timeSpent: number
}

interface PracticeExercisesProps {
  dialogue: Array<{
    speaker: string
    text: string
    chinese?: string
    wordTranslations?: { [key: string]: string }
  }>
  onExerciseComplete: (exerciseId: string, isCorrect: boolean, userAnswer: string) => void
}

const PracticeExercises = ({ dialogue, onExerciseComplete }: PracticeExercisesProps) => {
  const { themeConfig } = useTheme()
  const [exercises, setExercises] = useState<PracticeExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioSpeed, setAudioSpeed] = useState(1)
  const [results, setResults] = useState<ExerciseResult[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [sentenceBuilder, setSentenceBuilder] = useState<string[]>([])
  const [draggedWord, setDraggedWord] = useState<string | null>(null)
  const [draggedFromBuilder, setDraggedFromBuilder] = useState<boolean>(false)
  const [dropZoneActive, setDropZoneActive] = useState<boolean>(false)
  const [insertIndex, setInsertIndex] = useState<number>(-1)
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingTouch, setIsDraggingTouch] = useState<boolean>(false)
  
  // 閱讀理解相關狀態
  const [readingPassage, setReadingPassage] = useState<ReadingPassage | null>(null)
  const [isGeneratingReading, setIsGeneratingReading] = useState(false)
  const [readingDifficulty, setReadingDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  
  // SSE 串流狀態
  const [streamingTitle, setStreamingTitle] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingQuestions, setStreamingQuestions] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  
  // 移除調試日誌，這些變量現在會被實際使用
  
  // 使用已導出的 MistralService 實例


  // 生成閱讀理解（帶 SSE 支持）
  const generateReadingComprehension = async () => {
    setIsGeneratingReading(true)
    setIsStreaming(true)
    
    // 重置串流狀態
    setStreamingTitle('')
    setStreamingContent('')
    setStreamingQuestions('')
    
    try {
      // 嘗試使用 SSE 串流生成
      try {
        const streamGenerator = mistralService.generateReadingComprehensionStream(
          readingDifficulty,
          (chunk, type) => {
            console.log(`收到 ${type} 片段:`, chunk)
            // 實時更新串流內容
            switch (type) {
              case 'title':
                setStreamingTitle(prev => prev + chunk)
                break
              case 'content':
                setStreamingContent(prev => prev + chunk)
                break
              case 'questions':
                setStreamingQuestions(prev => prev + chunk)
                break
            }
          }
        )
        
        for await (const update of streamGenerator) {
          if (update.type === 'complete') {
            // 完成生成
            const apiResponse = update.data as {
              title: string
              content: string
              questions: Array<{
                question: string
                options: string[]
                correctAnswer: string
                explanation?: string
              }>
            }
            
            const passage: ReadingPassage = {
              id: `reading-${Date.now()}`,
              title: apiResponse.title,
              content: apiResponse.content,
              difficulty: readingDifficulty,
              questions: apiResponse.questions.map((q, index) => ({
                id: `question-${index}`,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
              }))
            }
            
            setReadingPassage(passage)
            
            // 將閱讀理解題目添加到練習題中
            const readingExercises = passage.questions.map((q, index) => ({
              id: `reading-${passage.id}-${index}`,
              type: 'reading-comprehension' as const,
              question: q.question,
              answer: q.correctAnswer,
              options: q.options,
              difficulty: readingDifficulty,
              points: 15
            }))
            
            setExercises(readingExercises)
            setCurrentExerciseIndex(0)
            setUserAnswers({})
            setShowResults(false)
            setScore(0)
            setResults([])
            setStartTime(Date.now())
            break
          }
        }
      } catch (streamError) {
        console.warn('串流生成失敗，回退到普通模式:', streamError)
        // 回退到普通生成
        const apiResponse = await mistralService.generateReadingComprehension(readingDifficulty)
        
        const passage: ReadingPassage = {
          id: `reading-${Date.now()}`,
          title: apiResponse.title,
          content: apiResponse.content,
          difficulty: readingDifficulty,
          questions: apiResponse.questions.map((q, index) => ({
            id: `question-${index}`,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        }
        
        setReadingPassage(passage)
        
        const readingExercises = passage.questions.map((q, index) => ({
          id: `reading-${passage.id}-${index}`,
          type: 'reading-comprehension' as const,
          question: q.question,
          answer: q.correctAnswer,
          options: q.options,
          difficulty: readingDifficulty,
          points: 15
        }))
        
        setExercises(readingExercises)
        setCurrentExerciseIndex(0)
        setUserAnswers({})
        setShowResults(false)
        setScore(0)
        setResults([])
        setStartTime(Date.now())
      }
      
    } catch (error) {
      console.error('生成閱讀理解失敗:', error)
      
      // 提供更詳細的錯誤信息
      let errorMessage = '生成閱讀理解失敗，請稍後再試。'
      if (error instanceof Error) {
        if (error.message.includes('429') || error.message.includes('capacity exceeded')) {
          errorMessage = 'API 使用量已達上限，請稍後再試或聯繫管理員。'
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'API 調用頻率過高，請稍候幾分鐘後再試。'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '網絡連接問題，請檢查網絡設置後再試。'
        }
      }
      
      alert(errorMessage)
    } finally {
      // 清空串流狀態
      setStreamingTitle('')
      setStreamingContent('')
      setStreamingQuestions('')
      setIsGeneratingReading(false)
      setIsStreaming(false)
    }
  }



  // 生成練習題
  const generateExercises = () => {
    if (dialogue.length === 0) return

    const newExercises: PracticeExercise[] = []
    const words = new Set<string>()
    const usedSentences = new Set<string>()
    const usedWords = new Set<string>()
    
    // 收集所有單字
    dialogue.forEach(message => {
      if (message.wordTranslations) {
        Object.keys(message.wordTranslations).forEach(word => words.add(word))
      }
    })

    const wordArray = Array.from(words)
    const availableMessages = dialogue.filter(message => message.text.length > 10) // 過濾太短的句子
    
    // 生成練習題，確保不重複
    let attempts = 0
    const maxAttempts = 100 // 防止無限循環
    
    while (newExercises.length < Math.min(10, Math.min(dialogue.length * 2, wordArray.length * 2)) && attempts < maxAttempts) {
      attempts++
      
      const exerciseType = Math.floor(Math.random() * 4)
      let randomMessage: any
      let randomWord: string
      
      // 智能選擇未使用的句子和單字
      const unusedMessages = availableMessages.filter(msg => !usedSentences.has(msg.text))
      const unusedWords = wordArray.filter((word: string) => !usedWords.has(word))
      
      if (unusedMessages.length === 0 || unusedWords.length === 0) {
        // 如果沒有未使用的內容，重置使用狀態
        usedSentences.clear()
        usedWords.clear()
        continue
      }
      
      randomMessage = unusedMessages[Math.floor(Math.random() * unusedMessages.length)]
      randomWord = unusedWords[Math.floor(Math.random() * unusedWords.length)]
      
      if (!randomWord || !randomMessage) continue
      
      let exercise: PracticeExercise | null = null

      switch (exerciseType) {
        case 0: // 填空題
          if (randomMessage.text.includes(randomWord)) {
            exercise = {
              id: `exercise-${Date.now()}-${Math.random()}`,
              type: 'fill-blank',
              question: randomMessage.text.replace(new RegExp(randomWord, 'gi'), '_____'),
              answer: randomWord,
              options: generateOptions(randomWord, wordArray),
              difficulty: 'beginner',
              points: 10
            }
            usedSentences.add(randomMessage.text)
            usedWords.add(randomWord)
          }
          break

        case 1: // 聽力練習
          exercise = {
            id: `exercise-${Date.now()}-${Math.random()}`,
            type: 'listening',
            question: '聽聽看，填入正確的單字：',
            answer: randomWord,
            audioText: randomWord,
            difficulty: 'intermediate',
            points: 15
          }
          usedWords.add(randomWord)
          break

        case 2: // 單字配對
          // 檢查單字是否有中文翻譯，如果沒有則跳過
          const translation = randomMessage.wordTranslations?.[randomWord]
          if (!translation) {
            continue // 跳過沒有翻譯的單字
          }
          
          exercise = {
            id: `exercise-${Date.now()}-${Math.random()}`,
            type: 'word-matching',
            question: `將 "${randomWord}" 與正確的中文翻譯配對：`,
            answer: translation,
            options: generateTranslationOptions(randomWord, randomMessage.wordTranslations || {}, dialogue),
            difficulty: 'beginner',
            points: 10
          }
          usedWords.add(randomWord)
          break

        case 3: // 句子重組
          const sentenceWords = randomMessage.text.split(' ').filter((word: string) => word.length > 0)
          if (sentenceWords.length >= 3 && !usedSentences.has(randomMessage.text)) {
            const shuffledWords = [...sentenceWords].sort(() => Math.random() - 0.5)
            exercise = {
              id: `exercise-${Date.now()}-${Math.random()}`,
              type: 'sentence-reconstruction',
              question: '重新排列單字，組成正確的句子：',
              answer: randomMessage.text,
              options: shuffledWords,
              difficulty: 'advanced',
              points: 20
            }
            usedSentences.add(randomMessage.text)
          }
          break
      }
      
      if (exercise) {
        newExercises.push(exercise)
      }
    }

    setExercises(newExercises)
    setCurrentExerciseIndex(0)
    setUserAnswers({})
    setShowResults(false)
    setScore(0)
    setResults([])
    setStartTime(Date.now())
    setUsedWords([])
    setSentenceBuilder([])
  }

  // 生成選項
  const generateOptions = (correctAnswer: string, allWords: string[]): string[] => {
    const options = [correctAnswer]
    const filteredWords = allWords.filter(word => 
      word !== correctAnswer && 
      word.length > 2 && 
      word.toLowerCase() !== correctAnswer.toLowerCase()
    )
    
    while (options.length < 4 && filteredWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length)
      const randomWord = filteredWords.splice(randomIndex, 1)[0]
      if (!options.includes(randomWord)) {
        options.push(randomWord)
      }
    }

    // 如果選項不足，添加一些常見單字
    const commonWords = ['the', 'is', 'are', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by']
    while (options.length < 4) {
      const randomWord = commonWords[Math.floor(Math.random() * commonWords.length)]
      if (!options.includes(randomWord)) {
        options.push(randomWord)
      }
    }

    return options.sort(() => Math.random() - 0.5)
  }

  // 生成翻譯選項
  const generateTranslationOptions = (word: string, translations: { [key: string]: string }, allDialogue: any[]): string[] => {
    const correctTranslation = translations[word]
    if (!correctTranslation) {
      return [] // 如果沒有翻譯，返回空數組
    }
    
    const options = [correctTranslation]
    
    // 從所有對話的翻譯中隨機選擇
    const allTranslations = new Set<string>()
    allDialogue.forEach(message => {
      if (message.wordTranslations) {
        Object.values(message.wordTranslations).forEach((translation) => {
          if (typeof translation === 'string' && translation !== correctTranslation && translation.length > 0) {
            allTranslations.add(translation)
          }
        })
      }
    })

    const otherTranslations = Array.from(allTranslations)
    while (options.length < 4 && otherTranslations.length > 0) {
      const randomTranslation = otherTranslations.splice(Math.floor(Math.random() * otherTranslations.length), 1)[0]
      if (!options.includes(randomTranslation)) {
        options.push(randomTranslation)
      }
    }

    // 如果選項不足，添加一些常見翻譯
    const commonTranslations = ['是', '的', '在', '和', '或', '但是', '有', '沒有', '可以', '不能', '很', '非常']
    while (options.length < 4) {
      const randomWord = commonTranslations[Math.floor(Math.random() * commonTranslations.length)]
      if (!options.includes(randomWord)) {
        options.push(randomWord)
      }
    }

    return options.sort(() => Math.random() - 0.5)
  }

  // 播放語音
  const playAudio = async (text: string) => {
    try {
      setIsPlaying(true)
      await ttsService.speak({
        text,
        lang: 'en-US',
        rate: audioSpeed
      })
      setIsPlaying(false)
    } catch (error) {
      console.error('播放語音失敗:', error)
      setIsPlaying(false)
    }
  }

  // 停止語音
  const stopAudio = () => {
    ttsService.stop()
    setIsPlaying(false)
  }

  // 提交答案
  const submitAnswer = () => {
    const currentExercise = exercises[currentExerciseIndex]
    if (!currentExercise) return

    const userAnswer = userAnswers[currentExercise.id] || ''
    const isCorrect = checkAnswer(currentExercise, userAnswer)
    const timeSpent = Date.now() - startTime
    
    const result: ExerciseResult = {
      exerciseId: currentExercise.id,
      isCorrect,
      userAnswer,
      correctAnswer: currentExercise.answer,
      points: isCorrect ? currentExercise.points : 0,
      timeSpent
    }

    setResults(prev => [...prev, result])
    
    if (isCorrect) {
      setScore(prev => prev + currentExercise.points)
    }

    onExerciseComplete(currentExercise.id, isCorrect, userAnswer)

    // 下一題或顯示結果
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
      setStartTime(Date.now())
      setUsedWords([])
      setSentenceBuilder([])
    } else {
      setShowResults(true)
    }
  }

  // 檢查答案
  const checkAnswer = (exercise: PracticeExercise, userAnswer: string): boolean => {
    const normalizeAnswer = (answer: string) => answer.toLowerCase().trim().replace(/[.,!?;]/g, '')
    
    switch (exercise.type) {
      case 'sentence-reconstruction':
        return normalizeAnswer(userAnswer) === normalizeAnswer(exercise.answer)
      default:
        return normalizeAnswer(userAnswer) === normalizeAnswer(exercise.answer)
    }
  }

  // 觸控友好的單字處理
  const handleWordSelect = (word: string) => {
    const currentExercise = exercises[currentExerciseIndex]
    if (currentExercise?.type === 'sentence-reconstruction') {
      // 如果單字已經被使用，則從句子構建器中移除
      if (usedWords.includes(word)) {
        const newBuilder = sentenceBuilder.filter(w => w !== word)
        setSentenceBuilder(newBuilder)
        setUsedWords(prev => prev.filter(w => w !== word))
        
        const newSentence = newBuilder.join(' ')
        setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
      } else {
        // 如果單字未被使用，則添加到句子構建器
        setSentenceBuilder(prev => [...prev, word])
        setUsedWords(prev => [...prev, word])
        
        const newSentence = [...sentenceBuilder, word].join(' ')
        setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
      }
    }
  }

  const handleWordRemove = (word: string) => {
    const currentExercise = exercises[currentExerciseIndex]
    if (currentExercise?.type === 'sentence-reconstruction') {
      const newBuilder = sentenceBuilder.filter(w => w !== word)
      setSentenceBuilder(newBuilder)
      setUsedWords(prev => prev.filter(w => w !== word))
      
      const newSentence = newBuilder.join(' ')
      setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
    }
  }

  // 拖拽處理函數
  const handleDragStart = (e: React.DragEvent, word: string, fromBuilder: boolean = false) => {
    setDraggedWord(word)
    setDraggedFromBuilder(fromBuilder)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', word)
    
    // 設置拖拽影像樣式
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedWord(null)
    setDraggedFromBuilder(false)
    setDropZoneActive(false)
    
    // 重置拖拽影像樣式
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropZoneActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // 只有當離開整個區域時才重置
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropZoneActive(false)
    }
  }

  const handleDropToBuilder = (e: React.DragEvent) => {
    e.preventDefault()
    setDropZoneActive(false)
    setInsertIndex(-1)
    
    const word = e.dataTransfer.getData('text/plain')
    if (!word || !draggedWord) return

    const currentExercise = exercises[currentExerciseIndex]
    if (currentExercise?.type === 'sentence-reconstruction') {
      if (draggedFromBuilder) {
        // 如果是從句子構建器內部拖拽，重新排列
        const currentIndex = sentenceBuilder.indexOf(word)
        const targetIndex = insertIndex >= 0 ? insertIndex : sentenceBuilder.length
        
        if (currentIndex !== targetIndex && currentIndex !== -1) {
          const newBuilder = [...sentenceBuilder]
          newBuilder.splice(currentIndex, 1)
          newBuilder.splice(targetIndex > currentIndex ? targetIndex - 1 : targetIndex, 0, word)
          setSentenceBuilder(newBuilder)
          
          const newSentence = newBuilder.join(' ')
          setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
        }
      } else {
        // 從選項區域拖拽到構建器
        if (insertIndex >= 0 && insertIndex < sentenceBuilder.length) {
          // 插入到指定位置
          const newBuilder = [...sentenceBuilder]
          newBuilder.splice(insertIndex, 0, word)
          setSentenceBuilder(newBuilder)
          setUsedWords(prev => [...prev, word])
          
          const newSentence = newBuilder.join(' ')
          setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
        } else {
          // 添加到末尾
          handleWordSelect(word)
        }
      }
    }
  }

  const handleWordDropZone = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setInsertIndex(index)
  }

  const handleDropToOptions = (e: React.DragEvent) => {
    e.preventDefault()
    setDropZoneActive(false)
    
    const word = e.dataTransfer.getData('text/plain')
    if (!word || !draggedWord) return

    const currentExercise = exercises[currentExerciseIndex]
    if (currentExercise?.type === 'sentence-reconstruction' && draggedFromBuilder) {
      // 從句子構建器拖拽回選項區域
      handleWordRemove(word)
    }
  }

  // 觸控拖拽處理函數
  const handleTouchStart = (e: React.TouchEvent, word: string, fromBuilder: boolean = false) => {
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggedWord(word)
    setDraggedFromBuilder(fromBuilder)
    setIsDraggingTouch(false)
    setDropZoneActive(false)
    setInsertIndex(-1)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos || !draggedWord) return
    
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)
    
    // 檢測是否是拖拽手勢（移動距離超過閾值）
    if (deltaX > 15 || deltaY > 15) {
      setIsDraggingTouch(true)
      setDropZoneActive(true)
      
      // 如果是在句子構建器內拖拽，計算最佳插入位置
      if (draggedFromBuilder) {
        const builderElement = document.querySelector('[data-drop-zone="builder"]')
        if (builderElement) {
          const rect = builderElement.getBoundingClientRect()
          const relativeX = touch.clientX - rect.left
          const relativeY = touch.clientY - rect.top
          
          // 檢查是否在構建器區域內
          if (relativeX >= 0 && relativeX <= rect.width && relativeY >= 0 && relativeY <= rect.height) {
            // 計算插入位置
            const wordElements = builderElement.querySelectorAll('[data-word-element]')
            let bestInsertIndex = sentenceBuilder.length
            
            for (let i = 0; i < wordElements.length; i++) {
              const wordRect = wordElements[i].getBoundingClientRect()
              const wordCenterX = wordRect.left + wordRect.width / 2
              
              if (touch.clientX < wordCenterX) {
                bestInsertIndex = i
                break
              }
            }
            
            setInsertIndex(bestInsertIndex)
          } else {
            // 拖拽到構建器外部，準備移除
            setInsertIndex(-1)
          }
        }
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos || !draggedWord) {
      setTouchStartPos(null)
      setDraggedWord(null)
      setDraggedFromBuilder(false)
      setIsDraggingTouch(false)
      setDropZoneActive(false)
      setInsertIndex(-1)
      return
    }

    const touch = e.changedTouches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.y)
    
    // 如果是拖拽手勢（移動距離超過閾值）
    if (deltaX > 15 || deltaY > 15) {
      const currentExercise = exercises[currentExerciseIndex]
      if (currentExercise?.type === 'sentence-reconstruction') {
        
        if (draggedFromBuilder) {
          // 從句子構建器內拖拽
          const builderElement = document.querySelector('[data-drop-zone="builder"]')
          if (builderElement) {
            const rect = builderElement.getBoundingClientRect()
            const relativeX = touch.clientX - rect.left
            const relativeY = touch.clientY - rect.top
            
            // 檢查是否還在構建器區域內
            if (relativeX >= 0 && relativeX <= rect.width && relativeY >= 0 && relativeY <= rect.height) {
              // 在構建器內重新排序
              const currentIndex = sentenceBuilder.indexOf(draggedWord)
              let targetIndex = insertIndex >= 0 ? insertIndex : sentenceBuilder.length
              
              if (currentIndex !== -1 && targetIndex !== currentIndex) {
                const newBuilder = [...sentenceBuilder]
                newBuilder.splice(currentIndex, 1)
                
                // 調整目標索引
                if (targetIndex > currentIndex) {
                  targetIndex -= 1
                }
                
                newBuilder.splice(targetIndex, 0, draggedWord)
                setSentenceBuilder(newBuilder)
                
                const newSentence = newBuilder.join(' ')
                setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
              }
            } else {
              // 拖拽到構建器外部，移除單字
              handleWordRemove(draggedWord)
            }
          }
        } else {
          // 從選項區域拖拽到構建器
          const builderElement = document.querySelector('[data-drop-zone="builder"]')
          if (builderElement) {
            const rect = builderElement.getBoundingClientRect()
            const relativeX = touch.clientX - rect.left
            const relativeY = touch.clientY - rect.top
            
            // 檢查是否拖拽到構建器區域
            if (relativeX >= 0 && relativeX <= rect.width && relativeY >= 0 && relativeY <= rect.height) {
              // 根據插入位置添加單字
              if (insertIndex >= 0 && insertIndex < sentenceBuilder.length) {
                const newBuilder = [...sentenceBuilder]
                newBuilder.splice(insertIndex, 0, draggedWord)
                setSentenceBuilder(newBuilder)
                setUsedWords(prev => [...prev, draggedWord])
                
                const newSentence = newBuilder.join(' ')
                setUserAnswers(prev => ({ ...prev, [currentExercise.id]: newSentence }))
              } else {
                // 添加到末尾
                handleWordSelect(draggedWord)
              }
            }
          }
        }
      }
    }

    // 重置狀態
    setTouchStartPos(null)
    setDraggedWord(null)
    setDraggedFromBuilder(false)
    setIsDraggingTouch(false)
    setDropZoneActive(false)
    setInsertIndex(-1)
  }

  // 渲染練習題
  const renderExercise = (exercise: PracticeExercise) => {
    switch (exercise.type) {
      case 'fill-blank':
        return (
          <div className="space-y-4">
            <div className={`text-lg ${themeConfig.colors.text.primary} font-medium mb-4`}>{exercise.question}</div>
            <div className="grid grid-cols-2 gap-3">
              {exercise.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswers(prev => ({ ...prev, [exercise.id]: option }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                    userAnswers[exercise.id] === option
                      ? `bg-gradient-to-r ${themeConfig.colors.gradient.blue} text-white border-transparent shadow-lg`
                      : `bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} ${themeConfig.colors.border.primary} hover:bg-gradient-to-r ${themeConfig.colors.background.cardHover} hover:${themeConfig.colors.border.secondary}`
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {userAnswers[exercise.id] && (
              <div className={`mt-4 p-3 bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-lg`}>
                <div className={`${themeConfig.colors.text.accent} text-sm`}>您的選擇：</div>
                <div className={`${themeConfig.colors.text.primary} font-medium`}>{exercise.question.replace('_____', userAnswers[exercise.id])}</div>
              </div>
            )}
          </div>
        )

      case 'listening':
        return (
          <div className="space-y-4">
            <div className={`text-lg ${themeConfig.colors.text.primary} font-medium mb-4`}>{exercise.question}</div>
            <div className={`flex items-center gap-4 bg-gradient-to-r ${themeConfig.colors.background.secondary} rounded-lg p-4`}>
              <button
                onClick={() => isPlaying ? stopAudio() : playAudio(exercise.audioText || '')}
                className={`bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} text-white p-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-2">
                <Volume2 className={`w-5 h-5 ${themeConfig.colors.text.primary}`} />
                <span className={`${themeConfig.colors.text.primary} text-sm`}>語速：</span>
                <select
                  value={audioSpeed}
                  onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                  className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} border ${themeConfig.colors.border.primary} rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent}`}
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>
              </div>
            </div>
            <input
              type="text"
              value={userAnswers[exercise.id] || ''}
              onChange={(e) => setUserAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
              placeholder="請輸入聽到的單字..."
              className={`w-full bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-xl px-4 py-3 ${themeConfig.colors.text.primary} placeholder-${themeConfig.colors.text.tertiary} focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent transition-all duration-200`}
            />
          </div>
        )

      case 'word-matching':
        return (
          <div className="space-y-4">
            <div className={`text-lg ${themeConfig.colors.text.primary} font-medium mb-4`}>{exercise.question}</div>
            <div className="grid grid-cols-2 gap-3">
              {exercise.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setUserAnswers(prev => ({ ...prev, [exercise.id]: option }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                    userAnswers[exercise.id] === option
                      ? `bg-gradient-to-r ${themeConfig.colors.gradient.emerald} text-white border-transparent shadow-lg`
                      : `bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} ${themeConfig.colors.border.primary} hover:bg-gradient-to-r ${themeConfig.colors.background.cardHover} hover:${themeConfig.colors.border.secondary}`
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )

      case 'sentence-reconstruction':
        return (
          <div className="space-y-4">
            <div className={`text-lg ${themeConfig.colors.text.primary} font-medium mb-4`}>{exercise.question}</div>
            
            {/* 句子構建區域 */}
            <div 
              className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} border-2 border-dashed ${
                dropZoneActive ? themeConfig.colors.border.accent : themeConfig.colors.border.primary
              } rounded-xl p-4 min-h-[80px] flex items-center transition-all duration-200 ${
                dropZoneActive ? 'scale-102 shadow-lg' : ''
              }`}
              data-drop-zone="builder"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropToBuilder}
            >
              {sentenceBuilder.length === 0 ? (
                <div className="text-center w-full">
                  <div className={`${themeConfig.colors.text.accent} text-sm mb-2`}>📱 拖拽 & 觸控操作</div>
                  <div className={`${themeConfig.colors.text.accent} text-xs`}>拖拽或點擊下方單字添加到句子中</div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 items-center">
                  {sentenceBuilder.map((word, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {/* 插入點 */}
                      <div
                        className={`w-1 h-8 rounded-full transition-all duration-200 ${
                          insertIndex === index ? `bg-gradient-to-b ${themeConfig.colors.gradient.emerald} shadow-lg scale-110` : 'bg-transparent hover:bg-gray-300/30'
                        }`}
                        onDragOver={(e) => handleWordDropZone(e, index)}
                        onDrop={(e) => handleWordDropZone(e, index)}
                      />
                      
                      {/* 單字 */}
                      <span
                        draggable
                        data-word-element
                        onClick={() => {
                          if (!isDraggingTouch) {
                            handleWordRemove(word)
                          }
                        }}
                        onDragStart={(e) => handleDragStart(e, word, true)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, word, true)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className={`bg-gradient-to-r ${themeConfig.colors.gradient.blue} text-white px-3 py-1 rounded-lg cursor-move hover:${themeConfig.colors.gradient.cyan} transition-all duration-200 flex items-center gap-1 active:scale-95 hover:scale-105 select-none ${
                          isDraggingTouch && draggedWord === word ? 'opacity-50 scale-110' : ''
                        }`}
                        title="拖拽重新排列或點擊移除"
                      >
                        <span className="text-xs opacity-70">⋮⋮</span>
                        {word}
                        <span className="text-xs opacity-70">×</span>
                      </span>
                    </div>
                  ))}
                  
                  {/* 末尾插入點 */}
                  <div
                    className={`w-1 h-8 rounded-full transition-all duration-200 ${
                      insertIndex === sentenceBuilder.length ? `bg-gradient-to-b ${themeConfig.colors.gradient.emerald} shadow-lg scale-110` : 'bg-transparent hover:bg-gray-300/30'
                    }`}
                    onDragOver={(e) => handleWordDropZone(e, sentenceBuilder.length)}
                    onDrop={(e) => handleWordDropZone(e, sentenceBuilder.length)}
                  />
                </div>
              )}
            </div>

            {/* 單字選項區域 */}
            <div 
              className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-xl p-4 transition-all duration-200`}
              data-drop-zone="options"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDropToOptions}
            >
              <div className={`${themeConfig.colors.text.primary} text-sm mb-2 flex items-center gap-2`}>
                <span>📝 可用單字</span>
                <span className={`${themeConfig.colors.text.accent} text-xs`}>(拖拽或點擊添加)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.options?.filter(word => !usedWords.includes(word)).map((word, index) => (
                  <span
                    key={index}
                    draggable
                    onClick={() => {
                      if (!isDraggingTouch) {
                        handleWordSelect(word)
                      }
                    }}
                    onDragStart={(e) => handleDragStart(e, word, false)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, word, false)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} ${themeConfig.colors.text.primary} px-3 py-2 rounded-lg cursor-move hover:bg-gradient-to-r ${themeConfig.colors.background.cardHover} transition-all duration-200 transform hover:scale-105 active:scale-95 select-none ${
                      isDraggingTouch && draggedWord === word ? 'opacity-50 scale-110' : ''
                    }`}
                    title="拖拽到上方或點擊添加"
                  >
                    <span className="text-xs opacity-50 mr-1">⋮⋮</span>
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSentenceBuilder([])
                  setUsedWords([])
                  setUserAnswers(prev => ({ ...prev, [exercise.id]: '' }))
                }}
                className={`bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center`}
              >
                清空重組
              </button>
              <button
                onClick={() => playAudio(exercise.answer)}
                className={`bg-gradient-to-r ${themeConfig.colors.gradient.emerald} hover:${themeConfig.colors.gradient.teal} text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 min-h-[44px] min-w-[44px]`}
              >
                <Volume2 className="w-4 h-4" />
                聽正確答案
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // 渲染結果頁面
  const renderResults = () => {
    const totalPoints = results.reduce((sum, result) => sum + result.points, 0)
    const correctAnswers = results.filter(result => result.isCorrect).length
    const accuracy = Math.round((correctAnswers / results.length) * 100)
    const avgTime = Math.round(results.reduce((sum, result) => sum + result.timeSpent, 0) / results.length / 1000)

    return (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">
          {accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🎉' : '💪'}
        </div>
        <h3 className={`text-3xl font-bold ${themeConfig.colors.text.primary}`}>練習完成！</h3>
        
        {/* 成績統計 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-xl p-4`}>
            <Trophy className={`w-8 h-8 ${themeConfig.colors.text.accent} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${themeConfig.colors.text.primary}`}>{totalPoints}</div>
            <div className={`${themeConfig.colors.text.tertiary} text-sm`}>總分</div>
          </div>
          <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-xl p-4`}>
            <CheckCircle className={`w-8 h-8 ${themeConfig.colors.text.accent} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${themeConfig.colors.text.primary}`}>{accuracy}%</div>
            <div className={`${themeConfig.colors.text.tertiary} text-sm`}>正確率</div>
          </div>
          <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-xl p-4`}>
            <Star className={`w-8 h-8 ${themeConfig.colors.text.accent} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${themeConfig.colors.text.primary}`}>{avgTime}s</div>
            <div className={`${themeConfig.colors.text.tertiary} text-sm`}>平均用時</div>
          </div>
        </div>

        {/* 詳細結果 */}
        <div className={`text-left bg-gradient-to-r ${themeConfig.colors.background.secondary} rounded-xl p-4 max-h-60 overflow-y-auto`}>
          <h4 className={`${themeConfig.colors.text.primary} font-medium mb-3 text-center`}>詳細結果</h4>
          {results.map((result, index) => {
            const exercise = exercises.find(ex => ex.id === result.exerciseId)
            return (
              <div key={result.exerciseId} className={`p-3 bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-lg mb-3 border ${themeConfig.colors.border.primary}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.isCorrect ? (
                      <CheckCircle className={`w-4 h-4 ${themeConfig.colors.text.accent}`} />
                    ) : (
                      <XCircle className={`w-4 h-4 ${themeConfig.colors.text.accent}`} />
                    )}
                    <span className={`text-sm ${themeConfig.colors.text.primary} font-medium`}>第 {index + 1} 題</span>
                    <span className={`text-xs ${themeConfig.colors.text.accent}`}>({exercise?.type === 'fill-blank' ? '填空題' : exercise?.type === 'listening' ? '聽力練習' : exercise?.type === 'word-matching' ? '單字配對' : '句子重組'})</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${themeConfig.colors.text.primary}`}>{result.points} 分</div>
                    <div className={`text-xs ${themeConfig.colors.text.accent}`}>{Math.round(result.timeSpent / 1000)}s</div>
                  </div>
                </div>
                
                {/* 題目內容 */}
                {exercise && (
                  <div className="space-y-2 text-sm">
                    <div className={themeConfig.colors.text.tertiary}>
                      <span className={themeConfig.colors.text.accent}>題目：</span>
                      {exercise.question}
                    </div>
                    
                    {/* 用戶答案 */}
                    <div className={themeConfig.colors.text.tertiary}>
                      <span className={themeConfig.colors.text.accent}>您的答案：</span>
                      <span className={`${result.isCorrect ? themeConfig.colors.text.accent : themeConfig.colors.text.accent} font-medium`}>
                        {result.userAnswer || '(未作答)'}
                      </span>
                    </div>
                    
                    {/* 正確答案 */}
                    <div className={themeConfig.colors.text.tertiary}>
                      <span className={themeConfig.colors.text.accent}>正確答案：</span>
                      <span className={`${themeConfig.colors.text.accent} font-medium`}>{result.correctAnswer}</span>
                    </div>
                    
                    {/* 題目詳情 */}
                    {exercise.type === 'fill-blank' && (
                      <div className={themeConfig.colors.text.tertiary}>
                        <span className={themeConfig.colors.text.accent}>完整句子：</span>
                        <span className={themeConfig.colors.text.primary}>{exercise.question.replace('_____', exercise.answer)}</span>
                      </div>
                    )}
                    
                    {exercise.type === 'listening' && exercise.audioText && (
                      <div className={themeConfig.colors.text.tertiary}>
                        <span className={themeConfig.colors.text.accent}>聽力文本：</span>
                        <span className={themeConfig.colors.text.primary}>{exercise.audioText}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={generateExercises}
          className={`bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center`}
        >
          <RotateCcw className="w-5 h-5 inline mr-2" />
          重新開始
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.primary} rounded-xl p-6 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${themeConfig.colors.text.primary} flex items-center gap-2`}>
          <span className={themeConfig.colors.text.primary}>📚</span>
          互動式練習
        </h2>
        <div className="flex items-center gap-3">
          {/* 閱讀理解選擇器 */}
          <div className="flex items-center gap-2">
            <span className={`${themeConfig.colors.text.tertiary} text-sm`}>難度:</span>
            <select
              value={readingDifficulty}
              onChange={(e) => setReadingDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} border ${themeConfig.colors.border.primary} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent}`}
            >
              <option value="beginner">初級</option>
              <option value="intermediate">中級</option>
              <option value="advanced">高級</option>
            </select>
            <button
              onClick={generateReadingComprehension}
              disabled={isGeneratingReading}
              className={`bg-gradient-to-r ${themeConfig.colors.gradient.purple} hover:${themeConfig.colors.gradient.pink} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 min-h-[44px] min-w-[44px]`}
            >
              {isGeneratingReading ? '生成中...' : '📖 閱讀理解'}
            </button>
          </div>
          
          <button
            onClick={generateExercises}
            disabled={dialogue.length === 0}
            className={`bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 min-h-[44px] min-w-[44px]`}
          >
            <RotateCcw className="w-4 h-4" />
            生成練習題
          </button>
        </div>
      </div>

      {exercises.length === 0 && !isStreaming ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className={`${themeConfig.colors.text.tertiary} text-lg`}>還沒有練習題</p>
          <p className={`${themeConfig.colors.text.accent} text-sm mt-2`}>
            {dialogue.length === 0 
              ? '請先生成對話內容，然後點擊上方按鈕生成練習題'
              : '點擊上方按鈕生成練習題'
            }
          </p>
        </div>
      ) : isStreaming ? (
        <div className="space-y-6">
          {/* 串流生成中的界面 */}
          <div className={`bg-gradient-to-br ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.accent} rounded-2xl p-8 shadow-2xl backdrop-blur-xl`}>
            {/* 生成狀態標題 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${themeConfig.colors.gradient.purple} rounded-xl flex items-center justify-center shadow-lg animate-pulse`}>
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${themeConfig.colors.text.primary} mb-1`}>
                    {streamingTitle ? `📝 ${streamingTitle}` : 'AI 正在生成標題...'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`${themeConfig.colors.text.tertiary} text-sm`}>難度等級:</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      readingDifficulty === 'beginner' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg' :
                      readingDifficulty === 'intermediate' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' :
                      'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg'
                    }`}>
                      {readingDifficulty === 'beginner' ? '🌟 初級' :
                       readingDifficulty === 'intermediate' ? '⭐ 中級' : '🔥 高級'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 生成進度 */}
              <div className="text-right">
                <div className={`${themeConfig.colors.text.accent} text-sm animate-pulse`}>
                  {streamingQuestions ? '📝 生成題目中...' : 
                   streamingContent ? '📄 生成文章中...' : 
                   streamingTitle ? '📝 生成標題中...' : '🚀 準備生成...'}
                </div>
              </div>
            </div>
            
            {/* 串流文章內容 */}
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-xl p-6 border ${themeConfig.colors.border.primary} shadow-inner min-h-[200px]`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
                <span className={`${themeConfig.colors.text.accent} text-sm font-medium`}>實時生成中...</span>
              </div>
              <div className={`${themeConfig.colors.text.primary} leading-relaxed text-base whitespace-pre-line`}>
                {streamingContent || '等待內容生成...'}
                {streamingContent && <span className="animate-pulse text-blue-500">|</span>}
              </div>
              
              {/* 題目生成預覽 */}
              {streamingQuestions && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
                  <div className={`${themeConfig.colors.text.accent} text-sm font-medium mb-2`}>📝 生成題目中...</div>
                  <div className={`${themeConfig.colors.text.tertiary} text-sm whitespace-pre-line`}>
                    {streamingQuestions}
                    <span className="animate-pulse text-blue-500">|</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 生成提示 */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <span className="text-sm">💡</span>
                <span className="text-sm">
                  {streamingQuestions ? '正在生成最後的題目，請稍候...' :
                   streamingContent ? '文章內容正在生成中，接下來會生成題目...' :
                   streamingTitle ? '標題已生成，正在生成文章內容...' : '正在準備生成內容...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : showResults ? (
        renderResults()
      ) : (
        <div className="space-y-6">
          {/* 閱讀理解文章 */}
          {readingPassage && (
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.accent} rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${themeConfig.colors.text.primary}`}>{readingPassage.title}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  readingPassage.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  readingPassage.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {readingPassage.difficulty === 'beginner' ? '初級' :
                   readingPassage.difficulty === 'intermediate' ? '中級' : '高級'}
                </div>
              </div>
              <div className={`${themeConfig.colors.text.primary} leading-relaxed whitespace-pre-line`}>
                {readingPassage.content}
              </div>
            </div>
          )}
          
          {/* 進度指示器 */}
          <div className={`flex items-center justify-between bg-gradient-to-r ${themeConfig.colors.background.secondary} rounded-lg p-3`}>
            <div className={`${themeConfig.colors.text.primary} text-sm`}>
              第 {currentExerciseIndex + 1} 題 / 共 {exercises.length} 題
            </div>
            <div className="flex items-center gap-4">
              <div className={`${themeConfig.colors.text.accent} font-medium flex items-center gap-1`}>
                <Trophy className="w-4 h-4" />
                {score} 分
              </div>
              <div className={`w-32 ${themeConfig.colors.background.tertiary} rounded-full h-2`}>
                <div 
                  className={`bg-gradient-to-r ${themeConfig.colors.gradient.blue} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 練習題內容 */}
          <div className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} rounded-xl p-6 border ${themeConfig.colors.border.secondary}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`text-sm ${themeConfig.colors.text.tertiary}`}>
                題型: {
                  exercises[currentExerciseIndex]?.type === 'fill-blank' ? '填空題' :
                  exercises[currentExerciseIndex]?.type === 'listening' ? '聽力練習' :
                  exercises[currentExerciseIndex]?.type === 'word-matching' ? '單字配對' :
                  exercises[currentExerciseIndex]?.type === 'sentence-reconstruction' ? '句子重組' :
                  exercises[currentExerciseIndex]?.type === 'reading-comprehension' ? '閱讀理解' :
                  '未知題型'
                }
              </div>
              <div className={`text-sm ${themeConfig.colors.text.accent}`}>
                {exercises[currentExerciseIndex]?.points} 分
              </div>
            </div>
            {renderExercise(exercises[currentExerciseIndex])}
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-between">
            <button
              onClick={() => {
                if (currentExerciseIndex > 0) {
                  setCurrentExerciseIndex(prev => prev - 1)
                  setStartTime(Date.now())
                }
              }}
              disabled={currentExerciseIndex === 0}
              className={`bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} disabled:bg-gradient-to-r ${themeConfig.colors.background.tertiary} disabled:${themeConfig.colors.text.tertiary} text-white px-6 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center`}
            >
              上一題
            </button>
            
            <button
              onClick={submitAnswer}
              disabled={!userAnswers[exercises[currentExerciseIndex]?.id]}
              className={`bg-gradient-to-r ${themeConfig.colors.gradient.emerald} hover:${themeConfig.colors.gradient.teal} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white px-8 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center`}
            >
              {currentExerciseIndex === exercises.length - 1 ? '完成練習' : '下一題'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticeExercises