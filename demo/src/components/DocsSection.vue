<script setup lang="ts">
import { gooeyToast } from 'gooey-toast-vue'
import {
  toastTypes, typeColors,
  exDefault, exSuccess, exError, exWarning, exInfo,
  exWarningDesc, exErrorDesc, exErrorAction, exActionSuccess,
  exNoSpringSuccess, exPromiseSuccess, exPromiseError, exPromiseSuccessExpanded,
} from '../composables/useExamples'
import CodeBlock from './shared/CodeBlock.vue'
import PropTable from './shared/PropTable.vue'

const typeHandlers: Record<string, () => void> = {
  default: exDefault, success: exSuccess, error: exError, warning: exWarning, info: exInfo,
}

// ---- Code samples ----
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

// ---- Table data ----
const timingsRows = [
  { property: 'displayDuration', type: 'number', default: '4000', description: 'Time in ms before the toast auto-closes' },
]

const toasterRows = [
  { prop: 'position', type: 'GooeyToastPosition', default: "'bottom-right'", description: 'Where toasts appear on screen' },
  { prop: 'theme', type: "'light' | 'dark'", default: "'light'", description: 'Color theme for toasts' },
  { prop: 'preset', type: 'AnimationPresetName', default: "'smooth'", description: 'Animation preset' },
  { prop: 'spring', type: 'boolean', default: 'true', description: 'Enable spring physics' },
  { prop: 'bounce', type: 'number', default: '0.3', description: 'Spring bounce factor (0.05 - 0.8)' },
  { prop: 'closeButton', type: "boolean | 'top-left' | 'top-right'", default: 'false', description: 'Show close button' },
  { prop: 'showProgress', type: 'boolean', default: 'false', description: 'Show progress indicator' },
  { prop: 'closeOnEscape', type: 'boolean', default: 'true', description: 'Dismiss on Escape key' },
  { prop: 'visibleToasts', type: 'number', default: '3', description: 'Max visible toasts' },
  { prop: 'gap', type: 'number', default: '14', description: 'Gap between toasts in px' },
  { prop: 'offset', type: 'number | string', default: '32', description: 'Offset from viewport edge' },
  { prop: 'expand', type: 'boolean', default: 'false', description: 'Expand all toasts by default' },
  { prop: 'swipeToDismiss', type: 'boolean', default: 'true', description: 'Enable swipe to dismiss' },
]

const optionRows = [
  { option: 'description', type: 'string | VNode', default: '-', description: 'Toast description text' },
  { option: 'action', type: 'GooeyToastAction', default: '-', description: 'Action button config' },
  { option: 'icon', type: 'string | VNode', default: '-', description: 'Custom icon' },
  { option: 'id', type: 'string | number', default: 'auto', description: 'Custom toast ID' },
  { option: 'fillColor', type: 'string', default: '-', description: 'Background fill color' },
  { option: 'borderColor', type: 'string', default: '-', description: 'Border color' },
  { option: 'borderWidth', type: 'number', default: '-', description: 'Border width in px' },
  { option: 'timing', type: 'GooeyToastTimings', default: '-', description: 'Timing configuration' },
  { option: 'preset', type: 'AnimationPresetName', default: '-', description: 'Animation preset override' },
  { option: 'spring', type: 'boolean', default: '-', description: 'Spring physics override' },
  { option: 'bounce', type: 'number', default: '-', description: 'Bounce factor override' },
  { option: 'showProgress', type: 'boolean', default: '-', description: 'Show progress bar' },
  { option: 'showTimestamp', type: 'boolean', default: '-', description: 'Show timestamp' },
  { option: 'onDismiss', type: '(id) => void', default: '-', description: 'Called on any dismiss' },
  { option: 'onAutoClose', type: '(id) => void', default: '-', description: 'Called on auto-close' },
]

const dismissRows = [
  { method: 'gooeyToast.dismiss(id)', description: 'Dismiss a specific toast by ID' },
  { method: 'gooeyToast.dismiss()', description: 'Dismiss all toasts' },
  { method: "gooeyToast.dismiss({ type: 'error' })", description: 'Dismiss all toasts of a given type' },
]

const updateRows = [
  { method: 'gooeyToast.update(id, opts)', description: 'Update title, description, type, action, or icon' },
]

const classNameRows = [
  { classname: 'wrapper', target: 'Outer toast wrapper' },
  { classname: 'content', target: 'Content container' },
  { classname: 'header', target: 'Header row' },
  { classname: 'title', target: 'Title element' },
  { classname: 'icon', target: 'Icon container' },
  { classname: 'description', target: 'Description text' },
  { classname: 'actionWrapper', target: 'Action button wrapper' },
  { classname: 'actionButton', target: 'Action button element' },
]

const tryPillClass = 'inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80'
</script>

<template>
  <section id="docs" class="border-t border-border max-w-300 mx-auto px-6 py-16 max-sm:px-4 max-sm:py-10">
    <h2 class="font-display text-[28px] max-sm:text-2xl font-bold mb-10">Documentation</h2>

    <!-- 01. Quick Start -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Quick Start</h3>
      <CodeBlock :code="codeQuickStart" />
    </div>

    <!-- 02. Toast Types -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Toast Types</h3>
      <CodeBlock :code="codeTypes" />
      <div class="flex flex-wrap gap-1.5 mt-4">
        <button
          v-for="t in toastTypes" :key="t"
          :class="tryPillClass"
          :style="{ background: typeColors[t].bg, color: typeColors[t].fg }"
          @click="typeHandlers[t]()"
        >Try {{ t }}</button>
      </div>
    </div>

    <!-- 03. Description -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Description</h3>
      <CodeBlock :code="codeDescription" />
      <div class="flex flex-wrap gap-1.5 mt-4">
        <button :class="tryPillClass" :style="{ background: typeColors.warning.bg, color: typeColors.warning.fg }" @click="exWarningDesc">Try Warning + Desc</button>
        <button :class="tryPillClass" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorDesc">Try Error + Desc</button>
      </div>
    </div>

    <!-- 04. Action Button -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Action Button</h3>
      <CodeBlock :code="codeAction" />
      <div class="flex flex-wrap gap-1.5 mt-4">
        <button :class="tryPillClass" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorAction">Try Error + Action</button>
        <button :class="tryPillClass" :style="{ background: typeColors.default.bg, color: typeColors.default.fg }" @click="exActionSuccess">Try Action + Success</button>
      </div>
    </div>

    <!-- 05. Promise Toasts -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Promise Toasts</h3>
      <CodeBlock :code="codePromise" />
      <div class="flex flex-wrap gap-1.5 mt-4">
        <button :class="tryPillClass" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccess">Try Success</button>
        <button :class="tryPillClass" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exPromiseError">Try Error</button>
        <button :class="tryPillClass" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccessExpanded">Try Expanded</button>
      </div>
    </div>

    <!-- 06. Timings -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Timings</h3>
      <PropTable :columns="['Property', 'Type', 'Default', 'Description']" :rows="timingsRows" />
    </div>

    <!-- 07. Toaster Props -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Toaster Props</h3>
      <CodeBlock :code="codeToasterProps" />
      <div class="mt-4">
        <PropTable :columns="['Prop', 'Type', 'Default', 'Description']" :rows="toasterRows" />
      </div>
    </div>

    <!-- 08. Toast Options -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Toast Options</h3>
      <PropTable :columns="['Option', 'Type', 'Default', 'Description']" :rows="optionRows" />
    </div>

    <!-- 09. Methods -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Methods</h3>
      <h4 class="font-display text-base font-semibold mb-3">Dismiss</h4>
      <CodeBlock :code="codeDismiss" />
      <div class="mt-4">
        <PropTable :columns="['Method', 'Description']" :rows="dismissRows" />
      </div>
      <h4 class="font-display text-base font-semibold mt-6 mb-3">Update</h4>
      <CodeBlock :code="codeUpdate" />
      <div class="mt-4">
        <PropTable :columns="['Method', 'Description']" :rows="updateRows" />
      </div>
    </div>

    <!-- 10. Custom Styling -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Custom Styling</h3>
      <CodeBlock :code="codeCustomStyle" />
      <div class="mt-4">
        <PropTable :columns="['className', 'Target']" :rows="classNameRows" />
      </div>
    </div>

    <!-- 11. Spring Animation -->
    <div class="py-8 border-b border-border-subtle">
      <h3 class="font-display text-lg font-bold mb-4">Spring Animation</h3>
      <CodeBlock :code="codeSpring" />
      <div class="flex flex-wrap gap-1.5 mt-4">
        <button :class="tryPillClass" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exNoSpringSuccess">Try No Spring</button>
        <button :class="tryPillClass" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="() => gooeyToast.success('Bouncy!', { spring: true, bounce: 0.6 })">Try Bouncy</button>
        <button :class="tryPillClass" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="() => gooeyToast.success('Subtle', { spring: true, bounce: 0.05 })">Try Subtle</button>
      </div>
    </div>

    <!-- 12. Nuxt Integration -->
    <div class="py-8">
      <h3 class="font-display text-lg font-bold mb-4">Nuxt Integration</h3>
      <CodeBlock :code="codeNuxt" />
    </div>
  </section>
</template>
