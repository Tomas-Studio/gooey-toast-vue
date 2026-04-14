<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { subscribeAnnouncements } from '../store/config-store'

const politeMessage = ref('')
const assertiveMessage = ref('')
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeAnnouncements(({ message, politeness }) => {
    if (politeness === 'assertive') {
      assertiveMessage.value = ''

      requestAnimationFrame(() => {
        assertiveMessage.value = message
      })
    } else {
      politeMessage.value = ''
      requestAnimationFrame(() => {
        politeMessage.value = message
      })
    }
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div
    aria-live="polite"
    aria-atomic="true"
    role="status"
    style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
  >
    {{ politeMessage }}
  </div>
  <div
    aria-live="assertive"
    aria-atomic="true"
    role="alert"
    style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
  >
    {{ assertiveMessage }}
  </div>
</template>
