<script setup lang="ts">
import Skeleton from './Skeleton.vue'

/** Placeholder for a detail page: title block, a row of stat boxes and content sections. */
withDefaults(
  defineProps<{
    stats?: number
    sections?: number
  }>(),
  { stats: 4, sections: 2 },
)
</script>

<template>
  <div class="space-y-6" aria-hidden="true">
    <div class="space-y-2.5">
      <Skeleton class="h-3 w-32" />
      <Skeleton class="h-7 w-72 max-w-full" />
      <Skeleton class="h-3.5 w-96 max-w-full" />
    </div>

    <div v-if="stats" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="s in stats" :key="s" class="space-y-3 rounded-xl border border-border bg-surface p-4">
        <Skeleton class="h-9 w-9" rounded="lg" />
        <Skeleton class="h-3 w-20" />
        <Skeleton class="h-6 w-14" />
      </div>
    </div>

    <div v-for="section in sections" :key="section" class="space-y-4 rounded-xl border border-border bg-surface p-5">
      <Skeleton class="h-4 w-40" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div v-for="field in 4" :key="field" class="space-y-2">
          <Skeleton class="h-2.5 w-24" />
          <Skeleton class="h-4" :class="field % 2 ? 'w-3/4' : 'w-1/2'" />
        </div>
      </div>
    </div>
  </div>
</template>
