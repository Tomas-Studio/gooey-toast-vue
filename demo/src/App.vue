<script setup lang="ts">
import { ref } from 'vue'
import { GooeyToaster } from 'gooey-toast-vue'
import {
  bPosition, bTheme, bPreset, bSpring, bBounce,
  bCloseButton, bShowProgress, bCloseOnEscape,
} from './composables/useBuilder'
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/HeroSection.vue'
import ExamplesPanel from './components/ExamplesPanel.vue'
import ToastBuilder from './components/ToastBuilder.vue'
import DocsSection from './components/DocsSection.vue'
import SiteFooter from './components/SiteFooter.vue'

const heroVisible = ref(true)
</script>

<template>
  <div class="min-h-screen">
    <SiteHeader :hero-visible="heroVisible" />

    <HeroSection @update:hero-visible="heroVisible = $event" />

    <!-- Two-column layout: Examples + Builder -->
    <section class="grid grid-cols-1 md-lg:grid-cols-[5fr_7fr] gap-8 md-lg:gap-12 max-w-300 mx-auto px-6 max-sm:px-4 pb-16 pt-12 border-t border-border">
      <ExamplesPanel />
      <ToastBuilder />
    </section>

    <DocsSection />

    <SiteFooter />

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
