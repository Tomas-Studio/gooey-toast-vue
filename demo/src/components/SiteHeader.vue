<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  heroVisible: boolean
}>()

const mobileMenuOpen = ref(false)

function scrollTo(id: string) {
  mobileMenuOpen.value = false
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <header
    class="sticky top-0 z-50 h-14 bg-bg/80 backdrop-blur-md border-b border-border-subtle transition-shadow"
    :class="{ 'shadow-sm': !heroVisible }"
  >
    <div class="flex items-center justify-between h-full px-6 max-md-lg:px-4">
      <!-- Logo -->
      <a
        href="#"
        class="flex items-center gap-2.5 font-display font-bold text-[15px] text-text whitespace-nowrap no-underline"
        @click.prevent="scrollTo('hero')"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="url(#logo-grad)" />
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="24" y2="24">
              <stop stop-color="#6366f1" />
              <stop offset="1" stop-color="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <span>gooey-toast-vue</span>
      </a>

      <!-- Desktop Nav -->
      <nav class="hidden md-lg:flex items-center gap-0.5 bg-card rounded-full p-0.75">
        <a
          v-for="item in [{ label: 'Examples', id: 'examples' }, { label: 'Builder', id: 'builder' }, { label: 'Docs', id: 'docs' }]"
          :key="item.id"
          :href="`#${item.id}`"
          class="inline-flex items-center px-3.5 py-1.5 rounded-full text-[13px] font-medium text-text-secondary hover:text-text hover:bg-card-hover transition-all no-underline"
          @click.prevent="scrollTo(item.id)"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- Right links -->
      <div class="flex items-center gap-1">
        <a
          href="https://github.com/Tomas-Studio/gooey-toast-vue"
          target="_blank"
          rel="noopener"
          class="w-9 h-9 rounded-[10px] inline-flex items-center justify-center text-text-secondary hover:text-text hover:bg-card transition-all"
          aria-label="GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
        <a
          href="https://www.npmjs.com/package/gooey-toast-vue"
          target="_blank"
          rel="noopener"
          class="w-9 h-9 rounded-[10px] inline-flex items-center justify-center text-text-secondary hover:text-text hover:bg-card transition-all"
          aria-label="npm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/></svg>
        </a>

        <!-- Mobile menu button -->
        <button
          class="w-9 h-9 rounded-[10px] flex-col items-center justify-center gap-1 text-text-secondary hover:text-text hover:bg-card transition-all flex md-lg:hidden cursor-pointer"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle menu"
        >
          <span class="hamburger-line" />
          <span class="hamburger-line" />
          <span class="hamburger-line" />
        </button>
      </div>
    </div>

    <!-- Mobile dropdown -->
    <div
      v-if="mobileMenuOpen"
      class="md-lg:hidden fixed top-14 left-0 right-0 bottom-0 bg-bg/95 backdrop-blur-md z-50 flex flex-col gap-2 p-4 overflow-y-auto"
    >
      <a
        v-for="item in [{ label: 'Examples', id: 'examples' }, { label: 'Builder', id: 'builder' }, { label: 'Docs', id: 'docs' }]"
        :key="item.id"
        :href="`#${item.id}`"
        class="flex items-center gap-2.5 px-4 py-3 rounded-[10px] text-[15px] font-medium text-text-secondary hover:text-text hover:bg-card transition-all no-underline"
        @click.prevent="scrollTo(item.id)"
      >
        {{ item.label }}
      </a>
    </div>
  </header>
</template>
