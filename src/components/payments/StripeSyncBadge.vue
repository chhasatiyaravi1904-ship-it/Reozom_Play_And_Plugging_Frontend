<script setup lang="ts">
import { computed, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import type { StripeSyncSummary } from '@/types/stripe'

/**
 * Stripe status of a plan. Failed and pending plans get a Retry button (syncs right away).
 */
const props = defineProps<{
  sync?: StripeSyncSummary | null
  retry?: () => Promise<void>
}>()

const isRetrying = ref(false)

const view = computed(() => {
  switch (props.sync?.status) {
    case 'synced':
      return { label: 'In Stripe', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' }
    case 'failed':
      return { label: 'Sync failed', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' }
    case 'not_required':
      return { label: 'Free / off', cls: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300' }
    default:
      return { label: 'Pending', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' }
  }
})

const canRetry = computed(() => !!props.retry && ['failed', 'pending'].includes(props.sync?.status ?? 'pending'))

const title = computed(() => {
  if (props.sync?.status === 'failed') return props.sync.error || 'Stripe sync failed'
  if (props.sync?.status === 'not_required') return 'Free or inactive plans are not sold through Stripe'
  if (props.sync?.status === 'synced') return `Stripe product ${props.sync.product_id ?? ''}`.trim()
  return 'Waiting to be created in Stripe'
})

async function onRetry() {
  if (!props.retry) return
  isRetrying.value = true
  try {
    await props.retry()
  } finally {
    isRetrying.value = false
  }
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="view.cls" :title="title">
      {{ view.label }}
    </span>
    <button
      v-if="canRetry"
      type="button"
      class="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
      :disabled="isRetrying"
      :title="'Retry creating this plan in Stripe'"
      @click.stop="onRetry"
    >
      <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isRetrying }" />
      Retry
    </button>
  </span>
</template>
