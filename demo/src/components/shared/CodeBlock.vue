<script setup lang="ts">
import { useCopy } from '../../composables/useCopy'

defineProps<{
  code: string
  label?: string
}>()

const { copied, copy } = useCopy()
</script>

<template>
  <div class="rounded-xl bg-[#1a1a1a] relative overflow-hidden">
    <div v-if="label" class="flex items-center justify-between px-4 pt-3 pb-0">
      <span class="text-xs font-medium text-[#888]">{{ label }}</span>
      <button
        class="text-xs font-medium text-[#888] hover:text-[#ccc] transition-colors cursor-pointer"
        @click="copy(code)"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <div v-else class="absolute top-2 right-2 z-10">
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center text-[#888] hover:text-[#ccc] hover:bg-white/8 transition-all cursor-pointer"
        @click="copy(code)"
      >
        <svg v-if="copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      </button>
    </div>
    <pre class="font-mono text-[13px] leading-relaxed text-[#e0e0e0] p-4 overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>
