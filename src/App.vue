<script setup lang="ts">
import { ref } from 'vue'
import { GooeyToaster, gooeyToast } from './index'
import type { GooeyToastPosition, AnimationPresetName } from './index'

const position = ref<GooeyToastPosition>('bottom-right')
const theme = ref<'light' | 'dark'>('light')
const preset = ref<AnimationPresetName>('snappy')
const showProgress = ref(false)
const closeButton = ref<boolean | 'top-left' | 'top-right'>(false)

const positions: GooeyToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']
const presets: AnimationPresetName[] = ['smooth', 'bouncy', 'subtle', 'snappy']

function btnStyle(bg: string, color: string) {
  return {
    padding: '8px 16px',
    borderRadius: '999px',
    border: 'none',
    background: bg,
    color: color,
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }
}

function showDefault() {
  gooeyToast('Event created')
}

function showSuccess() {
  gooeyToast.success('Changes saved successfully')
}

function showError() {
  gooeyToast.error('Something went wrong')
}

function showWarning() {
  gooeyToast.warning('Please review your input')
}

function showInfo() {
  gooeyToast.info('New update available')
}

function showWithDescription() {
  gooeyToast.success('File uploaded', {
    description: 'Your file has been uploaded successfully and is now being processed.',
  })
}

function showWithAction() {
  gooeyToast('Meeting scheduled', {
    description: 'Your meeting with the team has been scheduled for tomorrow at 2:00 PM.',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo clicked'),
      successLabel: 'Done!',
    },
  })
}

function showPromise() {
  const promise = new Promise<{ name: string }>((resolve) => {
    setTimeout(() => resolve({ name: 'data.json' }), 2000)
  })
  gooeyToast.promise(promise, {
    loading: 'Uploading file...',
    success: (data) => `${data.name} uploaded`,
    error: 'Upload failed',
    description: {
      loading: 'Please wait while we upload your file.',
      success: 'Your file is now available in your workspace.',
      error: 'There was an error uploading your file. Please try again.',
    },
  })
}

function showCustomColors() {
  gooeyToast.info('Custom styled', {
    description: 'This toast has a custom border and fill color.',
    fillColor: '#f0f9ff',
    borderColor: '#0ea5e9',
    borderWidth: 2,
  })
}

function dismissAll() {
  gooeyToast.dismiss()
}
</script>

<template>
  <div :style="{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto', color: theme === 'dark' ? '#e0e0e0' : '#333', background: theme === 'dark' ? '#111' : '#fff', minHeight: '100vh' }">
    <h1 :style="{ marginBottom: '8px', fontSize: '28px' }">gooey-toasst-vue</h1>
    <p :style="{ color: theme === 'dark' ? '#999' : '#666', marginBottom: '32px' }">
      A gooey toast notification library for Vue, powered by motion-v
    </p>

    <!-- Controls -->
    <div :style="{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }">
      <div>
        <label :style="{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Position</label>
        <select v-model="position" :style="{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }">
          <option v-for="p in positions" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div>
        <label :style="{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Preset</label>
        <select v-model="preset" :style="{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }">
          <option v-for="p in presets" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div>
        <label :style="{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Theme</label>
        <select v-model="theme" :style="{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div :style="{ display: 'flex', alignItems: 'flex-end', gap: '12px' }">
        <label :style="{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }">
          <input type="checkbox" v-model="showProgress" /> Progress
        </label>
        <label :style="{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }">
          <input type="checkbox" :checked="closeButton !== false" @change="closeButton = ($event.target as HTMLInputElement).checked ? 'top-left' : false" /> Close btn
        </label>
      </div>
    </div>

    <!-- Toast type buttons -->
    <div :style="{ marginBottom: '24px' }">
      <h3 :style="{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }">Toast Types</h3>
      <div :style="{ display: 'flex', gap: '8px', flexWrap: 'wrap' }">
        <button @click="showDefault" :style="btnStyle('#e8e8e8', '#555')">Default</button>
        <button @click="showSuccess" :style="btnStyle('#c8e6c9', '#4CAF50')">Success</button>
        <button @click="showError" :style="btnStyle('#ffcdd2', '#E53935')">Error</button>
        <button @click="showWarning" :style="btnStyle('#ffecb3', '#C49000')">Warning</button>
        <button @click="showInfo" :style="btnStyle('#bbdefb', '#1E88E5')">Info</button>
      </div>
    </div>

    <!-- Feature buttons -->
    <div :style="{ marginBottom: '24px' }">
      <h3 :style="{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }">Features</h3>
      <div :style="{ display: 'flex', gap: '8px', flexWrap: 'wrap' }">
        <button @click="showWithDescription" :style="btnStyle('#e8e8e8', '#555')">With Description</button>
        <button @click="showWithAction" :style="btnStyle('#e8e8e8', '#555')">With Action</button>
        <button @click="showPromise" :style="btnStyle('#e8e8e8', '#555')">Promise Toast</button>
        <button @click="showCustomColors" :style="btnStyle('#e8e8e8', '#555')">Custom Colors</button>
        <button @click="dismissAll" :style="btnStyle('#ffcdd2', '#E53935')">Dismiss All</button>
      </div>
    </div>

    <GooeyToaster
      :position="position"
      :theme="theme"
      :preset="preset"
      :show-progress="showProgress"
      :close-button="closeButton"
    />
  </div>
</template>
