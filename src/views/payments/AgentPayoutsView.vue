<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Banknote, Building, CheckCircle2, Pencil, RefreshCw } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BankAccountForm from '@/components/payments/BankAccountForm.vue'
import { useToastStore } from '@/stores/toast'
import * as paymentService from '@/services/paymentService'
import type { AgentPayoutsOverview, BankAccountSummary, PayoutRow, PayoutStatus } from '@/services/paymentService'

/**
 * Agent payouts: sellers pay the platform; the agent's share builds up here and they request a
 * withdrawal to their bank account. An admin sends the bank transfer and marks it paid.
 */
const toast = useToastStore()

const data = ref<AgentPayoutsOverview | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isEditingBank = ref(false)
const amount = ref('')
const withdrawError = ref<string | null>(null)
const isWithdrawing = ref(false)
const confirmOpen = ref(false)
const toCancel = ref<PayoutRow | null>(null)
const isCanceling = ref(false)

const currency = computed(() => data.value?.currency || 'usd')
const money = (v: number | null | undefined) => paymentService.formatMoney(v, currency.value)
const bank = computed(() => data.value?.bank_account ?? null)
const canWithdraw = computed(() => !!bank.value && (data.value?.balance.available ?? 0) > 0)

async function load() {
  isLoading.value = true
  loadError.value = null
  try {
    data.value = await paymentService.fetchAgentPayouts()
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Could not load your payouts.'
  } finally {
    isLoading.value = false
  }
}

function onBankSaved(saved: BankAccountSummary) {
  if (data.value) data.value.bank_account = saved
  isEditingBank.value = false
  toast.success('Bank details saved.')
}

function withdrawAll() {
  if (data.value) amount.value = data.value.balance.available.toFixed(2)
}

/** Check the amount, then ask for confirmation. */
function startWithdraw() {
  withdrawError.value = null
  const value = Number(amount.value)
  if (!data.value || !Number.isFinite(value) || value <= 0) {
    withdrawError.value = 'Enter an amount.'
    return
  }
  if (!/^\d+(\.\d{1,2})?$/.test(amount.value.trim())) {
    withdrawError.value = 'Use at most 2 decimals.'
    return
  }
  if (value < data.value.min_withdrawal) {
    withdrawError.value = `The minimum withdrawal is ${money(data.value.min_withdrawal)}.`
    return
  }
  if (value > data.value.balance.available) {
    withdrawError.value = `You can withdraw up to ${money(data.value.balance.available)} right now.`
    return
  }
  confirmOpen.value = true
}

async function confirmWithdraw() {
  isWithdrawing.value = true
  try {
    await paymentService.requestWithdrawal(Number(amount.value))
    confirmOpen.value = false
    toast.success('Withdrawal requested. You will get an email when it has been sent to your bank.')
    amount.value = ''
    await load()
  } catch (e: any) {
    confirmOpen.value = false
    withdrawError.value = e?.response?.data?.errors?.amount?.[0] || e?.response?.data?.message || 'Withdrawal request failed.'
  } finally {
    isWithdrawing.value = false
  }
}

async function confirmCancel() {
  if (!toCancel.value) return
  isCanceling.value = true
  try {
    await paymentService.cancelWithdrawal(toCancel.value.id)
    toast.success('Withdrawal request canceled.')
    toCancel.value = null
    await load()
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Could not cancel this request.')
  } finally {
    isCanceling.value = false
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

const formatDate = (v: string | null) => (v ? new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—')

onMounted(load)
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
    <div class="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight text-fg">
          <Banknote class="h-6 w-6 text-primary" />
          Payouts
        </h1>
        <p class="mt-1 text-sm text-fg-muted">
          Sellers pay for your plans through REOZOM. Your share builds up here; request a withdrawal and we send it to your bank account.
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" :loading="isLoading" @click="load">
        <RefreshCw class="mr-1.5 h-4 w-4" />
        Refresh
      </BaseButton>
    </div>

    <LoadingState v-if="isLoading && !data" variant="table" :rows="3" label="Loading payouts" />
    <BaseCard v-else-if="loadError" class="p-6 text-center text-sm text-rose-600">{{ loadError }}</BaseCard>

    <template v-else-if="data">
      <!-- Bank account -->
      <BaseCard class="p-5">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <CheckCircle2 v-if="bank && !isEditingBank" class="mt-0.5 h-6 w-6 shrink-0 text-success" />
            <Building v-else class="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div>
              <div class="font-semibold text-fg">Bank account for withdrawals</div>
              <p v-if="bank && !isEditingBank" class="mt-0.5 text-sm text-fg-muted">
                {{ bank.bank_name }} · {{ bank.account_type === 'savings' ? 'Savings' : 'Checking' }} ending in
                <strong class="text-fg">{{ bank.account_last4 }}</strong> · {{ bank.account_holder_name }}
              </p>
              <p v-else class="mt-0.5 text-sm text-fg-muted">Add the US bank account we should send your withdrawals to.</p>
            </div>
          </div>
          <BaseButton v-if="bank && !isEditingBank" variant="secondary" size="sm" @click="isEditingBank = true">
            <Pencil class="mr-1.5 h-3.5 w-3.5" />
            Change
          </BaseButton>
        </div>
        <BankAccountForm
          v-if="!bank || isEditingBank"
          :existing="bank"
          @saved="onBankSaved"
          @cancel="isEditingBank = false"
        />
      </BaseCard>

      <!-- Balance & request -->
      <div class="grid gap-4 md:grid-cols-3">
        <BaseCard class="p-5">
          <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Available to withdraw</div>
          <div class="mt-1 text-3xl font-bold text-fg">{{ money(data.balance.available) }}</div>
          <div class="mt-1 space-y-0.5 text-xs text-fg-muted">
            <div>{{ money(data.balance.pending) }} requested, waiting for transfer</div>
            <div>{{ money(data.balance.withdrawn) }} paid out so far</div>
          </div>
        </BaseCard>

        <BaseCard class="p-5 md:col-span-2">
          <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Request a withdrawal</div>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <div class="relative flex-1">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-muted">$</span>
              <input
                v-model="amount"
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                aria-label="Withdrawal amount"
                :disabled="!canWithdraw"
                class="w-full rounded-lg border border-border bg-surface py-2 pl-7 pr-3 text-sm text-fg focus:border-primary focus:outline-none disabled:opacity-50"
                @keydown.enter.prevent="startWithdraw"
              />
            </div>
            <BaseButton variant="secondary" :disabled="!canWithdraw" @click="withdrawAll">Max</BaseButton>
            <BaseButton :disabled="!canWithdraw" @click="startWithdraw">Request withdrawal</BaseButton>
          </div>
          <p v-if="withdrawError" class="mt-2 text-sm text-rose-600" role="alert">{{ withdrawError }}</p>
          <p v-else class="mt-2 text-xs text-fg-muted">
            <template v-if="!bank">Add your bank account first.</template>
            <template v-else-if="data.balance.available <= 0">Nothing to withdraw yet.</template>
            <template v-else>
              Minimum {{ money(data.min_withdrawal) }}. Sent by bank transfer to the account ending in {{ bank.account_last4 }},
              usually within 1-3 business days after approval.
            </template>
          </p>
        </BaseCard>
      </div>

      <!-- Earnings -->
      <BaseCard class="p-5">
        <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">
          Earnings from sellers ({{ data.earnings.sales }} sale{{ data.earnings.sales === 1 ? '' : 's' }})
        </div>
        <dl class="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt class="text-fg-muted">Sellers paid</dt><dd class="text-lg font-semibold text-fg">{{ money(data.earnings.gross) }}</dd></div>
          <div><dt class="text-fg-muted">Platform fee</dt><dd class="text-lg font-semibold text-fg">−{{ money(data.earnings.platform_fee) }}</dd></div>
          <div><dt class="text-fg-muted">Stripe fee</dt><dd class="text-lg font-semibold text-fg">−{{ money(data.earnings.processing_fee) }}</dd></div>
          <div><dt class="text-fg-muted">Your share</dt><dd class="text-lg font-semibold text-success">{{ money(data.earnings.net) }}</dd></div>
        </dl>
      </BaseCard>

      <!-- History -->
      <BaseCard class="overflow-hidden">
        <div class="border-b border-border px-5 py-3 text-sm font-semibold text-fg">Withdrawals</div>
        <p v-if="data.payouts.length === 0" class="px-5 py-8 text-center text-sm text-fg-muted">No withdrawals yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[620px] text-left text-sm">
            <thead class="bg-surface-raised/50 text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th class="px-5 py-2.5 font-semibold">Requested</th>
                <th class="px-5 py-2.5 text-right font-semibold">Amount</th>
                <th class="px-5 py-2.5 font-semibold">Status</th>
                <th class="px-5 py-2.5 font-semibold">Details</th>
                <th class="px-5 py-2.5"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="p in data.payouts" :key="p.id">
                <td class="px-5 py-3 text-fg-muted">{{ formatDate(p.created_at) }}</td>
                <td class="px-5 py-3 text-right font-semibold text-fg">{{ money(p.amount) }}</td>
                <td class="px-5 py-3">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="STATUS_STYLES[p.status]">
                    {{ STATUS_LABELS[p.status] }}
                  </span>
                </td>
                <td class="px-5 py-3 text-xs text-fg-muted">
                  <template v-if="p.status === 'paid'">
                    Sent {{ formatDate(p.paid_at) }}<template v-if="p.reference"> · Ref {{ p.reference }}</template>
                  </template>
                  <span v-else-if="p.status === 'rejected' || p.status === 'failed'" class="text-rose-600">{{ p.failure_message }}</span>
                  <template v-else-if="p.status === 'pending'">Waiting for transfer<template v-if="p.bank_last4"> to ••••{{ p.bank_last4 }}</template></template>
                </td>
                <td class="px-5 py-3 text-right">
                  <BaseButton v-if="p.status === 'pending' && p.method === 'manual'" variant="ghost" size="sm" @click="toCancel = p">
                    Cancel
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Request this withdrawal?"
      confirm-label="Request withdrawal"
      :loading="isWithdrawing"
      @confirm="confirmWithdraw"
    >
      We'll send {{ money(Number(amount) || 0) }} to your {{ bank?.bank_name }} account ending in {{ bank?.account_last4 }}.
      You'll get an email when the transfer has been sent.
    </ConfirmDialog>

    <ConfirmDialog
      :model-value="!!toCancel"
      title="Cancel this withdrawal request?"
      confirm-label="Cancel request"
      tone="danger"
      :loading="isCanceling"
      @update:model-value="(open) => { if (!open) toCancel = null }"
      @confirm="confirmCancel"
    >
      {{ money(toCancel?.amount) }} goes back to your available balance.
    </ConfirmDialog>
  </div>
</template>
