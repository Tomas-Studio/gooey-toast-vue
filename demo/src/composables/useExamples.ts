import { gooeyToast } from 'gooey-toast-vue'
import type { GooeyToastOptions, GooeyToastType, GooeyPromiseData } from 'gooey-toast-vue'

export const DEMO_DEFAULTS: GooeyToastOptions = {
  spring: true,
  bounce: 0.3,
  timing: { displayDuration: 5000 },
}

// Pick only the fields that exist on GooeyPromiseData (excludes description, icon, id, showProgress)
// so spreading this into promise calls is type-safe.
const PROMISE_DEFAULTS: Pick<GooeyPromiseData<unknown>, 'spring' | 'bounce' | 'timing'> = {
  spring: DEMO_DEFAULTS.spring,
  bounce: DEMO_DEFAULTS.bounce,
  timing: DEMO_DEFAULTS.timing,
}

export const typeColors: Record<GooeyToastType, { bg: string; fg: string }> = {
  default: { bg: '#e8e8e8', fg: '#555' },
  success: { bg: '#c8e6c9', fg: '#2e7d32' },
  error: { bg: '#ffcdd2', fg: '#c62828' },
  warning: { bg: '#ffecb3', fg: '#c49000' },
  info: { bg: '#bbdefb', fg: '#1565c0' },
}

export const toastTypes: GooeyToastType[] = ['default', 'success', 'error', 'warning', 'info']

function sleep(ms: number) {
  return new Promise<{ name: string }>((resolve) =>
    setTimeout(() => resolve({ name: 'Backup' }), ms),
  )
}

function failAfter(ms: number) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Connection timeout')), ms),
  )
}

// --- Toast Types ---
export function exDefault() { gooeyToast('Event created', DEMO_DEFAULTS) }
export function exSuccess() { gooeyToast.success('Changes saved successfully', DEMO_DEFAULTS) }
export function exError() { gooeyToast.error('Something went wrong', DEMO_DEFAULTS) }
export function exWarning() { gooeyToast.warning('Please review your input', DEMO_DEFAULTS) }
export function exInfo() { gooeyToast.info('New update available', DEMO_DEFAULTS) }

// --- With Description ---
export function exWarningDesc() {
  gooeyToast.warning('Storage almost full', {
    ...DEMO_DEFAULTS,
    description: 'You have used 90% of your storage. Consider upgrading your plan.',
  })
}
export function exErrorDesc() {
  gooeyToast.error('Payment failed', {
    ...DEMO_DEFAULTS,
    description: 'Your card was declined. Please try a different payment method.',
  })
}

// --- With Action Button ---
export function exErrorAction() {
  gooeyToast.error('Email not sent', {
    ...DEMO_DEFAULTS,
    description: 'Failed to send email to the recipient.',
    action: { label: 'Retry', onClick: () => gooeyToast.success('Email sent!', DEMO_DEFAULTS) },
  })
}
export function exActionSuccess() {
  gooeyToast('Meeting scheduled', {
    ...DEMO_DEFAULTS,
    action: { label: 'Undo', onClick: () => {}, successLabel: 'Done!' },
  })
}

// --- No Spring ---
export function exNoSpringSuccess() { gooeyToast.success('Saved', { ...DEMO_DEFAULTS, spring: false }) }
export function exNoSpringError() {
  gooeyToast.error('Connection lost', {
    ...DEMO_DEFAULTS,
    spring: false,
    description: 'Attempting to reconnect...',
  })
}
export function exNoSpringAction() {
  gooeyToast('Archived', {
    ...DEMO_DEFAULTS,
    spring: false,
    action: { label: 'Undo', onClick: () => {} },
  })
}

// --- Promise ---
export function exPromiseSuccess() {
  gooeyToast.promise(sleep(2000), {
    loading: 'Saving changes...',
    success: (d) => `${d.name} saved`,
    error: 'Save failed',
    ...PROMISE_DEFAULTS,
  })
}
export function exPromiseError() {
  gooeyToast.promise(failAfter(2000), {
    loading: 'Connecting...',
    success: 'Connected',
    error: (e) => (e as Error).message,
    ...PROMISE_DEFAULTS,
  })
}
export function exPromiseSuccessExpanded() {
  gooeyToast.promise(sleep(2000), {
    loading: 'Creating backup...',
    success: (d) => `${d.name} created`,
    error: 'Backup failed',
    description: {
      loading: 'Please wait while we create your backup.',
      success: 'Your backup is ready for download.',
      error: 'There was an error creating your backup.',
    },
    ...PROMISE_DEFAULTS,
  })
}
export function exPromiseErrorExpanded() {
  gooeyToast.promise(failAfter(2000), {
    loading: 'Uploading file...',
    success: 'Upload complete',
    error: 'Upload failed',
    description: {
      loading: 'Transferring data to the server.',
      success: 'Your file is now available.',
      error: 'Please check your connection and try again.',
    },
    ...PROMISE_DEFAULTS,
  })
}

// --- Update Toast ---
export function exUpdate() {
  const id = gooeyToast('Downloading...', {
    ...DEMO_DEFAULTS,
    description: 'Starting download...',
  })
  setTimeout(() => {
    gooeyToast.update(id!, { title: 'Download complete', type: 'success', description: 'File saved to disk.' })
  }, 2000)
}

// --- Progress Bar ---
export function exProgress() {
  gooeyToast.info('Processing...', { ...DEMO_DEFAULTS, showProgress: true, description: 'Your request is being processed.' })
}

// --- Callbacks ---
export function exCallbacks() {
  gooeyToast.success('Notification sent', {
    ...DEMO_DEFAULTS,
    onDismiss: (id) => gooeyToast.info(`Toast ${String(id).slice(0, 5)} dismissed`, { timing: { displayDuration: 2000 } }),
    onAutoClose: (id) => console.log('Auto-closed:', id),
  })
}
