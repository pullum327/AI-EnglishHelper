import React, { useState, useEffect } from 'react'
import { Mail, Send, RotateCcw, Download, Copy, CheckCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { MistralService } from '../services/mistralService'

interface ReplyLetterGeneratorProps {
  className?: string
}

interface ReplyResult {
  englishReply: string
  chineseReply: string
}



const ReplyLetterGenerator: React.FC<ReplyLetterGeneratorProps> = ({ className = '' }) => {
  const { themeConfig } = useTheme()
  const [inputLetter, setInputLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [replyResult, setReplyResult] = useState<ReplyResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [apiStatus, setApiStatus] = useState<'available' | 'unavailable' | 'checking'>('checking')
  
  // 初始化 Mistral 服務
  const mistralService = new MistralService(import.meta.env.VITE_MISTRAL_TOKEN || '6BjrhFY5nFujgMhUOKX2QujWCaDBXiTV')

  // 檢查API狀態
  useEffect(() => {
    checkAPIStatus()
  }, [])

  const checkAPIStatus = async () => {
    try {
      setApiStatus('checking')
      // 嘗試調用API進行簡單測試
      await mistralService.generateCustomContent('test')
      setApiStatus('available')
    } catch (error) {
      console.log('API不可用，將使用備用方案:', error)
      setApiStatus('unavailable')
    }
  }

  // 生成AI回覆
  const generateReply = async () => {
    if (!inputLetter.trim()) return
    
    setIsGenerating(true)
    try {
      // 使用API生成英文回覆
      const englishReply = await generateEnglishReply(inputLetter)
      
      // 將英文回覆翻譯成中文
      const chineseReply = await translateToChineseReply(englishReply)
      
      setReplyResult({
        englishReply,
        chineseReply
      })
    } catch (error) {
      console.error('生成回覆失敗:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成英文回覆
  const generateEnglishReply = async (originalLetter: string): Promise<string> => {
    try {
      const prompt = `Please write a professional and appropriate English reply to the following letter. The reply should be polite, well-structured, and address all points mentioned in the original letter:

Original Letter:
${originalLetter}

Please provide only the reply letter without any additional explanation.`

      const response = await mistralService.generateCustomContent(prompt)
      return response
    } catch (error) {
      console.error('生成英文回覆失敗:', error)
      
      // 根據信件內容智能生成備用回覆
      return generateFallbackReply(originalLetter)
    }
  }

  // 生成備用回覆（當API不可用時）
  const generateFallbackReply = (originalLetter: string): string => {
    const letter = originalLetter.toLowerCase()
    
    // 檢測信件類型和語境
    if (letter.includes('job') || letter.includes('position') || letter.includes('application')) {
      return `Dear Applicant,

Thank you for your interest in the position. We have received your application and are currently reviewing it.

We will contact you within the next few days to discuss the next steps in our hiring process.

Best regards,
HR Team`
    } else if (letter.includes('complaint') || letter.includes('problem') || letter.includes('issue')) {
      return `Dear Customer,

Thank you for bringing this matter to our attention. We sincerely apologize for the inconvenience you have experienced.

We are investigating this issue and will provide you with a resolution as soon as possible.

Best regards,
Customer Service Team`
    } else if (letter.includes('invitation') || letter.includes('party') || letter.includes('event')) {
      return `Dear Friend,

Thank you so much for the invitation! I would love to attend your event.

Please let me know if there's anything I can bring or help with to make the occasion special.

Best regards,
[Your Name]`
    } else if (letter.includes('inquiry') || letter.includes('question') || letter.includes('information')) {
      return `Dear Inquirer,

Thank you for your inquiry. I appreciate your interest and would be happy to provide you with the information you requested.

Please let me know if you need any additional details or have further questions.

Best regards,
[Your Name]`
    } else if (letter.includes('apology') || letter.includes('sorry') || letter.includes('regret')) {
      return `Dear [Name],

Thank you for your apology. I completely understand that unexpected situations can arise, and I appreciate you reaching out.

No worries at all - these things happen to everyone. Let's reschedule and move forward.

Best regards,
[Your Name]`
    } else {
      // 通用回覆
      return `Dear Sender,

Thank you for your letter. I have received your message and will respond accordingly.

I appreciate you taking the time to reach out, and I will give your letter the attention it deserves.

Best regards,
[Your Name]`
    }
  }

  // 將英文回覆翻譯成中文
  const translateToChineseReply = async (englishText: string): Promise<string> => {
    try {
      const prompt = `Please translate the following English letter into Traditional Chinese. Keep the professional tone and format:

${englishText}`

      const response = await mistralService.generateCustomContent(prompt)
      return response
    } catch (error) {
      console.error('翻譯失敗:', error)
      
      // 提供備用中文翻譯
      return generateFallbackChineseTranslation(englishText)
    }
  }

  // 生成備用中文翻譯（當API不可用時）
  const generateFallbackChineseTranslation = (englishText: string): string => {
    const text = englishText.toLowerCase()
    
    // 根據英文內容提供對應的中文翻譯
    if (text.includes('dear applicant')) {
      return `親愛的申請者，

感謝您對該職位的興趣。我們已收到您的申請，目前正在審查中。

我們將在未來幾天內與您聯繫，討論招聘流程的下一步。

此致
敬禮
人力資源團隊`
    } else if (text.includes('dear customer')) {
      return `親愛的客戶，

感謝您將此事告知我們。我們對您所經歷的不便深表歉意。

我們正在調查此問題，將盡快為您提供解決方案。

此致
敬禮
客戶服務團隊`
    } else if (text.includes('dear friend')) {
      return `親愛的朋友，

非常感謝您的邀請！我很樂意參加您的活動。

請告訴我是否需要帶些什麼或幫忙準備，讓這個場合更加特別。

此致
敬禮
[您的姓名]`
    } else if (text.includes('dear inquirer')) {
      return `親愛的詢問者，

感謝您的詢問。我感謝您的興趣，很樂意為您提供您所要求的信息。

如果您需要任何額外的細節或有進一步的問題，請告訴我。

此致
敬禮
[您的姓名]`
    } else if (text.includes('thank you for your apology')) {
      return `親愛的[姓名]，

感謝您的道歉。我完全理解意外情況可能會發生，我感謝您主動聯繫。

完全不用擔心 - 這種事情會發生在每個人身上。讓我們重新安排時間，繼續前進。

此致
敬禮
[您的姓名]`
    } else {
      // 通用翻譯
      return `親愛的發信人，

感謝您的來信。我已收到您的消息，將相應地回覆。

我感謝您花時間聯繫我，我將認真對待您的來信。

此致
敬禮
[您的姓名]`
    }
  }



  // 複製到剪貼板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('複製失敗:', error)
    }
  }

  // 下載為文本文件
  const downloadAsText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 重置所有狀態
  const resetAll = () => {
    setInputLetter('')
    setReplyResult(null)
    setCopied(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 標題區域 */}
      <div className="text-center space-y-4">
        <div className="relative mb-4">
          <div className="text-5xl mb-2">✉️</div>
          <div className={`absolute inset-0 bg-gradient-to-r ${themeConfig.colors.gradient.blue}/20 ${themeConfig.colors.gradient.purple}/20 rounded-full blur-3xl`}></div>
        </div>
        <h2 className={`text-2xl font-bold bg-gradient-to-r ${themeConfig.colors.gradient.blue} ${themeConfig.colors.gradient.purple} bg-clip-text text-transparent`}>
          AI 英文回信助手
        </h2>
        <p className={`${themeConfig.colors.text.tertiary} text-lg`}>
          提供英文信件，AI自動生成專業回覆，並提供中英文對照
        </p>
        
        {/* API狀態指示器 */}
        <div className="flex items-center justify-center gap-2">
          {apiStatus === 'checking' && (
            <div className={`flex items-center gap-2 ${themeConfig.colors.text.accent}`}>
              <div className={`w-3 h-3 border-2 ${themeConfig.colors.border.accent} border-t-transparent rounded-full animate-spin`}></div>
              檢查API狀態中...
            </div>
          )}
          {apiStatus === 'available' && (
            <div className={`flex items-center gap-2 ${themeConfig.colors.text.accent}`}>
              <div className={`w-3 h-3 ${themeConfig.colors.text.accent} rounded-full`}></div>
              AI服務正常
            </div>
          )}
          {apiStatus === 'unavailable' && (
            <div className={`flex items-center gap-2 ${themeConfig.colors.text.accent}`}>
              <div className={`w-3 h-3 ${themeConfig.colors.text.accent} rounded-full`}></div>
              使用備用方案（離線模式）
            </div>
          )}
        </div>
      </div>

      {/* 信件輸入區域 */}
      <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
        <h3 className={`text-xl font-bold ${themeConfig.colors.text.primary} mb-4 flex items-center gap-2`}>
          <Mail className="w-5 h-5" />
          輸入要回覆的英文信件
        </h3>
        
        <textarea
          value={inputLetter}
          onChange={(e) => setInputLetter(e.target.value)}
          placeholder="請貼上或輸入您收到的英文信件內容..."
          className={`w-full bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-xl px-4 py-3 ${themeConfig.colors.text.primary} placeholder-${themeConfig.colors.text.tertiary} focus:outline-none focus:ring-2 focus:ring-${themeConfig.colors.border.accent} focus:border-transparent transition-all duration-200 resize-none backdrop-blur-sm shadow-lg`}
          rows={8}
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={generateReply}
            disabled={!inputLetter.trim() || isGenerating}
            className={`flex-1 bg-gradient-to-r ${themeConfig.colors.button.primary} hover:${themeConfig.colors.button.hover} disabled:bg-gradient-to-r ${themeConfig.colors.gradient.slate} text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                生成回信中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                生成AI回信
              </>
            )}
          </button>
          
          <button
            onClick={resetAll}
            className={`px-6 py-3 bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2`}
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        </div>
      </div>

      {/* AI生成的中英文對照回覆 */}
      {replyResult && (
        <div className="space-y-6">
          {/* 英文回覆 */}
          <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
            <h3 className={`text-xl font-bold ${themeConfig.colors.text.primary} mb-4 flex items-center gap-2`}>
              🇺🇸 英文回覆
            </h3>
            
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-xl p-4 mb-4`}>
              <pre className={`text-sm ${themeConfig.colors.text.primary} whitespace-pre-wrap font-sans leading-relaxed`}>{replyResult.englishReply}</pre>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(replyResult.englishReply)}
                className={`flex-1 bg-gradient-to-r ${themeConfig.colors.gradient.emerald} hover:${themeConfig.colors.gradient.teal} text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    複製英文回覆
                  </>
                )}
              </button>
              
              <button
                onClick={() => downloadAsText(replyResult.englishReply, 'English-Reply.txt')}
                className={`px-6 py-3 bg-gradient-to-r ${themeConfig.colors.gradient.slate} hover:${themeConfig.colors.gradient.gray} text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2`}
              >
                <Download className="w-4 h-4" />
                下載
              </button>
            </div>
          </div>

          {/* 中文回覆 */}
          <div className={`bg-gradient-to-br ${themeConfig.colors.background.card} border ${themeConfig.colors.border.accent} rounded-3xl p-6 backdrop-blur-xl shadow-2xl`}>
            <h3 className={`text-xl font-bold ${themeConfig.colors.text.primary} mb-4 flex items-center gap-2`}>
              🇨🇳 中文回覆
            </h3>
            
            <div className={`bg-gradient-to-r ${themeConfig.colors.background.tertiary} border ${themeConfig.colors.border.primary} rounded-xl p-4 mb-4`}>
              <pre className={`text-sm ${themeConfig.colors.text.primary} whitespace-pre-wrap font-sans leading-relaxed`}>{replyResult.chineseReply}</pre>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => copyToClipboard(replyResult.chineseReply)}
                className={`flex-1 bg-gradient-to-r ${themeConfig.colors.gradient.emerald} hover:${themeConfig.colors.gradient.teal} text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    複製中文回覆
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReplyLetterGenerator
