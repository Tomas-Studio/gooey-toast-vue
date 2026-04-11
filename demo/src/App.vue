<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { GooeyToaster, gooeyToast, animationPresets } from 'gooey-toast-vue'
import type { GooeyToastOptions, GooeyToasterProps, AnimationPresetName, GooeyToastPosition, GooeyToastType } from 'gooey-toast-vue'
import './App.css'

// ---------------------------------------------------------------------------
// Page state
// ---------------------------------------------------------------------------
const page = ref<'home' | 'changelog'>('home')
const mobileMenuOpen = ref(false)
const heroVisible = ref(true)
const heroTitleRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
onMounted(() => {
  nextTick(() => {
    if (heroTitleRef.value) {
      observer = new IntersectionObserver(
        ([entry]) => { heroVisible.value = entry.isIntersecting },
        { threshold: 0.1 },
      )
      observer.observe(heroTitleRef.value)
    }
  })
})
onUnmounted(() => { observer?.disconnect() })

// ---------------------------------------------------------------------------
// Demo defaults
// ---------------------------------------------------------------------------
const DEMO_DEFAULTS: GooeyToastOptions = {
  spring: true,
  bounce: 0.3,
  timing: { displayDuration: 5000 },
}

// ---------------------------------------------------------------------------
// Builder state
// ---------------------------------------------------------------------------
const bPosition = ref<GooeyToastPosition>('bottom-right')
const bType = ref<GooeyToastType>('default')
const bTitle = ref('Event created')
const bHasDesc = ref(false)
const bDesc = ref('This is a description for the toast notification.')
const bHasAction = ref(false)
const bActionLabel = ref('Undo')
const bFillColor = ref('#ffffff')
const bHasBorder = ref(false)
const bBorderColor = ref('#e2e8f0')
const bBorderWidth = ref(1)
const bDisplayDuration = ref(5)
const bSpring = ref(true)
const bBounce = ref(0.3)
const bPreset = ref<AnimationPresetName>('smooth')
const bTheme = ref<'light' | 'dark'>('light')
const bShowProgress = ref(false)
const bCloseOnEscape = ref(true)
const bShowTimestamp = ref(false)
const bCloseButton = ref<boolean | 'top-left' | 'top-right'>(false)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

function useCopy() {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      copied.value = true
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => { copied.value = false }, 2000)
    })
  }
  return { copied, copy }
}

const installCopy = useCopy()
const codeCopy = useCopy()

function scrollTo(id: string) {
  mobileMenuOpen.value = false
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const positions: GooeyToastPosition[] = [
  'top-left', 'top-center', 'top-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]
const toastTypes: GooeyToastType[] = ['default', 'success', 'error', 'warning', 'info']
const presetNames: AnimationPresetName[] = ['smooth', 'bouncy', 'subtle', 'snappy']

const typeColors: Record<GooeyToastType, { bg: string; fg: string }> = {
  default: { bg: '#e8e8e8', fg: '#555' },
  success: { bg: '#c8e6c9', fg: '#2e7d32' },
  error: { bg: '#ffcdd2', fg: '#c62828' },
  warning: { bg: '#ffecb3', fg: '#c49000' },
  info: { bg: '#bbdefb', fg: '#1565c0' },
}

// ---------------------------------------------------------------------------
// Example handlers
// ---------------------------------------------------------------------------

// --- Toast Types ---
function exDefault() { gooeyToast('Event created', DEMO_DEFAULTS) }
function exSuccess() { gooeyToast.success('Changes saved successfully', DEMO_DEFAULTS) }
function exError() { gooeyToast.error('Something went wrong', DEMO_DEFAULTS) }
function exWarning() { gooeyToast.warning('Please review your input', DEMO_DEFAULTS) }
function exInfo() { gooeyToast.info('New update available', DEMO_DEFAULTS) }

// --- With Description ---
function exWarningDesc() {
  gooeyToast.warning('Storage almost full', {
    ...DEMO_DEFAULTS,
    description: 'You have used 90% of your storage. Consider upgrading your plan.',
  })
}
function exErrorDesc() {
  gooeyToast.error('Payment failed', {
    ...DEMO_DEFAULTS,
    description: 'Your card was declined. Please try a different payment method.',
  })
}

// --- With Action Button ---
function exErrorAction() {
  gooeyToast.error('Email not sent', {
    ...DEMO_DEFAULTS,
    description: 'Failed to send email to the recipient.',
    action: { label: 'Retry', onClick: () => gooeyToast.success('Email sent!', DEMO_DEFAULTS) },
  })
}
function exActionSuccess() {
  gooeyToast('Meeting scheduled', {
    ...DEMO_DEFAULTS,
    action: { label: 'Undo', onClick: () => {}, successLabel: 'Done!' },
  })
}

// --- No Spring ---
function exNoSpringSuccess() { gooeyToast.success('Saved', { ...DEMO_DEFAULTS, spring: false }) }
function exNoSpringError() {
  gooeyToast.error('Connection lost', {
    ...DEMO_DEFAULTS,
    spring: false,
    description: 'Attempting to reconnect...',
  })
}
function exNoSpringAction() {
  gooeyToast('Archived', {
    ...DEMO_DEFAULTS,
    spring: false,
    action: { label: 'Undo', onClick: () => {} },
  })
}

// --- Promise ---
function exPromiseSuccess() {
  gooeyToast.promise(sleep(2000), {
    loading: 'Saving changes...',
    success: (d) => `${d.name} saved`,
    error: 'Save failed',
    ...DEMO_DEFAULTS,
  })
}
function exPromiseError() {
  gooeyToast.promise(failAfter(2000), {
    loading: 'Connecting...',
    success: 'Connected',
    error: (e) => (e as Error).message,
    ...DEMO_DEFAULTS,
  })
}
function exPromiseSuccessExpanded() {
  gooeyToast.promise(sleep(2000), {
    loading: 'Creating backup...',
    success: (d) => `${d.name} created`,
    error: 'Backup failed',
    description: {
      loading: 'Please wait while we create your backup.',
      success: 'Your backup is ready for download.',
      error: 'There was an error creating your backup.',
    },
    ...DEMO_DEFAULTS,
  })
}
function exPromiseErrorExpanded() {
  gooeyToast.promise(failAfter(2000), {
    loading: 'Uploading file...',
    success: 'Upload complete',
    error: 'Upload failed',
    description: {
      loading: 'Transferring data to the server.',
      success: 'Your file is now available.',
      error: 'Please check your connection and try again.',
    },
    ...DEMO_DEFAULTS,
  })
}

// --- Update Toast ---
function exUpdate() {
  const id = gooeyToast('Downloading...', {
    ...DEMO_DEFAULTS,
    description: 'Starting download...',
  })
  setTimeout(() => {
    gooeyToast.update(id!, { title: 'Download complete', type: 'success', description: 'File saved to disk.' })
  }, 2000)
}

// --- Progress Bar ---
function exProgress() {
  gooeyToast.info('Processing...', { ...DEMO_DEFAULTS, showProgress: true, description: 'Your request is being processed.' })
}

// --- Callbacks ---
function exCallbacks() {
  gooeyToast.success('Notification sent', {
    ...DEMO_DEFAULTS,
    onDismiss: (id) => gooeyToast.info(`Toast ${String(id).slice(0, 5)} dismissed`, { timing: { displayDuration: 2000 } }),
    onAutoClose: (id) => console.log('Auto-closed:', id),
  })
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
function fireBuilderToast() {
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

const generatedCode = computed(() => {
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

// ---------------------------------------------------------------------------
// Doc code samples
// ---------------------------------------------------------------------------
const codeQuickStart = `import { GooeyToaster, gooeyToast } from 'gooey-toast-vue'

// In your template
<GooeyToaster position="bottom-right" />

// Fire a toast
gooeyToast('Hello world!')`

const codeTypes = `gooeyToast('Default notification')
gooeyToast.success('Changes saved')
gooeyToast.error('Something went wrong')
gooeyToast.warning('Check your input')
gooeyToast.info('New update available')`

const codeDescription = `gooeyToast.warning('Storage almost full', {
  description: 'You have used 90% of storage.',
})`

const codeAction = `gooeyToast.error('Email not sent', {
  description: 'Failed to send email.',
  action: {
    label: 'Retry',
    onClick: () => resendEmail(),
    successLabel: 'Sent!',
  },
})`

const codePromise = `const promise = fetchData()

gooeyToast.promise(promise, {
  loading: 'Loading data...',
  success: (data) => \`Loaded \${data.count} items\`,
  error: 'Failed to load',
  description: {
    loading: 'Fetching from server...',
    success: 'All items are ready.',
    error: 'Please try again later.',
  },
})`

const codeToasterProps = `<GooeyToaster
  position="bottom-right"
  theme="light"
  preset="smooth"
  :spring="true"
  :bounce="0.3"
  :close-button="'top-right'"
  :show-progress="false"
  :close-on-escape="true"
  :visible-toasts="3"
  :gap="14"
  :offset="32"
/>`

const codeDismiss = `// Dismiss a specific toast
const id = gooeyToast('Hello')
gooeyToast.dismiss(id)

// Dismiss all toasts
gooeyToast.dismiss()

// Dismiss by type
gooeyToast.dismiss({ type: 'error' })`

const codeUpdate = `const id = gooeyToast('Processing...')

setTimeout(() => {
  gooeyToast.update(id, {
    title: 'Complete!',
    type: 'success',
    description: 'All tasks finished.',
  })
}, 2000)`

const codeCustomStyle = `gooeyToast.info('Custom styled', {
  fillColor: '#f0f9ff',
  borderColor: '#0ea5e9',
  borderWidth: 2,
  classNames: {
    wrapper: 'my-toast-wrapper',
    title: 'my-toast-title',
  },
})`

const codeSpring = `// With spring (default)
gooeyToast.success('Bouncy!', {
  spring: true,
  bounce: 0.6,
})

// Without spring
gooeyToast.success('Smooth', {
  spring: false,
})`

const codeNuxt = `// plugins/gooey-toast.client.ts
import { GooeyToastPlugin } from 'gooey-toast-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(GooeyToastPlugin)
})

// app.vue
<template>
  <NuxtPage />
  <GooeyToaster position="bottom-right" />
</template>`

// ---------------------------------------------------------------------------
// Doc tables
// ---------------------------------------------------------------------------
const timingsProps = [
  { name: 'displayDuration', type: 'number', default: '4000', desc: 'Time in ms before the toast auto-closes' },
]

const toasterProps = [
  { name: 'position', type: 'GooeyToastPosition', default: "'bottom-right'", desc: 'Where toasts appear on screen' },
  { name: 'theme', type: "'light' | 'dark'", default: "'light'", desc: 'Color theme for toasts' },
  { name: 'preset', type: 'AnimationPresetName', default: "'smooth'", desc: 'Animation preset' },
  { name: 'spring', type: 'boolean', default: 'true', desc: 'Enable spring physics' },
  { name: 'bounce', type: 'number', default: '0.3', desc: 'Spring bounce factor (0.05 - 0.8)' },
  { name: 'closeButton', type: "boolean | 'top-left' | 'top-right'", default: 'false', desc: 'Show close button' },
  { name: 'showProgress', type: 'boolean', default: 'false', desc: 'Show progress indicator' },
  { name: 'closeOnEscape', type: 'boolean', default: 'true', desc: 'Dismiss on Escape key' },
  { name: 'visibleToasts', type: 'number', default: '3', desc: 'Max visible toasts' },
  { name: 'gap', type: 'number', default: '14', desc: 'Gap between toasts in px' },
  { name: 'offset', type: "number | string", default: '32', desc: 'Offset from viewport edge' },
  { name: 'expand', type: 'boolean', default: 'false', desc: 'Expand all toasts by default' },
  { name: 'swipeToDismiss', type: 'boolean', default: 'true', desc: 'Enable swipe to dismiss' },
]

const optionProps = [
  { name: 'description', type: 'string | VNode', default: '-', desc: 'Toast description text' },
  { name: 'action', type: 'GooeyToastAction', default: '-', desc: 'Action button config' },
  { name: 'icon', type: 'string | VNode', default: '-', desc: 'Custom icon' },
  { name: 'id', type: 'string | number', default: 'auto', desc: 'Custom toast ID' },
  { name: 'fillColor', type: 'string', default: '-', desc: 'Background fill color' },
  { name: 'borderColor', type: 'string', default: '-', desc: 'Border color' },
  { name: 'borderWidth', type: 'number', default: '-', desc: 'Border width in px' },
  { name: 'timing', type: 'GooeyToastTimings', default: '-', desc: 'Timing configuration' },
  { name: 'preset', type: 'AnimationPresetName', default: '-', desc: 'Animation preset override' },
  { name: 'spring', type: 'boolean', default: '-', desc: 'Spring physics override' },
  { name: 'bounce', type: 'number', default: '-', desc: 'Bounce factor override' },
  { name: 'showProgress', type: 'boolean', default: '-', desc: 'Show progress bar' },
  { name: 'showTimestamp', type: 'boolean', default: '-', desc: 'Show timestamp' },
  { name: 'onDismiss', type: '(id) => void', default: '-', desc: 'Called on any dismiss' },
  { name: 'onAutoClose', type: '(id) => void', default: '-', desc: 'Called on auto-close' },
]

const dismissMethods = [
  { method: 'gooeyToast.dismiss(id)', desc: 'Dismiss a specific toast by ID' },
  { method: 'gooeyToast.dismiss()', desc: 'Dismiss all toasts' },
  { method: "gooeyToast.dismiss({ type: 'error' })", desc: 'Dismiss all toasts of a given type' },
]

const updateMethods = [
  { method: 'gooeyToast.update(id, opts)', desc: 'Update title, description, type, action, or icon' },
]

const classNameProps = [
  { name: 'wrapper', desc: 'Outer toast wrapper' },
  { name: 'content', desc: 'Content container' },
  { name: 'header', desc: 'Header row' },
  { name: 'title', desc: 'Title element' },
  { name: 'icon', desc: 'Icon container' },
  { name: 'description', desc: 'Description text' },
  { name: 'actionWrapper', desc: 'Action button wrapper' },
  { name: 'actionButton', desc: 'Action button element' },
]

// Close button position options
const closeButtonPositions: Array<{ label: string; value: boolean | 'top-left' | 'top-right' }> = [
  { label: 'Off', value: false },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Right', value: 'top-right' },
]
</script>

<template>
  <div class="app">
    <!-- ================================================================== -->
    <!-- HEADER                                                             -->
    <!-- ================================================================== -->
    <header class="site-header" :class="{ scrolled: !heroVisible }">
      <div class="header-inner">
        <a class="logo" href="#" @click.prevent="scrollTo('hero')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="url(#logo-grad)" />
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24">
                <stop stop-color="#6366f1" />
                <stop offset="1" stop-color="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <span>gooey-toasst-vue</span>
        </a>

        <nav class="desktop-nav">
          <a href="#examples" @click.prevent="scrollTo('examples')">Examples</a>
          <a href="#builder" @click.prevent="scrollTo('builder')">Builder</a>
          <a href="#docs" @click.prevent="scrollTo('docs')">Docs</a>
        </nav>

        <div class="header-links">
          <a href="https://github.com/pheralb/gooey-toasst" target="_blank" rel="noopener" class="icon-link" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="https://www.npmjs.com/package/gooey-toast-vue" target="_blank" rel="noopener" class="icon-link" aria-label="npm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/></svg>
          </a>
          <button class="mobile-menu-btn" :class="{ open: mobileMenuOpen }" @click="mobileMenuOpen = !mobileMenuOpen" aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      <!-- Mobile dropdown -->
      <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
        <a href="#examples" @click.prevent="scrollTo('examples')">Examples</a>
        <a href="#builder" @click.prevent="scrollTo('builder')">Builder</a>
        <a href="#docs" @click.prevent="scrollTo('docs')">Docs</a>
      </div>
    </header>

    <!-- ================================================================== -->
    <!-- HERO                                                               -->
    <!-- ================================================================== -->
    <section id="hero" class="hero">
      <div class="hero-inner">
        <div class="version-badge">
          <span class="pulse-dot" />
          <span>v0.1.0</span>
        </div>
        <h1 ref="heroTitleRef" class="hero-title">gooey-toasst-vue</h1>
        <p class="hero-subtitle">
          Beautiful, gooey toast notifications for Vue 3. Smooth spring animations powered by motion-v.
        </p>
        <div class="install-command">
          <code>npm install gooey-toast-vue</code>
          <button class="copy-btn" @click="installCopy.copy('npm install gooey-toast-vue')">
            <template v-if="installCopy.copied.value">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            </template>
            <template v-else>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </template>
          </button>
        </div>
      </div>
    </section>

    <!-- ================================================================== -->
    <!-- TWO-COLUMN LAYOUT: Examples + Builder                              -->
    <!-- ================================================================== -->
    <section class="two-col">
      <!-- LEFT: Examples -->
      <div id="examples" class="examples">
        <h2 class="section-heading">Examples</h2>

        <!-- 1. Toast Types -->
        <div class="example-section">
          <h3>Toast Types</h3>
          <div class="pill-row">
            <button v-for="t in toastTypes" :key="t" class="type-pill" :style="{ background: typeColors[t].bg, color: typeColors[t].fg }" @click="t === 'default' ? exDefault() : t === 'success' ? exSuccess() : t === 'error' ? exError() : t === 'warning' ? exWarning() : exInfo()">
              {{ t.charAt(0).toUpperCase() + t.slice(1) }}
            </button>
          </div>
        </div>

        <!-- 2. With Description -->
        <div class="example-section">
          <h3>With Description</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.warning.bg, color: typeColors.warning.fg }" @click="exWarningDesc">Warning + Desc</button>
            <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorDesc">Error + Desc</button>
          </div>
        </div>

        <!-- 3. With Action Button -->
        <div class="example-section">
          <h3>With Action Button</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorAction">Error + Action</button>
            <button class="type-pill" :style="{ background: typeColors.default.bg, color: typeColors.default.fg }" @click="exActionSuccess">Action + SuccessPill</button>
          </div>
        </div>

        <!-- 4. No Spring -->
        <div class="example-section">
          <h3>No Spring</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exNoSpringSuccess">Success</button>
            <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exNoSpringError">Error + Desc</button>
            <button class="type-pill" :style="{ background: typeColors.default.bg, color: typeColors.default.fg }" @click="exNoSpringAction">Action</button>
          </div>
        </div>

        <!-- 5. Promise -->
        <div class="example-section">
          <h3>Promise</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccess">Promise &rarr; Success</button>
            <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exPromiseError">Promise &rarr; Error</button>
            <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccessExpanded">Promise &rarr; Success (expanded)</button>
            <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exPromiseErrorExpanded">Promise &rarr; Error (expanded)</button>
          </div>
        </div>

        <!-- 6. Update Toast -->
        <div class="example-section">
          <h3>Update Toast</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.info.bg, color: typeColors.info.fg }" @click="exUpdate">Update Toast</button>
          </div>
        </div>

        <!-- 7. Progress Bar -->
        <div class="example-section">
          <h3>Progress Bar</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.info.bg, color: typeColors.info.fg }" @click="exProgress">Show Progress</button>
          </div>
        </div>

        <!-- 8. Callbacks -->
        <div class="example-section">
          <h3>Callbacks</h3>
          <div class="pill-row">
            <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exCallbacks">With Callback</button>
          </div>
        </div>

        <!-- 9. Dismiss All -->
        <div class="example-section">
          <h3>Dismiss</h3>
          <div class="pill-row">
            <button class="type-pill" style="background: #fecaca; color: #b91c1c;" @click="gooeyToast.dismiss()">Dismiss All</button>
          </div>
        </div>
      </div>

      <!-- RIGHT: Builder -->
      <div id="builder" class="builder">
        <h2 class="section-heading">Toast Builder</h2>
        <div class="builder-card">

          <!-- Position -->
          <div class="builder-row">
            <label>Position</label>
            <div class="pill-row">
              <button v-for="p in positions" :key="p" class="type-pill small" :class="{ active: bPosition === p }" @click="bPosition = p">{{ p }}</button>
            </div>
          </div>

          <!-- Type -->
          <div class="builder-row">
            <label>Type</label>
            <div class="pill-row">
              <button v-for="t in toastTypes" :key="t" class="type-pill small" :class="{ active: bType === t }" :style="bType === t ? { background: typeColors[t].bg, color: typeColors[t].fg } : {}" @click="bType = t">{{ t }}</button>
            </div>
          </div>

          <!-- Title -->
          <div class="builder-row">
            <label>Title</label>
            <input v-model="bTitle" class="builder-input" type="text" />
          </div>

          <!-- Description -->
          <div class="builder-row">
            <label>
              Description
              <button class="toggle" :class="{ on: bHasDesc }" @click="bHasDesc = !bHasDesc">
                <span class="toggle-thumb" />
              </button>
            </label>
            <textarea v-if="bHasDesc" v-model="bDesc" class="builder-input" rows="2" />
          </div>

          <!-- Action Button -->
          <div class="builder-row">
            <label>
              Action Button
              <button class="toggle" :class="{ on: bHasAction }" @click="bHasAction = !bHasAction">
                <span class="toggle-thumb" />
              </button>
            </label>
            <input v-if="bHasAction" v-model="bActionLabel" class="builder-input" type="text" placeholder="Button label" />
          </div>

          <!-- Style -->
          <div class="builder-row">
            <label>Style</label>
            <div class="builder-inline">
              <div class="builder-field">
                <span class="field-label">Fill</span>
                <input v-model="bFillColor" type="color" class="color-input" />
              </div>
              <div class="builder-field">
                <span class="field-label">Border</span>
                <button class="toggle small" :class="{ on: bHasBorder }" @click="bHasBorder = !bHasBorder">
                  <span class="toggle-thumb" />
                </button>
              </div>
              <template v-if="bHasBorder">
                <div class="builder-field">
                  <span class="field-label">Color</span>
                  <input v-model="bBorderColor" type="color" class="color-input" />
                </div>
                <div class="builder-field">
                  <span class="field-label">Width</span>
                  <input v-model.number="bBorderWidth" type="number" min="1" max="5" class="builder-input small-num" />
                </div>
              </template>
            </div>
          </div>

          <!-- Timing -->
          <div class="builder-row">
            <label>Display Duration <span class="label-value">{{ bDisplayDuration }}s</span></label>
            <input v-model.number="bDisplayDuration" type="range" min="1" max="20" step="1" class="range-input" />
          </div>

          <!-- Animation Preset -->
          <div class="builder-row">
            <label>Animation Preset</label>
            <div class="pill-row">
              <button v-for="p in presetNames" :key="p" class="type-pill small" :class="{ active: bPreset === p }" @click="bPreset = p">{{ p }}</button>
            </div>
          </div>

          <!-- Spring Effect -->
          <div class="builder-row">
            <label>
              Spring Effect
              <button class="toggle" :class="{ on: bSpring }" @click="bSpring = !bSpring">
                <span class="toggle-thumb" />
              </button>
            </label>
            <div v-if="bSpring" class="builder-inline">
              <span class="field-label">Bounce {{ bBounce }}</span>
              <input v-model.number="bBounce" type="range" min="0.05" max="0.8" step="0.05" class="range-input" />
            </div>
          </div>

          <!-- Theme -->
          <div class="builder-row">
            <label>Theme</label>
            <div class="pill-row">
              <button class="type-pill small" :class="{ active: bTheme === 'light' }" @click="bTheme = 'light'">Light</button>
              <button class="type-pill small" :class="{ active: bTheme === 'dark' }" @click="bTheme = 'dark'">Dark</button>
            </div>
          </div>

          <!-- Show Progress -->
          <div class="builder-row">
            <label>
              Show Progress
              <button class="toggle" :class="{ on: bShowProgress }" @click="bShowProgress = !bShowProgress">
                <span class="toggle-thumb" />
              </button>
            </label>
          </div>

          <!-- Close on Escape -->
          <div class="builder-row">
            <label>
              Close on Escape
              <button class="toggle" :class="{ on: bCloseOnEscape }" @click="bCloseOnEscape = !bCloseOnEscape">
                <span class="toggle-thumb" />
              </button>
            </label>
          </div>

          <!-- Show Timestamp -->
          <div class="builder-row">
            <label>
              Show Timestamp
              <button class="toggle" :class="{ on: bShowTimestamp }" @click="bShowTimestamp = !bShowTimestamp">
                <span class="toggle-thumb" />
              </button>
            </label>
          </div>

          <!-- Close Button -->
          <div class="builder-row">
            <label>Close Button</label>
            <div class="pill-row">
              <button v-for="opt in closeButtonPositions" :key="String(opt.value)" class="type-pill small" :class="{ active: bCloseButton === opt.value }" @click="bCloseButton = opt.value">{{ opt.label }}</button>
            </div>
          </div>

          <!-- Fire button -->
          <button class="fire-btn" @click="fireBuilderToast">
            Fire Toast
          </button>

          <!-- Generated code -->
          <div class="code-block">
            <div class="code-header">
              <span>Generated Code</span>
              <button class="copy-btn small" @click="codeCopy.copy(generatedCode)">
                {{ codeCopy.copied.value ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <pre><code>{{ generatedCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================== -->
    <!-- DOCUMENTATION                                                      -->
    <!-- ================================================================== -->
    <section id="docs" class="docs">
      <h2 class="section-heading">Documentation</h2>

      <!-- 01. Quick Start -->
      <div class="doc-section">
        <h3>Quick Start</h3>
        <div class="code-block">
          <pre><code>{{ codeQuickStart }}</code></pre>
        </div>
      </div>

      <!-- 02. Toast Types -->
      <div class="doc-section">
        <h3>Toast Types</h3>
        <div class="code-block">
          <pre><code>{{ codeTypes }}</code></pre>
        </div>
        <div class="pill-row doc-pills">
          <button v-for="t in toastTypes" :key="t" class="type-pill" :style="{ background: typeColors[t].bg, color: typeColors[t].fg }" @click="t === 'default' ? exDefault() : t === 'success' ? exSuccess() : t === 'error' ? exError() : t === 'warning' ? exWarning() : exInfo()">
            Try {{ t }}
          </button>
        </div>
      </div>

      <!-- 03. Description -->
      <div class="doc-section">
        <h3>Description</h3>
        <div class="code-block">
          <pre><code>{{ codeDescription }}</code></pre>
        </div>
        <div class="pill-row doc-pills">
          <button class="type-pill" :style="{ background: typeColors.warning.bg, color: typeColors.warning.fg }" @click="exWarningDesc">Try Warning + Desc</button>
          <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorDesc">Try Error + Desc</button>
        </div>
      </div>

      <!-- 04. Action Button -->
      <div class="doc-section">
        <h3>Action Button</h3>
        <div class="code-block">
          <pre><code>{{ codeAction }}</code></pre>
        </div>
        <div class="pill-row doc-pills">
          <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorAction">Try Error + Action</button>
          <button class="type-pill" :style="{ background: typeColors.default.bg, color: typeColors.default.fg }" @click="exActionSuccess">Try Action + Success</button>
        </div>
      </div>

      <!-- 05. Promise Toasts -->
      <div class="doc-section">
        <h3>Promise Toasts</h3>
        <div class="code-block">
          <pre><code>{{ codePromise }}</code></pre>
        </div>
        <div class="pill-row doc-pills">
          <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccess">Try Success</button>
          <button class="type-pill" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exPromiseError">Try Error</button>
          <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccessExpanded">Try Expanded</button>
        </div>
      </div>

      <!-- 06. Timings -->
      <div class="doc-section">
        <h3>Timings</h3>
        <table class="prop-table">
          <thead><tr><th>Property</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
          <tbody>
            <tr v-for="p in timingsProps" :key="p.name">
              <td><code>{{ p.name }}</code></td>
              <td><code>{{ p.type }}</code></td>
              <td><code>{{ p.default }}</code></td>
              <td>{{ p.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 07. Toaster Props -->
      <div class="doc-section">
        <h3>Toaster Props</h3>
        <div class="code-block">
          <pre><code>{{ codeToasterProps }}</code></pre>
        </div>
        <table class="prop-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
          <tbody>
            <tr v-for="p in toasterProps" :key="p.name">
              <td><code>{{ p.name }}</code></td>
              <td><code>{{ p.type }}</code></td>
              <td><code>{{ p.default }}</code></td>
              <td>{{ p.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 08. Options -->
      <div class="doc-section">
        <h3>Toast Options</h3>
        <table class="prop-table">
          <thead><tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
          <tbody>
            <tr v-for="p in optionProps" :key="p.name">
              <td><code>{{ p.name }}</code></td>
              <td><code>{{ p.type }}</code></td>
              <td><code>{{ p.default }}</code></td>
              <td>{{ p.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 09. Methods -->
      <div class="doc-section">
        <h3>Methods</h3>
        <h4>Dismiss</h4>
        <div class="code-block">
          <pre><code>{{ codeDismiss }}</code></pre>
        </div>
        <table class="prop-table">
          <thead><tr><th>Method</th><th>Description</th></tr></thead>
          <tbody>
            <tr v-for="m in dismissMethods" :key="m.method">
              <td><code>{{ m.method }}</code></td>
              <td>{{ m.desc }}</td>
            </tr>
          </tbody>
        </table>

        <h4>Update</h4>
        <div class="code-block">
          <pre><code>{{ codeUpdate }}</code></pre>
        </div>
        <table class="prop-table">
          <thead><tr><th>Method</th><th>Description</th></tr></thead>
          <tbody>
            <tr v-for="m in updateMethods" :key="m.method">
              <td><code>{{ m.method }}</code></td>
              <td>{{ m.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 10. Custom Styling -->
      <div class="doc-section">
        <h3>Custom Styling</h3>
        <div class="code-block">
          <pre><code>{{ codeCustomStyle }}</code></pre>
        </div>
        <table class="prop-table">
          <thead><tr><th>className</th><th>Target</th></tr></thead>
          <tbody>
            <tr v-for="c in classNameProps" :key="c.name">
              <td><code>{{ c.name }}</code></td>
              <td>{{ c.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 11. Spring Animation -->
      <div class="doc-section">
        <h3>Spring Animation</h3>
        <div class="code-block">
          <pre><code>{{ codeSpring }}</code></pre>
        </div>
        <div class="pill-row doc-pills">
          <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exNoSpringSuccess">Try No Spring</button>
          <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="() => gooeyToast.success('Bouncy!', { spring: true, bounce: 0.6 })">Try Bouncy</button>
          <button class="type-pill" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="() => gooeyToast.success('Subtle', { spring: true, bounce: 0.05 })">Try Subtle</button>
        </div>
      </div>

      <!-- 12. Nuxt Integration -->
      <div class="doc-section">
        <h3>Nuxt Integration</h3>
        <div class="code-block">
          <pre><code>{{ codeNuxt }}</code></pre>
        </div>
      </div>
    </section>

    <!-- ================================================================== -->
    <!-- FOOTER                                                             -->
    <!-- ================================================================== -->
    <footer class="site-footer">
      <p>Built with Vue &amp; motion-v</p>
    </footer>

    <!-- ================================================================== -->
    <!-- TOASTER                                                            -->
    <!-- ================================================================== -->
    <GooeyToaster
      :position="bPosition"
      :theme="bTheme"
      :preset="bPreset"
      :spring="bSpring"
      :bounce="bBounce"
      :close-button="bCloseButton"
      :show-progress="bShowProgress"
      :close-on-escape="bCloseOnEscape"
    />
  </div>
</template>
