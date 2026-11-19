<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  ArrowLeft,
  LogIn,
  DollarSign,
  Clock,
  FileText,
  Download,
  User,
  Users,
  Building,
  Calendar,
  Check,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import * as offerApi from '@/services/offerService'
import type { ListingOffer } from '@/services/offerService'

/**
 * Admin: one offer's full details on its own page (replaces the old
 * "Offer Inspection" modal on the Offer Management list).
 */
const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const authStore = useAuthStore()

const offer = ref<ListingOffer | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isDownloadingDoc = ref<string | null>(null)
const isDownloadingContract = ref(false)

async function loadOffer() {
  const id = Number(route.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    errorMessage.value = 'Offer not found.'
    return
  }
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await offerApi.getAdminOffer(id)
    offer.value = res.data
  } catch (err: any) {
    offer.value = null
    errorMessage.value = err?.response?.status === 404
      ? 'Offer not found.'
      : err?.response?.data?.message || 'Failed to load this offer.'
  } finally {
    isLoading.value = false
  }
}

// --- Log in as the seller or the buyer of this offer (admin "login as user") ---
type Party = { id: number; name?: string | null; email?: string | null; role?: string; is_active?: boolean | number }

const seller = computed(() => ((offer.value?.listing as any)?.user ?? null) as Party | null)
const buyer = computed(() => ((offer.value as any)?.buyer ?? null) as Party | null)

// Same rules as the backend (which still enforces them): never an admin, only active accounts.
const canLoginAs = (p: Party | null) =>
  !!p?.id && !['admin', 'super-admin', 'content-manager'].includes(String(p.role ?? '')) && p.is_active !== false && p.is_active !== 0

const loginAsTarget = ref<'seller' | 'buyer' | null>(null)
const isLoggingIn = ref(false)
const loginAsParty = computed(() => (loginAsTarget.value === 'seller' ? seller.value : loginAsTarget.value === 'buyer' ? buyer.value : null))
const isLoginAsOpen = computed({
  get: () => loginAsTarget.value !== null,
  set: (open: boolean) => {
    if (!open) loginAsTarget.value = null
  },
})

async function confirmLoginAs() {
  const party = loginAsParty.value
  const target = loginAsTarget.value
  if (!party || !offer.value || !target) return
  isLoggingIn.value = true
  try {
    const user = await authStore.startImpersonation(party.id, `/admin/offers/${offer.value.id}`)
    loginAsTarget.value = null
    toast.success(`You are now logged in as ${user.fullName || user.email}.`)
    // Open the offer where that person manages it
    if (target === 'seller' && offer.value.listing_id) {
      router.push(user.role === 'agent'
        ? `/agent/listings/${offer.value.listing_id}?tab=offers`
        : `/listings/${offer.value.listing_id}?tab=offers`)
    } else {
      // The buyer's "Sent Offers" tab, in their own portal
      router.push({ name: user.role === 'agent' ? 'agent-offers' : 'my-offers', query: { tab: 'sent' } })
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Could not log in as this user.')
  } finally {
    isLoggingIn.value = false
  }
}

function saveBlob(data: BlobPart, fileName: string, type?: string) {
  const url = window.URL.createObjectURL(new Blob([data], type ? { type } : undefined))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

async function handleDownloadDoc(docId: string, fileName: string) {
  if (!offer.value) return
  isDownloadingDoc.value = docId
  try {
    const res = await offerApi.downloadOfferDocument(offer.value.id, docId)
    saveBlob(res.data, fileName)
  } catch {
    toast.error('Failed to download document.')
  } finally {
    isDownloadingDoc.value = null
  }
}

async function handleDownloadContract() {
  if (!offer.value) return
  isDownloadingContract.value = true
  try {
    const res = await offerApi.downloadOfferContract(offer.value.id)
    saveBlob(res.data, `Purchase_Agreement_${offer.value.reference_code}.pdf`, 'application/pdf')
    toast.success('Purchase agreement contract downloaded.')
  } catch {
    toast.error('Failed to download contract.')
  } finally {
    isDownloadingContract.value = false
  }
}

function formatCurrency(val?: number | string | null) {
  if (val === undefined || val === null) return '$0'
  return `$${Number(val).toLocaleString()}`
}

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString()
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'accepted':
      return 'success'
    case 'submitted':
      return 'warning'
    case 'countered_by_seller':
    case 'countered_by_buyer':
      return 'info'
    case 'rejected':
    case 'rejected_under_contract':
      return 'danger'
    default:
      return 'secondary'
  }
}

onMounted(loadOffer)
watch(() => route.params.id, loadOffer)
</script>

<template>
  <div class="space-y-6">
    <RouterLink
      :to="{ name: 'admin-offers' }"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-primary"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to Offer Management
    </RouterLink>

    <PageHeader
      :title="offer ? `Offer ${offer.reference_code}` : 'Offer Details'"
      description="Full offer terms, parties, documents, contract and negotiation history."
    >
      <template v-if="offer" #actions>
        <div class="flex flex-wrap gap-2">
        <BaseButton
          v-if="canLoginAs(seller)"
          variant="secondary"
          title="Log in as the seller and open this listing's offers"
          @click="loginAsTarget = 'seller'"
        >
          <LogIn class="mr-1.5 h-4 w-4" /> Log in as Seller
        </BaseButton>
        <BaseButton
          v-if="canLoginAs(buyer)"
          variant="secondary"
          title="Log in as the buyer and open their offers"
          @click="loginAsTarget = 'buyer'"
        >
          <LogIn class="mr-1.5 h-4 w-4" /> Log in as Buyer
        </BaseButton>
        </div>
      </template>
    </PageHeader>

    <ConfirmDialog
      v-model="isLoginAsOpen"
      :title="`Log in as ${loginAsParty?.name || loginAsParty?.email || ''}`"
      :confirm-label="loginAsTarget === 'seller' ? 'Log in as Seller' : 'Log in as Buyer'"
      :loading="isLoggingIn"
      @confirm="confirmLoginAs"
    >
      This tab will switch to <span class="font-semibold text-fg">{{ loginAsParty?.name || loginAsParty?.email }}</span>'s
      account and open
      {{ loginAsTarget === 'seller' ? "this listing's offers" : 'their offers' }} as they see them. Your other tabs stay
      logged in as admin. Use <span class="font-semibold text-fg">Return to admin</span> in the yellow bar to come back
      to this offer. This is recorded in the admin activity log.
    </ConfirmDialog>

    <LoadingState v-if="isLoading" label="Loading offer..." />
    <ErrorState v-else-if="errorMessage" :description="errorMessage" @retry="loadOffer" />

    <div v-else-if="offer" class="space-y-6">
        <!-- Top Status Banner -->
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface-raised p-4">
          <div>
            <span class="text-xs uppercase tracking-wider text-fg-muted font-semibold">Offer Status</span>
            <div class="mt-1 flex items-center gap-2">
              <BaseBadge :variant="getStatusBadgeVariant(offer.status)" class="capitalize text-sm py-1 px-3">
                {{ formatStatus(offer.status) }}
              </BaseBadge>
              <span v-if="offer.is_backup_offer" class="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded">
                Backup Offer
              </span>
            </div>
          </div>

          <div class="text-right">
            <span class="text-xs uppercase tracking-wider text-fg-muted font-semibold">Purchase Price</span>
            <div class="text-2xl font-black text-fg">
              {{ formatCurrency(offer.offer_amount) }}
            </div>
          </div>
        </div>

        <!-- Property & Parties Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Property Info -->
          <div class="rounded-xl border border-border p-4 bg-surface">
            <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
              <Building class="h-4 w-4 text-primary" />
              Property Details
            </h4>
            <div class="text-sm font-semibold text-fg">
              {{ offer.listing?.address }}
            </div>
            <div class="text-xs text-fg-muted">
              {{ offer.listing?.city }}, {{ offer.listing?.state }} {{ offer.listing?.zip }}
            </div>
            <div class="mt-2 text-xs text-fg-muted">
              Listing Ref: <span class="font-mono text-fg">{{ offer.listing?.reference_code }}</span>
            </div>
          </div>

          <!-- Buyer & Agent Info -->
          <div class="rounded-xl border border-border p-4 bg-surface">
            <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
              <User class="h-4 w-4 text-primary" />
              Buyer Contact
            </h4>
            <div class="text-sm font-semibold text-fg">
              {{ offer.buyer_name || offer.buyer?.name || 'Buyer' }}
            </div>
            <div class="text-xs text-fg-muted">
              Email: {{ offer.buyer_email || offer.buyer?.email || 'N/A' }}
            </div>
            <div v-if="offer.buyer_phone" class="text-xs text-fg-muted">
              Phone: {{ offer.buyer_phone }}
            </div>
            <div v-if="offer.has_agent_representation" class="mt-2 pt-2 border-t border-border text-xs">
              <span class="font-semibold text-fg">Agent:</span> {{ offer.agent_name }} ({{ offer.agent_email }})
            </div>
          </div>
        </div>

        <!-- Legal Purchasers Section -->
        <div v-if="offer.purchasers && offer.purchasers.length > 0" class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <Users class="h-4 w-4 text-primary" />
            Legal Offer Purchasers ({{ offer.purchasers.length }})
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(purchaser, idx) in offer.purchasers"
              :key="idx"
              class="p-3 rounded-lg border border-border bg-surface-raised text-xs space-y-1"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-fg">{{ purchaser.first_name }} {{ purchaser.last_name }}</span>
                <span v-if="purchaser.is_main" class="bg-indigo-50 dark:bg-indigo-950 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Primary Purchaser
                </span>
              </div>
              <div class="text-fg-muted">{{ purchaser.email }}</div>
              <div v-if="purchaser.street_address" class="text-fg-muted">
                {{ purchaser.street_address }}{{ purchaser.unit_number ? `, Unit ${purchaser.unit_number}` : '' }}, {{ purchaser.city }}, {{ purchaser.zip }}
              </div>
              <div v-if="purchaser.non_us_citizen" class="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                ⚠ Non-US Citizen Purchaser
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Breakdown & Reozom Net Calculation -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-4 flex items-center gap-1.5">
            <DollarSign class="h-4 w-4 text-primary" />
            Financial Terms & Bottom Line Net Calculation
          </h4>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-fg-muted block">Earnest Money (EMD)</span>
              <span class="text-sm font-bold text-fg mt-0.5 block">
                {{ formatCurrency(offer.earnest_money_deposit) }}
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Down Payment</span>
              <span class="text-sm font-bold text-fg mt-0.5 block">
                {{ formatCurrency(offer.down_payment_amount) }}
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Payment Method</span>
              <span class="text-sm font-bold capitalize text-fg mt-0.5 block">
                {{ offer.payment_method }}
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Seller Concessions</span>
              <span class="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {{ formatCurrency(offer.seller_concessions) }}
              </span>
            </div>
          </div>

          <!-- Reozom Live Net Calculation Breakdown -->
          <div class="mt-4 pt-3 border-t border-border space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-fg-muted">
              <span>Gross Purchase Price:</span>
              <span class="font-medium text-fg">{{ formatCurrency(offer.offer_amount) }}</span>
            </div>
            <div v-if="Number(offer.seller_concessions) > 0" class="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span>Less Seller Concessions:</span>
              <span>-{{ formatCurrency(offer.seller_concessions) }}</span>
            </div>
            <div v-if="Number(offer.commission) > 0" class="flex items-center justify-between text-fg-muted">
              <span>Less Buyer Agent Commission ({{ offer.commission }}{{ offer.commission_type === 1 ? '%' : '$' }}):</span>
              <span>
                -{{ formatCurrency(offer.commission_type === 1 ? (Number(offer.offer_amount) * Number(offer.commission) / 100) : Number(offer.commission)) }}
              </span>
            </div>
            <div v-if="offer.home_warranty_included" class="flex items-center justify-between text-fg-muted">
              <span>Less Home Warranty:</span>
              <span>-{{ formatCurrency(offer.home_warranty_price || 499) }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-border font-bold">
              <span class="text-fg">Reozom Bottom Line Net to Seller:</span>
              <div class="text-right">
                <span class="text-base text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(offer.bottom_line_offer ?? (Number(offer.offer_amount) - Number(offer.seller_concessions || 0))) }}
                </span>
                <span class="text-xs text-primary font-semibold ml-1.5">
                  ({{ offer.percentage ?? 100 }}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contingencies & Closing Details -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <Calendar class="h-4 w-4 text-primary" />
            Closing & Contingencies
          </h4>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-4">
            <div>
              <span class="text-fg-muted block">Closing Date</span>
              <span class="font-semibold text-fg">{{ formatDate(offer.closing_date) }}</span>
            </div>
            <div>
              <span class="text-fg-muted block">Occupancy</span>
              <span class="font-semibold text-fg capitalize">
                {{ offer.occupancy_type ? offer.occupancy_type.replace(/_/g, ' ') : 'At Closing' }}
                <span v-if="offer.occupancy_days">({{ offer.occupancy_days }} days<span v-if="offer.fee_per_day"> @ ${{ offer.fee_per_day }}/day</span>)</span>
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Expiration Deadline</span>
              <span class="font-semibold text-fg">{{ formatDateTime(offer.deadline) }}</span>
            </div>
          </div>

          <!-- Contingencies Checklist -->
          <div v-if="offer.contingencies" class="pt-3 border-t border-border">
            <span class="text-xs font-semibold text-fg block mb-2">Selected Contingencies:</span>
            <div class="flex flex-wrap gap-2">
              <template v-for="(val, key) in offer.contingencies" :key="key">
                <span
                  v-if="val"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-raised border border-border text-xs text-fg font-medium capitalize"
                >
                  <Check class="h-3.5 w-3.5 text-emerald-500" />
                  {{ String(key).replace(/_/g, ' ') }}
                </span>
              </template>
            </div>
          </div>

          <!-- Additional Terms -->
          <div v-if="offer.additional_terms" class="mt-3 pt-3 border-t border-border">
            <span class="text-xs font-semibold text-fg block mb-1">Additional Terms:</span>
            <p class="text-xs text-fg-muted bg-surface-raised p-3 rounded-lg whitespace-pre-wrap">
              {{ offer.additional_terms }}
            </p>
          </div>
        </div>

        <!-- Official Purchase Agreement Contract (PDF) -->
        <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <FileText class="h-5 w-5 text-primary" />
            <div>
              <div class="text-xs font-bold text-fg">Reozom Purchase Agreement & Offer Contract</div>
              <div class="text-[11px] text-fg-muted">Official electronic legal contract with pricing, terms, contingencies and signatures</div>
            </div>
          </div>
          <BaseButton
            variant="primary"
            size="sm"
            :disabled="isDownloadingContract"
            @click="handleDownloadContract"
          >
            <Download class="mr-1.5 h-3.5 w-3.5" :class="{ 'animate-bounce': isDownloadingContract }" />
            {{ isDownloadingContract ? 'Generating...' : 'Download Contract (PDF)' }}
          </BaseButton>
        </div>

        <!-- Attached Documents -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <FileText class="h-4 w-4 text-primary" />
            Verification Documents ({{ offer.documents?.length || 0 }})
          </h4>

          <div v-if="!offer.documents || offer.documents.length === 0" class="text-xs text-fg-muted">
            No attached documents submitted with this offer.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="doc in offer.documents"
              :key="doc.id"
              class="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-raised text-xs"
            >
              <div class="flex items-center gap-3">
                <FileText class="h-4 w-4 text-primary shrink-0" />
                <div>
                  <div class="font-medium text-fg">{{ doc.original_name }}</div>
                  <div class="text-[11px] text-fg-muted capitalize">{{ doc.type.replace(/_/g, ' ') }} • {{ Math.round(doc.size / 1024) }} KB</div>
                </div>
              </div>

              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="isDownloadingDoc === doc.id"
                @click="handleDownloadDoc(doc.id, doc.original_name)"
              >
                <Download class="mr-1 h-3.5 w-3.5" :class="{ 'animate-bounce': isDownloadingDoc === doc.id }" />
                Download
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Action / Negotiation History Timeline -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <Clock class="h-4 w-4 text-primary" />
            Negotiation & Activity Timeline
          </h4>

          <div v-if="!offer.actions || offer.actions.length === 0" class="text-xs text-fg-muted">
            Initial offer submission recorded on {{ formatDateTime(offer.created_at) }}.
          </div>

          <div v-else class="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
            <div
              v-for="act in offer.actions"
              :key="act.id"
              class="relative flex items-start gap-3 pl-8"
            >
              <div class="absolute left-1.5 mt-1 h-4 w-4 rounded-full border-2 border-surface bg-primary ring-2 ring-primary/20"></div>

              <div class="flex-1 rounded-lg border border-border bg-surface-raised p-3 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-bold text-fg capitalize">
                    {{ act.action_type.replace(/_/g, ' ') }}
                    <span v-if="act.offer_amount" class="text-primary font-bold">
                      ({{ formatCurrency(act.offer_amount) }})
                    </span>
                  </span>
                  <span class="text-fg-muted text-[11px]">{{ formatDateTime(act.created_at) }}</span>
                </div>
                <div class="text-fg-muted mt-1">
                  Actor: <span class="text-fg font-medium capitalize">{{ act.actor_type }}</span>
                  <span v-if="act.user"> ({{ act.user.name || act.user.first_name }})</span>
                </div>
                <p v-if="act.comment" class="mt-2 text-fg bg-surface p-2 rounded border border-border/50 text-xs italic">
                  "{{ act.comment }}"
                </p>
                <div v-if="act.terms_snapshot" class="mt-2 p-2 bg-surface rounded border border-border/50 text-[11px] text-fg-muted">
                  <span class="font-semibold text-fg">Terms Snapshot:</span>
                  <span v-if="act.terms_snapshot.offer_amount"> Price: {{ formatCurrency(act.terms_snapshot.offer_amount) }}</span>
                  <span v-if="act.terms_snapshot.closing_date"> • Close: {{ act.terms_snapshot.closing_date }}</span>
                  <span v-if="act.terms_snapshot.seller_concessions"> • Concessions: {{ formatCurrency(act.terms_snapshot.seller_concessions) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>
