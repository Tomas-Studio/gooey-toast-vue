# gooey-toast-vue

<p>
  <a href="https://gooey-toast-vue.vercel.app/">
    <img src="https://img.shields.io/badge/docs-live-blue?style=flat-square" alt="Documentation">
  </a>
  <a href="https://www.npmjs.com/package/gooey-toast-vue">
    <img src="https://img.shields.io/npm/v/gooey-toast-vue?style=flat-square" alt="npm">
  </a>
  <a href="https://github.com/Tomas-Studio/gooey-toast-vue">
    <img src="https://img.shields.io/github/license/Tomas-Studio/gooey-toast-vue?style=flat-square" alt="MIT.License">
  </a>
</p>

A gooey, morphing toast notification library for Vue 3, powered by [motion-v](https://motion.dev/docs/vue) and [vue-sonner](https://vue-sonner.vercel.app/).

Inspired by [goey-toast](https://github.com/anl331/goey-toast) for React.

🎨 **[View Documentation & Demo](https://gooey-toast-vue.vercel.app/)**

## Features

- SVG blob morph animation from compact pill to expanded organic shape
- Spring physics with configurable bounce and stiffness
- 5 toast types: default, success, error, warning, info
- Promise toasts with loading → success/error transitions
- Action buttons with success label morphing
- 4 animation presets: smooth, bouncy, subtle, snappy
- Progress bar, close button, timestamp
- Dark mode support
- Swipe to dismiss
- Nuxt 3 module included
- Fully typed with TypeScript

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
  - [Vue 3](#vue-3)
  - [Nuxt 3](#nuxt-3)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Toast Types](#toast-types)
  - [Toast Examples](#toast-examples)
  - [Toaster Props](#toaster-props)
  - [Toast Options](#toast-options)
- [Advanced Usage](#advanced-usage)
  - [Composable](#composable)
  - [Animation Presets](#animation-presets)
  - [Custom Spring](#custom-spring)
  - [Custom Styling](#custom-styling)
- [License](#license)

## Installation

```bash
npm install gooey-toast-vue
```

## Setup

### Vue 3

**Option 1: Plugin Registration (Recommended)**

```ts
import { createApp } from 'vue'
import { GooeyToastPlugin } from 'gooey-toast-vue'
import 'gooey-toast-vue/style.css'

const app = createApp(App)
app.use(GooeyToastPlugin, {
  position: 'top-right',
  theme: 'dark',
  preset: 'bouncy',
})
```

**Option 2: Direct Import**

```vue
<script setup>
import { GooeyToaster, gooeyToast } from 'gooey-toast-vue'
import 'gooey-toast-vue/style.css'
</script>

<template>
  <div>
    <GooeyToaster position="bottom-right" />
  </div>
</template>
```

### Nuxt 3 & 4 

**1. Add module to `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  modules: ['gooey-toast-vue/nuxt'],
})
```

**2. Add `<GooeyToaster>` to your layout**

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <slot />
    <GooeyToaster position="bottom-right" />
  </div>
</template>
```

**3. Use anywhere**

```vue
<script setup>
// gooeyToast is auto-imported by the Nuxt module
gooeyToast.success('It works!')
</script>
```

The Nuxt module automatically:
- Imports the CSS stylesheet
- Registers `GooeyToaster` as a global component
- Auto-imports `gooeyToast` and `useGooeyToast`
- Marks the plugin as client-only (SSR safe)

## Quick Start

```vue
<script setup>
import { GooeyToaster, gooeyToast } from 'gooey-toast-vue'
import 'gooey-toast-vue/style.css'
</script>

<template>
  <div>
    <button @click="gooeyToast.success('Changes saved')">
      Show Toast
    </button>
    <GooeyToaster position="bottom-right" />
  </div>
</template>
```

## API Reference

### Toast Types

```ts
import { gooeyToast } from 'gooey-toast-vue'

gooeyToast('Default notification')
gooeyToast.success('Changes saved')
gooeyToast.error('Something went wrong')
gooeyToast.warning('Please review your input')
gooeyToast.info('New update available')
```

### Toast Examples

#### With Description

```ts
gooeyToast.success('File uploaded', {
  description: 'Your file has been uploaded successfully.',
})
```

#### Action Button

```ts
gooeyToast.error('Failed to save', {
  description: 'Your changes could not be saved.',
  action: {
    label: 'Retry',
    onClick: () => retryOperation(),
    successLabel: 'Done!',
  },
})
```

#### Promise Toasts

```ts
gooeyToast.promise(fetchData(), {
  loading: 'Loading data...',
  success: (data) => `Loaded ${data.count} items`,
  error: 'Failed to load data',
  description: {
    loading: 'Please wait...',
    success: 'All items are now available.',
    error: 'Check your connection and try again.',
  },
})
```

#### Update Toast

```ts
const id = gooeyToast('Uploading...', { duration: Infinity })

// Later...
gooeyToast.update(id, {
  title: 'Upload complete',
  type: 'success',
  description: 'File is ready.',
})
```

#### Dismiss

```ts
// Dismiss specific toast
gooeyToast.dismiss(id)

// Dismiss all
gooeyToast.dismiss()
```

### Toaster Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `GooeyToastPosition` | `'bottom-right'` | Toast position on screen |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `preset` | `AnimationPresetName` | — | Animation preset (smooth, bouncy, subtle, snappy) |
| `spring` | `boolean` | `true` | Enable spring physics |
| `bounce` | `number` | `0.4` | Spring bounce (0-0.8) |
| `duration` | `number` | — | Default toast duration (ms) |
| `gap` | `number` | `14` | Gap between stacked toasts (px) |
| `offset` | `string` | `'24px'` | Distance from screen edge |
| `visibleToasts` | `number` | `3` | Max visible toasts |
| `showProgress` | `boolean` | `false` | Show progress countdown bar |
| `closeButton` | `boolean \| 'top-left' \| 'top-right'` | `false` | Show close button |
| `closeOnEscape` | `boolean` | `true` | Dismiss on Escape key |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | Text direction |

### Toast Options

| Option | Type | Description |
|--------|------|-------------|
| `description` | `string \| VNode \| Component` | Toast description/body |
| `action` | `GooeyToastAction` | Action button config |
| `icon` | `string \| VNode \| Component` | Custom icon |
| `duration` | `number` | Display duration (ms) |
| `id` | `string` | Custom toast ID |
| `fillColor` | `string` | SVG blob fill color |
| `borderColor` | `string` | SVG blob border color |
| `borderWidth` | `number` | SVG blob border width |
| `preset` | `AnimationPresetName` | Per-toast animation preset |
| `spring` | `boolean` | Per-toast spring toggle |
| `bounce` | `number` | Per-toast spring bounce |
| `showProgress` | `boolean` | Show progress bar |
| `showTimestamp` | `boolean` | Show timestamp |
| `timing` | `GooeyToastTimings` | Fine-grained timing control |
| `classNames` | `GooeyToastClassNames` | CSS class overrides |

## Advanced Usage

### Composable

```vue
<script setup>
import { useGooeyToast } from 'gooey-toast-vue'

const { toast, dismiss, update } = useGooeyToast()

toast.success('Hello!')
</script>
```

### Animation Presets

```ts
gooeyToast.success('Saved', { preset: 'smooth' })
gooeyToast.success('Saved', { preset: 'bouncy' })
gooeyToast.success('Saved', { preset: 'subtle' })
gooeyToast.success('Saved', { preset: 'snappy' })
```

Or configure globally:

```vue
<GooeyToaster preset="bouncy" />
```

### Custom Spring

```ts
gooeyToast.success('Saved', {
  spring: true,
  bounce: 0.6, // 0 (no bounce) to 0.8 (very bouncy)
})
```

### Custom Styling

```ts
gooeyToast.info('Custom styled', {
  fillColor: '#f0f9ff',
  borderColor: '#0ea5e9',
  borderWidth: 2,
})
```

Override internal classes:

```ts
gooeyToast('Hello', {
  classNames: {
    title: 'my-title',
    description: 'my-desc',
    actionButton: 'my-btn',
  },
})
```

## License

MIT
