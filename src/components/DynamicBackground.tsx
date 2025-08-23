import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const DynamicBackground: React.FC = () => {
  const { themeConfig } = useTheme()

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* 發光效果 */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${themeConfig.colors.gradient.blue} rounded-full blur-3xl opacity-20 animate-pulse`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r ${themeConfig.colors.gradient.purple} rounded-full blur-3xl opacity-20 animate-pulse delay-1000`}></div>
      <div className={`absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r ${themeConfig.colors.gradient.emerald} rounded-full blur-3xl opacity-15 animate-pulse delay-500`}></div>
      
      {/* 網格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* 粒子效果 */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 bg-white/30 rounded-full animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default DynamicBackground
