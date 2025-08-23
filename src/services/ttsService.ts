// TTS服務 - 跨瀏覽器兼容的語音合成
export interface TTSOptions {
  text: string
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

export interface TTSVoice {
  name: string
  lang: string
  default?: boolean
}

export class TTSService {
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private isSupported: boolean = false
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    this.init()
  }

  private init() {
    // 檢查瀏覽器支持
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      this.synthesis = window.speechSynthesis
      this.isSupported = true
      this.loadVoices()
      
      // 監聽語音列表加載
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => {
          this.loadVoices()
        }
      }
    } else {
      console.warn('此瀏覽器不支持語音合成')
      this.isSupported = false
    }
  }

  private loadVoices() {
    if (!this.synthesis) return
    
    try {
      this.voices = this.synthesis.getVoices()
    } catch (error) {
      console.warn('無法加載語音列表:', error)
      this.voices = []
    }
  }

  // 獲取可用的語音列表
  getAvailableVoices(): TTSVoice[] {
    return this.voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default
    }))
  }

  // 獲取英語語音
  getEnglishVoices(): TTSVoice[] {
    return this.voices
      .filter(voice => voice.lang.startsWith('en'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        default: voice.default
      }))
  }

  // 獲取默認英語語音
  getDefaultEnglishVoice(): TTSVoice | null {
    const englishVoices = this.getEnglishVoices()
    const defaultVoice = englishVoices.find(voice => voice.default)
    return defaultVoice || englishVoices[0] || null
  }

  // 檢測設備類型
  private detectDevice(): 'mobile' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    return isMobile ? 'mobile' : 'desktop'
  }

  // 根據設備類型獲取最佳語音設置
  private getOptimalVoiceSettings(): Partial<TTSOptions> {
    const device = this.detectDevice()
    
    if (device === 'mobile') {
      // 移動設備優化設置
      return {
        rate: 0.7,      // 稍慢的語速
        pitch: 1.0,     // 正常音調
        volume: 0.8     // 適中音量
      }
    } else {
      // 桌面設備設置
      return {
        rate: 0.7,      // 較慢語速，便於學習
        pitch: 1.0,     // 正常音調
        volume: 1.0     // 最大音量
      }
    }
  }

  // 播放語音
  speak(options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synthesis) {
        reject(new Error('語音合成不支持'))
        return
      }

      try {
        // 停止當前播放
        this.stop()

        // 創建新的語音合成
        const utterance = new SpeechSynthesisUtterance(options.text)
        
        // 設置語音參數
        utterance.lang = options.lang || 'en-US'
        utterance.rate = options.rate ?? this.getOptimalVoiceSettings().rate ?? 0.8
        utterance.pitch = options.pitch ?? this.getOptimalVoiceSettings().pitch ?? 1.0
        utterance.volume = options.volume ?? this.getOptimalVoiceSettings().volume ?? 0.8

        // 選擇最佳語音
        if (options.voice) {
          utterance.voice = this.voices.find(v => v.name === options.voice) || null
        } else {
          const defaultVoice = this.getDefaultEnglishVoice()
          if (defaultVoice) {
            utterance.voice = this.voices.find(v => v.name === defaultVoice.name) || null
          }
        }

        // 設置事件監聽器
        utterance.onstart = () => {
          this.currentUtterance = utterance
        }

        utterance.onend = () => {
          this.currentUtterance = null
          resolve()
        }

        utterance.onerror = (event) => {
          this.currentUtterance = null
          reject(new Error(`語音播放錯誤: ${event.error}`))
        }

        // 開始播放
        this.synthesis.speak(utterance)

      } catch (error) {
        reject(error)
      }
    })
  }

  // 播放單字
  speakWord(word: string, options?: Partial<TTSOptions>): Promise<void> {
    return this.speak({
      text: word,
      lang: 'en-US',
      rate: 0.7, // 單字播放較慢
      ...options
    })
  }

  // 播放句子
  speakSentence(sentence: string, options?: Partial<TTSOptions>): Promise<void> {
    return this.speak({
      text: sentence,
      lang: 'en-US',
      rate: 0.8, // 句子播放稍慢
      ...options
    })
  }

  // 停止播放
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.currentUtterance = null
    }
  }

  // 暫停播放
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause()
    }
  }

  // 恢復播放
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume()
    }
  }

  // 檢查是否正在播放
  isPlaying(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }

  // 檢查是否暫停
  isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false
  }

  // 獲取當前語音實例
  getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance
  }

  // 獲取支持狀態
  getSupportStatus(): { supported: boolean; device: 'mobile' | 'desktop' } {
    return {
      supported: this.isSupported,
      device: this.detectDevice()
    }
  }

  // 測試語音功能
  async testVoice(): Promise<boolean> {
    try {
      await this.speakWord('Hello')
      return true
    } catch (error) {
      console.warn('語音測試失敗:', error)
      return false
    }
  }
}

// 創建單例實例
export const ttsService = new TTSService()
