<script setup lang="ts">
import { computed } from 'vue'
import type { ListingStatus } from '@/types/listing'

export type UserStatus = 'active' | 'pending' | 'suspended' | 'inactive' | 'blocked'

const props = withDefaults(
  defineProps<{
    status: ListingStatus | UserStatus
    kind?: 'listing' | 'user'
    emphasized?: boolean
  }>(),
  {
    kind: 'listing',
    emphasized: false,
  },
)

const listingConfig: Record<ListingStatus, { label: string; dotClass: string; textClass: string }> = {
  draft: { label: 'Draft', dotClass: 'bg-fg-muted', textClass: 'text-fg-muted' },
  in_progress: { label: 'In Progress', dotClass: 'bg-warning', textClass: 'text-warning' },
  under_review: { label: 'Under Review', dotClass: 'bg-info', textClass: 'text-info' },
  submitted: { label: 'Submitted', dotClass: 'bg-info', textClass: 'text-info' },
  published: { label: 'Published', dotClass: 'bg-success', textClass: 'text-success' },
  under_contract: { label: 'Under Contract', dotClass: 'bg-primary', textClass: 'text-primary' },
  ccs: { label: 'Contingent (CCS)', dotClass: 'bg-warning', textClass: 'text-warning' },
  contingent_continue_to_show: { label: 'Contingent (CCS)', dotClass: 'bg-warning', textClass: 'text-warning' },
  sold: { label: 'Sold', dotClass: 'bg-success', textClass: 'text-success' },
  rejected: { label: 'Rejected', dotClass: 'bg-danger', textClass: 'text-danger' },
  withdrawn: { label: 'Withdrawn', dotClass: 'bg-fg-muted', textClass: 'text-fg-muted' },
  canceled: { label: 'Canceled', dotClass: 'bg-danger', textClass: 'text-danger' },
  suspended: { label: 'Suspended', dotClass: 'bg-warning', textClass: 'text-warning' },
  expired: { label: 'Expired', dotClass: 'bg-fg-muted', textClass: 'text-fg-muted' },
  unpublished: { label: 'Unpublished', dotClass: 'bg-fg-muted', textClass: 'text-fg-muted' },
}

const userConfig: Record<UserStatus, { label: string; dotClass: string; textClass: string; ringClass: string }> = {
  active: { label: 'Active', dotClass: 'bg-success', textClass: 'text-success', ringClass: 'ring-success/20' },
  pending: { label: 'Pending', dotClass: 'bg-warning', textClass: 'text-warning', ringClass: 'ring-warning/20' },
  suspended: { label: 'Suspended', dotClass: 'bg-caution', textClass: 'text-caution', ringClass: 'ring-caution/20' },
  inactive: { label: 'Inactive', dotClass: 'bg-fg-muted', textClass: 'text-fg-muted', ringClass: 'ring-fg-muted/20' },
  blocked: { label: 'Blocked', dotClass: 'bg-danger', textClass: 'text-danger', ringClass: 'ring-danger/20' },
}

const current = computed(() => {
  if (props.kind === 'user') {
    return userConfig[props.status as UserStatus]
  }
  return { ...listingConfig[props.status as ListingStatus], ringClass: '' }
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-sm font-medium" :class="current.textClass">
    <span
      class="h-1.5 w-1.5 shrink-0 rounded-full"
      :class="[current.dotClass, emphasized ? ['ring-2', current.ringClass] : '']"
      aria-hidden="true"
    ></span>
    {{ current.label }}
  </span>
</template>
