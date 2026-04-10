import type { App } from 'vue'
import type { GooeyToasterProps } from './types'
import { configStore } from './store/config-store'
import { animationPresets } from './presets'

export const GooeyToastPlugin = {
  install(_app: App, options?: Partial<GooeyToasterProps>) {
    if (!options) return
    if (options.position) configStore.position = options.position
    if (options.dir) configStore.dir = options.dir
    if (options.theme) configStore.theme = options.theme
    if (options.visibleToasts != null) configStore.visibleToasts = options.visibleToasts
    if (options.swipeToDismiss != null) configStore.swipeToDismiss = options.swipeToDismiss
    if (options.closeOnEscape != null) configStore.closeOnEscape = options.closeOnEscape
    if (options.maxQueue != null) configStore.maxQueue = options.maxQueue
    if (options.queueOverflow) configStore.queueOverflow = options.queueOverflow
    if (options.showProgress != null) configStore.showProgress = options.showProgress
    if (options.closeButton != null) configStore.closeButton = options.closeButton

    const presetConfig = options.preset ? animationPresets[options.preset] : undefined
    configStore.spring = options.spring ?? presetConfig?.spring ?? true
    configStore.bounce = options.bounce ?? presetConfig?.bounce
  },
}
