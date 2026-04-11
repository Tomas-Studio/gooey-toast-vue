import type { VNode, Component } from 'vue'
import type { AnimationPresetName } from './presets'

export type GooeyToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

export type GooeyToastPhase = 'loading' | 'default' | 'success' | 'error' | 'warning' | 'info'

export type GooeyToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type ToastContent = string | VNode | Component

export interface GooeyToastTimings {
  displayDuration?: number
}

export interface GooeyToastClassNames {
  wrapper?: string
  content?: string
  header?: string
  title?: string
  icon?: string
  description?: string
  actionWrapper?: string
  actionButton?: string
}

export interface GooeyToastAction {
  label: string
  onClick: () => void
  successLabel?: string
}

export interface GooeyToastOptions {
  description?: ToastContent
  action?: GooeyToastAction
  icon?: ToastContent
  duration?: number
  id?: string | number
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
  onDismiss?: (id: string | number) => void
  onAutoClose?: (id: string | number) => void
}

export interface GooeyPromiseData<T> {
  loading: string
  success: string | ((data: T) => string)
  error: string | ((error: unknown) => string)
  description?: {
    loading?: ToastContent
    success?: ToastContent | ((data: T) => ToastContent)
    error?: ToastContent | ((error: unknown) => ToastContent)
  }
  action?: {
    success?: GooeyToastAction
    error?: GooeyToastAction
  }
  classNames?: GooeyToastClassNames
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  timing?: GooeyToastTimings
  preset?: AnimationPresetName
  spring?: boolean
  bounce?: number
  showTimestamp?: boolean
  /** Duration in ms to show the resolved/rejected toast before auto-dismissing (default: 4000) */
  duration?: number
  onDismiss?: (id: string | number) => void
  onAutoClose?: (id: string | number) => void
}

export interface GooeyToastUpdateOptions {
  title?: string
  description?: ToastContent
  type?: GooeyToastType
  action?: GooeyToastAction
  icon?: ToastContent | null
  showTimestamp?: boolean
}

export interface DismissFilter {
  type: GooeyToastType | GooeyToastType[]
}

export interface GooeyToasterProps {
  position?: GooeyToastPosition
  duration?: number
  gap?: number
  offset?: number | string
  theme?: 'light' | 'dark'
  expand?: boolean
  closeButton?: boolean | 'top-left' | 'top-right'
  visibleToasts?: number
  dir?: 'ltr' | 'rtl'
  preset?: AnimationPresetName
  spring?: boolean
  bounce?: number
  swipeToDismiss?: boolean
  closeOnEscape?: boolean
  maxQueue?: number
  queueOverflow?: 'drop-oldest' | 'drop-newest'
  showProgress?: boolean
}
