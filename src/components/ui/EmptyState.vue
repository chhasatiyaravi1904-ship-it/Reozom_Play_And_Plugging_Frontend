<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  description?: string
  icon?: Component
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface-raised px-6 py-12 text-center"
  >
    <component :is="icon" v-if="icon" class="h-8 w-8 text-fg-muted" aria-hidden="true" />
    <h3 class="text-lg font-semibold text-fg">{{ title }}</h3>
    <p v-if="description" class="max-w-sm text-sm text-fg-muted">{{ description }}</p>
    <div v-if="$slots.action" class="mt-3">
      <slot name="action"></slot>
    </div>
  </div>
</template>
