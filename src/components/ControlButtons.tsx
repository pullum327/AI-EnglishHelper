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
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <button
        onClick={() => onGenerateDialogue(false)}
        disabled={isGeneratingDialogue || cooldownSeconds > 0}
        className={`bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/30 flex items-center justify-center gap-2 min-w-[160px] ${
          cooldownSeconds > 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isGeneratingDialogue ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
