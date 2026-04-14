import { onMounted, onUnmounted, type Ref } from 'vue'
import { PH } from '../constants'

/**
 * Recalculates CSS variables (--initial-height, --offset) on sibling
 * toast `<li>` elements managed by vue-sonner. Sonner measures pill
 * height on mount but never re-measures after morph expand, so we
 * must do it manually.
 */
export function syncSonnerHeights(wrapperEl: HTMLElement | null, includeOffsets = false) {
  if (!wrapperEl) return
  const li = wrapperEl.closest('[data-sonner-toast]') as HTMLElement | null
  if (!li?.parentElement) return

  const ol = li.parentElement
  const toasts = Array.from(
    ol.querySelectorAll(':scope > [data-sonner-toast]'),
  ) as HTMLElement[]

  if (toasts.length === 0) return

  const heights = toasts.map((t) => {
    if (t.getAttribute('data-visible') === 'false') return 0
    const content = t.firstElementChild as HTMLElement | null
    const h = content ? content.getBoundingClientRect().height : 0
    return h > 0 ? h : PH
  })

  const isExpandedState =
    includeOffsets && toasts[0]?.getAttribute('data-expanded') === 'true'
  if (isExpandedState) {
    for (const t of toasts)
      t.style.setProperty('transition', 'none', 'important')
  }

  for (let i = 0; i < toasts.length; i++) {
    toasts[i].style.setProperty('--initial-height', `${heights[i]}px`)
  }

  if (!includeOffsets) {
    if (isExpandedState) {
      for (const t of toasts) t.style.removeProperty('transition')
    }
    return
  }

  const gapStr = getComputedStyle(ol).getPropertyValue('--gap').trim()
  const gap = parseFloat(gapStr) || 14

  let runningOffset = 0
  for (let i = toasts.length - 1; i >= 0; i--) {
    if (toasts[i].getAttribute('data-visible') === 'false') {
      toasts[i].style.setProperty('--offset', '0px')
      continue
    }
    toasts[i].style.setProperty('--offset', `${runningOffset}px`)
    if (i > 0) {
      runningOffset += heights[i] + gap
    }
  }

  if (isExpandedState) {
    void ol.offsetHeight
    for (const t of toasts) t.style.removeProperty('transition')
  }
}

// ---------------------------------------------------------------------------
// Shared MutationObserver registry — one observer per <ol> element, shared
// across all GooeyToast instances in the same toaster container.
// ---------------------------------------------------------------------------
const observerRegistry = new Map<
  Element,
  { observer: MutationObserver; callbacks: Set<() => void> }
>()

function registerSonnerObserver(ol: Element, callback: () => void) {
  let entry = observerRegistry.get(ol)
  if (!entry) {
    const callbacks = new Set<() => void>()
    let applying = false
    const observer = new MutationObserver(() => {
      if (applying) return
      applying = true
      requestAnimationFrame(() => {
        callbacks.forEach((cb) => cb())
        requestAnimationFrame(() => {
          applying = false
        })
      })
    })
    observer.observe(ol, {
      attributes: true,
      attributeFilter: ['style', 'data-visible'],
      subtree: true,
      childList: true,
    })
    entry = { observer, callbacks }
    observerRegistry.set(ol, entry)
  }
  entry.callbacks.add(callback)
  return () => {
    entry!.callbacks.delete(callback)
    if (entry!.callbacks.size === 0) {
      entry!.observer.disconnect()
      observerRegistry.delete(ol)
    }
  }
}

/**
 * Sets up MutationObservers on the Sonner toast container to keep
 * `--initial-height` and `--offset` CSS variables in sync whenever
 * toast elements change (add/remove/resize/expand).
 *
 * Call inside `<script setup>` — registers observers in `onMounted`
 * and cleans up in `onUnmounted`.
 */
export function useSonnerSync(wrapperRef: Ref<HTMLElement | null>) {
  let unregisterSonner: (() => void) | null = null
  let expandObserver: MutationObserver | null = null

  onMounted(() => {
    if (!wrapperRef.value) return
    const ol =
      wrapperRef.value.closest('[data-sonner-toast]')?.parentElement
    if (!ol) return

    unregisterSonner = registerSonnerObserver(ol, () => {
      syncSonnerHeights(wrapperRef.value, true)
    })

    expandObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === 'attributes' &&
          m.attributeName === 'data-expanded' &&
          (m.target as HTMLElement).getAttribute('data-expanded') === 'true'
        ) {
          syncSonnerHeights(wrapperRef.value, true)
          break
        }
      }
    })
    expandObserver.observe(ol, {
      attributes: true,
      attributeFilter: ['data-expanded'],
      subtree: true,
    })
  })

  onUnmounted(() => {
    unregisterSonner?.()
    expandObserver?.disconnect()
  })
}
