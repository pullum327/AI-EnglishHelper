import { type DifficultyLevel, type DifficultyConfig } from '../services/mistralService'

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel
  onDifficultyChange: (difficulty: DifficultyLevel) => void
  difficultyConfigs: { [key in DifficultyLevel]: DifficultyConfig }
  onDifficultyClick?: (difficulty: DifficultyLevel) => void
}

const DifficultySelector = ({ 
  selectedDifficulty, 
  onDifficultyChange, 
  difficultyConfigs,
  onDifficultyClick
}: DifficultySelectorProps) => {
  const handleDifficultyClick = (level: DifficultyLevel) => {
    // 先更新選中的難度
    onDifficultyChange(level)
    // 如果提供了點擊回調，則觸發對話生成
    if (onDifficultyClick) {
      onDifficultyClick(level)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <label className="text-white font-medium text-sm whitespace-nowrap">
        難度：
      </label>
      <div className="flex gap-2 w-full sm:w-auto">
        {(Object.entries(difficultyConfigs) as [DifficultyLevel, DifficultyConfig][]).map(([level, config]) => (
          <button
            key={level}
            onClick={() => handleDifficultyClick(level)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border-2 flex-1 sm:flex-none ${
              selectedDifficulty === level
                ? 'bg-white/30 text-white border-white/50 shadow-lg shadow-white/20'
                : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 hover:text-white hover:border-white/30'
            }`}
            title={`${config.description}${onDifficultyClick ? ' - 點擊生成對話' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {level === 'beginner' ? '🟢' : level === 'intermediate' ? '🟡' : '🔴'}
              </span>
              <span>{config.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DifficultySelector
