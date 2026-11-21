<script setup lang="ts">
import Skeleton from './skeleton/Skeleton.vue'
import SkeletonTable from './skeleton/SkeletonTable.vue'
import SkeletonCardGrid from './skeleton/SkeletonCardGrid.vue'
import SkeletonDetail from './skeleton/SkeletonDetail.vue'

/**
 * Shimmer placeholder shaped like the content that is loading.
 *   list   – stacked rows (default; `rows` sets how many)
 *   table  – table header + rows (`rows`, `columns`)
 *   cards  – grid of cards (`rows` = number of cards)
 *   detail – title, stat boxes and sections
 *   lines  – compact checklist lines for narrow panels (`rows`)
 */
withDefaults(
  defineProps<{
    label?: string
    rows?: number
    variant?: 'list' | 'lines' | 'table' | 'cards' | 'detail'
    columns?: number
  }>(),
  { variant: 'list' },
)
</script>

<template>
  <div role="status" aria-live="polite" :aria-label="label || 'Loading'">
    <SkeletonTable v-if="variant === 'table'" :rows="rows || 5" :columns="columns || 4" />
    <SkeletonCardGrid v-else-if="variant === 'cards'" :count="rows || 6" />
    <SkeletonDetail v-else-if="variant === 'detail'" />
    <div v-else-if="variant === 'lines'" class="flex flex-col gap-3" aria-hidden="true">
      <div v-for="row in rows || 4" :key="row" class="flex items-center gap-2">
        <Skeleton class="h-4 w-4 shrink-0" rounded="full" />
        <Skeleton class="h-3" :class="row % 2 ? 'w-3/4' : 'w-1/2'" />
      </div>
    </div>
    <div v-else class="flex flex-col gap-3" aria-hidden="true">
      <div
        v-for="row in rows || 3"
        :key="row"
        class="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
      >
        <Skeleton class="h-10 w-10 shrink-0" rounded="lg" />
        <div class="min-w-0 flex-1 space-y-2">
          <Skeleton class="h-3.5" :class="row % 2 ? 'w-2/5' : 'w-1/3'" />
          <Skeleton class="h-3 w-3/5" />
        </div>
        <Skeleton class="hidden h-8 w-20 sm:block" rounded="lg" />
      </div>
    </div>
    <span class="sr-only">{{ label || 'Loading…' }}</span>
  </div>
</template>
