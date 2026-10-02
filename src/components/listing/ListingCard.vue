<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { ListingSummary } from '@/types/listing'

defineProps<{
  listing: ListingSummary
}>()

const route = useRoute()
const linkPath = computed(() => {
  const basePath = route.path.startsWith('/agent') ? '/agent' : ''
  return `${basePath}/listings/`
})
</script>

<template>
  <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div class="min-w-0">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 class="truncate text-base font-semibold text-fg">{{ listing.address.address }}</h3>
        <StatusBadge :status="listing.status" />
      </div>
      <p class="mt-0.5 text-sm text-fg-muted">
        {{ listing.address.city }}, {{ listing.address.state }} {{ listing.address.zip }}
      </p>

      <div class="mt-3 flex items-center gap-3">
        <div class="h-1.5 w-32 overflow-hidden rounded-full bg-surface-raised">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${listing.progressPercent}%` }"
          ></div>
        </div>
        <span class="text-xs text-fg-muted">
          {{ listing.stepsCompleted }} of {{ listing.stepsTotal }} steps &middot; Updated
          {{ listing.updatedAt }}
        </span>
      </div>
    </div>

    <RouterLink :to="`${linkPath}${listing.id}`" class="shrink-0">
      <BaseButton size="sm">
        Continue
        <ArrowRight class="ml-1.5 h-4 w-4" />
      </BaseButton>
    </RouterLink>
  </div>
</template>
