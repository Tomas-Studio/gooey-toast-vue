<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { Toaster } from 'vue-sonner'
import type { GooeyToasterProps } from '../types'
import { animationPresets } from '../presets'
import { configStore, setContainerHovered } from '../store/config-store'
import { gooeyToast, getMostRecentActiveId, setGooeyToastWrapperComponent, setPromiseToastWrapperComponent } from '../store/toast-store'
import AriaLiveAnnouncer from './AriaLiveAnnouncer.vue'
import GooeyToastWrapper from './GooeyToastWrapper.vue'
import PromiseToastWrapper from './PromiseToastWrapper.vue'

const props = withDefaults(defineProps<GooeyToasterProps>(), {
  position: 'bottom-right',
  gap: 14,
  offset: '24px',
  theme: 'light',
  visibleToasts: 3,
  dir: 'ltr',
  swipeToDismiss: true,
  closeOnEscape: true,
  maxQueue: Infinity,
  queueOverflow: 'drop-oldest',
  showProgress: false,
})

// Register wrapper components for the toast store to use
setGooeyToastWrapperComponent(GooeyToastWrapper)
setPromiseToastWrapperComponent(PromiseToastWrapper)

// Sync props to config store
watch(() => props.position, (v) => { configStore.position = v! }, { immediate: true })
watch(() => props.dir, (v) => { configStore.dir = v ?? 'ltr' }, { immediate: true })
watch(() => props.theme, (v) => { configStore.theme = v! }, { immediate: true })
watch(() => props.visibleToasts, (v) => { configStore.visibleToasts = v ?? 3 }, { immediate: true })
watch(() => props.swipeToDismiss, (v) => { configStore.swipeToDismiss = v ?? true }, { immediate: true })
watch(() => props.closeOnEscape, (v) => { configStore.closeOnEscape = v ?? true }, { immediate: true })
watch(() => props.maxQueue, (v) => { configStore.maxQueue = v ?? Infinity }, { immediate: true })
watch(() => props.queueOverflow, (v) => { configStore.queueOverflow = v ?? 'drop-oldest' }, { immediate: true })
watch(() => props.showProgress, (v) => { configStore.showProgress = v ?? false }, { immediate: true })
watch(() => props.closeButton, (v) => { configStore.closeButton = v ?? false }, { immediate: true })

// Resolve spring/bounce from preset
watch(
  [() => props.spring, () => props.bounce, () => props.preset],
  ([spring, bounce, preset]) => {
    const presetConfig = preset ? animationPresets[preset] : undefined
    configStore.spring = spring ?? presetConfig?.spring ?? true
    configStore.bounce = bounce ?? presetConfig?.bounce
  },
  { immediate: true },
)

// Escape key handler
let handleKeyDown: ((e: KeyboardEvent) => void) | null = null

watch(() => props.closeOnEscape, (enabled) => {
  if (handleKeyDown) {
    document.removeEventListener('keydown', handleKeyDown)
    handleKeyDown = null
  }
  if (enabled !== false) {
    handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const recentId = getMostRecentActiveId()
        if (recentId != null) {
          gooeyToast.dismiss(recentId)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
  }
}, { immediate: true })

// Container hover detection via pointer events on the sonner toaster element
let bodyObs: MutationObserver | null = null
let currentToaster: HTMLElement | null = null
let bodyRafId = 0

function handleMouseEnter() {
  setContainerHovered(true)
}
function handleMouseLeave() {
  setContainerHovered(false)
}

function attachToaster(el: HTMLElement) {
  if (el === currentToaster) return
  detachToaster()
  currentToaster = el
  el.addEventListener('mouseenter', handleMouseEnter)
  el.addEventListener('mouseleave', handleMouseLeave)
}

function detachToaster() {
  if (currentToaster) {
    currentToaster.removeEventListener('mouseenter', handleMouseEnter)
    currentToaster.removeEventListener('mouseleave', handleMouseLeave)
    currentToaster = null
  }
  setContainerHovered(false)
}

onMounted(() => {
  const el = document.querySelector<HTMLElement>('[data-sonner-toaster]')
  if (el) attachToaster(el)

  // Watch for sonner toaster being added/removed from DOM
  bodyObs = new MutationObserver(() => {
    if (bodyRafId) return
    bodyRafId = requestAnimationFrame(() => {
      bodyRafId = 0
      const found = document.querySelector<HTMLElement>('[data-sonner-toaster]')
      if (found) {
        attachToaster(found)
      } else {
        detachToaster()
      }
    })
  })
  bodyObs.observe(document.body, { childList: true, subtree: true })
})

onUnmounted(() => {
  if (handleKeyDown) document.removeEventListener('keydown', handleKeyDown)
  if (bodyRafId) cancelAnimationFrame(bodyRafId)
  bodyObs?.disconnect()
  detachToaster()
})
</script>

<template>
  <Toaster
    :position="position"
    :duration="duration"
    :gap="gap"
    :offset="offset"
    :theme="theme"
    :toast-options="{ unstyled: true }"
    :expand="expand ?? false"
    :close-button="false"
    :visible-toasts="visibleToasts"
    :dir="dir"
  />
  <AriaLiveAnnouncer />
</template>
