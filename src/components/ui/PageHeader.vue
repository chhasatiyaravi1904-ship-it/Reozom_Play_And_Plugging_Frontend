<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-headline-sm font-headline-sm text-primary">{{ title }}</h1>
      <p v-if="description" class="mt-1 text-body-sm font-body-sm text-on-surface-variant">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
