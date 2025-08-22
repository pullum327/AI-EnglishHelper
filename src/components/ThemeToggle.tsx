import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl transition-all duration-300 group overflow-hidden"
      title={`切換到${theme === 'dark' ? '淺色' : '深色'}主題`}
    >
      {/* 背景漸層 */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
        theme === 'dark' 
          ? 'from-amber-400/20 via-orange-400/20 to-yellow-400/20' 
          : 'from-slate-400/20 via-blue-400/20 to-indigo-400/20'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* 邊框 */}
      <div className={`absolute inset-0 rounded-xl border ${
        theme === 'dark' 
          ? 'border-amber-400/30' 
          : 'border-slate-400/30'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* 圖標 */}
      <div className="relative z-10 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors duration-300" />
        ) : (
          <Moon className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors duration-300" />
        )}
      </div>
      
      {/* 懸停效果指示器 */}
      <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
        theme === 'dark' ? 'bg-amber-400' : 'bg-slate-400'
      } opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse`} />
    </button>
  )
}

export default ThemeToggle
