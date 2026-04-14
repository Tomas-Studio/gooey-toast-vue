import { watch, type Ref, type ComputedRef } from 'vue'
import { animate } from 'motion'
import { squishSpring } from '../math/squish-spring'
import {
  DEFAULT_EXPAND_DUR,
  DEFAULT_COLLAPSE_DUR,
  SMOOTH_EASE,
  SQUISH_DEBOUNCE_MS,
  SQUISH_COMPRESS_Y_BASE,
  SQUISH_EXPAND_X_BASE,
  SQUISH_COMPRESS_Y_COLLAPSE,
  SQUISH_EXPAND_X_COLLAPSE,
  HEADER_SQUISH_SCALE,
  HEADER_SQUISH_PUSH_Y,
  ERROR_SHAKE_DURATION,
  ERROR_SHAKE_FREQUENCY,
  ERROR_SHAKE_AMPLITUDE,
} from '../constants'

type AnimateReturn = ReturnType<typeof animate>

export interface SquishOptions {
  wrapperRef: Ref<HTMLElement | null>
  headerRef: Ref<HTMLElement | null>
  useSpring: ComputedRef<boolean>
  bounceVal: ComputedRef<number>
  prefersReducedMotion: Ref<boolean>
  showBody: Ref<boolean>
  dismissing: Ref<boolean>
  actionSuccess: Ref<string | null>
  hovered: Ref<boolean>
  hasDims: ComputedRef<boolean>
  isExpanded: ComputedRef<boolean>
  phase: () => string
  preDismissRef: { value: boolean }
  safeTimeout: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>
}

/**
 * Manages all spring-based squish animations:
 * - Landing squish (mount, expand, collapse)
 * - Header elastic squish (compress on expand, release on collapse)
 * - Error shake
 *
 * Returns cleanup function and triggerLandingSquish for external use.
 */
export function useSquishAnimations(options: SquishOptions) {
  const {
    wrapperRef,
    headerRef,
    useSpring,
    bounceVal,
    prefersReducedMotion,
    showBody,
    dismissing,
    actionSuccess,
    hovered,
    hasDims,
    isExpanded,
    phase,
    preDismissRef,
    safeTimeout,
  } = options

  let blobSquishCtrl: AnimateReturn | null = null
  let headerSquishCtrl: AnimateReturn | null = null
  let shakeCtrl: AnimateReturn | null = null
  let lastSquishTime = 0
  let mountSquished = false
  let headerSquished = false

  // -----------------------------------------------------------------------
  // Landing squish — blob compress/expand on mount, expand, collapse
  // -----------------------------------------------------------------------
  function triggerLandingSquish(squishPhase: 'expand' | 'collapse' | 'mount' = 'mount') {
    if (!wrapperRef.value || prefersReducedMotion.value || !useSpring.value) return
    const now = Date.now()
    if (now - lastSquishTime < SQUISH_DEBOUNCE_MS) return
    lastSquishTime = now
    blobSquishCtrl?.stop()
    const el = wrapperRef.value
    const springConfig =
      squishPhase === 'collapse'
        ? squishSpring(DEFAULT_COLLAPSE_DUR, DEFAULT_COLLAPSE_DUR, bounceVal.value)
        : squishSpring(DEFAULT_EXPAND_DUR, DEFAULT_EXPAND_DUR, bounceVal.value)
    const bScale = bounceVal.value / 0.4
    const compressY =
      (squishPhase === 'collapse' ? SQUISH_COMPRESS_Y_COLLAPSE : SQUISH_COMPRESS_Y_BASE) * bScale
    const expandX =
      (squishPhase === 'collapse' ? SQUISH_EXPAND_X_COLLAPSE : SQUISH_EXPAND_X_BASE) * bScale
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

  // -----------------------------------------------------------------------
  // Entry squish — fire on first valid dims
  // -----------------------------------------------------------------------
  watch(hasDims, (val) => {
    if (val && !mountSquished && !isExpanded.value) {
      mountSquished = true
      safeTimeout(() => triggerLandingSquish(), 45)
    }
  })

  // -----------------------------------------------------------------------
  // Squish on expand (showBody false → true)
  // -----------------------------------------------------------------------
  let prevShowBody = false
  watch(showBody, (val) => {
    if (!prevShowBody && val && !hovered.value) {
      safeTimeout(() => triggerLandingSquish('expand'), 80)
    }
    prevShowBody = val
  })

  // -----------------------------------------------------------------------
  // Error shake — short horizontal shake on phase → error
  // -----------------------------------------------------------------------
  let prevPhase = phase()
  watch(phase, (p) => {
    if (
      p === 'error' &&
      prevPhase !== 'error' &&
      !dismissing.value &&
      wrapperRef.value &&
      !prefersReducedMotion.value
    ) {
      shakeCtrl?.stop()
      const el = wrapperRef.value
      const mirror = el.style.transform?.includes('scaleX(-1)') ? 'scaleX(-1) ' : ''
      shakeCtrl = animate(0, 1, {
        duration: ERROR_SHAKE_DURATION,
        ease: 'easeOut' as any,
        onUpdate: (v: number) => {
          const decay = 1 - v
          const shake =
            Math.sin(v * Math.PI * ERROR_SHAKE_FREQUENCY) * decay * ERROR_SHAKE_AMPLITUDE
          el.style.transform = mirror + `translateX(${shake}px)`
        },
        onComplete: () => {
          el.style.transform = mirror.trim() || ''
        },
      })
    }
    prevPhase = p
  })

  // -----------------------------------------------------------------------
  // Header elastic squish — compress header on expand, release on collapse
  // -----------------------------------------------------------------------
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
          const scale = 1 - HEADER_SQUISH_SCALE * v
          const pushY = v * HEADER_SQUISH_PUSH_Y
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
          const scale = 1 - HEADER_SQUISH_SCALE * v
          const pushY = v * HEADER_SQUISH_PUSH_Y
          el.style.transform = `scale(${scale}) translateY(${pushY}px)`
        },
        onComplete: () => {
          el.style.transform = ''
        },
      })
    }
  })

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------
  function cleanup() {
    blobSquishCtrl?.stop()
    headerSquishCtrl?.stop()
    shakeCtrl?.stop()
  }

  return {
    triggerLandingSquish,
    cleanup,
  }
}
