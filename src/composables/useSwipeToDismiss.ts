import { ref } from 'vue'
import { toast as sonnerToast } from 'vue-sonner'
import { configStore } from '../store/config-store'
import { SWIPE_THRESHOLD } from '../constants'

/**
 * Composable for swipe-to-dismiss touch gesture handling.
 *
 * Returns reactive swipe offset and touch event handlers to bind
 * on the toast wrapper element.
 */
export function useSwipeToDismiss(toastId: () => string | number | undefined) {
  const swipeOffsetX = ref(0)
  let swipeStart: { x: number; y: number } | null = null
  let isSwiping = false

  function handleTouchStart(e: TouchEvent) {
    if (!configStore.swipeToDismiss) return
    const touch = e.touches[0]
    swipeStart = { x: touch.clientX, y: touch.clientY }
    isSwiping = false
  }

  function handleTouchMove(e: TouchEvent) {
    if (!swipeStart || !configStore.swipeToDismiss) return
    const touch = e.touches[0]
    const dx = touch.clientX - swipeStart.x
    const dy = touch.clientY - swipeStart.y
    if (!isSwiping && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      swipeStart = null
      return
    }
    if (!isSwiping && Math.abs(dx) > 10) isSwiping = true
    if (isSwiping) swipeOffsetX.value = dx
  }

  function handleTouchEnd() {
    if (!configStore.swipeToDismiss) { swipeStart = null; return }
    const id = toastId()
    if (isSwiping && Math.abs(swipeOffsetX.value) >= SWIPE_THRESHOLD && id != null) {
      sonnerToast.dismiss(id)
    }
    swipeStart = null
    isSwiping = false
    swipeOffsetX.value = 0
  }

  return {
    swipeOffsetX,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
