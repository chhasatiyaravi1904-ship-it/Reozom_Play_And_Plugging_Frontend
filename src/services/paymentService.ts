import api from './api'

/**
 * Stripe Checkout payments. The browser never sends amounts: the backend reads prices from the
 * database, and a payment only counts as paid once Stripe confirms it server-side.
 */

export type PaymentType = 'agent_package' | 'listing'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'

export interface PaymentSummary {
  id: number
  type: PaymentType
  status: PaymentStatus
  amount: number
  currency: string
  description: string | null
  package_id: string | null
  listing_id: number | null
  paid_at: string | null
  created_at: string | null
}

export interface CheckoutResponse {
  checkout_url: string
  payment: PaymentSummary
}

export interface ListingPaymentStatus {
  required: boolean
  paid: boolean
  amount: number
  currency: string
  package: { id: number; name: string } | null
  can_pay: boolean
  payment_available: boolean
  /** False until the agent finishes Stripe payout setup (seller money goes to the agent) */
  agent_ready: boolean
}

export interface PaymentRow {
  id: number
  type: PaymentType
  status: PaymentStatus
  amount: number
  currency: string
  platform_fee: number
  processing_fee: number
  agent_amount: number
  refund_requested: boolean
  description: string | null
  payer: { id: number; name: string; email: string } | null
  agent: { id: number; name: string; email: string } | null
  package: { id: string; name: string } | null
  service_package: { id: number; name: string } | null
  listing: { id: number; reference_code: string; address: string; city: string; state: string } | null
  stripe_payment_intent_id: string | null
  paid_at: string | null
  refunded_at: string | null
  created_at: string | null
}

export interface PaymentListResponse {
  items: PaymentRow[]
  totals: Partial<Record<PaymentStatus, { count: number; amount: number; platform_fee: number; processing_fee: number; agent_amount: number }>>
  currency: string
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface PaymentListFilters {
  type?: PaymentType | ''
  status?: PaymentStatus | ''
  from?: string
  to?: string
  search?: string
  page?: number
  per_page?: number
}

export async function startPackageCheckout(packageId: string): Promise<CheckoutResponse> {
  const res = await api.post(`/packages/${packageId}/checkout`)
  return res.data as CheckoutResponse
}

export async function startListingCheckout(listingId: number): Promise<CheckoutResponse> {
  const res = await api.post(`/listings/${listingId}/checkout`)
  return res.data as CheckoutResponse
}

export async function fetchListingPaymentStatus(listingId: number): Promise<ListingPaymentStatus> {
  const res = await api.get(`/listings/${listingId}/payment-status`)
  return res.data as ListingPaymentStatus
}

/** Asks the backend to re-check the session with Stripe and return the result. */
export async function fetchPaymentSession(sessionId: string): Promise<PaymentSummary> {
  const res = await api.get(`/payments/session/${encodeURIComponent(sessionId)}`)
  return res.data as PaymentSummary
}

function cleanFilters(filters: PaymentListFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v != null))
}

export async function fetchAdminPayments(filters: PaymentListFilters = {}): Promise<PaymentListResponse> {
  const res = await api.get('/admin/payments', { params: cleanFilters(filters) })
  return res.data as PaymentListResponse
}

export async function fetchAgentPayments(filters: PaymentListFilters = {}): Promise<PaymentListResponse> {
  const res = await api.get('/agent/payments', { params: cleanFilters(filters) })
  return res.data as PaymentListResponse
}

export function formatMoney(amount: number | string | null | undefined, currency = 'usd'): string {
  const n = Number(amount ?? 0)
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(Number.isFinite(n) ? n : 0)
}

/** Only follow redirects to Stripe's own checkout domain. */
export function redirectToCheckout(url: string) {
  const target = new URL(url)
  if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com') {
    throw new Error('Unexpected payment URL.')
  }
  window.location.assign(target.toString())
}

// --- Agent payout account (Stripe Connect) & withdrawals ---

export type PayoutAccountStatus = 'not_started' | 'pending' | 'ready' | 'restricted'

export interface PayoutAccount {
  status: PayoutAccountStatus
  details_submitted: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  requirements_due: number
  disabled_reason: string | null
  updated_at: string | null
  available: boolean
}

export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled'

export interface PayoutRow {
  id: number
  amount: number
  currency: string
  status: PayoutStatus
  failure_message: string | null
  arrival_date: string | null
  paid_at: string | null
  created_at: string | null
  agent?: { id: number; name: string; email: string } | null
}

export interface AgentPayoutsOverview {
  account: PayoutAccount
  currency: string
  balance: { available: number; pending: number }
  balance_error: string | null
  min_withdrawal: number
  earnings: { sales: number; gross: number; platform_fee: number; processing_fee: number; net: number }
  payouts: PayoutRow[]
}

export async function fetchPayoutAccount(refresh = false): Promise<PayoutAccount> {
  const res = await api.get('/agent/payout-account', { params: refresh ? { refresh: 1 } : {} })
  return res.data as PayoutAccount
}

/** Only follow links to Stripe's own Connect pages. */
export function redirectToStripeConnect(url: string) {
  const target = new URL(url)
  if (target.protocol !== 'https:' || !/(^|\.)stripe\.com$/.test(target.hostname)) {
    throw new Error('Unexpected Stripe URL.')
  }
  window.location.assign(target.toString())
}

export async function startPayoutOnboarding(): Promise<string> {
  const res = await api.post('/agent/payout-account/onboarding')
  return (res.data as { url: string }).url
}

export async function openPayoutDashboard(): Promise<string> {
  const res = await api.post('/agent/payout-account/dashboard')
  return (res.data as { url: string }).url
}

export async function fetchAgentPayouts(): Promise<AgentPayoutsOverview> {
  const res = await api.get('/agent/payouts')
  return res.data as AgentPayoutsOverview
}

export async function requestWithdrawal(amount: number): Promise<PayoutRow> {
  const res = await api.post('/agent/payouts', { amount: amount.toFixed(2) })
  return res.data as PayoutRow
}

// --- Admin ---

export interface PaymentSettings {
  platform_fee_percent: number
  platform_fee_fixed: number
  processing_fee_percent: number
  processing_fee_fixed: number
  example: { amount: number; platform_fee: number; processing_fee: number; agent_amount: number }
}

export interface AgentPayoutAccountRow {
  id: number
  name: string
  email: string
  payout_status: PayoutAccountStatus
  requirements_due: number
  gross: number
  net: number
  platform_fee: number
  withdrawn: number
}

export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  const res = await api.get('/admin/payment-settings')
  return res.data as PaymentSettings
}

export async function savePaymentSettings(platformFeePercent: number, platformFeeFixed: number): Promise<PaymentSettings> {
  const res = await api.put('/admin/payment-settings', {
    platform_fee_percent: platformFeePercent,
    platform_fee_fixed: platformFeeFixed,
  })
  return res.data as PaymentSettings
}

export async function refundPayment(paymentId: number): Promise<void> {
  await api.post(`/admin/payments/${paymentId}/refund`)
}

export async function fetchAdminPayouts(status = ''): Promise<{ items: PayoutRow[]; meta: { current_page: number; last_page: number; total: number } }> {
  const res = await api.get('/admin/payouts', { params: status ? { status } : {} })
  return res.data as { items: PayoutRow[]; meta: { current_page: number; last_page: number; total: number } }
}

export async function fetchAdminPayoutAccounts(): Promise<AgentPayoutAccountRow[]> {
  const res = await api.get('/admin/payout-accounts')
  return res.data as AgentPayoutAccountRow[]
}

export const PAYOUT_ACCOUNT_LABELS: Record<PayoutAccountStatus, string> = {
  not_started: 'Not set up',
  pending: 'Pending verification',
  ready: 'Ready',
  restricted: 'Action needed',
}
