import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { PageType, MenuItem } from '../types'

interface BottomNavigationProps {
  menuItems: MenuItem[]
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  menuItems,
  currentPage,
  onNavigate
}) => {
  const { themeConfig } = useTheme()

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r ${themeConfig.colors.background.tertiary} backdrop-blur-xl border-t ${themeConfig.colors.border.primary} z-40 shadow-lg`}>
      <div className="flex justify-around py-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
              currentPage === item.id
                ? `${themeConfig.colors.text.accent} bg-gradient-to-r ${themeConfig.colors.background.tertiary} ${themeConfig.colors.border.accent} shadow-lg`
                : `${themeConfig.colors.text.tertiary} hover:${themeConfig.colors.text.primary} hover:bg-gradient-to-r hover:${themeConfig.colors.background.secondary} border border-transparent hover:${themeConfig.colors.border.primary}`
            }`}
            aria-label={`前往 ${item.label}`}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
