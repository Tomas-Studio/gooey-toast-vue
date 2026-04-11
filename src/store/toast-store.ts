import { markRaw, type Component } from 'vue'
import { toast } from 'vue-sonner'
import { configStore, announce, type AriaLivePoliteness } from './config-store'
import type {
  GooeyToastOptions,
  GooeyPromiseData,
  GooeyToastType,
  GooeyToastUpdateOptions,
  DismissFilter,
  ToastContent,
} from '../types'

const DEFAULT_EXPANDED_DURATION = 4000

function getAnnouncePoliteness(type: GooeyToastType): AriaLivePoliteness {
  return type === 'error' || type === 'warning' ? 'assertive' : 'polite'
}

function buildAnnouncementMessage(title: string, description?: ToastContent): string {
  if (!description || typeof description !== 'string') return title
  return `${title}: ${description}`
}

// ---------------------------------------------------------------------------
// Toast queue — limits concurrent toasts to `visibleToasts` (default 3).
// ---------------------------------------------------------------------------
const _activeIds = new Map<string | number, GooeyToastType>()
const _queue: Array<{ id: string | number; type: GooeyToastType; create: () => void }> = []

// Callback registry
const _toastCallbacks = new Map<string | number, {
  onDismiss?: (id: string | number) => void
  onAutoClose?: (id: string | number) => void
}>()
const _autoCloseFlags = new Set<string | number>()
const _manualDismissFlags = new Set<string | number>()

// Toast update store
const _toastUpdateListeners = new Map<string | number, (opts: GooeyToastUpdateOptions) => void>()

export function markAutoClose(id: string | number) {
  _autoCloseFlags.add(id)
}

export function getMostRecentActiveId(): string | number | undefined {
  let last: string | number | undefined
  for (const id of _activeIds.keys()) last = id
  return last
}

function _processQueue() {
  const max = configStore.visibleToasts
  while (_queue.length > 0 && _activeIds.size < max) {
    const next = _queue.shift()!
    _activeIds.set(next.id, next.type)
    next.create()
  }
}

function _enqueue(entry: { id: string | number; type: GooeyToastType; create: () => void }): boolean {
  const maxQueue = configStore.maxQueue
  const overflow = configStore.queueOverflow
  if (_queue.length >= maxQueue) {
    if (overflow === 'drop-newest') return false
    _queue.shift()
  }
  _queue.push(entry)
  return true
}

export function onToastDismissed(id: string | number) {
  if (!_activeIds.delete(id)) return
  _toastUpdateListeners.delete(id)

  const cbs = _toastCallbacks.get(id)
  if (cbs) {
    const isAutoClose = _autoCloseFlags.has(id) || !_manualDismissFlags.has(id)
    if (isAutoClose && cbs.onAutoClose) {
      try { cbs.onAutoClose(id) } catch { /* callback errors must not break queue */ }
    }
    if (cbs.onDismiss) {
      try { cbs.onDismiss(id) } catch { /* callback errors must not break queue */ }
    }
    _toastCallbacks.delete(id)
  }
  _autoCloseFlags.delete(id)
  _manualDismissFlags.delete(id)

  _processQueue()
}

export function registerUpdateListener(id: string | number, listener: (opts: GooeyToastUpdateOptions) => void) {
  _toastUpdateListeners.set(id, listener)
}

export function unregisterUpdateListener(id: string | number) {
  _toastUpdateListeners.delete(id)
}

export function registerCallbacks(id: string | number, onDismiss?: (id: string | number) => void, onAutoClose?: (id: string | number) => void) {
  if (onDismiss || onAutoClose) {
    _toastCallbacks.set(id, { onDismiss, onAutoClose })
  }
}

// ---------------------------------------------------------------------------
// Lazy-loaded component references (avoids circular imports)
// ---------------------------------------------------------------------------
let _GooeyToastWrapper: Component | null = null
let _PromiseToastWrapper: Component | null = null

export function setGooeyToastWrapperComponent(comp: Component) {
  _GooeyToastWrapper = markRaw(comp)
}

export function setPromiseToastWrapperComponent(comp: Component) {
  _PromiseToastWrapper = markRaw(comp)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function createGooeyToast(
  title: string,
  type: GooeyToastType,
  options?: GooeyToastOptions,
) {
  const hasExpandedContent = Boolean(options?.description || options?.action)
  const baseDuration = options?.timing?.displayDuration ?? options?.duration ?? (options?.description ? DEFAULT_EXPANDED_DURATION : undefined)
  const duration = hasExpandedContent ? Infinity : baseDuration

  const toastId = options?.id ?? Math.random().toString(36).slice(2)

  const create = () => {
    if (!_GooeyToastWrapper) {
      console.warn('[gooey-toasst-vue] GooeyToastWrapper component not registered. Make sure <GooeyToaster /> is mounted.')
      return
    }
    toast.custom(_GooeyToastWrapper, {
      duration,
      id: toastId,
      componentProps: {
        initialPhase: type,
        title,
        type,
        description: options?.description,
        action: options?.action,
        icon: options?.icon,
        classNames: options?.classNames,
        fillColor: options?.fillColor,
        borderColor: options?.borderColor,
        borderWidth: options?.borderWidth,
        timing: options?.timing,
        preset: options?.preset,
        spring: options?.spring,
        bounce: options?.bounce,
        showProgress: options?.showProgress,
        showTimestamp: options?.showTimestamp,
        toastId,
      },
    })
  }

  // Register callbacks before creating the toast
  if (options?.onDismiss || options?.onAutoClose) {
    _toastCallbacks.set(toastId, { onDismiss: options.onDismiss, onAutoClose: options.onAutoClose })
  }

  // Announce to screen readers
  announce(
    buildAnnouncementMessage(title, options?.description),
    getAnnouncePoliteness(type),
  )

  if (_activeIds.size < configStore.visibleToasts) {
    _activeIds.set(toastId, type)
    create()
  } else {
    _enqueue({ id: toastId, type, create })
  }

  return toastId
}

function updateGooeyToast(id: string | number, options: GooeyToastUpdateOptions) {
  const listener = _toastUpdateListeners.get(id)
  if (listener) {
    listener(options)
    if (options.type !== undefined && _activeIds.has(id)) {
      _activeIds.set(id, options.type)
    }
    if (options.title !== undefined) {
      announce(
        buildAnnouncementMessage(options.title, options.description),
        options.type ? getAnnouncePoliteness(options.type) : 'polite',
      )
    }
  }
}

function dismissGooeyToast(idOrFilter?: string | number | DismissFilter) {
  if (idOrFilter != null && typeof idOrFilter === 'object') {
    const filterTypes = Array.isArray(idOrFilter.type) ? idOrFilter.type : [idOrFilter.type]
    const typesSet = new Set<GooeyToastType>(filterTypes)

    for (let i = _queue.length - 1; i >= 0; i--) {
      if (typesSet.has(_queue[i].type)) {
        _queue.splice(i, 1)
      }
    }

    for (const [id, toastType] of _activeIds) {
      if (typesSet.has(toastType)) {
        _manualDismissFlags.add(id)
        toast.dismiss(id)
      }
    }
  } else if (idOrFilter != null) {
    const idx = _queue.findIndex(q => q.id === idOrFilter)
    if (idx !== -1) {
      _queue.splice(idx, 1)
      return
    }
    _manualDismissFlags.add(idOrFilter)
    toast.dismiss(idOrFilter)
  } else {
    for (const id of _activeIds.keys()) {
      _manualDismissFlags.add(id)
    }
    _queue.length = 0
    _activeIds.clear()
    toast.dismiss()
  }
}

function promiseGooeyToast<T>(promise: Promise<T>, data: GooeyPromiseData<T>) {
  const id = Math.random().toString(36).slice(2)

  announce(buildAnnouncementMessage(data.loading, data.description?.loading), 'polite')

  if (data.onDismiss || data.onAutoClose) {
    _toastCallbacks.set(id, { onDismiss: data.onDismiss, onAutoClose: data.onAutoClose })
  }

  const create = () => {
    if (!_PromiseToastWrapper) {
      console.warn('[gooey-toasst-vue] PromiseToastWrapper component not registered.')
      return
    }
    toast.custom(_PromiseToastWrapper, {
      id,
      duration: (data.timing?.displayDuration != null || data.description) ? Infinity : undefined,
      componentProps: {
        promise,
        data,
        toastId: id,
      },
    })
  }

  if (_activeIds.size < configStore.visibleToasts) {
    _activeIds.set(id, 'info')
    create()
  } else {
    _enqueue({ id, type: 'info', create })
  }

  return id
}

export const gooeyToast = Object.assign(
  (title: string, options?: GooeyToastOptions) =>
    createGooeyToast(title, 'default', options),
  {
    success: (title: string, options?: GooeyToastOptions) =>
      createGooeyToast(title, 'success', options),
    error: (title: string, options?: GooeyToastOptions) =>
      createGooeyToast(title, 'error', options),
    warning: (title: string, options?: GooeyToastOptions) =>
      createGooeyToast(title, 'warning', options),
    info: (title: string, options?: GooeyToastOptions) =>
      createGooeyToast(title, 'info', options),
    promise: promiseGooeyToast,
    dismiss: dismissGooeyToast,
    update: updateGooeyToast,
  },
)
