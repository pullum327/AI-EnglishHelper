import { useTheme } from '../contexts/ThemeContext'

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
  const { themeConfig } = useTheme()

  const getStatusColor = () => {
    if (isGenerating) return `bg-gradient-to-r ${themeConfig.colors.gradient.blue}/20 ${themeConfig.colors.text.accent} border ${themeConfig.colors.border.accent}`
    if (hasDialogue) {
      return isApiGenerated 
        ? `bg-gradient-to-r ${themeConfig.colors.gradient.emerald}/20 ${themeConfig.colors.text.accent} border ${themeConfig.colors.border.accent}` 
        : `bg-gradient-to-r ${themeConfig.colors.gradient.purple}/20 ${themeConfig.colors.text.accent} border ${themeConfig.colors.border.accent}`
    }
    return `bg-gradient-to-r ${themeConfig.colors.gradient.slate}/20 ${themeConfig.colors.text.accent} border ${themeConfig.colors.border.accent}`
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
        <div className={`px-3 py-1.5 rounded-full border bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.primary} border ${themeConfig.colors.border.primary}`}>
          模型: {getModelDisplayName(currentModel)}
        </div>
      )}
    </div>
  )
}

export default APIStatusIndicator
