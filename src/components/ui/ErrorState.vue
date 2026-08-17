<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()

defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-2 rounded-xl border border-danger/20 bg-danger-soft px-6 py-12 text-center"
  >
    <AlertTriangle class="h-8 w-8 text-danger" aria-hidden="true" />
    <h3 class="text-lg font-semibold text-fg">{{ title || 'Something went wrong' }}</h3>
    <p class="max-w-sm text-sm text-fg-muted">
      {{ description || 'Your saved information is safe. Please try again.' }}
    </p>
    <div v-if="$slots.action" class="mt-3">
      <slot name="action"></slot>
    </div>
  </div>
</template>
