<script setup lang="ts">
import { computed } from 'vue'
import type { ListingStatus } from '@/types/listing'

const props = defineProps<{
  status: ListingStatus
}>()

const config: Record<ListingStatus, { label: string; dotClass: string; textClass: string }> = {
  draft: { label: 'Draft', dotClass: 'bg-fg-muted', textClass: 'text-fg-muted' },
  in_progress: { label: 'In Progress', dotClass: 'bg-warning', textClass: 'text-warning' },
  under_review: { label: 'Under Review', dotClass: 'bg-info', textClass: 'text-info' },
  submitted: { label: 'Submitted', dotClass: 'bg-success', textClass: 'text-success' },
}

const current = computed(() => config[props.status])
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-sm font-medium" :class="current.textClass">
    <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="current.dotClass" aria-hidden="true"></span>
    {{ current.label }}
  </span>
</template>
