<script setup lang="ts">
import Skeleton from './Skeleton.vue'

/** Placeholder for a grid of cards (image, title, a couple of text lines, a footer). */
withDefaults(
  defineProps<{
    count?: number
    image?: boolean
  }>(),
  { count: 6, image: true },
)
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
    <div
      v-for="card in count"
      :key="card"
      class="overflow-hidden rounded-xl border border-border bg-surface shadow-xs"
    >
      <Skeleton v-if="image" class="aspect-[16/10] w-full" rounded="sm" />
      <div class="space-y-3 p-4">
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-3 w-1/2" />
        <div class="flex gap-2 pt-1">
          <Skeleton class="h-5 w-14" rounded="full" />
          <Skeleton class="h-5 w-16" rounded="full" />
        </div>
        <div class="flex items-center justify-between border-t border-border pt-3">
          <Skeleton class="h-5 w-24" />
          <Skeleton class="h-8 w-20" rounded="lg" />
        </div>
      </div>
    </div>
  </div>
</template>
