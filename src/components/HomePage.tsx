import React from 'react'
import { MessageSquare, BookOpen } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { DifficultyLevel } from '../services/mistralService'
import ReplyLetterGenerator from './ReplyLetterGenerator'
import type { PageType } from '../types'

interface HomePageProps {
  selectedDifficulty: DifficultyLevel
  selectedModel: string
  customInput: string
  isGeneratingDialogue: boolean
  cooldownSeconds: number
  inputMode: 'dialogue' | 'translation' | 'reply-letter'
  translationResult: string
  isTranslating: boolean
  dialogue: Array<{
    speaker: string
    text: string
    chinese?: string
    wordTranslations?: { [key: string]: string }
  }>
  onDifficultyClick: (difficulty: DifficultyLevel) => void
  onGenerateDialogue: () => void
  onCustomInputChange: (value: string) => void
  onInputModeChange: (mode: 'dialogue' | 'translation' | 'reply-letter') => void
  onCustomDialogue: () => void
  onTranslate: () => void
  onClearTranslation: () => void
  onNavigate: (page: PageType) => void
}

const HomePage: React.FC<HomePageProps> = ({
  selectedDifficulty,
  customInput,
  isGeneratingDialogue,
  cooldownSeconds,
  inputMode,
  translationResult,
  isTranslating,
  dialogue,
  onDifficultyClick,
  onGenerateDialogue,
  onCustomInputChange,
  onInputModeChange,
  onCustomDialogue,
  onTranslate,
  onClearTranslation,
  onNavigate
}) => {
  const { themeConfig } = useTheme()

  return (
    <div className="space-y-6 p-4">
      {/* 歡迎標題 */}
      <div className="text-center space-y-4">
        <div className="relative mb-6">
          <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.background.tertiary} rounded-full blur-3xl`}></div>
        </div>
        <h1 className={`text-3xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>
          英語學習助手
        </h1>
        <p className={`${themeConfig.colors.text.secondary} text-lg font-medium`}>AI 驅動的個性化英語學習體驗</p>
        <div className="flex justify-center">
          <div className={`w-16 h-1 bg-gradient-to-r ${themeConfig.colors.gradient.cyan} rounded-full`}></div>
        </div>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 gap-4">
        {/* 快速生成對話 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group`}>
          {/* 卡片背景裝飾 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${themeConfig.colors.background.tertiary} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${themeConfig.colors.background.tertiary} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
          <div className={`absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br ${themeConfig.colors.background.tertiary} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} style={{transitionDelay: '0.2s'}}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className={`w-12 h-12 bg-gradient-to-br ${themeConfig.colors.gradient.cyan} rounded-2xl flex items-center justify-center shadow-lg`}>
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            </div>
            <div>
              <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>
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
                  onClick={() => onDifficultyClick(level as DifficultyLevel)}
                  disabled={isGeneratingDialogue || cooldownSeconds > 0}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedDifficulty === level
                      ? `bg-gradient-to-r ${themeConfig.colors.button.primary} text-white shadow-lg`
                      : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:${themeConfig.colors.button.hover} border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent}`
                  } ${isGeneratingDialogue || cooldownSeconds > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {level === 'beginner' ? '🟢 初級' : level === 'intermediate' ? '🟡 中級' : '🔴 高級'}
                </button>
              ))}
            </div>
            
            <button
              onClick={onGenerateDialogue}
              disabled={isGeneratingDialogue || cooldownSeconds > 0}
              className={`w-full bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105`}
            >
              {isGeneratingDialogue ? (
                <>
                  <div className={`w-5 h-5 border-2 ${themeConfig.colors.border.accent} border-t-white rounded-full animate-spin`}></div>
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
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className={`w-12 h-12 bg-gradient-to-br ${themeConfig.colors.gradient.emerald} rounded-2xl flex items-center justify-center shadow-lg`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            </div>
            <div>
              <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.emerald} bg-clip-text text-transparent`}>
                自定義內容
              </h3>
              <p className={`${themeConfig.colors.text.tertiary} text-sm font-medium`}>輸入您想要練習的內容</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => onInputModeChange('dialogue')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === 'dialogue'
                    ? `bg-gradient-to-r ${themeConfig.colors.button.primary} text-white shadow-lg`
                    : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:${themeConfig.colors.button.hover} border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent}`
                }`}
              >
                生成對話
              </button>
              <button
                onClick={() => onInputModeChange('translation')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === 'translation'
                    ? `bg-gradient-to-r ${themeConfig.colors.button.primary} text-white shadow-lg`
                    : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:${themeConfig.colors.button.hover} border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent}`
                }`}
              >
                翻譯文本
              </button>
              <button
                onClick={() => onInputModeChange('reply-letter')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  inputMode === 'reply-letter'
                    ? `bg-gradient-to-r ${themeConfig.colors.button.primary} text-white shadow-lg`
                    : `bg-gradient-to-r ${themeConfig.colors.button.secondary} ${themeConfig.colors.text.secondary} hover:${themeConfig.colors.button.hover} border ${themeConfig.colors.border.primary} hover:${themeConfig.colors.border.accent}`
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
                  onChange={(e) => onCustomInputChange(e.target.value)}
                  placeholder={inputMode === 'dialogue' ? '輸入您想要練習的主題或情境...' : '輸入要翻譯的文本...'}
                  className={`w-full bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-xl px-4 py-3 ${themeConfig.colors.text.primary} placeholder-${themeConfig.colors.text.tertiary} focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent transition-all duration-200 resize-none backdrop-blur-sm shadow-lg`}
                  rows={3}
                />
                
                <button
                  onClick={inputMode === 'dialogue' ? onCustomDialogue : onTranslate}
                  disabled={!customInput.trim() || (inputMode === 'dialogue' ? isGeneratingDialogue : isTranslating)}
                  className={`w-full bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105`}
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
              <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.accent} rounded-xl p-4 backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
                  <span className={`${themeConfig.colors.text.accent} text-sm font-medium`}>翻譯結果</span>
                </div>
                <div className={`${themeConfig.colors.text.primary} mb-3 font-medium`}>{translationResult}</div>
                <button
                  onClick={onClearTranslation}
                  className={`${themeConfig.colors.text.accent} hover:${themeConfig.colors.text.primary} text-sm hover:underline transition-all duration-200 font-medium`}
                >
                  清空結果
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 練習題入口 */}
        <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className={`w-12 h-12 bg-gradient-to-br ${themeConfig.colors.gradient.purple} rounded-2xl flex items-center justify-center shadow-lg`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${themeConfig.colors.text.accent} rounded-full animate-pulse`}></div>
            </div>
            <div>
              <h3 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.purple} bg-clip-text text-transparent`}>
                互動練習
              </h3>
              <p className={`${themeConfig.colors.text.tertiary} text-sm font-medium`}>基於對話內容的練習題</p>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('practice')}
            disabled={dialogue.length === 0}
            className={`w-full bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105`}
          >
            <BookOpen className="w-5 h-5" />
            {dialogue.length === 0 ? '請先生成對話' : '開始練習'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomePage
