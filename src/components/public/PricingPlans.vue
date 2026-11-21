<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, X } from 'lucide-vue-next'
import * as packageService from '@/services/packageService'
import type { PackageItem } from '@/types/package'

/**
 * "Listing Agent Packages" on the website: the active plans from /admin/packages, in their
 * Sort Order, each with its Included (✓) and Not included (✕) lists.
 */
const plans = ref<PackageItem[]>([])
const status = ref<'loading' | 'idle' | 'error'>('loading')

onMounted(async () => {
  try {
    const { data } = await packageService.fetchPackages()
    const payload: any = data
    plans.value = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []
    status.value = 'idle'
  } catch {
    status.value = 'error'
  }
})

function isFree(plan: PackageItem): boolean {
  return plan.price === null || plan.price === undefined || plan.price === '' || Number(plan.price) === 0
}

function priceText(plan: PackageItem): string {
  const amount = Number(plan.price)
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  })
}

function periodText(days: number): string {
  if (days === 30 || days === 31) return '/month'
  if (days === 365) return '/year'
  if (days === 7) return '/week'
  return `/ ${days} days`
}
</script>

<template>
  <!-- Loading: card-shaped shimmer -->
  <div
    v-if="status === 'loading'"
    class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
    role="status"
    aria-label="Loading plans"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-8 space-y-4"
      aria-hidden="true"
    >
      <div class="skeleton h-6 w-2/3 rounded"></div>
      <div class="skeleton h-4 w-full rounded"></div>
      <div class="skeleton h-10 w-28 rounded"></div>
      <div v-for="line in 4" :key="line" class="flex items-center gap-2">
        <div class="skeleton h-4 w-4 rounded-full"></div>
        <div class="skeleton h-3.5 rounded" :class="line % 2 ? 'w-3/4' : 'w-1/2'"></div>
      </div>
      <div class="skeleton h-11 w-full rounded-lg"></div>
    </div>
  </div>

  <p
    v-else-if="status === 'error' || plans.length === 0"
    class="text-center text-body-md font-body-md text-on-surface-variant"
  >
    {{ status === 'error' ? 'Plans are unavailable right now. Please check back soon.' : 'New agent plans are coming soon.' }}
  </p>

  <div
    v-else
    class="grid grid-cols-1 gap-8 items-stretch"
    :class="plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'"
  >
    <article
      v-for="plan in plans"
      :key="plan.id"
      class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-8 flex flex-col justify-between shadow-xs"
    >
      <div>
        <h3 class="text-headline-md font-headline-md text-primary">{{ plan.name }}</h3>
        <p v-if="plan.description" class="text-body-sm font-body-sm text-on-surface-variant mt-1">
          {{ plan.description }}
        </p>

        <div class="my-6">
          <template v-if="isFree(plan)">
            <span class="font-headline-lg text-4xl text-primary font-bold">Free</span>
          </template>
          <template v-else>
            <span class="font-headline-lg text-4xl text-primary font-bold">{{ priceText(plan) }}</span>
            <span class="text-on-surface-variant text-body-md">{{ periodText(plan.durationDays) }}</span>
          </template>
        </div>

        <ul
          v-if="plan.includedFeatures?.length || plan.excludedFeatures?.length"
          class="space-y-3 pt-4 border-t border-outline-variant/20"
        >
          <li
            v-for="item in plan.includedFeatures"
            :key="`in-${item}`"
            class="flex items-start text-body-md font-body-md text-primary"
          >
            <Check class="h-4 w-4 shrink-0 text-secondary mr-2 mt-0.5" aria-hidden="true" />
            <span><span class="sr-only">Included: </span>{{ item }}</span>
          </li>
          <li
            v-for="item in plan.excludedFeatures"
            :key="`out-${item}`"
            class="flex items-start text-body-md font-body-md text-on-surface-variant"
          >
            <X class="h-4 w-4 shrink-0 text-outline-variant mr-2 mt-0.5" aria-hidden="true" />
            <span><span class="sr-only">Not included: </span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <div class="mt-8">
        <RouterLink
          :to="{ path: '/auth/register', query: { type: 'agent', package: plan.id } }"
          class="block w-full py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-center text-primary hover:bg-surface-container font-label-lg text-label-lg transition-colors"
        >
          Get Started
        </RouterLink>
      </div>
    </article>
  </div>
</template>
