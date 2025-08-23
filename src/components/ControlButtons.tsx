import { useTheme } from '../contexts/ThemeContext'

interface ControlButtonsProps {
  isGeneratingDialogue: boolean
  cooldownSeconds: number
  onGenerateDialogue: (skipTranslationCheck?: boolean) => void
}

const ControlButtons = ({
  isGeneratingDialogue,
  cooldownSeconds,
  onGenerateDialogue
}: ControlButtonsProps) => {
  const { themeConfig } = useTheme()

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <button
        onClick={() => onGenerateDialogue(false)}
        disabled={isGeneratingDialogue || cooldownSeconds > 0}
        className={`bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 border ${themeConfig.colors.border.accent} flex items-center justify-center gap-2 min-w-[160px] ${
          cooldownSeconds > 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isGeneratingDialogue ? (
          <>
            <div className={`w-4 h-4 border-2 ${themeConfig.colors.border.accent} border-t-transparent rounded-full animate-spin`}></div>
            生成中...
          </>
        ) : cooldownSeconds > 0 ? (
          `等待 ${cooldownSeconds}s`
        ) : (
          <>
            <span className="text-lg">🚀</span>
            快速生成
          </>
        )}
      </button>
    </div>
  )
}

export default ControlButtons
