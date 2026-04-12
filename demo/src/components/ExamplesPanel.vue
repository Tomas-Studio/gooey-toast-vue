<script setup lang="ts">
import { gooeyToast } from 'gooey-toast-vue'
import {
  toastTypes, typeColors,
  exDefault, exSuccess, exError, exWarning, exInfo,
  exWarningDesc, exErrorDesc,
  exErrorAction, exActionSuccess,
  exNoSpringSuccess, exNoSpringError, exNoSpringAction,
  exPromiseSuccess, exPromiseError, exPromiseSuccessExpanded, exPromiseErrorExpanded,
  exUpdate, exProgress, exCallbacks,
} from '../composables/useExamples'

const typeHandlers: Record<string, () => void> = {
  default: exDefault,
  success: exSuccess,
  error: exError,
  warning: exWarning,
  info: exInfo,
}
</script>

<template>
  <div id="examples" class="flex flex-col gap-6 md-lg:sticky md-lg:top-20 md-lg:self-start md-lg:max-h-[calc(100vh-56px-48px)] md-lg:overflow-y-auto">
    <h2 class="font-display text-xl font-bold">Examples</h2>

    <!-- Toast Types -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Toast Types</h3>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="t in toastTypes"
          :key="t"
          class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80"
          :style="{ background: typeColors[t].bg, color: typeColors[t].fg }"
          @click="typeHandlers[t]()"
        >
          {{ t.charAt(0).toUpperCase() + t.slice(1) }}
        </button>
      </div>
    </div>

    <!-- With Description -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">With Description</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.warning.bg, color: typeColors.warning.fg }" @click="exWarningDesc">Warning + Desc</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorDesc">Error + Desc</button>
      </div>
    </div>

    <!-- With Action Button -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">With Action Button</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exErrorAction">Error + Action</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.default.bg, color: typeColors.default.fg }" @click="exActionSuccess">Action + Success</button>
      </div>
    </div>

    <!-- No Spring -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">No Spring</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exNoSpringSuccess">Success</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exNoSpringError">Error + Desc</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.default.bg, color: typeColors.default.fg }" @click="exNoSpringAction">Action</button>
      </div>
    </div>

    <!-- Promise -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Promise</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccess">Promise &rarr; Success</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exPromiseError">Promise &rarr; Error</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exPromiseSuccessExpanded">Success (expanded)</button>
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.error.bg, color: typeColors.error.fg }" @click="exPromiseErrorExpanded">Error (expanded)</button>
      </div>
    </div>

    <!-- Update Toast -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Update Toast</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.info.bg, color: typeColors.info.fg }" @click="exUpdate">Update Toast</button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Progress Bar</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.info.bg, color: typeColors.info.fg }" @click="exProgress">Show Progress</button>
      </div>
    </div>

    <!-- Callbacks -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Callbacks</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" :style="{ background: typeColors.success.bg, color: typeColors.success.fg }" @click="exCallbacks">With Callback</button>
      </div>
    </div>

    <!-- Dismiss -->
    <div>
      <h3 class="text-[13px] font-semibold text-text-muted uppercase tracking-wider mb-2">Dismiss</h3>
      <div class="flex flex-wrap gap-1.5">
        <button class="inline-flex items-center px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer hover:opacity-80" style="background: #fecaca; color: #b91c1c;" @click="gooeyToast.dismiss()">Dismiss All</button>
      </div>
    </div>
  </div>
</template>
