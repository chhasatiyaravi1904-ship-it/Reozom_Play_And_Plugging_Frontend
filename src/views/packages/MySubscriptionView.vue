<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SkeletonTableRows from '@/components/ui/skeleton/SkeletonTableRows.vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as packageService from '@/services/packageService'
import { formatMoney } from '@/services/paymentService'
import type { SubscriptionHistoryRow, SubscriptionStatus } from '@/services/packageService'
import BaseCard from '@/components/ui/BaseCard.vue'

const authStore = useAuthStore()

const rows = ref<SubscriptionHistoryRow[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  replaced: 'Replaced',
  expired: 'Expired',
  refunded: 'Refunded',
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  replaced: 'bg-neutral-50 text-neutral-600 border-neutral-200',
  expired: 'bg-neutral-50 text-neutral-500 border-neutral-200',
  refunded: 'bg-amber-50 text-amber-700 border-amber-200',
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatAmount(row: SubscriptionHistoryRow) {
  return row.amount > 0 ? formatMoney(row.amount / 100, row.currency) : 'Free'
}

async function loadHistory(page = 1) {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await packageService.fetchMySubscriptions(page)
    rows.value = response.data.data
    meta.value = response.data.meta
  } catch {
    loadError.value = 'Unable to load your purchase history.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadHistory())
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-8 py-4">
    <!-- Current plan -->
    <BaseCard class="shadow-sm" :padding="true">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-neutral-500">Current plan</p>
          <template v-if="authStore.user?.currentPackage">
            <h1 class="mt-1 text-xl font-semibold text-neutral-900">{{ authStore.user.currentPackage.name }}</h1>
            <p class="mt-1 text-sm text-neutral-600">
              Active until {{ formatDate(authStore.user.currentPackage.expiresAt) }}
            </p>
          </template>
          <template v-else>
            <h1 class="mt-1 text-xl font-semibold text-neutral-900">No active plan</h1>
            <p class="mt-1 text-sm text-neutral-600">Choose a plan to keep using your agent account.</p>
          </template>
        </div>
        <RouterLink
          :to="{ name: 'agent-subscription' }"
          class="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50"
        >
          {{ authStore.user?.currentPackage ? 'Renew or change plan' : 'Choose a plan' }}
        </RouterLink>
      </div>
    </BaseCard>

    <!-- Purchase History -->
    <div>
      <h2 class="mb-4 text-xl font-semibold text-neutral-900">Purchase History</h2>
      <BaseCard class="overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-left text-sm">
            <thead class="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              <tr>
                <th class="px-6 py-4">Package</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Started</th>
                <th class="px-6 py-4">Expires</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 bg-white">
              <SkeletonTableRows v-if="isLoading && rows.length === 0" :rows="3" :columns="5" cell-class="px-6 py-4" />
              <tr v-else-if="loadError">
                <td colspan="5" class="px-6 py-8 text-center text-red-600">
                  {{ loadError }}
                  <button type="button" class="ml-2 underline" @click="loadHistory(meta.current_page)">Try again</button>
                </td>
              </tr>
              <tr v-else-if="rows.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-neutral-500">No purchases yet.</td>
              </tr>
              <tr v-for="row in rows" :key="row.id" class="transition hover:bg-neutral-50/50">
                <td class="px-6 py-4 font-medium text-neutral-900">{{ row.package?.name ?? 'Deleted package' }}</td>
                <td class="px-6 py-4 text-neutral-700">{{ formatAmount(row) }}</td>
                <td class="px-6 py-4 text-neutral-600">{{ formatDate(row.started_at) }}</td>
                <td class="px-6 py-4 text-neutral-600">{{ formatDate(row.expires_at) }}</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                    :class="STATUS_STYLES[row.status]"
                  >
                    {{ STATUS_LABELS[row.status] }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="meta.last_page > 1"
          class="flex items-center justify-between border-t border-neutral-200 px-6 py-3 text-sm"
        >
          <button
            type="button"
            class="rounded-lg border border-neutral-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="isLoading || meta.current_page <= 1"
            @click="loadHistory(meta.current_page - 1)"
          >
            Previous
          </button>
          <span class="text-neutral-500">Page {{ meta.current_page }} of {{ meta.last_page }}</span>
          <button
            type="button"
            class="rounded-lg border border-neutral-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="isLoading || meta.current_page >= meta.last_page"
            @click="loadHistory(meta.current_page + 1)"
          >
            Next
          </button>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
