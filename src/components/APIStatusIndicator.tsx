interface APIStatusIndicatorProps {
  currentModel: string
  isGenerating: boolean
  isApiGenerated: boolean
  hasDialogue: boolean
}

const APIStatusIndicator = ({ 
  currentModel, 
  isGenerating, 
  isApiGenerated, 
  hasDialogue 
}: APIStatusIndicatorProps) => {
  const getStatusColor = () => {
    if (isGenerating) return 'bg-blue-600/20 text-blue-400 border-blue-400/30'
    if (hasDialogue) {
      return isApiGenerated 
        ? 'bg-green-600/20 text-green-400 border-green-400/30' 
        : 'bg-yellow-600/20 text-yellow-400 border-yellow-400/30'
    }
    return 'bg-gray-600/20 text-gray-400 border-gray-400/30'
  }

  const getStatusText = () => {
    if (isGenerating) return '🔄 生成中'
    if (hasDialogue) {
      return isApiGenerated ? '🤖 API 生成' : '📋 預設範例'
    }
    return '⏳ 等待生成'
  }

  const getModelDisplayName = (model: string) => {
    const parts = model.split('/')
    const modelName = parts[parts.length - 1]?.split(':')[0] || model
    const isFree = model.includes(':free')
    return `${modelName}${isFree ? ' 🆓' : ' 💳'}`
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className={`px-3 py-1.5 rounded-full border ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      
      {hasDialogue && (
        <div className="px-3 py-1.5 rounded-full border bg-white/20 text-white border-white/30">
          模型: {getModelDisplayName(currentModel)}
        </div>
      )}
    </div>
  )
}

export default APIStatusIndicator
