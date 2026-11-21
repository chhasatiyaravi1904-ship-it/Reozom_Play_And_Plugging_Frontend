<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'

defineProps<{
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()

// Pages pass @retry expecting a way to try again; show a button for it unless the page
// provides its own action. Without a listener there is nothing to retry, so no button.
const instance = getCurrentInstance()
const hasRetryListener = computed(() => !!instance?.vnode.props?.onRetry)
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
    <button
      v-else-if="hasRetryListener"
      type="button"
      class="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-fg shadow-xs hover:bg-surface-raised transition-colors"
      @click="emit('retry')"
    >
      <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />
      Try again
    </button>
  </div>
</template>
