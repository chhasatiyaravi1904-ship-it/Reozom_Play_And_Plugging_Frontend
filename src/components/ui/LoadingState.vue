<script setup lang="ts">
defineProps<{
  label?: string
  rows?: number
}>()
</script>

<template>
  <div class="flex flex-col gap-3" role="status" :aria-label="label || 'Loading'">
    <div
      v-for="row in rows || 3"
      :key="row"
      class="h-16 animate-pulse rounded-xl bg-surface-raised"
    ></div>
    <span class="sr-only">{{ label || 'Loading…' }}</span>
  </div>
</template>
