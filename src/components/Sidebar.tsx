import React from 'react'
import { X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { PageType, MenuItem } from '../types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  menuItems: MenuItem[]
  currentPage: PageType
  onNavigate: (page: PageType) => void
  onPreload?: (page: PageType) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  menuItems,
  currentPage,
  onNavigate,
  onPreload
}) => {
  const { themeConfig } = useTheme()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className={`absolute inset-0 ${themeConfig.colors.background.primary}/50 backdrop-blur-sm`} 
        onClick={onClose} 
      />
      <div className={`absolute left-0 top-0 h-full w-80 bg-gradient-to-b ${themeConfig.colors.background.tertiary} border-r ${themeConfig.colors.border.primary} shadow-2xl backdrop-blur-xl`}>
        <div className={`flex items-center justify-between p-4 border-b ${themeConfig.colors.border.primary}`}>
          <h2 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>
            導航選單
          </h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gradient-to-r hover:${themeConfig.colors.background.secondary} rounded-xl transition-all duration-200 border border-transparent hover:${themeConfig.colors.border.primary}`}
            aria-label="關閉選單"
          >
            <X className={`w-6 h-6 ${themeConfig.colors.text.secondary}`} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                onClose()
              }}
              onMouseEnter={() => onPreload?.(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                currentPage === item.id
                  ? `bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.text.accent} ${themeConfig.colors.border.accent} shadow-lg`
                  : `${themeConfig.colors.text.tertiary} hover:bg-gradient-to-r hover:${themeConfig.colors.background.secondary} hover:${themeConfig.colors.text.primary} border border-transparent hover:${themeConfig.colors.border.primary}`
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                currentPage === item.id
                  ? `bg-gradient-to-r ${themeConfig.colors.background.tertiary}`
                  : `bg-gradient-to-r ${themeConfig.colors.background.secondary}`
              }`}>
                {item.icon}
              </div>
              <div>
                <div className="font-medium">{item.label}</div>
                <div className={`text-sm ${themeConfig.colors.text.tertiary}`}>{item.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
