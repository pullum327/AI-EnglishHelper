import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface ModelSelectorProps {
  currentModel: string
  availableModels: string[]
  onModelChange: (model: string) => void
  isDisabled?: boolean
}

const ModelSelector = ({ 
  currentModel, 
  availableModels, 
  onModelChange, 
  isDisabled = false 
}: ModelSelectorProps) => {
  const { themeConfig } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 過濾模型
  const filteredModels = availableModels.filter(model =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 獲取模型顯示名稱
  const getModelDisplayName = (model: string) => {
    const parts = model.split('/')
    return parts[parts.length - 1] || model
  }

  // 檢查是否為免費模型
  const isFreeModel = (model: string) => {
    return model.includes('free') || model.includes('latest')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 觸發按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={`flex items-center justify-between w-full px-4 py-2 bg-white/20 border border-white/30 rounded-xl text-white font-medium transition-all duration-200 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🤖</span>
          <span className="text-sm">{getModelDisplayName(currentModel)}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className={`absolute top-full mt-2 w-80 ${themeConfig.colors.background.tertiary} rounded-2xl shadow-2xl border ${themeConfig.colors.border.primary} z-50 max-h-96 overflow-hidden`}>
          {/* 搜尋欄 */}
          <div className={`p-4 border-b ${themeConfig.colors.border.secondary}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${themeConfig.colors.text.tertiary}`} />
              <input
                type="text"
                placeholder="search model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${themeConfig.colors.background.secondary} border ${themeConfig.colors.border.primary} rounded-lg text-sm ${themeConfig.colors.text.primary} placeholder-${themeConfig.colors.text.tertiary} focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent`}
                autoFocus
              />
            </div>
          </div>

          {/* 模型列表 */}
          <div className="max-h-64 overflow-y-auto">
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const isCurrent = model === currentModel
                const isFree = isFreeModel(model)
                
                return (
                  <button
                    key={model}
                    onClick={() => {
                      onModelChange(model)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`w-full px-4 py-3 text-left hover:${themeConfig.colors.background.secondary} transition-colors duration-150 flex items-center justify-between ${
                      isCurrent ? `bg-gradient-to-r ${themeConfig.colors.background.tertiary} border-l-4 ${themeConfig.colors.border.accent}` : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${themeConfig.colors.background.secondary} rounded-lg flex items-center justify-center`}>
                        <span className={`text-sm font-medium ${themeConfig.colors.text.tertiary}`}>
                          {isFree ? '🆓' : '💳'}
                        </span>
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-medium ${themeConfig.colors.text.primary}`}>
                          {getModelDisplayName(model)}
                        </div>
                        <div className={`text-xs ${themeConfig.colors.text.tertiary}`}>
                          {model}
                        </div>
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <Check className={`w-4 h-4 ${themeConfig.colors.text.accent}`} />
                    )}
                  </button>
                )
              })
            ) : (
              <div className={`px-4 py-8 text-center ${themeConfig.colors.text.tertiary}`}>
                <div className="text-sm">沒有找到匹配的模型</div>
                <div className="text-xs mt-1">嘗試使用不同的搜尋詞</div>
              </div>
            )}
          </div>

          {/* 底部當前選中模型顯示 */}
          <div className={`p-4 border-t ${themeConfig.colors.border.secondary} ${themeConfig.colors.background.secondary}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${themeConfig.colors.text.secondary}`}>當前模型：</span>
                <span className={`text-sm ${themeConfig.colors.text.primary}`}>{getModelDisplayName(currentModel)}</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`px-3 py-1 ${themeConfig.colors.background.tertiary} hover:${themeConfig.colors.background.cardHover} ${themeConfig.colors.text.primary} text-xs rounded-lg transition-colors duration-150`}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector
