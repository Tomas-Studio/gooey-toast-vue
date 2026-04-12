<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useCopy } from '../composables/useCopy'

const emit = defineEmits<{
  'update:heroVisible': [visible: boolean]
}>()

const heroTitleRef = ref<HTMLElement | null>(null)
const { copied, copy } = useCopy()

let observer: IntersectionObserver | null = null
onMounted(() => {
  nextTick(() => {
    if (heroTitleRef.value) {
      observer = new IntersectionObserver(
        ([entry]) => { emit('update:heroVisible', entry.isIntersecting) },
        { threshold: 0.1 },
      )
      observer.observe(heroTitleRef.value)
    }
  })
})
onUnmounted(() => { observer?.disconnect() })
</script>

<template>
  <section id="hero" class="text-center max-w-[680px] mx-auto px-6 pt-16 pb-12 max-sm:px-4 max-sm:pt-10 max-sm:pb-8">
    <!-- Version badge -->
    <div class="inline-flex items-center gap-2 bg-card rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-secondary mb-6">
      <span class="w-2 h-2 rounded-full bg-green animate-[pulse-dot_2s_ease-in-out_infinite]" />
      <span>v0.2.0</span>
    </div>

    <!-- Title -->
    <h1
      ref="heroTitleRef"
      class="font-display text-5xl max-sm:text-[28px] font-extrabold leading-tight tracking-tight mb-4 bg-gradient-to-br from-text via-green to-blue bg-clip-text text-transparent"
    >
      gooey-toast-vue
    </h1>

    <!-- Subtitle -->
    <p class="text-text-secondary text-[17px] max-sm:text-[15px] leading-relaxed max-w-[480px] mx-auto mb-7">
      Beautiful, gooey toast notifications for Vue 3. Smooth spring animations powered by motion-v.
    </p>

    <!-- Install command -->
    <div class="inline-flex items-center gap-2 bg-surface border border-border rounded-[10px] shadow-sm font-mono text-[13.5px] text-text px-4 py-2.5 max-w-full">
      <code class="whitespace-nowrap overflow-hidden text-ellipsis">npm install gooey-toast-vue</code>
      <button
        class="w-8 h-8 rounded-lg flex-shrink-0 inline-flex items-center justify-center text-text-muted hover:text-text hover:bg-card transition-all cursor-pointer"
        @click="copy('npm install gooey-toast-vue')"
      >
        <svg v-if="copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      </button>
    </div>
  </section>
</template>
