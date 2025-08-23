import { useState } from 'react'
import { RotateCcw, Play, Pause, Volume2, CheckCircle, XCircle, Trophy, Star } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { ttsService } from '../services/ttsService'

interface PracticeExercise {
  id: string
  type: 'fill-blank' | 'listening' | 'word-matching' | 'sentence-reconstruction'
  question: string
  answer: string
  options?: string[]
  audioText?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  points: number
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


  // 生成練習題
  const generateExercises = () => {
    if (dialogue.length === 0) return

    const newExercises: PracticeExercise[] = []
    const words = new Set<string>()
    
    // 收集所有單字
    dialogue.forEach(message => {
      if (message.wordTranslations) {
        Object.keys(message.wordTranslations).forEach(word => words.add(word))
      }
    })

    const wordArray = Array.from(words)
    
    // 生成 10 道隨機練習題
    for (let i = 0; i < Math.min(10, dialogue.length * 2); i++) {
      const exerciseType = Math.floor(Math.random() * 4)
      const randomMessage = dialogue[Math.floor(Math.random() * dialogue.length)]
      const randomWord = wordArray[Math.floor(Math.random() * wordArray.length)]
      
      if (!randomWord || !randomMessage) continue
      
      let exercise: PracticeExercise

      switch (exerciseType) {
        case 0: // 填空題
          if (randomMessage.text.includes(randomWord)) {
            exercise = {
              id: `exercise-${i}`,
              type: 'fill-blank',
              question: randomMessage.text.replace(new RegExp(randomWord, 'gi'), '_____'),
              answer: randomWord,
              options: generateOptions(randomWord, wordArray),
              difficulty: 'beginner',
              points: 10
            }
          } else {
            continue
          }
          break

        case 1: // 聽力練習
          exercise = {
            id: `exercise-${i}`,
            type: 'listening',
            question: '聽聽看，填入正確的單字：',
            answer: randomWord,
            audioText: randomWord,
            difficulty: 'intermediate',
            points: 15
          }
          break

        case 2: // 單字配對
          // 檢查單字是否有中文翻譯，如果沒有則跳過
          const translation = randomMessage.wordTranslations?.[randomWord]
          if (!translation) {
            continue // 跳過沒有翻譯的單字
          }
          
          exercise = {
            id: `exercise-${i}`,
            type: 'word-matching',
            question: `將 "${randomWord}" 與正確的中文翻譯配對：`,
            answer: translation,
            options: generateTranslationOptions(randomWord, randomMessage.wordTranslations || {}, dialogue),
            difficulty: 'beginner',
            points: 10
          }
          break

        case 3: // 句子重組
          const words = randomMessage.text.split(' ').filter(word => word.length > 0)
          if (words.length >= 3) {
            const shuffledWords = [...words].sort(() => Math.random() - 0.5)
            exercise = {
              id: `exercise-${i}`,
              type: 'sentence-reconstruction',
              question: '重新排列單字，組成正確的句子：',
              answer: randomMessage.text,
              options: shuffledWords,
              difficulty: 'advanced',
              points: 20
            }
          } else {
            continue
          }
          break

        default:
          continue
      }

      newExercises.push(exercise)
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
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                      : `bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} ${themeConfig.colors.border.primary} hover:bg-gradient-to-r ${themeConfig.colors.background.cardHover} hover:${themeConfig.colors.border.secondary}`
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {userAnswers[exercise.id] && (
              <div className={`mt-4 p-3 bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-lg`}>
                <div className="text-blue-300 text-sm">您的選擇：</div>
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
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-2">
                <Volume2 className={`w-5 h-5 ${themeConfig.colors.text.primary}`} />
                <span className={`${themeConfig.colors.text.primary} text-sm`}>語速：</span>
                <select
                  value={audioSpeed}
                  onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                  className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} border ${themeConfig.colors.border.primary} rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
              className={`w-full bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-xl px-4 py-3 ${themeConfig.colors.text.primary} placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
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
                      ? 'bg-green-600 text-white border-green-500 shadow-lg'
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
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} border-2 border-dashed ${themeConfig.colors.border.primary} rounded-xl p-4 min-h-[80px] flex items-center`}>
              {sentenceBuilder.length === 0 ? (
                <div className="text-center w-full">
                  <div className={`${themeConfig.colors.text.accent} text-sm mb-2`}>📱 觸控操作說明</div>
                  <div className={`${themeConfig.colors.text.accent} text-xs`}>點擊下方單字添加到句子中</div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sentenceBuilder.map((word, index) => (
                    <span
                      key={index}
                      onClick={() => handleWordRemove(word)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 flex items-center gap-1 active:scale-95"
                      title="點擊移除"
                    >
                      {word}
                      <span className="text-xs opacity-70">×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 單字選項區域 */}
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-xl p-4`}>
              <div className={`${themeConfig.colors.text.primary} text-sm mb-2 flex items-center gap-2`}>
                <span>📝 可用單字</span>
                <span className={`${themeConfig.colors.text.accent} text-xs`}>(點擊添加)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.options?.filter(word => !usedWords.includes(word)).map((word, index) => (
                  <span
                    key={index}
                    onClick={() => handleWordSelect(word)}
                    className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} ${themeConfig.colors.text.primary} px-3 py-2 rounded-lg cursor-pointer hover:bg-gradient-to-r ${themeConfig.colors.background.cardHover} transition-all duration-200 transform hover:scale-105 active:scale-95`}
                    title="點擊添加"
                  >
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
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  清空重組
                </button>
                              <button
                  onClick={() => playAudio(exercise.answer)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
            <div className="text-yellow-300 text-sm">總分</div>
          </div>
          <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{accuracy}%</div>
            <div className="text-green-300 text-sm">正確率</div>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
            <Star className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{avgTime}s</div>
            <div className="text-blue-300 text-sm">平均用時</div>
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
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
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
                      <span className={`${result.isCorrect ? 'text-green-400' : 'text-red-400'} font-medium`}>
                        {result.userAnswer || '(未作答)'}
                      </span>
                    </div>
                    
                    {/* 正確答案 */}
                    <div className={themeConfig.colors.text.tertiary}>
                      <span className={themeConfig.colors.text.accent}>正確答案：</span>
                      <span className="text-green-400 font-medium">{result.correctAnswer}</span>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <button
          onClick={generateExercises}
          disabled={dialogue.length === 0}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4" />
          生成練習題
        </button>
      </div>

      {exercises.length === 0 ? (
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
      ) : showResults ? (
        renderResults()
      ) : (
        <div className="space-y-6">
          {/* 進度指示器 */}
          <div className={`flex items-center justify-between bg-gradient-to-r ${themeConfig.colors.background.secondary} rounded-lg p-3`}>
            <div className={`${themeConfig.colors.text.primary} text-sm`}>
              第 {currentExerciseIndex + 1} 題 / 共 {exercises.length} 題
            </div>
            <div className="flex items-center gap-4">
              <div className="text-yellow-400 font-medium flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                {score} 分
              </div>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                  '句子重組'
                }
              </div>
              <div className="text-sm text-yellow-400">
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
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              上一題
            </button>
            
            <button
              onClick={submitAnswer}
              disabled={!userAnswers[exercises[currentExerciseIndex]?.id]}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-8 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
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