import { reactive } from 'vue'
import type { GooeyToastPosition } from '../types'

export interface ConfigState {
  position: GooeyToastPosition
  dir: 'ltr' | 'rtl'
  spring: boolean
  bounce: number | undefined
  theme: 'light' | 'dark'
  visibleToasts: number
  swipeToDismiss: boolean
  closeOnEscape: boolean
  maxQueue: number
  queueOverflow: 'drop-oldest' | 'drop-newest'
  showProgress: boolean
  closeButton: boolean | 'top-left' | 'top-right'
  containerHovered: boolean
}

export const configStore = reactive<ConfigState>({
  position: 'bottom-right',
  dir: 'ltr',
  spring: true,
  bounce: undefined,
  theme: 'light',
  visibleToasts: 3,
  swipeToDismiss: true,
  closeOnEscape: true,
  maxQueue: Infinity,
  queueOverflow: 'drop-oldest',
  showProgress: false,
  closeButton: false,
  containerHovered: false,
})

// Container hover subscription system (mirrors React version)
type HoverCb = (hovered: boolean) => void
const _hoverSubs = new Set<HoverCb>()

export function setContainerHovered(hovered: boolean) {
  if (configStore.containerHovered === hovered) return
  configStore.containerHovered = hovered
  _hoverSubs.forEach(cb => cb(hovered))
}

export function subscribeContainerHovered(cb: HoverCb): () => void {
  _hoverSubs.add(cb)
  return () => { _hoverSubs.delete(cb) }
}

// ARIA live region announcer
export type AriaLivePoliteness = 'polite' | 'assertive'

interface Announcement {
  message: string
  politeness: AriaLivePoliteness
}

type AnnounceCb = (announcement: Announcement) => void
const _announceSubs = new Set<AnnounceCb>()

export function announce(message: string, politeness: AriaLivePoliteness = 'polite') {
  _announceSubs.forEach(cb => cb({ message, politeness }))
}

export function subscribeAnnouncements(cb: AnnounceCb): () => void {
  _announceSubs.add(cb)
  return () => { _announceSubs.delete(cb) }
}
