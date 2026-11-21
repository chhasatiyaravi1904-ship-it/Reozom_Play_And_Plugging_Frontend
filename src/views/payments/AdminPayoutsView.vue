<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Banknote, Copy, RefreshCw } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import Modal from '@/components/ui/Modal.vue'
import { useToastStore } from '@/stores/toast'
import * as paymentService from '@/services/paymentService'
import type { AgentPayoutAccountRow, PayoutRow, PayoutStatus } from '@/services/paymentService'

/**
 * Admin: agents' withdrawal requests. Send the bank transfer using the details shown, then
 * "Mark as paid" with the transfer reference, or "Reject" with a reason. Agents are emailed.
 */
const toast = useToastStore()

const tab = ref<'requests' | 'agents'>('requests')
const accounts = ref<AgentPayoutAccountRow[]>([])
const payouts = ref<PayoutRow[]>([])
const pendingTotal = ref(0)
const statusFilter = ref<PayoutStatus | ''>('pending')
const isLoading = ref(false)
const loadError = ref<string | null>(null)

// Mark paid / reject dialog
const action = ref<{ kind: 'paid' | 'reject'; payout: PayoutRow } | null>(null)
const reference = ref('')
const paidOn = ref('')
const reason = ref('')
const actionError = ref('')
const isSubmitting = ref(false)

const money = (v: number | null | undefined) => paymentService.formatMoney(v)

async function load() {
  isLoading.value = true
  loadError.value = null
  try {
    if (tab.value === 'agents') {
      accounts.value = await paymentService.fetchAdminPayoutAccounts()
    } else {
      const page = await paymentService.fetchAdminPayouts(statusFilter.value)
      payouts.value = page.items
      pendingTotal.value = page.pending_total
    }
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Could not load payouts.'
  } finally {
    isLoading.value = false
  }
}

watch([tab, statusFilter], load)
onMounted(load)

const agentsWithBank = computed(() => accounts.value.filter((a) => a.has_bank_account).length)

function open(kind: 'paid' | 'reject', payout: PayoutRow) {
  action.value = { kind, payout }
  reference.value = ''
  paidOn.value = ''
  reason.value = ''
  actionError.value = ''
}

async function submitAction() {
  if (!action.value) return
  actionError.value = ''
  const { kind, payout } = action.value
  if (kind === 'paid' && !reference.value.trim()) {
    actionError.value = 'Enter the bank transfer reference.'
    return
  }
  if (kind === 'reject' && !reason.value.trim()) {
    actionError.value = 'Tell the agent why the request is rejected.'
    return
  }
  isSubmitting.value = true
  try {
    if (kind === 'paid') {
      await paymentService.markPayoutPaid(payout.id, reference.value.trim(), paidOn.value || undefined)
      toast.success('Marked as paid. The agent has been emailed.')
    } else {
      await paymentService.rejectPayout(payout.id, reason.value.trim())
      toast.success('Request rejected. The agent has been emailed.')
    }
    action.value = null
    await load()
  } catch (e: any) {
    const errors = e?.response?.data?.errors as Record<string, string[]> | undefined
    actionError.value = (errors && Object.values(errors)[0]?.[0]) || e?.response?.data?.message || 'Could not update this request.'
  } finally {
    isSubmitting.value = false
  }
}

async function copy(text: string | undefined) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied.')
  } catch {
    // Clipboard blocked: the value is visible to copy by hand
  }
}

const STATUS_LABELS: Record<PayoutStatus, string> = {
  pending: 'Requested',
  in_transit: 'In transit',
  paid: 'Paid',
  failed: 'Failed',
  canceled: 'Canceled',
  rejected: 'Rejected',
}
const STATUS_STYLES: Record<PayoutStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  in_transit: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  canceled: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
}
const FILTERS: { value: PayoutStatus | ''; label: string }[] = [
  { value: 'pending', label: 'To pay' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'canceled', label: 'Canceled' },
  { value: '', label: 'All' },
]

const formatDate = (v: string | null) => (v ? new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—')
const today = new Date().toISOString().slice(0, 10)
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
          Sellers pay REOZOM; agents request their share. Send the bank transfer, then mark the request as paid.
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" :loading="isLoading" @click="load">
        <RefreshCw class="mr-1.5 h-4 w-4" />
        Refresh
      </BaseButton>
    </div>

    <div class="flex gap-1 border-b border-border" role="tablist">
      <button
        v-for="t in (['requests', 'agents'] as const)"
        :key="t"
        type="button"
        role="tab"
        :aria-selected="tab === t"
        class="-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition"
        :class="tab === t ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
        @click="tab = t"
      >
        {{ t === 'requests' ? 'Withdrawal requests' : 'Agents' }}
      </button>
    </div>

    <!-- Requests -->
    <template v-if="tab === 'requests'">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="f in FILTERS"
            :key="f.value || 'all'"
            type="button"
            class="rounded-full border px-3 py-1 text-xs font-semibold transition"
            :class="statusFilter === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-fg-muted hover:text-fg'"
            @click="statusFilter = f.value"
          >
            {{ f.label }}
          </button>
        </div>
        <div class="text-sm text-fg-muted">
          Waiting for transfer: <strong class="text-fg">{{ money(pendingTotal) }}</strong>
        </div>
      </div>

      <LoadingState v-if="isLoading" variant="table" :rows="3" label="Loading requests" />
      <BaseCard v-else-if="loadError" class="p-6 text-center text-sm text-rose-600">{{ loadError }}</BaseCard>
      <BaseCard v-else-if="payouts.length === 0" class="p-8 text-center text-sm text-fg-muted">
        {{ statusFilter === 'pending' ? 'No withdrawal requests to pay.' : 'No withdrawals here.' }}
      </BaseCard>

      <div v-else class="flex flex-col gap-3">
        <BaseCard v-for="p in payouts" :key="p.id" class="p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xl font-bold text-fg">{{ money(p.amount) }}</span>
                <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="STATUS_STYLES[p.status]">
                  {{ STATUS_LABELS[p.status] }}
                </span>
              </div>
              <div class="mt-1 text-sm text-fg">{{ p.agent?.name }} <span class="text-fg-muted">· {{ p.agent?.email }}</span></div>
              <div class="mt-0.5 text-xs text-fg-muted">
                Requested {{ formatDate(p.created_at) }}
                <template v-if="p.status === 'paid'"> · Paid {{ formatDate(p.paid_at) }} · Ref {{ p.reference }}<template v-if="p.processed_by"> · by {{ p.processed_by }}</template></template>
                <template v-if="p.status === 'rejected'"> · {{ p.failure_message }}</template>
              </div>
            </div>

            <!-- Where to send the money -->
            <dl
              v-if="p.bank_details"
              class="grid shrink-0 grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-border bg-surface-raised/50 p-3 text-xs lg:min-w-[340px]"
            >
              <dt class="text-fg-muted">Account holder</dt><dd class="font-medium text-fg">{{ p.bank_details.account_holder_name }}</dd>
              <dt class="text-fg-muted">Bank</dt><dd class="text-fg">{{ p.bank_details.bank_name }} ({{ p.bank_details.account_type }})</dd>
              <dt class="text-fg-muted">Routing</dt>
              <dd class="flex items-center gap-1.5 font-mono text-fg">
                {{ p.bank_details.routing_number }}
                <button v-if="p.status === 'pending'" type="button" class="text-fg-muted hover:text-fg" aria-label="Copy routing number" @click="copy(p.bank_details?.routing_number)">
                  <Copy class="h-3.5 w-3.5" />
                </button>
              </dd>
              <dt class="text-fg-muted">Account</dt>
              <dd class="flex items-center gap-1.5 font-mono text-fg">
                {{ p.bank_details.account_number }}
                <button v-if="p.status === 'pending'" type="button" class="text-fg-muted hover:text-fg" aria-label="Copy account number" @click="copy(p.bank_details?.account_number)">
                  <Copy class="h-3.5 w-3.5" />
                </button>
              </dd>
            </dl>
          </div>

          <div v-if="p.status === 'pending' && p.method === 'manual'" class="mt-4 flex justify-end gap-2 border-t border-border pt-3">
            <BaseButton variant="secondary" size="sm" @click="open('reject', p)">Reject</BaseButton>
            <BaseButton size="sm" @click="open('paid', p)">Mark as paid</BaseButton>
          </div>
        </BaseCard>
      </div>
    </template>

    <!-- Agents -->
    <template v-else>
      <LoadingState v-if="isLoading" variant="table" :rows="3" label="Loading agents" />
      <BaseCard v-else-if="loadError" class="p-6 text-center text-sm text-rose-600">{{ loadError }}</BaseCard>
      <BaseCard v-else class="overflow-hidden">
        <div class="border-b border-border px-5 py-3 text-xs text-fg-muted">{{ agentsWithBank }} of {{ accounts.length }} agents have bank details on file.</div>
        <p v-if="accounts.length === 0" class="p-8 text-center text-sm text-fg-muted">No agents yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-sm">
            <thead class="bg-surface-raised/50 text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th class="px-5 py-2.5 font-semibold">Agent</th>
                <th class="px-5 py-2.5 font-semibold">Bank details</th>
                <th class="px-5 py-2.5 text-right font-semibold">Sellers paid</th>
                <th class="px-5 py-2.5 text-right font-semibold">Agent share</th>
                <th class="px-5 py-2.5 text-right font-semibold">Requested</th>
                <th class="px-5 py-2.5 text-right font-semibold">Paid out</th>
                <th class="px-5 py-2.5 text-right font-semibold">Available</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="a in accounts" :key="a.id">
                <td class="px-5 py-3"><div class="font-medium text-fg">{{ a.name }}</div><div class="text-xs text-fg-muted">{{ a.email }}</div></td>
                <td class="px-5 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="a.has_bank_account ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'"
                  >
                    {{ a.has_bank_account ? 'On file' : 'Not added' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-right text-fg">{{ money(a.gross) }}</td>
                <td class="px-5 py-3 text-right text-fg">{{ money(a.net) }}</td>
                <td class="px-5 py-3 text-right text-fg">{{ money(a.pending) }}</td>
                <td class="px-5 py-3 text-right text-fg">{{ money(a.withdrawn) }}</td>
                <td class="px-5 py-3 text-right font-semibold text-fg">{{ money(a.available) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>

    <Modal
      :model-value="!!action"
      :title="action?.kind === 'paid' ? 'Mark as paid' : 'Reject withdrawal'"
      @update:model-value="(open) => { if (!open) action = null }"
    >
      <div v-if="action" class="space-y-4">
        <p class="text-sm text-fg-muted">
          {{ money(action.payout.amount) }} for {{ action.payout.agent?.name }}.
          <template v-if="action.kind === 'paid'">Only mark it paid after the bank transfer has been sent.</template>
          <template v-else>The amount goes back to the agent's available balance.</template>
        </p>
        <template v-if="action.kind === 'paid'">
          <div>
            <label for="payout-reference" class="mb-1 block text-xs font-semibold text-fg">Transfer reference</label>
            <input id="payout-reference" v-model="reference" type="text" maxlength="120" placeholder="e.g. ACH trace or wire number"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label for="payout-date" class="mb-1 block text-xs font-semibold text-fg">Sent on (optional)</label>
            <input id="payout-date" v-model="paidOn" type="date" :max="today"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none" />
          </div>
        </template>
        <div v-else>
          <label for="payout-reason" class="mb-1 block text-xs font-semibold text-fg">Reason (sent to the agent)</label>
          <textarea id="payout-reason" v-model="reason" rows="3" maxlength="500"
            class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"></textarea>
        </div>
        <p v-if="actionError" class="text-sm text-rose-600" role="alert">{{ actionError }}</p>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="action = null">Cancel</BaseButton>
        <BaseButton :variant="action?.kind === 'reject' ? 'danger' : 'primary'" :loading="isSubmitting" @click="submitAction">
          {{ action?.kind === 'paid' ? 'Mark as paid' : 'Reject request' }}
        </BaseButton>
      </template>
    </Modal>
  </div>
</template>
