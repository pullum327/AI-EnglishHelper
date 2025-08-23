import { SSE } from 'sse.js'

export interface SSEConfig {
  url: string
  headers?: Record<string, string>
  method?: 'GET' | 'POST'
  payload?: any
  withCredentials?: boolean
}

export interface SSEEvent {
  type: string
  data: any
  id?: string
  retry?: number
}

export class SSEService {
  private eventSource: EventSource | null = null
  private sse: SSE | null = null

  // 使用原生 EventSource 的簡單方法
  createEventSource(url: string, options?: EventSourceInit): EventSource {
    if (this.eventSource) {
      this.eventSource.close()
    }
    
    this.eventSource = new EventSource(url, options)
    return this.eventSource
  }

  // 使用 sse.js 的進階方法（支持 POST 和自定義標頭）
  createSSEConnection(config: SSEConfig): SSE {
    if (this.sse) {
      this.sse.close()
    }

    const sseConfig: any = {
      url: config.url,
      headers: config.headers || {},
      method: config.method || 'GET',
      withCredentials: config.withCredentials || false
    }

    if (config.method === 'POST' && config.payload) {
      sseConfig.payload = JSON.stringify(config.payload)
    }

    this.sse = new SSE(config.url, sseConfig)
    return this.sse
  }

  // 監聽事件
  onMessage(eventSource: EventSource | SSE, callback: (event: SSEEvent) => void): void {
    eventSource.addEventListener('message', (event) => {
      try {
        const data = event.data ? JSON.parse(event.data) : null
        callback({
          type: 'message',
          data,
          id: event.lastEventId || undefined
        })
      } catch (error) {
        console.warn('解析 SSE 消息失敗:', error)
        callback({
          type: 'message',
          data: event.data,
          id: event.lastEventId || undefined
        })
      }
    })
  }

  // 監聽特定事件類型
  onEvent(eventSource: EventSource | SSE, eventType: string, callback: (event: SSEEvent) => void): void {
    eventSource.addEventListener(eventType, (event) => {
      try {
        const data = event.data ? JSON.parse(event.data) : null
        callback({
          type: eventType,
          data,
          id: event.lastEventId || undefined
        })
      } catch (error) {
        console.warn(`解析 SSE ${eventType} 事件失敗:`, error)
        callback({
          type: eventType,
          data: event.data,
          id: event.lastEventId || undefined
        })
      }
    })
  }

  // 監聽錯誤
  onError(eventSource: EventSource | SSE, callback: (error: Event) => void): void {
    eventSource.addEventListener('error', callback)
  }

  // 監聽連接打開
  onOpen(eventSource: EventSource | SSE, callback: () => void): void {
    eventSource.addEventListener('open', callback)
  }

  // 關閉連接
  close(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    if (this.sse) {
      this.sse.close()
      this.sse = null
    }
  }

  // 檢查連接狀態
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN || 
           this.sse?.readyState === EventSource.OPEN
  }

  // 獲取連接狀態
  getReadyState(): number {
    if (this.eventSource) {
      return this.eventSource.readyState
    }
    if (this.sse) {
      return this.sse.readyState
    }
    return EventSource.CLOSED
  }
}

// 導出服務實例
export const sseService = new SSEService()
