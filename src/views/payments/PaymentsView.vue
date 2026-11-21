<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import { CreditCard, RefreshCw, ExternalLink } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import * as paymentService from '@/services/paymentService'
import type { PaymentListFilters, PaymentListResponse, PaymentRow, PaymentStatus } from '@/services/paymentService'

/**
 * Payments for the admin (everything) or an agent (their package payments and the seller
 * payments for their service packages). Refunds are made in the Stripe dashboard.
 */
const props = defineProps<{ scope: 'admin' | 'agent' }>()

const isAdmin = computed(() => props.scope === 'admin')
const toast = useToastStore()

const filters = reactive<PaymentListFilters>({ type: '', status: '', from: '', to: '', search: '', page: 1 })
const data = ref<PaymentListResponse | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

async function load() {
  isLoading.value = true
  loadError.value = null
  try {
    data.value = isAdmin.value
      ? await paymentService.fetchAdminPayments(filters)
      : await paymentService.fetchAgentPayments(filters)
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Could not load payments.'
  } finally {
    isLoading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(() => [filters.type, filters.status, filters.from, filters.to], () => {
  filters.page = 1
  load()
})
watch(() => filters.search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    filters.page = 1
    load()
  }, 350)
})

onMounted(load)

const currency = computed(() => data.value?.currency || 'usd')
const money = (amount: number | null | undefined) => paymentService.formatMoney(amount, currency.value)

const paidTotal = computed(() => data.value?.totals.paid?.amount ?? 0)
const platformFees = computed(() => data.value?.totals.paid?.platform_fee ?? 0)
const paidCount = computed(() => data.value?.totals.paid?.count ?? 0)
const pendingCount = computed(() => data.value?.totals.pending?.count ?? 0)
const refundedTotal = computed(() => data.value?.totals.refunded?.amount ?? 0)

const STATUS_STYLES: Record<PaymentStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  expired: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  refunded: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
}

function typeLabel(row: PaymentRow) {
  if (row.type === 'agent_package') return 'Agent package'
  return isAdmin.value ? 'Listing' : 'Seller payment'
}

function itemLabel(row: PaymentRow) {
  if (row.type === 'agent_package') return row.package?.name || 'Agent package'
  return row.service_package?.name || 'Service package'
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

// Stripe dashboard link (test-mode payments show under /test/)
function stripeLink(row: PaymentRow) {
  return row.stripe_payment_intent_id ? `https://dashboard.stripe.com/payments/${row.stripe_payment_intent_id}` : null
}

function goToPage(page: number) {
  filters.page = page
  load()
}

// --- Admin: platform fee settings ---
const settings = ref<paymentService.PaymentSettings | null>(null)
const feePercent = ref('0')
const feeFixed = ref('0')
const isSavingSettings = ref(false)
const settingsError = ref<string | null>(null)

async function loadSettings() {
  if (!isAdmin.value) return
  try {
    settings.value = await paymentService.fetchPaymentSettings()
    feePercent.value = String(settings.value.platform_fee_percent)
    feeFixed.value = String(settings.value.platform_fee_fixed)
  } catch {
    settings.value = null
  }
}

async function saveSettings() {
  settingsError.value = null
  const pct = Number(feePercent.value)
  const fixed = Number(feeFixed.value || 0)
  if (!Number.isFinite(pct) || pct < 0 || pct > 50) {
    settingsError.value = 'Platform fee must be between 0% and 50%.'
    return
  }
  if (!Number.isFinite(fixed) || fixed < 0) {
    settingsError.value = 'Fixed fee cannot be negative.'
    return
  }
  isSavingSettings.value = true
  try {
    settings.value = await paymentService.savePaymentSettings(pct, fixed)
    toast.success('Payment settings saved. They apply to new seller payments.')
  } catch (e: any) {
    settingsError.value = e?.response?.data?.message || 'Could not save settings.'
  } finally {
    isSavingSettings.value = false
  }
}

// --- Admin: refunds ---
const refundingId = ref<number | null>(null)

async function refund(row: PaymentRow) {
  const note = row.type === 'listing'
    ? ` The agent's share (${money(row.agent_amount)}) is taken back from the agent's Stripe account.`
    : ' The agent package will stop working when the refund completes.'
  if (!confirm(`Refund ${money(row.amount)} to ${row.payer?.email || 'the payer'}?${note}`)) return

  refundingId.value = row.id
  try {
    await paymentService.refundPayment(row.id)
    toast.success('Refund requested. The status updates when Stripe confirms it.')
    await load()
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Refund failed.')
  } finally {
    refundingId.value = null
  }
}

onMounted(loadSettings)
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
    <div class="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight text-fg">
          <CreditCard class="h-6 w-6 text-primary" />
          Payments
        </h1>
        <p class="mt-1 text-sm text-fg-muted">
          {{ isAdmin
            ? 'All Stripe payments: agent packages and seller listing payments. Refunds are made in the Stripe dashboard.'
            : 'Your package payments and what sellers paid for your service packages.' }}
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" :loading="isLoading" @click="load">
        <RefreshCw class="mr-1.5 h-4 w-4" />
        Refresh
      </BaseButton>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <BaseCard class="p-4">
        <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">{{ isAdmin ? 'Collected' : 'Paid' }}</div>
        <div class="mt-1 text-2xl font-bold text-fg">{{ money(paidTotal) }}</div>
      </BaseCard>
      <BaseCard class="p-4">
        <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">{{ isAdmin ? 'Platform fees' : 'Paid payments' }}</div>
        <div class="mt-1 text-2xl font-bold text-fg">{{ isAdmin ? money(platformFees) : paidCount }}</div>
      </BaseCard>
      <BaseCard class="p-4">
        <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Pending</div>
        <div class="mt-1 text-2xl font-bold text-fg">{{ pendingCount }}</div>
      </BaseCard>
      <BaseCard class="p-4">
        <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Refunded</div>
        <div class="mt-1 text-2xl font-bold text-fg">{{ money(refundedTotal) }}</div>
      </BaseCard>
    </div>

    <!-- Admin: platform fee (agent pays it, plus Stripe's fee, out of each seller payment) -->
    <BaseCard v-if="isAdmin && settings" class="p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-xl">
          <div class="font-semibold text-fg">Platform fee on seller payments</div>
          <p class="mt-1 text-sm text-fg-muted">
            Taken from the agent's share of each seller payment, together with Stripe's fee
            ({{ settings.processing_fee_percent }}% + {{ money(settings.processing_fee_fixed) }}). Applies to new payments only.
          </p>
          <p class="mt-2 text-xs text-fg-muted">
            Example: seller pays {{ money(settings.example.amount) }} → platform fee {{ money(settings.example.platform_fee) }},
            Stripe fee {{ money(settings.example.processing_fee) }}, agent receives
            <span class="font-semibold text-fg">{{ money(settings.example.agent_amount) }}</span>.
          </p>
        </div>
        <div class="flex flex-wrap items-end gap-2">
          <label class="text-xs font-medium text-fg-muted">
            Percent
            <div class="relative mt-1">
              <input v-model="feePercent" type="text" inputmode="decimal" aria-label="Platform fee percent"
                class="w-24 rounded-lg border border-border bg-surface py-2 pl-3 pr-7 text-sm text-fg focus:border-primary focus:outline-none" />
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-fg-muted">%</span>
            </div>
          </label>
          <label class="text-xs font-medium text-fg-muted">
            + Fixed
            <div class="relative mt-1">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-muted">$</span>
              <input v-model="feeFixed" type="text" inputmode="decimal" aria-label="Platform fixed fee"
                class="w-24 rounded-lg border border-border bg-surface py-2 pl-6 pr-3 text-sm text-fg focus:border-primary focus:outline-none" />
            </div>
          </label>
          <BaseButton :loading="isSavingSettings" @click="saveSettings">Save</BaseButton>
        </div>
      </div>
      <p v-if="settingsError" class="mt-2 text-sm text-rose-600">{{ settingsError }}</p>
    </BaseCard>

    <!-- Filters -->
    <BaseCard class="p-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          v-model="filters.search"
          type="search"
          placeholder="Search payer or description…"
          aria-label="Search payments"
          class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none lg:col-span-2"
        />
        <select v-model="filters.type" aria-label="Payment type" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none">
          <option value="">All types</option>
          <option value="agent_package">Agent packages</option>
          <option value="listing">{{ isAdmin ? 'Listing payments' : 'Seller payments' }}</option>
        </select>
        <select v-model="filters.status" aria-label="Payment status" class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none">
          <option value="">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
          <option value="refunded">Refunded</option>
        </select>
        <div class="flex items-center gap-2">
          <input v-model="filters.from" type="date" aria-label="From date" class="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-fg focus:border-primary focus:outline-none" />
          <input v-model="filters.to" type="date" aria-label="To date" class="w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-fg focus:border-primary focus:outline-none" />
        </div>
      </div>
    </BaseCard>

    <LoadingState variant="table" v-if="isLoading && !data" :rows="4" label="Loading payments" />

    <BaseCard v-else-if="loadError" class="p-6 text-center text-sm text-rose-600">{{ loadError }}</BaseCard>

    <BaseCard v-else-if="data && data.items.length === 0" class="p-10 text-center text-sm text-fg-muted">
      No payments match these filters.
    </BaseCard>

    <BaseCard v-else-if="data" class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1000px] text-left text-sm">
          <thead class="border-b border-border bg-surface-raised/50 text-xs uppercase tracking-wider text-fg-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">Date</th>
              <th class="px-4 py-3 font-semibold">Type</th>
              <th class="px-4 py-3 font-semibold">Payer</th>
              <th class="px-4 py-3 font-semibold">For</th>
              <th v-if="isAdmin" class="px-4 py-3 font-semibold">Agent</th>
              <th class="px-4 py-3 text-right font-semibold">Amount</th>
              <th class="px-4 py-3 text-right font-semibold">{{ isAdmin ? 'Fees / agent' : 'You receive' }}</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th v-if="isAdmin" class="px-4 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="row in data.items" :key="row.id" class="hover:bg-surface-raised/40">
              <td class="whitespace-nowrap px-4 py-3 text-fg-muted">
                {{ formatDate(row.paid_at || row.created_at) }}
              </td>
              <td class="px-4 py-3 text-fg">{{ typeLabel(row) }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-fg">{{ row.payer?.name || '—' }}</div>
                <div class="text-xs text-fg-muted">{{ row.payer?.email }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-fg">{{ itemLabel(row) }}</div>
                <div v-if="row.listing" class="text-xs text-fg-muted">
                  {{ row.listing.reference_code }} · {{ row.listing.address }}, {{ row.listing.city }}
                </div>
              </td>
              <td v-if="isAdmin" class="px-4 py-3 text-fg-muted">{{ row.agent?.name || '—' }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-semibold text-fg">{{ money(row.amount) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right text-xs text-fg-muted">
                <template v-if="row.type === 'listing'">
                  <template v-if="isAdmin">
                    <div>Platform {{ money(row.platform_fee) }} · Stripe {{ money(row.processing_fee) }}</div>
                    <div class="font-semibold text-fg">Agent {{ money(row.agent_amount) }}</div>
                  </template>
                  <template v-else-if="row.agent?.id && row.payer?.id !== row.agent?.id">
                    <div class="font-semibold text-fg">{{ money(row.agent_amount) }}</div>
                    <div>after {{ money(row.platform_fee + row.processing_fee) }} fees</div>
                  </template>
                </template>
                <span v-else>—</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize" :class="STATUS_STYLES[row.status]">
                  {{ row.status }}
                </span>
                <div v-if="row.refund_requested && row.status === 'paid'" class="mt-1 text-[11px] text-violet-600">Refund requested</div>
              </td>
              <td v-if="isAdmin" class="whitespace-nowrap px-4 py-3 text-right">
                <button
                  v-if="row.status === 'paid' && !row.refund_requested"
                  type="button"
                  class="mr-3 text-xs font-medium text-rose-600 hover:underline disabled:opacity-50"
                  :disabled="refundingId === row.id"
                  @click="refund(row)"
                >
                  {{ refundingId === row.id ? 'Refunding…' : 'Refund' }}
                </button>
                <a
                  v-if="stripeLink(row)"
                  :href="stripeLink(row)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Stripe <ExternalLink class="h-3 w-3" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="data.meta.last_page > 1" class="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-fg-muted">
        <span>Page {{ data.meta.current_page }} of {{ data.meta.last_page }} · {{ data.meta.total }} payments</span>
        <div class="flex gap-2">
          <BaseButton size="sm" variant="secondary" :disabled="data.meta.current_page <= 1" @click="goToPage(data.meta.current_page - 1)">Previous</BaseButton>
          <BaseButton size="sm" variant="secondary" :disabled="data.meta.current_page >= data.meta.last_page" @click="goToPage(data.meta.current_page + 1)">Next</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
