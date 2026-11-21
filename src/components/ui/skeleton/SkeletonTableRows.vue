<script setup lang="ts">
/**
 * Shimmer rows placed inside an existing <tbody>, so the real table header stays
 * visible while the data loads. `cellClass` should match the table's cell padding.
 */
withDefaults(
  defineProps<{
    rows?: number
    columns: number
    cellClass?: string
  }>(),
  { rows: 4, cellClass: 'px-4 py-3.5' },
)

const widths = ['w-36', 'w-20', 'w-24', 'w-16', 'w-28', 'w-14']
</script>

<template>
  <tr v-for="row in rows" :key="row" aria-hidden="true">
    <td v-for="col in columns" :key="col" :class="cellClass">
      <div class="skeleton h-4 rounded max-w-full" :class="widths[(row + col) % widths.length]"></div>
      <div v-if="col === 1" class="skeleton mt-1.5 h-2.5 w-16 rounded"></div>
    </td>
  </tr>
</template>
