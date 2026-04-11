<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import type { GooeyToastPhase, GooeyToastAction, GooeyPromiseData, ToastContent } from '../types'
import { onToastDismissed, registerCallbacks } from '../store/toast-store'
import { announce } from '../store/config-store'
import GooeyToast from './GooeyToast.vue'

const props = defineProps<{
  promise: Promise<any>
  data: GooeyPromiseData<any>
  toastId: string | number
}>()

const DEFAULT_DISMISS_DELAY = 4000

const phase = ref<GooeyToastPhase>('loading')
const title = ref(props.data.loading)
const description = ref<ToastContent | undefined>(
  props.data.description?.loading
)
const action = ref<GooeyToastAction | undefined>(undefined)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function scheduleDismiss() {
  const delay = props.data.timing?.displayDuration ?? props.data.duration ?? DEFAULT_DISMISS_DELAY
  dismissTimer = setTimeout(() => {
    toast.dismiss(props.toastId)
  }, delay)
}

// Register callbacks
onMounted(() => {
  if (props.data.onDismiss || props.data.onAutoClose) {
    registerCallbacks(props.toastId, props.data.onDismiss, props.data.onAutoClose)
  }
})

// Free queue slot on unmount
let mounted = true
onMounted(() => { mounted = true })
onUnmounted(() => {
  mounted = false
  if (dismissTimer) clearTimeout(dismissTimer)
  setTimeout(() => {
    if (!mounted) onToastDismissed(props.toastId)
  }, 100)
})

function buildAnnouncementMessage(t: string, d?: ToastContent): string {
  if (!d || typeof d !== 'string') return t
  return `${t}: ${d}`
}

// Handle promise resolution
onMounted(() => {
  props.promise
    .then((result: any) => {
      const desc = typeof props.data.description?.success === 'function'
        ? (props.data.description.success as (data: any) => ToastContent)(result)
        : props.data.description?.success
      const resolvedTitle = typeof props.data.success === 'function'
        ? (props.data.success as (data: any) => string)(result)
        : props.data.success
      title.value = resolvedTitle
      description.value = desc
      action.value = props.data.action?.success
      phase.value = 'success'
      announce(buildAnnouncementMessage(resolvedTitle, desc), 'polite')
      scheduleDismiss()
    })
    .catch((err: any) => {
      const desc = typeof props.data.description?.error === 'function'
        ? (props.data.description.error as (error: unknown) => ToastContent)(err)
        : props.data.description?.error
      const resolvedTitle = typeof props.data.error === 'function'
        ? (props.data.error as (error: unknown) => string)(err)
        : props.data.error
      title.value = resolvedTitle
      description.value = desc
      action.value = props.data.action?.error
      phase.value = 'error'
      announce(buildAnnouncementMessage(resolvedTitle, desc), 'assertive')
      scheduleDismiss()
    })
})
</script>

<template>
  <GooeyToast
    :title="title"
    :description="description"
    :type="phase === 'loading' ? 'info' : (phase as any)"
    :action="action"
    :phase="phase"
    :class-names="data.classNames"
    :fill-color="data.fillColor"
    :border-color="data.borderColor"
    :border-width="data.borderWidth"
    :timing="data.timing"
    :preset="data.preset"
    :spring="data.spring"
    :bounce="data.bounce"
    :show-timestamp="data.showTimestamp ?? true"
    :toast-id="toastId"
  />
</template>
