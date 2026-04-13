<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    class="relative w-10 h-5.5 rounded-full shrink-0 transition-colors cursor-pointer"
    :class="modelValue ? 'bg-green' : 'bg-card'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-0.75 left-0.75 w-4 h-4 rounded-full bg-surface shadow-sm transition-transform"
      :class="modelValue ? 'translate-x-4.5' : ''"
    />
  </button>
</template>
