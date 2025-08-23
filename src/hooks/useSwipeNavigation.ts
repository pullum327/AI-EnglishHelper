import { useState, useRef, useCallback } from 'react'

interface SwipeConfig {
  minSwipeDistance: number
  maxSwipeTime: number
  preventDefault: boolean
}

interface UseSwipeNavigationProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  config?: Partial<SwipeConfig>
}

const defaultConfig: SwipeConfig = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  preventDefault: false
}

export const useSwipeNavigation = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  config = {}
}: UseSwipeNavigationProps) => {
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null)
  
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null)
  
  const finalConfig = { ...defaultConfig, ...config }

  const onTouchStart = useCallback((e: TouchEvent) => {
    // 只在必要時阻止默認行為，避免影響正常滾動
    if (finalConfig.preventDefault && e.target instanceof HTMLElement) {
      const target = e.target as HTMLElement
      // 檢查是否在可滾動元素內
      if (!target.closest('textarea') && !target.closest('input')) {
        e.preventDefault()
      }
    }
    
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    }
    touchEnd.current = null
    setIsSwiping(false)
    setSwipeDirection(null)
  }, [finalConfig.preventDefault])

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return
    
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    }
    
    setIsSwiping(true)
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const timeElapsed = touchEnd.current.time - touchStart.current.time

    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    const isLongEnough = Math.abs(distanceX) > finalConfig.minSwipeDistance || Math.abs(distanceY) > finalConfig.minSwipeDistance
    const isFastEnough = timeElapsed < finalConfig.maxSwipeTime

    if (isLongEnough && isFastEnough) {
      if (isHorizontalSwipe) {
        if (distanceX > 0) {
          // 向左滑動
          setSwipeDirection('left')
          onSwipeLeft?.()
        } else {
          // 向右滑動
          setSwipeDirection('right')
          onSwipeRight?.()
        }
      } else {
        if (distanceY > 0) {
          // 向上滑動
          setSwipeDirection('up')
          onSwipeUp?.()
        } else {
          // 向下滑動
          setSwipeDirection('down')
          onSwipeDown?.()
        }
      }
    }

    // 重置觸控狀態
    touchStart.current = null
    touchEnd.current = null
    setIsSwiping(false)
    
    // 延遲清除方向狀態，以便UI可以顯示滑動反饋
    setTimeout(() => setSwipeDirection(null), 300)
  }, [finalConfig.minSwipeDistance, finalConfig.maxSwipeTime, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  const attachSwipeListeners = useCallback((element: HTMLElement) => {
    element.addEventListener('touchstart', onTouchStart, { passive: !finalConfig.preventDefault })
    element.addEventListener('touchmove', onTouchMove, { passive: true })
    element.addEventListener('touchend', onTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }, [onTouchStart, onTouchMove, onTouchEnd, finalConfig.preventDefault])

  return {
    isSwiping,
    swipeDirection,
    attachSwipeListeners
  }
}
