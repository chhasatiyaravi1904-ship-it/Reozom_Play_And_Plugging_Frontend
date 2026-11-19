<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import * as paymentService from '@/services/paymentService'
import type { PaymentSummary } from '@/services/paymentService'

/**
 * Stripe sends the payer back here. The page never trusts the URL: it asks the backend, which
 * re-checks the session with Stripe before anything is activated.
 */
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sessionId = String(route.query.session_id || '')
const canceled = route.query.canceled === '1'

const payment = ref<PaymentSummary | null>(null)
const error = ref<string | null>(null)
const isChecking = ref(true)
let attempts = 0
let pollTimer: ReturnType<typeof setTimeout> | undefined

const isAgent = computed(() => authStore.user?.role === 'agent')
const base = computed(() => (isAgent.value ? '/agent' : ''))

const state = computed<'checking' | 'paid' | 'pending' | 'canceled' | 'failed'>(() => {
  // Stay on "Confirming…" until check() has finished, including the account
  // refresh for a package payment; otherwise "Go to dashboard" could be clicked
  // while the app still thinks the agent has no package and the route guard
  // sends them back to the subscription page.
  if (isChecking.value) return 'checking'
  if (payment.value?.status === 'paid') return 'paid'
  if (canceled) return 'canceled'
  if (payment.value && ['failed', 'expired', 'refunded'].includes(payment.value.status)) return 'failed'
  if (error.value) return 'failed'
  return 'pending'
})

async function check() {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    error.value = 'This payment link is not valid.'
    isChecking.value = false
    return
  }

  try {
    payment.value = await paymentService.fetchPaymentSession(sessionId)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'We could not check this payment.'
  }

  // Card payments usually confirm within seconds; poll briefly while Stripe finishes.
  if (payment.value?.status === 'pending' && !canceled && attempts < 6) {
    attempts++
    pollTimer = setTimeout(check, 2000)
    return
  }

  if (payment.value?.status === 'paid' && payment.value.type === 'agent_package') {
    // The package is now active: refresh the account so the app unlocks.
    await authStore.loadCurrentUser()
    isChecking.value = false
    // Continue on automatically; the button stays for anyone faster.
    redirectTimer = setTimeout(goNext, 2000)
    return
  }

  isChecking.value = false
}

let redirectTimer: ReturnType<typeof setTimeout> | undefined

async function goNext() {
  clearTimeout(redirectTimer)
  const p = payment.value
  // Never navigate on a stale account: the guard would bounce an agent
  // without an active package straight back to the subscription page.
  if (p?.type === 'agent_package' && p.status === 'paid' && !authStore.user?.hasActivePackage) {
    await authStore.loadCurrentUser()
  }
  if (p?.type === 'listing' && p.listing_id) {
    router.push(`${base.value}/listings/${p.listing_id}/step/step_payment`)
  } else if (p?.type === 'agent_package') {
    router.push(p.status === 'paid' ? { name: 'agent-dashboard' } : { name: 'agent-subscription' })
  } else {
    router.push(isAgent.value ? { name: 'agent-dashboard' } : { name: 'dashboard' })
  }
}

onMounted(check)
onBeforeUnmount(() => {
  clearTimeout(pollTimer)
  clearTimeout(redirectTimer)
})
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-4 py-10">
    <BaseCard :padding="true" class="w-full text-center">
      <template v-if="state === 'checking'">
        <Loader2 class="mx-auto h-10 w-10 animate-spin text-primary" />
        <h1 class="mt-4 text-lg font-semibold text-fg">Confirming your payment…</h1>
        <p class="mt-1 text-sm text-fg-muted">Checking with Stripe. This only takes a moment.</p>
      </template>

      <template v-else-if="state === 'paid'">
        <CheckCircle2 class="mx-auto h-12 w-12 text-success" />
        <h1 class="mt-4 text-lg font-semibold text-fg">Payment successful</h1>
        <p class="mt-1 text-sm text-fg-muted">
          {{ paymentService.formatMoney(payment?.amount, payment?.currency) }} paid.
          {{ payment?.type === 'agent_package' ? 'Your package is now active.' : 'You can now publish your listing.' }}
        </p>
        <BaseButton class="mt-6" block @click="goNext">
          {{ payment?.type === 'listing' ? 'Back to my listing' : 'Go to dashboard' }}
        </BaseButton>
      </template>

      <template v-else-if="state === 'canceled'">
        <XCircle class="mx-auto h-12 w-12 text-fg-muted" />
        <h1 class="mt-4 text-lg font-semibold text-fg">Payment canceled</h1>
        <p class="mt-1 text-sm text-fg-muted">No money was taken. You can try again whenever you're ready.</p>
        <BaseButton class="mt-6" block variant="secondary" @click="goNext">Go back</BaseButton>
      </template>

      <template v-else-if="state === 'pending'">
        <Clock class="mx-auto h-12 w-12 text-warning" />
        <h1 class="mt-4 text-lg font-semibold text-fg">Payment is processing</h1>
        <p class="mt-1 text-sm text-fg-muted">
          Stripe hasn't confirmed this payment yet. It will activate automatically once it does.
        </p>
        <div class="mt-6 flex gap-2">
          <BaseButton block variant="secondary" @click="goNext">Go back</BaseButton>
          <BaseButton block @click="() => { attempts = 0; isChecking = true; check() }">Check again</BaseButton>
        </div>
      </template>

      <template v-else>
        <XCircle class="mx-auto h-12 w-12 text-error" />
        <h1 class="mt-4 text-lg font-semibold text-fg">Payment not completed</h1>
        <p class="mt-1 text-sm text-fg-muted">
          {{ error || 'This payment failed or expired. No package or listing was activated.' }}
        </p>
        <BaseButton class="mt-6" block variant="secondary" @click="goNext">Go back</BaseButton>
      </template>
    </BaseCard>
  </div>
</template>
