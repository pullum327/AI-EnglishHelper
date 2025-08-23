import React from 'react'

// 頁面類型
export type PageType = 'home' | 'dialogue' | 'words' | 'sentences' | 'practice' | 'settings'

// 側邊欄菜單項
export interface MenuItem {
  id: PageType
  label: string
  icon: React.ReactNode
  description: string
}

// 單字接口
export interface Word {
  id: string
  word: string
  translation: string
  addedAt: Date
}

// 句子接口
export interface Sentence {
  id: string
  english: string
  chinese: string
  addedAt: Date
}

// 對話消息接口
export interface DialogueMessage {
  speaker: string
  text: string
  chinese?: string
  wordTranslations?: { [key: string]: string }
}

// 通知接口
export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  timestamp: number
}
