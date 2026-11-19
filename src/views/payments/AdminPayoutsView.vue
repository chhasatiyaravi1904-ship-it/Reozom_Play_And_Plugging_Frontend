<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Banknote, RefreshCw } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import * as paymentService from '@/services/paymentService'
import type { AgentPayoutAccountRow, PayoutAccountStatus, PayoutRow, PayoutStatus } from '@/services/paymentService'

/**
 * Admin: agents' payout accounts (status, earnings, withdrawn) and all withdrawals.
 */
const tab = ref<'agents' | 'withdrawals'>('agents')
const accounts = ref<AgentPayoutAccountRow[]>([])
const payouts = ref<PayoutRow[]>([])
const payoutStatus = ref<PayoutStatus | ''>('')
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const money = (v: number) => paymentService.formatMoney(v)

async function load() {
  isLoading.value = true
  loadError.value = null
  try {
    if (tab.value === 'agents') {
      accounts.value = await paymentService.fetchAdminPayoutAccounts()
    } else {
      payouts.value = (await paymentService.fetchAdminPayouts(payoutStatus.value)).items
    }
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Could not load payouts.'
  } finally {
    isLoading.value = false
  }
}

watch([tab, payoutStatus], load)
onMounted(load)

const readyCount = computed(() => accounts.value.filter((a) => a.payout_status === 'ready').length)

const ACCOUNT_STYLES: Record<PayoutAccountStatus, string> = {
  ready: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  restricted: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  not_started: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
}
const PAYOUT_STYLES: Record<PayoutStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  in_transit: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  canceled: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
}

const formatDate = (v: string | null) => (v ? new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—')
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
    <div class="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight text-fg">
          <Banknote class="h-6 w-6 text-primary" />
          Agent Payouts
        </h1>
        <p class="mt-1 text-sm text-fg-muted">
          Agents' Stripe payout accounts, what they earned from sellers, and their withdrawals to the bank.
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" :loading="isLoading" @click="load">
        <RefreshCw class="mr-1.5 h-4 w-4" />
        Refresh
      </BaseButton>
    </div>

    <div class="flex gap-1 border-b border-border" role="tablist">
      <button
        v-for="t in (['agents', 'withdrawals'] as const)"
        :key="t"
        type="button"
        role="tab"
        :aria-selected="tab === t"
        class="-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition"
        :class="tab === t ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
        @click="tab = t"
      >
        {{ t === 'agents' ? `Agents (${readyCount} ready)` : 'Withdrawals' }}
      </button>
    </div>

    <LoadingState v-if="isLoading" :rows="3" label="Loading" />
    <BaseCard v-else-if="loadError" class="p-6 text-center text-sm text-rose-600">{{ loadError }}</BaseCard>

    <!-- Agents -->
    <BaseCard v-else-if="tab === 'agents'" class="overflow-hidden">
      <p v-if="accounts.length === 0" class="p-8 text-center text-sm text-fg-muted">No agents yet.</p>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-left text-sm">
          <thead class="border-b border-border bg-surface-raised/50 text-xs uppercase tracking-wider text-fg-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">Agent</th>
              <th class="px-4 py-3 font-semibold">Payout account</th>
              <th class="px-4 py-3 text-right font-semibold">Sellers paid</th>
              <th class="px-4 py-3 text-right font-semibold">Platform fee</th>
              <th class="px-4 py-3 text-right font-semibold">Agent received</th>
              <th class="px-4 py-3 text-right font-semibold">Withdrawn</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="a in accounts" :key="a.id" class="hover:bg-surface-raised/40">
              <td class="px-4 py-3">
                <div class="font-medium text-fg">{{ a.name }}</div>
                <div class="text-xs text-fg-muted">{{ a.email }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="ACCOUNT_STYLES[a.payout_status]">
                  {{ paymentService.PAYOUT_ACCOUNT_LABELS[a.payout_status] }}
                </span>
                <div v-if="a.requirements_due" class="mt-1 text-xs text-fg-muted">{{ a.requirements_due }} item(s) due on Stripe</div>
              </td>
              <td class="px-4 py-3 text-right text-fg">{{ money(a.gross) }}</td>
              <td class="px-4 py-3 text-right text-fg">{{ money(a.platform_fee) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-fg">{{ money(a.net) }}</td>
              <td class="px-4 py-3 text-right text-fg">{{ money(a.withdrawn) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <!-- Withdrawals -->
    <template v-else>
      <select
        v-model="payoutStatus"
        aria-label="Withdrawal status"
        class="w-full max-w-xs rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in_transit">In transit</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="canceled">Canceled</option>
      </select>
      <BaseCard class="overflow-hidden">
        <p v-if="payouts.length === 0" class="p-8 text-center text-sm text-fg-muted">No withdrawals.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
            <thead class="border-b border-border bg-surface-raised/50 text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th class="px-4 py-3 font-semibold">Requested</th>
                <th class="px-4 py-3 font-semibold">Agent</th>
                <th class="px-4 py-3 text-right font-semibold">Amount</th>
                <th class="px-4 py-3 font-semibold">Status</th>
                <th class="px-4 py-3 font-semibold">Arrives / paid</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="p in payouts" :key="p.id" class="hover:bg-surface-raised/40">
                <td class="px-4 py-3 text-fg-muted">{{ formatDate(p.created_at) }}</td>
                <td class="px-4 py-3">
                  <div class="font-medium text-fg">{{ p.agent?.name || '—' }}</div>
                  <div class="text-xs text-fg-muted">{{ p.agent?.email }}</div>
                </td>
                <td class="px-4 py-3 text-right font-semibold text-fg">{{ money(p.amount) }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="PAYOUT_STYLES[p.status]">
                    {{ p.status === 'in_transit' ? 'In transit' : p.status.charAt(0).toUpperCase() + p.status.slice(1) }}
                  </span>
                  <div v-if="p.failure_message" class="mt-1 text-xs text-rose-600">{{ p.failure_message }}</div>
                </td>
                <td class="px-4 py-3 text-fg-muted">{{ p.status === 'paid' ? formatDate(p.paid_at) : formatDate(p.arrival_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
