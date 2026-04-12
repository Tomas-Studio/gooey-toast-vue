<script setup lang="ts">
defineProps<{
  columns: string[]
  rows: Record<string, string>[]
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-[13.5px] border-collapse">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col"
            class="text-left uppercase tracking-wider text-[12px] font-semibold text-text-muted border-b border-border px-3 py-2"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i">
          <td
            v-for="col in columns"
            :key="col"
            class="px-3 py-2.5 border-b border-border-subtle align-top"
          >
            <code
              v-if="col.toLowerCase() !== 'description' && col.toLowerCase() !== 'target'"
              class="font-mono text-[12.5px] bg-card rounded px-1.5 py-0.5 whitespace-nowrap"
            >{{ row[col.toLowerCase()] || row[col] }}</code>
            <span v-else class="text-text-secondary">{{ row[col.toLowerCase()] || row[col] }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
