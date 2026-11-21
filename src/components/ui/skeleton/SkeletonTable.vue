<script setup lang="ts">
import Skeleton from './Skeleton.vue'

/** Placeholder for a data table: a header row and body rows; the first column has an icon. */
withDefaults(
  defineProps<{
    rows?: number
    columns?: number
  }>(),
  { rows: 5, columns: 4 },
)

// Varied widths so the rows don't look like a striped wall
const widths = ['w-40', 'w-28', 'w-20', 'w-24', 'w-16', 'w-32']
</script>

<template>
  <div class="w-full overflow-hidden" aria-hidden="true">
    <div class="flex items-center gap-6 border-b border-border bg-surface-raised px-4 py-3.5">
      <Skeleton v-for="col in columns" :key="col" class="h-3 flex-1 max-w-24" />
    </div>
    <div class="divide-y divide-border">
      <div v-for="row in rows" :key="row" class="flex items-center gap-6 px-4 py-3.5">
        <div v-for="col in columns" :key="col" class="flex flex-1 items-center gap-2.5 min-w-0">
          <Skeleton v-if="col === 1" class="h-8 w-8 shrink-0" rounded="lg" />
          <div class="min-w-0 flex-1 space-y-1.5">
            <Skeleton class="h-3.5 max-w-full" :class="widths[(row + col) % widths.length]" />
            <Skeleton v-if="col === 1" class="h-2.5 w-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
