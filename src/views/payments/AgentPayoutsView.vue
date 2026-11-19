<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banknote, ExternalLink, RefreshCw, ShieldCheck, AlertTriangle, Clock, CheckCircle2 } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useToastStore } from '@/stores/toast'
import * as paymentService from '@/services/paymentService'
import type { AgentPayoutsOverview, PayoutStatus } from '@/services/paymentService'

/**
 * Agent payouts: Stripe payout account setup, balance, Withdraw, earnings and history.
 * Identity and bank details are entered on Stripe's own pages, never here.
 */
const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const data = ref<AgentPayoutsOverview | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isOpeningStripe = ref(false)
const isWithdrawing = ref(false)
const amount = ref('')
const withdrawError = ref<string | null>(null)

const currency = computed(() => data.value?.currency || 'usd')
const money = (v: number | null | undefined) => paymentService.formatMoney(v, currency.value)
const account = computed(() => data.value?.account)
const isReady = computed(() => account.value?.status === 'ready')

async function load() {
  isLoading.value = true
  loadError.value = null
  try {
    // Coming back from Stripe onboarding: re-read the account from Stripe first
    if (route.query.onboarding === 'return') {
      await paymentService.fetchPayoutAccount(true)
      router.replace({ query: {} })
    }
    data.value = await paymentService.fetchAgentPayouts()
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Could not load your payouts.'
  } finally {
    isLoading.value = false
  }
}

async function goToStripe(kind: 'onboarding' | 'dashboard') {
  isOpeningStripe.value = true
  try {
    const url = kind === 'onboarding' ? await paymentService.startPayoutOnboarding() : await paymentService.openPayoutDashboard()
    paymentService.redirectToStripeConnect(url)
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Could not open Stripe. Please try again.')
    isOpeningStripe.value = false
  }
}

function withdrawAll() {
  if (data.value) amount.value = data.value.balance.available.toFixed(2)
}

async function withdraw() {
  withdrawError.value = null
  const value = Number(amount.value)
  if (!data.value || !Number.isFinite(value) || value <= 0) {
    withdrawError.value = 'Enter an amount.'
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
  if (!confirm(`Withdraw ${money(value)} to your bank account?`)) return

  isWithdrawing.value = true
  try {
    await paymentService.requestWithdrawal(value)
    toast.success('Withdrawal started. It usually reaches your bank in 1-2 business days.')
    amount.value = ''
    await load()
  } catch (e: any) {
    withdrawError.value = e?.response?.data?.errors?.amount?.[0] || e?.response?.data?.message || 'Withdrawal failed.'
  } finally {
    isWithdrawing.value = false
  }
}

const PAYOUT_STYLES: Record<PayoutStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  in_transit: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  canceled: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
}

const formatDate = (v: string | null) => (v ? new Date(v).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—')

onMounted(() => {
  // Stripe sends the agent here when an onboarding link expired: open a fresh one
  if (route.query.onboarding === 'refresh') {
    router.replace({ query: {} })
    goToStripe('onboarding')
    return
  }
  load()
})
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
          Sellers' payments for your plans arrive in your Stripe balance. Withdraw them to your bank whenever you like.
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" :loading="isLoading" @click="load">
        <RefreshCw class="mr-1.5 h-4 w-4" />
        Refresh
      </BaseButton>
    </div>

    <LoadingState v-if="isLoading && !data" :rows="3" label="Loading payouts" />
    <BaseCard v-else-if="loadError" class="p-6 text-center text-sm text-rose-600">{{ loadError }}</BaseCard>

    <template v-else-if="data && account">
      <!-- Payout account -->
      <BaseCard class="p-5">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <CheckCircle2 v-if="account.status === 'ready'" class="mt-0.5 h-6 w-6 shrink-0 text-success" />
            <Clock v-else-if="account.status === 'pending'" class="mt-0.5 h-6 w-6 shrink-0 text-warning" />
            <AlertTriangle v-else-if="account.status === 'restricted'" class="mt-0.5 h-6 w-6 shrink-0 text-error" />
            <ShieldCheck v-else class="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div>
              <div class="font-semibold text-fg">
                Payout account: {{ paymentService.PAYOUT_ACCOUNT_LABELS[account.status] }}
              </div>
              <p class="mt-0.5 text-sm text-fg-muted">
                <template v-if="account.status === 'not_started'">
                  Set up payouts so sellers can buy your plans. Stripe verifies your identity and bank account. It takes about 5 minutes.
                </template>
                <template v-else-if="account.status === 'pending'">
                  Stripe is checking your details{{ account.requirements_due ? `, or ${account.requirements_due} item(s) still need your input` : '' }}.
                  Your plans can be sold once this is done.
                </template>
                <template v-else-if="account.status === 'restricted'">
                  Stripe needs more information before you can receive payments or withdraw.
                </template>
                <template v-else>
                  You can receive seller payments and withdraw to your bank.
                </template>
              </p>
              <p v-if="!account.available" class="mt-1 text-sm text-rose-600">Payouts aren't available yet. Please contact support.</p>
            </div>
          </div>

          <div class="flex shrink-0 flex-wrap gap-2">
            <BaseButton
              v-if="account.status !== 'ready'"
              :loading="isOpeningStripe"
              :disabled="!account.available"
              @click="goToStripe('onboarding')"
            >
              {{ account.status === 'not_started' ? 'Set up payouts' : 'Continue on Stripe' }}
            </BaseButton>
            <BaseButton
              v-if="account.details_submitted"
              variant="secondary"
              :loading="isOpeningStripe"
              @click="goToStripe('dashboard')"
            >
              Stripe dashboard
              <ExternalLink class="ml-1.5 h-4 w-4" />
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Balance & withdraw -->
      <div class="grid gap-4 md:grid-cols-3">
        <BaseCard class="p-5">
          <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Available to withdraw</div>
          <div class="mt-1 text-3xl font-bold text-fg">{{ money(data.balance.available) }}</div>
          <div class="mt-1 text-xs text-fg-muted">{{ money(data.balance.pending) }} on the way (usually ~2 business days)</div>
          <p v-if="data.balance_error" class="mt-2 text-xs text-rose-600">{{ data.balance_error }}</p>
        </BaseCard>

        <BaseCard class="p-5 md:col-span-2">
          <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Withdraw to bank</div>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <div class="relative flex-1">
              <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-muted">$</span>
              <input
                v-model="amount"
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                aria-label="Withdrawal amount"
                :disabled="!isReady"
                class="w-full rounded-lg border border-border bg-surface py-2 pl-7 pr-3 text-sm text-fg focus:border-primary focus:outline-none disabled:opacity-50"
                @keydown.enter.prevent="withdraw"
              />
            </div>
            <BaseButton variant="secondary" :disabled="!isReady || data.balance.available <= 0" @click="withdrawAll">Max</BaseButton>
            <BaseButton :loading="isWithdrawing" :disabled="!isReady || data.balance.available <= 0" @click="withdraw">Withdraw</BaseButton>
          </div>
          <p v-if="withdrawError" class="mt-2 text-sm text-rose-600">{{ withdrawError }}</p>
          <p v-else class="mt-2 text-xs text-fg-muted">
            {{ isReady ? `Minimum ${money(data.min_withdrawal)}. Sent by Stripe to the bank account on file.` : 'Finish setting up payouts to withdraw.' }}
          </p>
        </BaseCard>
      </div>

      <!-- Earnings -->
      <BaseCard class="p-5">
        <div class="text-xs font-medium uppercase tracking-wider text-fg-muted">Earnings from sellers ({{ data.earnings.sales }} sale{{ data.earnings.sales === 1 ? '' : 's' }})</div>
        <dl class="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div><dt class="text-fg-muted">Sellers paid</dt><dd class="text-lg font-semibold text-fg">{{ money(data.earnings.gross) }}</dd></div>
          <div><dt class="text-fg-muted">Platform fee</dt><dd class="text-lg font-semibold text-fg">−{{ money(data.earnings.platform_fee) }}</dd></div>
          <div><dt class="text-fg-muted">Stripe fee</dt><dd class="text-lg font-semibold text-fg">−{{ money(data.earnings.processing_fee) }}</dd></div>
          <div><dt class="text-fg-muted">You received</dt><dd class="text-lg font-semibold text-success">{{ money(data.earnings.net) }}</dd></div>
        </dl>
      </BaseCard>

      <!-- Withdrawal history -->
      <BaseCard class="overflow-hidden">
        <div class="border-b border-border px-5 py-3 text-sm font-semibold text-fg">Withdrawals</div>
        <p v-if="data.payouts.length === 0" class="px-5 py-8 text-center text-sm text-fg-muted">No withdrawals yet.</p>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[520px] text-left text-sm">
            <thead class="bg-surface-raised/50 text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th class="px-5 py-2.5 font-semibold">Requested</th>
                <th class="px-5 py-2.5 text-right font-semibold">Amount</th>
                <th class="px-5 py-2.5 font-semibold">Status</th>
                <th class="px-5 py-2.5 font-semibold">Arrives</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="p in data.payouts" :key="p.id">
                <td class="px-5 py-3 text-fg-muted">{{ formatDate(p.created_at) }}</td>
                <td class="px-5 py-3 text-right font-semibold text-fg">{{ money(p.amount) }}</td>
                <td class="px-5 py-3">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="PAYOUT_STYLES[p.status]">
                    {{ p.status === 'in_transit' ? 'In transit' : p.status.charAt(0).toUpperCase() + p.status.slice(1) }}
                  </span>
                  <div v-if="p.failure_message" class="mt-1 text-xs text-rose-600">{{ p.failure_message }}</div>
                </td>
                <td class="px-5 py-3 text-fg-muted">{{ p.status === 'paid' ? formatDate(p.paid_at) : formatDate(p.arrival_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
