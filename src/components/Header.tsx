import React from 'react'
import { Menu, Home } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import type { PageType } from '../types'

interface HeaderProps {
  currentPage: PageType
  onShowSidebar: () => void
  onNavigateHome: () => void
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  onShowSidebar,
  onNavigateHome
}) => {
  const { themeConfig } = useTheme()

  return (
    <header className={`bg-gradient-to-r ${themeConfig.colors.background.secondary} backdrop-blur-xl border-b ${themeConfig.colors.border.primary} sticky top-0 z-50 shadow-lg`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onShowSidebar}
            className={`p-2 hover:bg-gradient-to-r hover:${themeConfig.colors.background.secondary} rounded-xl transition-all duration-200 border border-transparent hover:${themeConfig.colors.border.primary}`}
            aria-label="開啟選單"
          >
            <Menu className={`w-6 h-6 ${themeConfig.colors.text.secondary}`} />
          </button>
          <h1 className={`text-xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.cyan} bg-clip-text text-transparent`}>
            英語學習助手
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentPage !== 'home' && (
            <button
              onClick={onNavigateHome}
              className={`p-2 hover:bg-gradient-to-r hover:${themeConfig.colors.background.secondary} rounded-xl transition-all duration-200 border border-transparent hover:${themeConfig.colors.border.primary}`}
              aria-label="回到首頁"
            >
              <Home className={`w-6 h-6 ${themeConfig.colors.text.secondary}`} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
