import { ref, computed } from 'vue'
import { gooeyToast } from 'gooey-toast-vue'
import type { GooeyToastOptions, GooeyToastPosition, GooeyToastType, AnimationPresetName } from 'gooey-toast-vue'

// Module-level state (singleton) so App.vue and ToastBuilder share the same refs
export const bPosition = ref<GooeyToastPosition>('bottom-right')
export const bType = ref<GooeyToastType>('default')
export const bTitle = ref('Event created')
export const bHasDesc = ref(false)
export const bDesc = ref('This is a description for the toast notification.')
export const bHasAction = ref(false)
export const bActionLabel = ref('Undo')
export const bFillColor = ref('#ffffff')
export const bHasBorder = ref(false)
export const bBorderColor = ref('#e2e8f0')
export const bBorderWidth = ref(1)
export const bDisplayDuration = ref(5)
export const bSpring = ref(true)
export const bBounce = ref(0.3)
export const bPreset = ref<AnimationPresetName>('smooth')
export const bTheme = ref<'light' | 'dark'>('light')
export const bShowProgress = ref(false)
export const bCloseOnEscape = ref(true)
export const bShowTimestamp = ref(false)
export const bCloseButton = ref<boolean | 'top-left' | 'top-right'>(false)

export const positions: GooeyToastPosition[] = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

export const presetNames: AnimationPresetName[] = ['smooth', 'bouncy', 'subtle', 'snappy']

export const closeButtonPositions: Array<{ label: string; value: boolean | 'top-left' | 'top-right' }> = [
  { label: 'Off', value: false },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Right', value: 'top-right' },
]

export function fireBuilderToast() {
  const opts: GooeyToastOptions = {
    spring: bSpring.value,
    bounce: bBounce.value,
    timing: { displayDuration: bDisplayDuration.value * 1000 },
    preset: bPreset.value,
    showProgress: bShowProgress.value,
    showTimestamp: bShowTimestamp.value,
    fillColor: bFillColor.value !== '#ffffff' ? bFillColor.value : undefined,
    borderColor: bHasBorder.value ? bBorderColor.value : undefined,
    borderWidth: bHasBorder.value ? bBorderWidth.value : undefined,
  }
  if (bHasDesc.value) opts.description = bDesc.value
  if (bHasAction.value) opts.action = { label: bActionLabel.value, onClick: () => {} }

  if (bType.value === 'default') gooeyToast(bTitle.value, opts)
  else if (bType.value === 'success') gooeyToast.success(bTitle.value, opts)
  else if (bType.value === 'error') gooeyToast.error(bTitle.value, opts)
  else if (bType.value === 'warning') gooeyToast.warning(bTitle.value, opts)
  else gooeyToast.info(bTitle.value, opts)
}

export const generatedCode = computed(() => {
  const lines: string[] = []
  const fn = bType.value === 'default' ? 'gooeyToast' : `gooeyToast.${bType.value}`
  const opts: string[] = []

  if (bHasDesc.value) opts.push(`  description: '${bDesc.value}',`)
  if (bHasAction.value) {
    opts.push(`  action: {`)
    opts.push(`    label: '${bActionLabel.value}',`)
    opts.push(`    onClick: () => {},`)
    opts.push(`  },`)
  }
  if (bFillColor.value !== '#ffffff') opts.push(`  fillColor: '${bFillColor.value}',`)
  if (bHasBorder.value) {
    opts.push(`  borderColor: '${bBorderColor.value}',`)
    opts.push(`  borderWidth: ${bBorderWidth.value},`)
  }
  opts.push(`  timing: { displayDuration: ${bDisplayDuration.value * 1000} },`)
  if (bPreset.value !== 'smooth') opts.push(`  preset: '${bPreset.value}',`)
  if (!bSpring.value) opts.push(`  spring: false,`)
  else if (bBounce.value !== 0.3) opts.push(`  bounce: ${bBounce.value},`)
  if (bShowProgress.value) opts.push(`  showProgress: true,`)
  if (bShowTimestamp.value) opts.push(`  showTimestamp: true,`)

  if (opts.length === 0) {
    lines.push(`${fn}('${bTitle.value}')`)
  } else {
    lines.push(`${fn}('${bTitle.value}', {`)
    lines.push(...opts)
    lines.push(`})`)
  }
  return lines.join('\n')
})
