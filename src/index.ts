import 'vue-sonner/style.css'
import './styles/gooey-toast.css'

export { default as GooeyToaster } from './components/GooeyToaster.vue'
export { gooeyToast } from './store/toast-store'
export { useGooeyToast } from './composables/useGooeyToast'
export { GooeyToastPlugin } from './plugin'
export { animationPresets } from './presets'

export type { AnimationPreset, AnimationPresetName } from './presets'
export type {
  GooeyToastOptions,
  GooeyPromiseData,
  GooeyToasterProps,
  GooeyToastAction,
  GooeyToastClassNames,
  GooeyToastTimings,
  GooeyToastUpdateOptions,
  DismissFilter,
  GooeyToastType,
  GooeyToastPhase,
  GooeyToastPosition,
} from './types'
