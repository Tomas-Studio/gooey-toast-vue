<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { GooeyToastAction, GooeyToastClassNames, GooeyToastPhase, GooeyToastTimings, GooeyToastType, GooeyToastUpdateOptions, ToastContent } from '../types'
import type { AnimationPresetName } from '../presets'
import { registerUpdateListener, unregisterUpdateListener, onToastDismissed, registerCallbacks } from '../store/toast-store'
import GooeyToast from './GooeyToast.vue'

const props = defineProps<{
  initialPhase: GooeyToastPhase
  title: string
  type: GooeyToastType
  description?: ToastContent
  action?: GooeyToastAction
  icon?: ToastContent
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
  toastId: string | number
  onDismiss?: (id: string | number) => void
  onAutoClose?: (id: string | number) => void
}>()

const currentTitle = ref(props.title)
const currentType = ref(props.type)
const currentPhase = ref<GooeyToastPhase>(props.initialPhase)
const currentDescription = ref<ToastContent | undefined>(props.description)
const currentAction = ref<GooeyToastAction | undefined>(props.action)
const currentIcon = ref<ToastContent | undefined>(props.icon)
const currentShowTimestamp = ref(props.showTimestamp ?? true)

// Register callbacks
onMounted(() => {
  if (props.onDismiss || props.onAutoClose) {
    registerCallbacks(props.toastId, props.onDismiss, props.onAutoClose)
  }
})

// Subscribe to in-place updates
onMounted(() => {
  registerUpdateListener(props.toastId, (opts: GooeyToastUpdateOptions) => {
    if (opts.title !== undefined) currentTitle.value = opts.title
    if (opts.description !== undefined) currentDescription.value = opts.description
    if (opts.type !== undefined) {
      currentType.value = opts.type
      currentPhase.value = opts.type
    }
    if (opts.action !== undefined) currentAction.value = opts.action
    if ('icon' in opts) currentIcon.value = opts.icon ?? undefined
    if (opts.showTimestamp !== undefined) currentShowTimestamp.value = opts.showTimestamp
  })
})

// Free queue slot on unmount
let mounted = true
onMounted(() => { mounted = true })
onUnmounted(() => {
  mounted = false
  unregisterUpdateListener(props.toastId)
  setTimeout(() => {
    if (!mounted) onToastDismissed(props.toastId)
  }, 100)
})
</script>

<template>
  <GooeyToast
    :title="currentTitle"
    :description="currentDescription"
    :type="currentType"
    :action="currentAction"
    :icon="currentIcon"
    :phase="currentPhase"
    :class-names="classNames"
    :fill-color="fillColor"
    :border-color="borderColor"
    :border-width="borderWidth"
    :timing="timing"
    :preset="preset"
    :spring="spring"
    :bounce="bounce"
    :show-progress="showProgress"
    :show-timestamp="currentShowTimestamp"
    :toast-id="toastId"
  />
</template>
