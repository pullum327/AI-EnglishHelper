import { Mistral } from '@mistralai/mistralai';

export interface DialogueMessage {
  speaker: string
  text: string
  chinese?: string
  wordTranslations?: { [key: string]: string }
}

export interface Word {
  id: string
  word: string
  translation: string
  addedAt: Date
}

export interface Sentence {
  id: string
  english: string
  chinese: string
  addedAt: Date
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface DifficultyConfig {
  level: DifficultyLevel
  name: string
  description: string
  vocabulary: string
  grammar: string
  topics: string[]
  maxTokens: number
}

export class MistralService {
  private client: Mistral
  private modelName: string = "mistral-large-latest"
  
  // 備用模型列表
  private fallbackModels: string[] = [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest'
  ]
  
  private currentModelIndex: number = 0

  // 難度等級配置
  private difficultyConfigs: { [key in DifficultyLevel]: DifficultyConfig } = {
    beginner: {
      level: 'beginner',
      name: '初級',
      description: '基礎詞彙和簡單句型',
      vocabulary: 'basic everyday words (200-500 words)',
      grammar: 'simple present, basic questions, common verbs',
      topics: ['greetings', 'family', 'food', 'shopping', 'weather', 'daily activities'],
      maxTokens: 1200
    },
    intermediate: {
      level: 'intermediate',
      name: '中級',
      description: '常用詞彙和多樣句型',
      vocabulary: 'common vocabulary (500-1500 words)',
      grammar: 'past tense, future tense, conditionals, comparatives',
      topics: ['travel', 'work', 'hobbies', 'health', 'technology', 'relationships', 'education'],
      maxTokens: 1600
    },
    advanced: {
      level: 'advanced',
      name: '高級',
      description: '豐富詞彙和複雜表達',
      vocabulary: 'advanced vocabulary (1500+ words), idioms, phrasal verbs',
      grammar: 'complex sentences, passive voice, subjunctive mood, advanced tenses',
      topics: ['business', 'politics', 'science', 'philosophy', 'culture', 'current events', 'abstract concepts'],
      maxTokens: 2000
    }
  }

  constructor(apiKey: string) {
    this.client = new Mistral({
      apiKey: apiKey
    })
  }

  // 獲取所有難度配置
  getDifficultyConfigs(): { [key in DifficultyLevel]: DifficultyConfig } {
    return this.difficultyConfigs
  }

  // 獲取特定難度配置
  getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
    return this.difficultyConfigs[level]
  }

  // 獲取所有可用模型
  getAvailableModels(): string[] {
    return [...this.fallbackModels]
  }

  // 獲取當前模型
  getCurrentModel(): string {
    return this.fallbackModels[this.currentModelIndex] || this.fallbackModels[0]
  }

  // 設置特定模型
  setModel(model: string): boolean {
    const index = this.fallbackModels.indexOf(model)
    if (index !== -1) {
      this.currentModelIndex = index
      this.modelName = model
      console.log(`手動切換到模型: ${model}`)
      return true
    }
    console.warn(`模型 ${model} 不在可用列表中`)
    return false
  }

  // 切換到下一個模型
  private switchToNextModel(): boolean {
    const originalIndex = this.currentModelIndex
    this.currentModelIndex = (this.currentModelIndex + 1) % this.fallbackModels.length
    this.modelName = this.getCurrentModel()
    console.log(`切換到備用模型: ${this.modelName}`)
    
    // 如果回到原始模型，說明所有模型都已嘗試
    return this.currentModelIndex !== originalIndex
  }

  // 生成對話
  async generateDialogue(difficulty: DifficultyLevel = 'beginner', skipTranslationCheck: boolean = false): Promise<DialogueMessage[]> {
    const config = this.getDifficultyConfig(difficulty)
    const currentModel = this.getCurrentModel()
    
    console.log(`使用 Mistral AI API (${currentModel}) - 難度: ${config.name}`)

    try {
      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: this.createSystemPrompt(config)
          },
          {
            role: "user",
            content: this.createUserPrompt(config)
          }
        ],
        maxTokens: config.maxTokens,
        temperature: 0.7
      })

      const messageContent = response.choices[0]?.message?.content
      const content = typeof messageContent === 'string' 
        ? messageContent 
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text') 
          ? messageContent[0].text 
          : ''
      console.log('Mistral AI API 成功響應')
      console.log('原始 API 響應:', content)
      
      if (!content) {
        throw new Error('API 響應中沒有內容')
      }
      
      // 解析對話內容
      const dialogue = this.parseResponse(content)
      console.log('解析後的原始對話:', JSON.stringify(dialogue, null, 2))
      
      // 檢查並補充缺失的單字翻譯
      if (!skipTranslationCheck) {
        console.log('開始檢查並補充翻譯...')
        const enhancedDialogue = await this.checkAndSupplementTranslations(dialogue)
        console.log('補充翻譯後的對話:', JSON.stringify(enhancedDialogue, null, 2))
        return enhancedDialogue
      } else {
        console.log('跳過翻譯檢查，返回原始對話')
        return dialogue
      }
      
    } catch (error) {
      console.error('Mistral AI API 調用失敗:', error)
      
      // 檢查是否是模型相關錯誤，嘗試切換到備用模型
      if (error instanceof Error && (error.message.includes('model') || error.message.includes('rate limit'))) {
        console.log('檢測到模型錯誤，嘗試切換模型...')
        const hasMoreModels = this.switchToNextModel()
        if (hasMoreModels) {
          console.log('嘗試使用備用模型重新生成對話...')
          await this.delay(2000)
          return this.generateDialogue(difficulty, skipTranslationCheck)
        }
      }
      
      throw error
    }
  }

  // 生成單字翻譯
  async generateWordTranslations(word: string, context: string): Promise<string> {
    const currentModel = this.getCurrentModel()
    console.log(`使用 Mistral AI API (${currentModel}) 生成單字翻譯: ${word}`)

    try {
      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: `你是一個專業的英語翻譯助手。請為用戶提供的英語單字生成準確的繁體中文翻譯。

要求：
1. 只返回繁體中文翻譯，不要其他內容
2. 翻譯要準確、自然、符合中文表達習慣
3. 如果單字有多個意思，請根據上下文選擇最合適的翻譯
4. 不要添加任何解釋或額外信息`
          },
          {
            role: "user",
            content: `請翻譯這個英語單字：${word}

上下文：${context}

請只返回繁體中文翻譯，不要其他內容。`
          }
        ],
        maxTokens: 100,
        temperature: 0.3
      })

      const messageContent = response.choices[0]?.message?.content
      const translation = (typeof messageContent === 'string' 
        ? messageContent 
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text') 
          ? messageContent[0].text 
          : '').trim()
      console.log(`單字 "${word}" 的翻譯: ${translation}`)
      
      if (!translation) {
        throw new Error('翻譯響應為空')
      }
      
      return translation
      
    } catch (error) {
      console.error('生成單字翻譯失敗:', error)
      
      // 嘗試切換到備用模型
      const hasMoreModels = this.switchToNextModel()
      if (hasMoreModels) {
        return this.generateWordTranslations(word, context)
      }
      
      throw error
    }
  }

  // 檢查並補充缺失的翻譯
  async checkAndSupplementTranslations(dialogue: DialogueMessage[]): Promise<DialogueMessage[]> {
    console.log('開始檢查並補充缺失的翻譯...')
    
    for (const message of dialogue) {
      // 檢查句子級別的中文翻譯
      if (!message.chinese || message.chinese === '待翻譯') {
        try {
          console.log(`為句子生成中文翻譯: ${message.text}`)
          const chineseTranslation = await this.generateSentenceTranslation(message.text)
          message.chinese = chineseTranslation
        } catch (error) {
          console.error('生成句子翻譯失敗:', error)
          message.chinese = '翻譯失敗'
        }
      }
      
      // 檢查單字級別的翻譯
      if (!message.wordTranslations || Object.keys(message.wordTranslations).length === 0) {
        try {
          console.log(`為句子生成單字翻譯: ${message.text}`)
          const wordTranslations = await this.generateWordTranslationsForSentence(message.text)
          message.wordTranslations = wordTranslations
        } catch (error) {
          console.error('生成單字翻譯失敗:', error)
          message.wordTranslations = {}
        }
      }
    }
    
    console.log('翻譯檢查和補充完成')
    return dialogue
  }

  // 生成句子翻譯
  private async generateSentenceTranslation(englishText: string): Promise<string> {
    const currentModel = this.getCurrentModel()
    console.log(`使用 Mistral AI API (${currentModel}) 生成句子翻譯`)

    try {
      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: `你是一個專業的英語翻譯助手。請為用戶提供的英語句子生成準確的繁體中文翻譯。

要求：
1. 只返回繁體中文翻譯，不要其他內容
2. 翻譯要準確、自然、符合中文表達習慣
3. 保持句子的語調和情感
4. 不要添加任何解釋或額外信息`
          },
          {
            role: "user",
            content: `請翻譯這個英語句子：${englishText}

請只返回繁體中文翻譯，不要其他內容。`
          }
        ],
        maxTokens: 200,
        temperature: 0.3
      })

      const messageContent = response.choices[0]?.message?.content
      const translation = (typeof messageContent === 'string' 
        ? messageContent 
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text') 
          ? messageContent[0].text 
          : '').trim()
      console.log(`句子翻譯: ${translation}`)
      
      if (!translation) {
        throw new Error('翻譯響應為空')
      }
      
      return translation
      
    } catch (error) {
      console.error('生成句子翻譯失敗:', error)
      
      // 嘗試切換到備用模型
      const hasMoreModels = this.switchToNextModel()
      if (hasMoreModels) {
        return this.generateSentenceTranslation(englishText)
      }
      
      throw error
    }
  }

  // 為句子生成單字翻譯
  private async generateWordTranslationsForSentence(englishText: string): Promise<{ [key: string]: string }> {
    const currentModel = this.getCurrentModel()
    console.log(`使用 Mistral AI API (${currentModel}) 生成句子單字翻譯`)

    try {
      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: `你是一個專業的英語翻譯助手。請分析英語句子中的每個重要單字，並提供繁體中文翻譯。

要求：
1. 識別句子中的重要單字（名詞、動詞、形容詞、副詞等）
2. 為每個單字提供準確的繁體中文翻譯
3. 使用格式：word1=翻譯1, word2=翻譯2, word3=翻譯3
4. 只返回翻譯結果，不要其他內容
5. 翻譯要準確、自然、符合中文表達習慣`
          },
          {
            role: "user",
            content: `請分析這個英語句子中的單字並提供翻譯：${englishText}

請使用格式：word1=翻譯1, word2=翻譯2, word3=翻譯3

只返回翻譯結果，不要其他內容。`
          }
        ],
        maxTokens: 300,
        temperature: 0.3
      })

      const messageContent = response.choices[0]?.message?.content
      const content = (typeof messageContent === 'string' 
        ? messageContent 
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text') 
          ? messageContent[0].text 
          : '').trim()
      console.log(`單字翻譯響應: ${content}`)
      
      if (!content) {
        throw new Error('單字翻譯響應為空')
      }
      
      // 解析單字翻譯
      const wordTranslations: { [key: string]: string } = {}
      const pairs = content.split(',').map((pair: string) => pair.trim())
      
      for (const pair of pairs) {
        const [word, translation] = pair.split('=').map((part: string) => part.trim())
        if (word && translation) {
          wordTranslations[word] = translation
        }
      }
      
      console.log('解析後的單字翻譯:', wordTranslations)
      return wordTranslations
      
    } catch (error) {
      console.error('生成句子單字翻譯失敗:', error)
      
      // 嘗試切換到備用模型
      const hasMoreModels = this.switchToNextModel()
      if (hasMoreModels) {
        return this.generateWordTranslationsForSentence(englishText)
      }
      
      throw error
    }
  }

  // 翻譯單字
  async translateWord(word: string, dialogue?: DialogueMessage[]): Promise<string> {
    console.log(`翻譯單字: ${word}`)
    
    // 首先嘗試從對話中查找翻譯
    if (dialogue) {
      for (const message of dialogue) {
        if (message.wordTranslations && message.wordTranslations[word]) {
          console.log(`從對話中找到翻譯: ${word} = ${message.wordTranslations[word]}`)
          return message.wordTranslations[word]
        }
      }
    }
    
    // 如果沒有找到，嘗試從句子翻譯中提取
    if (dialogue) {
      for (const message of dialogue) {
        if (message.chinese && message.chinese !== '待翻譯' && message.chinese !== '翻譯失敗') {
          const extractedTranslation = this.extractWordTranslation(word, message.text, message.chinese)
          if (extractedTranslation) {
            console.log(`從句子翻譯中提取到翻譯: ${word} = ${extractedTranslation}`)
            return extractedTranslation
          }
        }
      }
    }
    
    // 最後嘗試動態生成翻譯
    try {
      console.log(`動態生成單字翻譯: ${word}`)
      const context = dialogue && dialogue.length > 0 ? dialogue[0].text : '英語學習'
      const translation = await this.generateWordTranslations(word, context)
      return translation
    } catch (error) {
      console.error('動態生成翻譯失敗:', error)
      return '待翻譯'
    }
  }

  // 從句子翻譯中提取單字翻譯
  private extractWordTranslation(_word: string, _englishText: string, _chineseText: string): string | null {
    // 這裡可以實現更智能的提取邏輯
    // 目前返回 null，讓系統使用動態生成
    return null
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 創建系統提示詞
  private createSystemPrompt(config: DifficultyConfig): string {
    return `You are a helpful English teacher. Create English conversations for language learners at ${config.level} level with Traditional Chinese (繁體中文) translations.

DIFFICULTY LEVEL: ${config.name} (${config.level})
- Vocabulary: ${config.vocabulary}
- Grammar: ${config.grammar}
- Topics: ${config.topics.join(', ')}

For each dialogue line, provide:
1. English sentence
2. Traditional Chinese sentence translation
3. Word-by-word translation

Use this exact format:

Speaker: English sentence
中文: Traditional Chinese translation
單字: word1=翻譯1, word2=翻譯2, word3=翻譯3

Example for ${config.level} level:
${this.getExampleByDifficulty(config.level)}

Make sure to:
- Use appropriate vocabulary for ${config.level} level
- Include ${config.grammar} grammar structures
- Focus on topics like: ${config.topics.slice(0, 3).join(', ')}
- Provide accurate Traditional Chinese (繁體中文) translations
- Use Traditional Chinese characters only, not Simplified Chinese`
  }

  // 創建用戶提示詞
  private createUserPrompt(config: DifficultyConfig): string {
    const topicCount = config.level === 'beginner' ? '4-5' : config.level === 'intermediate' ? '5-6' : '6-7'
    const randomTopic = config.topics[Math.floor(Math.random() * config.topics.length)]
    
    return `Create a ${config.level}-level English conversation between two people about "${randomTopic}". The conversation should have ${topicCount} exchanges and be appropriate for ${config.level} learners.

Requirements:
- Use ${config.vocabulary}
- Include ${config.grammar} grammar structures
- Make it engaging and practical
- Format each line as:

Speaker: English sentence
中文: Traditional Chinese translation
單字: word1=翻譯1, word2=翻譯2, word3=翻譯3

Make sure the Traditional Chinese (繁體中文) translations are accurate and natural.`
  }

  // 根據難度獲取示例
  private getExampleByDifficulty(level: DifficultyLevel): string {
    switch (level) {
      case 'beginner':
        return `Alice: Good morning! How are you today?
中文: 早安！你今天過得如何？
單字: Good=好的, morning=早上, How=如何, are=是, you=你, today=今天`
      case 'intermediate':
        return `Sarah: I've been thinking about changing my career recently.
中文: 我最近一直在考慮轉換職業。
單字: thinking=思考, about=關於, changing=改變, career=職業, recently=最近`
      case 'advanced':
        return `Michael: The implementation of sustainable development policies requires comprehensive stakeholder engagement.
中文: 可持續發展政策的實施需要全面的利益相關者參與。
單字: implementation=實施, sustainable=可持續的, development=發展, policies=政策, comprehensive=全面的, stakeholder=利益相關者, engagement=參與`
    }
  }

  // 解析 API 響應
  private parseResponse(content: string): DialogueMessage[] {
    try {
      console.log('解析響應數據:', content)
      
      if (!content) {
        console.error('API 響應內容為空')
        throw new Error('API 響應中沒有內容')
      }

      // 解析對話內容
      const lines = content.split('\n').filter((line: string) => line.trim())
      const dialogue: DialogueMessage[] = []
      
      let currentMessage: Partial<DialogueMessage> = {}

      for (const line of lines) {
        // 匹配英文對話格式：Name: Text 或 **Name**: Text 或 Name - Text 或 Speaker X: Text
        const speakerMatch = line.match(/^(?:\*\*)?([A-Za-z\s]+)(?:\*\*)?[:\-]\s*(.+)$/i)
        // 匹配中文翻譯格式：中文: Translation
        const chineseMatch = line.match(/^中文[：:]\s*(.+)$/i)
        // 匹配單字翻譯格式：單字: word1=翻譯1, word2=翻譯2
        const wordTranslationMatch = line.match(/^單字[：:]\s*(.+)$/i)
        
        if (speakerMatch) {
          // 如果已有未完成的對話，先保存它
          if (currentMessage.speaker && currentMessage.text) {
            dialogue.push({
              speaker: currentMessage.speaker,
              text: currentMessage.text,
              chinese: currentMessage.chinese || '待翻譯',
              wordTranslations: currentMessage.wordTranslations || {}
            })
          }
          
          const [, speaker, text] = speakerMatch
          // 移除文本中的所有 ** 符號
          const cleanText = text.replace(/\*\*/g, '')
          
          currentMessage = {
            speaker,
            text: cleanText,
            chinese: '待翻譯',
            wordTranslations: {}
          }
        } else if (chineseMatch) {
          const [, chinese] = chineseMatch
          if (currentMessage.speaker) {
            currentMessage.chinese = chinese.trim()
          }
        } else if (wordTranslationMatch) {
          const [, wordTranslationsText] = wordTranslationMatch
          if (currentMessage.speaker) {
            const wordTranslations: { [key: string]: string } = {}
            const pairs = wordTranslationsText.split(',').map(pair => pair.trim())
            
            for (const pair of pairs) {
              const [word, translation] = pair.split('=').map(part => part.trim())
              if (word && translation) {
                wordTranslations[word] = translation
              }
            }
            
            currentMessage.wordTranslations = wordTranslations
          }
        }
      }
      
      // 添加最後一個未完成的對話
      if (currentMessage.speaker && currentMessage.text) {
        dialogue.push({
          speaker: currentMessage.speaker,
          text: currentMessage.text,
          chinese: currentMessage.chinese || '待翻譯',
          wordTranslations: currentMessage.wordTranslations || {}
        })
      }
      
      console.log('解析後的對話:', dialogue)
      
      if (dialogue.length === 0) {
        throw new Error('無法解析對話內容，請檢查 API 響應格式')
      }
      
      return dialogue
      
    } catch (error) {
      console.error('解析 Mistral AI 響應時出錯:', error)
      throw new Error(`解析 API 響應失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  // 生成自定義對話
  async generateCustomDialogue(customInput: string, difficulty: DifficultyLevel = 'beginner'): Promise<DialogueMessage[]> {
    try {
      const config = this.difficultyConfigs[difficulty]
      
      const systemPrompt = `You are a helpful English teacher. Create English conversations based on the user's custom request with Traditional Chinese (繁體中文) translations.

DIFFICULTY LEVEL: ${config.name} (${difficulty})
- Vocabulary: ${config.vocabulary}
- Grammar: ${config.grammar}
- Topics: ${config.topics.join(', ')}

CUSTOM REQUEST: ${customInput}

For each dialogue line, provide:
1. English sentence
2. Traditional Chinese sentence translation
3. Word-by-word translation

Use this exact format:

Speaker: English sentence
中文: Traditional Chinese translation
單字: word1=翻譯1, word2=翻譯2, word3=翻譯3

Make sure to:
- Follow the user's custom request
- Use appropriate vocabulary for ${difficulty} level
- Include ${config.grammar} grammar structures
- Provide accurate Traditional Chinese (繁體中文) translations
- Use Traditional Chinese characters only, not Simplified Chinese
- Create 4-5 exchanges that are engaging and practical`

      const userPrompt = `Please create a ${difficulty}-level English conversation based on my request: "${customInput}". The conversation should have 4-5 exchanges and be appropriate for ${difficulty} learners.`

      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        maxTokens: config.maxTokens,
        temperature: 0.7
      })

      const messageContent = response.choices[0]?.message?.content
      const content = typeof messageContent === 'string'
        ? messageContent
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text')
          ? messageContent[0].text
          : ''

      if (!content) {
        throw new Error('API 響應中沒有內容')
      }

      return this.parseResponse(content)
    } catch (error) {
      console.error('生成自定義對話失敗:', error)
      throw error
    }
  }

  // 翻譯文本
  async translateText(text: string): Promise<string> {
    try {
      // 檢測語言
      const isEnglish = /^[a-zA-Z\s\.,!?;:'"()-]+$/.test(text.trim())
      
      const systemPrompt = isEnglish 
        ? `You are a professional translator. Translate the following English text to Traditional Chinese (繁體中文). Provide only the translation, no explanations.`
        : `You are a professional translator. Translate the following Traditional Chinese (繁體中文) text to English. Provide only the translation, no explanations.`

      const userPrompt = `Please translate this text: "${text}"`

      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        maxTokens: 500,
        temperature: 0.3
      })

      const messageContent = response.choices[0]?.message?.content
      const content = typeof messageContent === 'string'
        ? messageContent
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text')
          ? messageContent[0].text
          : ''

      if (!content) {
        throw new Error('翻譯 API 響應中沒有內容')
      }

      return content.trim()
    } catch (error) {
      console.error('翻譯文本失敗:', error)
      throw error
    }
  }

  // 生成自定義內容
  async generateCustomContent(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.complete({
        model: this.modelName,
        messages: [
          { role: 'user', content: prompt }
        ],
        maxTokens: 1000,
        temperature: 0.7
      })

      const messageContent = response.choices[0]?.message?.content
      const content = typeof messageContent === 'string'
        ? messageContent
        : (Array.isArray(messageContent) && messageContent[0]?.type === 'text')
          ? messageContent[0].text
          : ''

      if (!content) {
        throw new Error('API 響應中沒有內容')
      }

      return content.trim()
    } catch (error) {
      console.error('生成自定義內容失敗:', error)
      throw error
    }
  }
}
