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
    class="relative w-10 h-[22px] rounded-full flex-shrink-0 transition-colors cursor-pointer"
    :class="modelValue ? 'bg-green' : 'bg-card'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-surface shadow-sm transition-transform"
      :class="modelValue ? 'translate-x-[18px]' : ''"
    />
  </button>
</template>
