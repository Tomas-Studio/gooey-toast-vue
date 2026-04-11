<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, type Component as VueComponent } from 'vue'
import { motion as Motion, AnimatePresence } from 'motion-v'
import { animate } from 'motion'
import { toast as sonnerToast } from 'vue-sonner'
import type { GooeyToastAction, GooeyToastClassNames, GooeyToastPhase, GooeyToastTimings, GooeyToastType, ToastContent } from '../types'
import type { AnimationPresetName } from '../presets'
import { animationPresets } from '../presets'
import { configStore, subscribeContainerHovered } from '../store/config-store'
import { morphPath, morphPathCenter } from '../math/morph-path'
import { squishSpring } from '../math/squish-spring'
import { PH, DEFAULT_DISPLAY_DURATION, DEFAULT_EXPAND_DUR, DEFAULT_COLLAPSE_DUR, SMOOTH_EASE } from '../constants'
import { usePrefersReducedMotion } from '../composables/usePrefersReducedMotion'
import { DefaultIcon, SuccessIcon, ErrorIcon, WarningIcon, InfoIcon, SpinnerIcon } from './icons'

const props = withDefaults(defineProps<{
  title: string
  description?: ToastContent
  type: GooeyToastType
  action?: GooeyToastAction
  icon?: ToastContent
  phase: GooeyToastPhase
  classNames?: GooeyToastClassNames
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  timing?: GooeyToastTimings
  preset?: AnimationPresetName
  spring?: boolean
  bounce?: number
  showProgress?: boolean
  showTimestamp?: boolean
  toastId?: string | number
}>(), {
  showTimestamp: true,
})

const prefersReducedMotion = usePrefersReducedMotion()

// Resolve spring/bounce from props > preset > global config
const presetConfig = computed(() => props.preset ? animationPresets[props.preset] : undefined)
const useSpring = computed(() => props.spring ?? presetConfig.value?.spring ?? configStore.spring)
const bounceVal = computed(() => props.bounce ?? presetConfig.value?.bounce ?? configStore.bounce ?? 0.4)
const showProgress = computed(() => props.showProgress ?? configStore.showProgress)
const theme = computed(() => configStore.theme)
const closeButtonSetting = computed(() => configStore.closeButton)
const showCloseButton = computed(() => closeButtonSetting.value !== false)
const position = computed(() => configStore.position)
const dir = computed(() => configStore.dir)
const posIsRight = computed(() => position.value?.includes('right') ?? false)
const isCenter = computed(() => position.value?.includes('center') ?? false)
const isRight = computed(() =>
  dir.value === 'rtl' ? (isCenter.value ? false : !posIsRight.value) : posIsRight.value
)
const fillColor = computed(() =>
  props.fillColor ?? (theme.value === 'dark' ? '#1a1a1a' : '#ffffff')
)

// Phase icon map
const phaseIconMap: Record<Exclude<GooeyToastPhase, 'loading'>, VueComponent> = {
  default: DefaultIcon,
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
}

// Color class maps
const titleColorMap: Record<GooeyToastPhase, string> = {
  loading: 'gooey-titleLoading',
  default: 'gooey-titleDefault',
  success: 'gooey-titleSuccess',
  error: 'gooey-titleError',
  warning: 'gooey-titleWarning',
  info: 'gooey-titleInfo',
}

const actionColorMap: Record<GooeyToastPhase, string> = {
  loading: 'gooey-actionInfo',
  default: 'gooey-actionDefault',
  success: 'gooey-actionSuccess',
  error: 'gooey-actionError',
  warning: 'gooey-actionWarning',
  info: 'gooey-actionInfo',
}

const progressColorMap: Record<GooeyToastPhase, string> = {
  loading: 'gooey-progressInfo',
  default: 'gooey-progressDefault',
  success: 'gooey-progressSuccess',
  error: 'gooey-progressError',
  warning: 'gooey-progressWarning',
  info: 'gooey-progressInfo',
}

// State
const actionSuccess = ref<string | null>(null)
const dismissing = ref(false)
const progressKey = ref(0)
const hovered = ref(false)
const hoveredRef = { value: false }
const containerHoveredRef = { value: configStore.containerHovered }
const containerHovered = ref(configStore.containerHovered)
const collapsingRef = { value: false }
const preDismissRef = { value: false }
const collapseEndTime = { value: 0 }
const expandedDimsRef = { value: { pw: 0, bw: 0, th: 0 } }

// Effective values
const effectiveTitle = computed(() => actionSuccess.value ?? props.title)
const effectivePhase = computed<GooeyToastPhase>(() => actionSuccess.value ? 'success' : props.phase)
const effectiveDescription = computed(() => actionSuccess.value ? undefined : props.description)
const effectiveAction = computed(() => actionSuccess.value ? undefined : props.action)
const isLoading = computed(() => effectivePhase.value === 'loading')
const hasDescription = computed(() => Boolean(effectiveDescription.value))
const hasAction = computed(() => Boolean(effectiveAction.value))
const isExpanded = computed(() => (hasDescription.value || hasAction.value) && !dismissing.value)

const showBody = ref(false)

// DOM refs
const wrapperRef = ref<HTMLDivElement | null>(null)
const pathRef = ref<SVGPathElement | null>(null)
const headerRef = ref<HTMLDivElement | null>(null)
const contentRef = ref<HTMLDivElement | null>(null)

// Animation controllers
let morphCtrl: ReturnType<typeof animate> | null = null
let pillResizeCtrl: ReturnType<typeof animate> | null = null
let headerSquishCtrl: ReturnType<typeof animate> | null = null
let blobSquishCtrl: ReturnType<typeof animate> | null = null
let shakeCtrl: ReturnType<typeof animate> | null = null

// Animated state (not reactive -- avoids re-renders during animation)
let morphT = 0
const aDims = { pw: 0, bw: 0, th: 0 }
const dimsRef = { pw: 0, bw: 0, th: 0 }

// React state for dims
const dims = ref({ pw: 0, bw: 0, th: 0 })
watch(dims, (v) => { dimsRef.pw = v.pw; dimsRef.bw = v.bw; dimsRef.th = v.th })

// Subscribe to container hover
let unsubContainerHover: (() => void) | null = null

// Timestamp
const createdAt = new Date()
const timestampStr = createdAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })

// Dismiss timer
let dismissTimer: ReturnType<typeof setTimeout> | null = null
const remainingRef = { value: null as number | null }
const timerStartRef = { value: 0 }
const progressDelayRef = { value: 0 }

// Squish timing
let lastSquishTime = 0
let mountSquished = false

// ---------------------------------------------------------------------------
// syncSonnerHeights — recalculates CSS variables on sibling toast <li> elements
// ---------------------------------------------------------------------------
function syncSonnerHeights(wrapperEl: HTMLElement | null, includeOffsets = false) {
  if (!wrapperEl) return
  const li = wrapperEl.closest('[data-sonner-toast]') as HTMLElement | null
  if (!li?.parentElement) return

  const ol = li.parentElement
  const toasts = Array.from(
    ol.querySelectorAll(':scope > [data-sonner-toast]')
  ) as HTMLElement[]

  if (toasts.length === 0) return

  const heights = toasts.map(t => {
    if (t.getAttribute('data-visible') === 'false') return 0
    const content = t.firstElementChild as HTMLElement | null
    const h = content ? content.getBoundingClientRect().height : 0
    return h > 0 ? h : PH
  })

  const isExpandedState = includeOffsets && toasts[0]?.getAttribute('data-expanded') === 'true'
  if (isExpandedState) {
    for (const t of toasts) t.style.setProperty('transition', 'none', 'important')
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
// flush — push current animated state to SVG DOM + constrain wrapper/content
// ---------------------------------------------------------------------------
function flush() {
  const { pw: p, bw: b, th: h } = aDims
  if (p <= 0 || b <= 0 || h <= 0) return
  const t = Math.max(0, Math.min(1, morphT))

  const pos = configStore.position
  const d = configStore.dir
  const centerPos = pos?.includes('center') ?? false
  const posRight = pos?.includes('right') ?? false
  const rightSide = d === 'rtl' ? (centerPos ? false : !posRight) : posRight

  if (centerPos) {
    const centerBw = Math.max(dimsRef.bw, expandedDimsRef.value.bw, p)
    pathRef.value?.setAttribute('d', morphPathCenter(p, centerBw, h, t))
  } else {
    pathRef.value?.setAttribute('d', morphPath(p, b, h, t))
  }

  if (t >= 1) {
    if (wrapperRef.value) wrapperRef.value.style.width = ''
    if (contentRef.value) {
      contentRef.value.style.width = ''
      contentRef.value.style.overflow = ''
      contentRef.value.style.maxHeight = ''
      contentRef.value.style.clipPath = ''
    }
  } else if (t > 0) {
    const targetBw = dimsRef.bw
    const pillW = Math.min(p, b)
    const currentW = pillW + (b - pillW) * t
    const currentH = PH + (dimsRef.th - PH) * t
    const centerFullW = centerPos ? Math.max(dimsRef.bw, expandedDimsRef.value.bw, p) : 0
    if (wrapperRef.value) {
      wrapperRef.value.style.width = (centerPos ? centerFullW : currentW) + 'px'
    }
    if (contentRef.value) {
      contentRef.value.style.width = (centerPos ? centerFullW : targetBw) + 'px'
      contentRef.value.style.overflow = 'hidden'
      contentRef.value.style.maxHeight = currentH + 'px'
      if (centerPos) {
        const clip = (centerFullW - currentW) / 2
        contentRef.value.style.clipPath = `inset(0 ${clip}px 0 ${clip}px)`
      } else {
        const clip = targetBw - currentW
        contentRef.value.style.clipPath = rightSide
          ? `inset(0 0 0 ${clip}px)`
          : `inset(0 ${clip}px 0 0)`
      }
    }
  } else {
    const pillW = Math.min(p, b)
    const centerPos2 = configStore.position?.includes('center') ?? false
    if (wrapperRef.value) {
      const centerBw = centerPos2 ? Math.max(dimsRef.bw, expandedDimsRef.value.bw, p) : pillW
      wrapperRef.value.style.width = centerBw + 'px'
    }
    if (contentRef.value) {
      if (centerPos2) {
        const centerBwVal = Math.max(dimsRef.bw, expandedDimsRef.value.bw, p)
        contentRef.value.style.width = centerBwVal + 'px'
        const clip = (centerBwVal - pillW) / 2
        contentRef.value.style.clipPath = `inset(0 ${clip}px 0 ${clip}px)`
      } else {
        contentRef.value.style.width = ''
        contentRef.value.style.clipPath = ''
      }
      contentRef.value.style.overflow = 'hidden'
      contentRef.value.style.maxHeight = PH + 'px'
    }
  }
}

// ---------------------------------------------------------------------------
// measure — measure content dimensions
// ---------------------------------------------------------------------------
function measure() {
  if (!headerRef.value || !contentRef.value) return

  const savedW = wrapperRef.value?.style.width ?? ''
  const savedOv = contentRef.value.style.overflow
  const savedMH = contentRef.value.style.maxHeight
  const savedCW = contentRef.value.style.width
  if (wrapperRef.value) wrapperRef.value.style.width = ''
  contentRef.value.style.overflow = ''
  contentRef.value.style.maxHeight = ''
  contentRef.value.style.width = ''

  const cs = getComputedStyle(contentRef.value)
  const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
  const pw = headerRef.value.offsetWidth + paddingX
  const bw = contentRef.value.offsetWidth
  const th = contentRef.value.offsetHeight

  if (wrapperRef.value) wrapperRef.value.style.width = savedW
  contentRef.value.style.overflow = savedOv
  contentRef.value.style.maxHeight = savedMH
  contentRef.value.style.width = savedCW

  dimsRef.pw = pw; dimsRef.bw = bw; dimsRef.th = th
  dims.value = { pw, bw, th }
}

// ---------------------------------------------------------------------------
// Landing squish animation
// ---------------------------------------------------------------------------
function triggerLandingSquish(phase: 'expand' | 'collapse' | 'mount' = 'mount') {
  if (!wrapperRef.value || prefersReducedMotion.value || !useSpring.value) return
  const now = Date.now()
  if (now - lastSquishTime < 300) return
  lastSquishTime = now
  blobSquishCtrl?.stop()
  const el = wrapperRef.value
  const springConfig = phase === 'collapse'
    ? squishSpring(DEFAULT_COLLAPSE_DUR, DEFAULT_COLLAPSE_DUR, bounceVal.value)
    : squishSpring(DEFAULT_EXPAND_DUR, DEFAULT_EXPAND_DUR, bounceVal.value)
  const bScale = bounceVal.value / 0.4
  const compressY = (phase === 'collapse' ? 0.035 : 0.12) * bScale
  const expandX = (phase === 'collapse' ? 0.018 : 0.06) * bScale
  blobSquishCtrl = animate(0, 1, {
    ...springConfig,
    onUpdate: (v: number) => {
      const intensity = Math.sin(v * Math.PI)
      const sy = 1 - compressY * intensity
      const sx = 1 + expandX * intensity
      const mirror = el.style.transform?.includes('scaleX(-1)') ? 'scaleX(-1) ' : ''
      el.style.transformOrigin = 'center top'
      el.style.transform = mirror + `scaleX(${sx}) scaleY(${sy})`
    },
    onComplete: () => {
      const right = el.style.transform?.includes('scaleX(-1)')
      el.style.transform = right ? 'scaleX(-1)' : ''
      el.style.transformOrigin = ''
    },
  })
}

// ---------------------------------------------------------------------------
// MutationObserver for Sonner height sync
// ---------------------------------------------------------------------------
const observerRegistry = new Map<Element, {
  observer: MutationObserver
  callbacks: Set<() => void>
}>()

function registerSonnerObserver(ol: Element, callback: () => void) {
  let entry = observerRegistry.get(ol)
  if (!entry) {
    const callbacks = new Set<() => void>()
    let applying = false
    const observer = new MutationObserver(() => {
      if (applying) return
      applying = true
      requestAnimationFrame(() => {
        callbacks.forEach(cb => cb())
        requestAnimationFrame(() => { applying = false })
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

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
let resizeObserver: ResizeObserver | null = null
let unregisterSonner: (() => void) | null = null
let expandObserver: MutationObserver | null = null
let measureTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  // Subscribe to container hover
  unsubContainerHover = subscribeContainerHovered((h) => {
    containerHoveredRef.value = h
    containerHovered.value = h
  })

  // Initial measure
  nextTick(() => {
    measure()
    measureTimeout = setTimeout(measure, 100)

    // Trigger initial expand if description/action present at mount time
    if (isExpanded.value) {
      const delay = prefersReducedMotion.value ? 0 : 330
      setTimeout(() => { showBody.value = true }, delay)
    }
  })

  // ResizeObserver for content changes
  if (contentRef.value) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(contentRef.value)
  }

  // Sonner height sync observer
  if (wrapperRef.value) {
    const ol = wrapperRef.value.closest('[data-sonner-toast]')?.parentElement
    if (ol) {
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
    }
  }
})

onUnmounted(() => {
  unsubContainerHover?.()
  resizeObserver?.disconnect()
  unregisterSonner?.()
  expandObserver?.disconnect()
  morphCtrl?.stop()
  pillResizeCtrl?.stop()
  headerSquishCtrl?.stop()
  blobSquishCtrl?.stop()
  shakeCtrl?.stop()
  if (measureTimeout) clearTimeout(measureTimeout)
  if (dismissTimer) clearTimeout(dismissTimer)
})

// ---------------------------------------------------------------------------
// Watch dims changes and re-measure on prop changes
// ---------------------------------------------------------------------------
watch(
  [() => effectiveTitle.value, () => effectivePhase.value, () => isExpanded.value, () => showBody.value, () => effectiveDescription.value, () => effectiveAction.value],
  () => {
    nextTick(() => {
      measure()
      setTimeout(measure, 100)
    })
  },
)

const hasDims = computed(() => dims.value.pw > 0 && dims.value.bw > 0 && dims.value.th > 0)

// Handle dims changes: pill resize or direct update
watch(
  [dims, hasDims, showBody],
  ([newDims, hasDimsVal, showBodyVal]) => {
    if (!hasDimsVal || collapsingRef.value) return

    const { pw, bw, th } = newDims
    const prev = { ...aDims }
    const target = { pw, bw, th }

    // First render
    if (prev.bw <= 0) {
      Object.assign(aDims, target)
      flush()
      return
    }

    // During morph
    if (morphT > 0 && morphT < 1) {
      Object.assign(aDims, target)
      flush()
      return
    }

    // Expanded and settled
    if (showBodyVal) {
      Object.assign(aDims, target)
      flush()
      return
    }

    // Compact: animate pill resize
    if (prev.bw === target.bw && prev.pw === target.pw && prev.th === target.th) return

    if (prefersReducedMotion.value) {
      Object.assign(aDims, target)
      flush()
      return
    }

    pillResizeCtrl?.stop()
    if (Date.now() - collapseEndTime.value > 500 && !isExpanded.value) {
      triggerLandingSquish('expand')
    }
    const pillResizeTransition = useSpring.value
      ? { type: 'spring' as const, duration: 0.5, bounce: bounceVal.value * 0.875 }
      : { duration: 0.4, ease: SMOOTH_EASE }
    pillResizeCtrl = animate(0, 1, {
      ...pillResizeTransition,
      onUpdate: (t: number) => {
        aDims.pw = prev.pw + (target.pw - prev.pw) * t
        aDims.bw = prev.bw + (target.bw - prev.bw) * t
        aDims.th = prev.th + (target.th - prev.th) * t
        flush()
      },
    })
  },
  { immediate: true },
)

// Entry squish
watch(hasDims, (val) => {
  if (val && !mountSquished && !isExpanded.value) {
    mountSquished = true
    setTimeout(() => triggerLandingSquish(), 45)
  }
})

// Squish on expand (showBody false→true)
let prevShowBody = false
watch(showBody, (val) => {
  if (!prevShowBody && val && !hoveredRef.value) {
    setTimeout(() => triggerLandingSquish('expand'), 80)
  }
  prevShowBody = val
})

// Error shake
let prevPhase = props.phase
watch(() => props.phase, (phase) => {
  if (phase === 'error' && prevPhase !== 'error' && !dismissing.value && wrapperRef.value && !prefersReducedMotion.value) {
    shakeCtrl?.stop()
    const el = wrapperRef.value
    const mirror = el.style.transform?.includes('scaleX(-1)') ? 'scaleX(-1) ' : ''
    shakeCtrl = animate(0, 1, {
      duration: 0.4,
      ease: 'easeOut' as any,
      onUpdate: (v: number) => {
        const decay = 1 - v
        const shake = Math.sin(v * Math.PI * 6) * decay * 3
        el.style.transform = mirror + `translateX(${shake}px)`
      },
      onComplete: () => {
        el.style.transform = mirror.trim() || ''
      },
    })
  }
  prevPhase = phase
})

// Phase 1: expand (delay showBody) or collapse (reverse morph)
watch(isExpanded, (expanded) => {
  if (expanded) {
    const delay = prefersReducedMotion.value ? 0 : 330
    setTimeout(() => { showBody.value = true }, delay)
    return
  }

  morphCtrl?.stop()
  pillResizeCtrl?.stop()

  if (morphT > 0) {
    // Compute target compact pill dims
    const csPad = contentRef.value ? getComputedStyle(contentRef.value) : null
    const padX = csPad ? parseFloat(csPad.paddingLeft) + parseFloat(csPad.paddingRight) : 20
    const targetPw = headerRef.value ? headerRef.value.offsetWidth + padX : aDims.pw
    const targetDims = { pw: targetPw, bw: targetPw, th: PH }

    if (prefersReducedMotion.value) {
      morphT = 0
      collapsingRef.value = false
      preDismissRef.value = false
      showBody.value = false
      Object.assign(aDims, targetDims)
      flush()
      return
    }

    const savedDims = expandedDimsRef.value.bw > 0
      ? { ...expandedDimsRef.value }
      : { ...aDims }

    const isPreDismiss = preDismissRef.value
    const collapseDur = 0.9
    const collapseTransition = (isPreDismiss || !useSpring.value)
      ? { duration: collapseDur, ease: SMOOTH_EASE }
      : { type: 'spring' as const, duration: collapseDur, bounce: bounceVal.value * 0.875 }

    triggerLandingSquish('collapse')

    morphCtrl = animate(morphT, 0, {
      ...collapseTransition,
      onUpdate: (t: number) => {
        morphT = t
        aDims.pw = targetDims.pw + (savedDims.pw - targetDims.pw) * t
        aDims.bw = targetDims.bw + (savedDims.bw - targetDims.bw) * t
        aDims.th = targetDims.th + (savedDims.th - targetDims.th) * t
        flush()
        syncSonnerHeights(wrapperRef.value, true)
      },
      onComplete: () => {
        morphT = 0
        collapsingRef.value = false
        preDismissRef.value = false
        collapseEndTime.value = Date.now()
        Object.assign(aDims, targetDims)
        flush()
        syncSonnerHeights(wrapperRef.value, true)
        showBody.value = false
      },
    })
    return
  }

  showBody.value = false
  morphT = 0
  flush()
})

// Auto-dismiss timer for expanded toasts
watch(
  [showBody, actionSuccess, dismissing, hovered, containerHovered],
  ([showBodyVal, actionSuccessVal, dismissingVal]) => {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null }
    if (!showBodyVal || actionSuccessVal || dismissingVal) return

    const expandDelayMs = prefersReducedMotion.value ? 0 : 330
    const collapseMs = prefersReducedMotion.value ? 10 : (0.9 * 1000)
    const displayMs = props.timing?.displayDuration ?? DEFAULT_DISPLAY_DURATION
    const fullDelay = displayMs - expandDelayMs - collapseMs
    progressDelayRef.value = Math.max(fullDelay, 0)
    if (fullDelay <= 0) return

    if (hoveredRef.value || containerHoveredRef.value) return

    const delay = remainingRef.value ?? fullDelay
    timerStartRef.value = Date.now()

    dismissTimer = setTimeout(() => {
      if (hoveredRef.value || containerHoveredRef.value) {
        const elapsed = Date.now() - timerStartRef.value
        remainingRef.value = Math.max(0, delay - elapsed)
        return
      }
      remainingRef.value = null
      expandedDimsRef.value = { ...aDims }
      collapsingRef.value = true
      preDismissRef.value = true
      dismissing.value = true
    }, delay)
  },
)

// Re-expand on hover
const canExpand = computed(() => hasDescription.value || hasAction.value)
let reExpandingRef = false

watch(
  [hovered, containerHovered],
  ([h, ch]) => {
    if ((!h && !ch) || !canExpand.value || !dismissing.value) return
    morphCtrl?.stop()
    collapsingRef.value = false
    preDismissRef.value = false
    remainingRef.value = null
    reExpandingRef = true
    dismissing.value = false
    showBody.value = true
    if (showProgress.value) progressKey.value++

    const currentT = morphT
    const startDims = { ...aDims }
    const morphExpandTransition = useSpring.value
      ? { type: 'spring' as const, duration: 0.9, bounce: bounceVal.value }
      : { duration: 0.6, ease: SMOOTH_EASE }

    requestAnimationFrame(() => {
      morphCtrl = animate(currentT, 1, {
        ...morphExpandTransition,
        onUpdate: (t: number) => {
          morphT = t
          aDims.pw = startDims.pw + (dimsRef.pw - startDims.pw) * t
          aDims.bw = startDims.bw + (dimsRef.bw - startDims.bw) * t
          aDims.th = startDims.th + (dimsRef.th - startDims.th) * t
          flush()
          syncSonnerHeights(wrapperRef.value, true)
        },
        onComplete: () => {
          morphT = 1
          Object.assign(aDims, { ...dimsRef })
          reExpandingRef = false
          flush()
          syncSonnerHeights(wrapperRef.value, true)
        },
      })
    })
  },
)

// Dismiss from Sonner after collapse completes
watch([dismissing, showBody], ([d, sb]) => {
  if (!props.toastId || !d || sb) return
  setTimeout(() => {
    if (!hoveredRef.value && !containerHoveredRef.value) {
      sonnerToast.dismiss(props.toastId!)
    }
  }, 800)
})

// Dismiss after action success
watch([actionSuccess, showBody], ([as, sb]) => {
  if (!props.toastId || !as || sb) return
  setTimeout(() => sonnerToast.dismiss(props.toastId!), 1200)
})

// Phase 2: morph from pill → blob
watch(showBody, (val) => {
  if (reExpandingRef) return
  if (!val) {
    morphT = 0
    morphCtrl?.stop()
    flush()
    return
  }

  if (prefersReducedMotion.value) {
    pillResizeCtrl?.stop()
    morphCtrl?.stop()
    morphT = 1
    Object.assign(aDims, { ...dimsRef })
    flush()
    syncSonnerHeights(wrapperRef.value, true)
    return
  }

  requestAnimationFrame(() => {
    pillResizeCtrl?.stop()
    morphCtrl?.stop()
    const startDims = { ...aDims }
    const morphExpandTransition = useSpring.value
      ? { type: 'spring' as const, duration: 0.9, bounce: bounceVal.value }
      : { duration: 0.6, ease: SMOOTH_EASE }
    morphCtrl = animate(0, 1, {
      ...morphExpandTransition,
      onUpdate: (t: number) => {
        morphT = t
        aDims.pw = startDims.pw + (dimsRef.pw - startDims.pw) * t
        aDims.bw = startDims.bw + (dimsRef.bw - startDims.bw) * t
        aDims.th = startDims.th + (dimsRef.th - startDims.th) * t
        flush()
        syncSonnerHeights(wrapperRef.value, true)
      },
      onComplete: () => {
        morphT = 1
        Object.assign(aDims, { ...dimsRef })
        flush()
        syncSonnerHeights(wrapperRef.value, true)
      },
    })
  })
})

// Header elastic squish
let headerSquished = false
watch([showBody, dismissing, actionSuccess], ([sb, d, as]) => {
  if (!headerRef.value || prefersReducedMotion.value) return
  headerSquishCtrl?.stop()
  const el = headerRef.value

  if (sb && !d && !as) {
    if (!useSpring.value) return
    headerSquished = true
    headerSquishCtrl = animate(0, 1, {
      ...squishSpring(DEFAULT_EXPAND_DUR, DEFAULT_EXPAND_DUR, bounceVal.value),
      onUpdate: (v: number) => {
        const scale = 1 - 0.05 * v
        const pushY = v * 1
        el.style.transform = `scale(${scale}) translateY(${pushY}px)`
      },
    })
  } else if (headerSquished) {
    headerSquished = false
    const isSpringCollapse = !preDismissRef.value && useSpring.value
    const transition = isSpringCollapse
      ? squishSpring(DEFAULT_COLLAPSE_DUR, DEFAULT_COLLAPSE_DUR, bounceVal.value)
      : { duration: DEFAULT_COLLAPSE_DUR * 0.5, ease: SMOOTH_EASE }
    headerSquishCtrl = animate(1, 0, {
      ...transition,
      onUpdate: (v: number) => {
        const scale = 1 - 0.05 * v
        const pushY = v * 1
        el.style.transform = `scale(${scale}) translateY(${pushY}px)`
      },
      onComplete: () => {
        el.style.transform = ''
      },
    })
  }
})

// Swipe-to-dismiss
const SWIPE_THRESHOLD = 100
let swipeStart: { x: number; y: number } | null = null
const swipeOffsetX = ref(0)
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
  if (isSwiping && Math.abs(swipeOffsetX.value) >= SWIPE_THRESHOLD && props.toastId) {
    sonnerToast.dismiss(props.toastId)
  }
  swipeStart = null
  isSwiping = false
  swipeOffsetX.value = 0
}

// Action button handler
function handleActionClick() {
  if (!effectiveAction.value) return
  if (effectiveAction.value.successLabel) {
    expandedDimsRef.value = { ...aDims }
    collapsingRef.value = true
    actionSuccess.value = effectiveAction.value.successLabel
  }
  try { effectiveAction.value.onClick() } catch { /* onClick errors shouldn't block morph-back */ }
}

function handleMouseEnter() { hoveredRef.value = true; hovered.value = true }
function handleMouseLeave() { hoveredRef.value = false; hovered.value = false }

// Computed styles
const wrapperStyle = computed(() => {
  const base: Record<string, string> = {}
  if (isCenter.value) {
    base.margin = '0 auto'
  } else if (isRight.value) {
    base.marginLeft = 'auto'
    base.transform = 'scaleX(-1)'
  }
  if (swipeOffsetX.value !== 0) {
    const existingTransform = base.transform ?? ''
    base.transform = (existingTransform ? existingTransform + ' ' : '') + `translateX(${swipeOffsetX.value}px)`
    base.opacity = String(Math.max(0, 1 - Math.abs(swipeOffsetX.value) / (SWIPE_THRESHOLD * 1.5)))
    base.transition = 'none'
  }
  return base
})

const contentStyle = computed(() => {
  if (isCenter.value) return { textAlign: 'center' as const }
  if (isRight.value) return { transform: 'scaleX(-1)', textAlign: 'right' as const }
  return { textAlign: 'left' as const }
})

const wrapperClasses = computed(() => {
  let cls = 'gooey-wrapper'
  if (props.classNames?.wrapper) cls += ' ' + props.classNames.wrapper
  return cls
})

const contentClasses = computed(() => {
  let cls = 'gooey-content'
  cls += showBody.value ? ' gooey-contentExpanded' : ' gooey-contentCompact'
  if (props.classNames?.content) cls += ' ' + props.classNames.content
  return cls
})

const headerClasses = computed(() => {
  let cls = 'gooey-header ' + titleColorMap[effectivePhase.value]
  if (props.classNames?.header) cls += ' ' + props.classNames.header
  return cls
})

const iconTransition = computed(() =>
  prefersReducedMotion.value ? { duration: 0.01 } : { duration: 0.2 }
)

const iconKey = computed(() => isLoading.value ? 'spinner' : effectivePhase.value)

const currentIcon = computed(() => {
  if (!actionSuccess.value && props.icon) return null // custom icon slot
  if (isLoading.value) return SpinnerIcon
  return phaseIconMap[effectivePhase.value as Exclude<GooeyToastPhase, 'loading'>]
})

// Close button position
const closeButtonRightClass = computed(() => {
  return (isRight.value ? closeButtonSetting.value !== 'top-right' : closeButtonSetting.value === 'top-right')
    ? 'gooey-closeButtonRight'
    : ''
})

// Progress bar duration style
const progressDurationStyle = computed(() => ({
  '--gooey-progress-duration': `${progressDelayRef.value || (props.timing?.displayDuration ?? DEFAULT_DISPLAY_DURATION)}ms`,
}))
</script>

<template>
  <div
    ref="wrapperRef"
    :class="wrapperClasses"
    :style="wrapperStyle"
    :role="effectivePhase === 'error' || effectivePhase === 'warning' ? 'alert' : 'status'"
    :aria-live="effectivePhase === 'error' || effectivePhase === 'warning' ? 'assertive' : 'polite'"
    aria-atomic="true"
    :data-center="isCenter || undefined"
    :data-theme="theme"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- SVG background -->
    <svg class="gooey-blobSvg" aria-hidden="true">
      <path
        ref="pathRef"
        :fill="fillColor"
        :stroke="borderColor || 'none'"
        :stroke-width="borderColor ? (borderWidth ?? 1.5) : 0"
      />
    </svg>

    <!-- Close button -->
    <button
      v-if="showCloseButton && effectivePhase !== 'loading'"
      :class="['gooey-closeButton', closeButtonRightClass]"
      aria-label="Close toast"
      type="button"
      :style="{
        background: fillColor,
        borderColor: borderColor || 'transparent',
        borderWidth: borderColor ? (borderWidth ?? 1.5) + 'px' : '0',
        boxShadow: borderColor ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.2)',
      }"
      @click.stop="toastId != null && sonnerToast.dismiss(toastId)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>

    <!-- Content -->
    <div ref="contentRef" :class="contentClasses" :style="contentStyle">
      <div ref="headerRef" :class="headerClasses">
        <!-- Icon -->
        <div :class="['gooey-iconWrapper', classNames?.icon]">
          <AnimatePresence mode="wait">
            <Motion.div
              :key="iconKey"
              :initial="prefersReducedMotion ? false : { opacity: 0, scale: 0.5 }"
              :animate="{ opacity: 1, scale: 1 }"
              :exit="{ opacity: 0, scale: 0.5 }"
              :transition="iconTransition"
            >
              <slot v-if="!actionSuccess && icon" name="icon">
                <component :is="icon" v-if="typeof icon !== 'string'" :size="18" />
                <span v-else>{{ icon }}</span>
              </slot>
              <component v-else-if="currentIcon" :is="currentIcon" :size="18" />
            </Motion.div>
          </AnimatePresence>
        </div>
        <!-- Title -->
        <span :class="['gooey-title', classNames?.title]">{{ effectiveTitle }}</span>
        <!-- Inline timestamp for simple toasts -->
        <span
          v-if="!hasDescription && !hasAction && !actionSuccess && showTimestamp"
          class="gooey-timestamp"
        >{{ timestampStr }}</span>
      </div>

      <!-- Description -->
      <AnimatePresence>
        <Motion.div
          v-if="showBody && hasDescription && !dismissing"
          key="description"
          :class="['gooey-description', classNames?.description]"
          style="text-align: left"
          :initial="prefersReducedMotion ? false : { opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="prefersReducedMotion ? { duration: 0.01 } : { duration: 0.35, ease: [0.4, 0, 0.2, 1] }"
        >
          <div style="display: flex; align-items: flex-start; gap: 10px">
            <div style="flex: 1; min-width: 0">
              <template v-if="typeof effectiveDescription === 'string'">{{ effectiveDescription }}</template>
              <component v-else-if="effectiveDescription" :is="effectiveDescription" />
            </div>
            <span v-if="showTimestamp" class="gooey-timestamp">{{ timestampStr }}</span>
          </div>
        </Motion.div>
      </AnimatePresence>

      <!-- Timestamp for body toasts without description -->
      <AnimatePresence>
        <Motion.div
          v-if="showBody && !hasDescription && hasAction && !dismissing && showTimestamp"
          key="timestamp-body"
          class="gooey-timestamp"
          style="text-align: right; margin-top: 8px; padding-left: 0"
          :initial="prefersReducedMotion ? false : { opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="prefersReducedMotion ? { duration: 0.01 } : { duration: 0.35, ease: [0.4, 0, 0.2, 1] }"
        >
          {{ timestampStr }}
        </Motion.div>
      </AnimatePresence>

      <!-- Action button -->
      <AnimatePresence>
        <Motion.div
          v-if="showBody && hasAction && effectiveAction && !dismissing"
          key="action"
          :class="['gooey-actionWrapper', classNames?.actionWrapper]"
          :initial="prefersReducedMotion ? false : { opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
          :transition="prefersReducedMotion ? { duration: 0.01 } : { duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.1 }"
        >
          <button
            :class="['gooey-actionButton', actionColorMap[effectivePhase], classNames?.actionButton]"
            type="button"
            :aria-label="effectiveAction.label"
            @click="handleActionClick"
          >
            {{ effectiveAction.label }}
          </button>
        </Motion.div>
      </AnimatePresence>

      <!-- Progress bar -->
      <div
        v-if="showProgress"
        :key="progressKey"
        :class="['gooey-progressWrapper', (hovered || containerHovered) ? 'gooey-progressPaused' : '']"
        :style="{ opacity: showBody && !actionSuccess ? 1 : 0 }"
      >
        <div
          :class="['gooey-progressBar', progressColorMap[effectivePhase]]"
          :style="progressDurationStyle"
        />
      </div>
    </div>
  </div>
</template>
