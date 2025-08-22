import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// 主題類型定義
export type Theme = 'dark' | 'light'

// 主題配置接口
export interface ThemeConfig {
  name: Theme
  colors: {
    // 背景色
    background: {
      primary: string
      secondary: string
      tertiary: string
      card: string
      cardHover: string
    }
    // 文字色
    text: {
      primary: string
      secondary: string
      tertiary: string
      accent: string
    }
    // 邊框色
    border: {
      primary: string
      secondary: string
      accent: string
    }
    // 按鈕色
    button: {
      primary: string
      secondary: string
      accent: string
      hover: string
    }
    // 漸層色
    gradient: {
      cyan: string
      blue: string
      emerald: string
      teal: string
      purple: string
      pink: string
      slate: string
      gray: string
    }
  }
}

// 主題配置
export const themeConfigs: Record<Theme, ThemeConfig> = {
  dark: {
    name: 'dark',
    colors: {
      background: {
        primary: 'from-slate-950 via-slate-900 via-purple-950/30 via-slate-900 to-black',
        secondary: 'from-slate-900/90 via-slate-800/90 to-slate-900/90',
        tertiary: 'from-slate-900/95 via-slate-800/95 to-slate-900/95',
        card: 'from-slate-900/80 via-slate-800/60 to-slate-900/80',
        cardHover: 'from-slate-800/80 via-slate-700/60 to-slate-800/80'
      },
      text: {
        primary: 'text-white',
        secondary: 'text-slate-200',
        tertiary: 'text-slate-300',
        accent: 'text-slate-400'
      },
      border: {
        primary: 'border-slate-600/30',
        secondary: 'border-slate-500/30',
        accent: 'border-slate-400/30'
      },
      button: {
        primary: 'bg-gradient-to-r from-cyan-500 to-blue-500',
        secondary: 'bg-gradient-to-r from-slate-700/40 to-slate-600/40',
        accent: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        hover: 'hover:from-cyan-600 hover:to-blue-600'
      },
      gradient: {
        cyan: 'from-cyan-400 to-blue-400',
        blue: 'from-blue-400 to-cyan-400',
        emerald: 'from-emerald-400 to-teal-400',
        teal: 'from-teal-400 to-emerald-400',
        purple: 'from-purple-400 to-pink-400',
        pink: 'from-pink-400 to-purple-400',
        slate: 'from-slate-400 to-gray-400',
        gray: 'from-gray-400 to-slate-400'
      }
    }
  },
  light: {
    name: 'light',
    colors: {
      background: {
        primary: 'from-gray-50 via-white to-gray-100',
        secondary: 'from-white/90 via-gray-50/90 to-white/90',
        tertiary: 'from-white/95 via-gray-50/95 to-white/95',
        card: 'from-white/80 via-gray-50/60 to-white/80',
        cardHover: 'from-gray-50/80 via-gray-100/60 to-gray-50/80'
      },
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-800',
        tertiary: 'text-gray-700',
        accent: 'text-gray-600'
      },
      border: {
        primary: 'border-gray-300/70',
        secondary: 'border-gray-200/70',
        accent: 'border-gray-400/70'
      },
      button: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        secondary: 'bg-gradient-to-r from-gray-300/90 to-gray-400/90',
        accent: 'bg-gradient-to-r from-green-600 to-teal-600',
        hover: 'hover:from-blue-700 hover:to-indigo-700'
      },
      gradient: {
        cyan: 'from-blue-600 to-indigo-600',
        blue: 'from-indigo-600 to-blue-600',
        emerald: 'from-green-600 to-teal-600',
        teal: 'from-teal-600 to-green-600',
        purple: 'from-purple-600 to-pink-600',
        pink: 'from-pink-600 to-purple-600',
        slate: 'from-gray-600 to-slate-600',
        gray: 'from-slate-600 to-gray-600'
      }
    }
  }
}

// Context 接口
interface ThemeContextType {
  theme: Theme
  themeConfig: ThemeConfig
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// 創建 Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Provider 組件
interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 從 localStorage 讀取主題，默認為 dark
    const savedTheme = localStorage.getItem('theme') as Theme
    return savedTheme || 'dark'
  })

  const themeConfig = themeConfigs[theme]

  // 切換主題
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // 設置主題
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  // 當主題改變時，保存到 localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme)
    
    // 更新 document 的 data-theme 屬性
    document.documentElement.setAttribute('data-theme', theme)
    
    // 更新 body 的 class
    if (theme === 'light') {
      document.body.classList.add('light-theme')
      document.body.classList.remove('dark-theme')
    } else {
      document.body.classList.add('dark-theme')
      document.body.classList.remove('light-theme')
    }
  }, [theme])

  const value: ThemeContextType = {
    theme,
    themeConfig,
    toggleTheme,
    setTheme: handleSetTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 自定義 Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
