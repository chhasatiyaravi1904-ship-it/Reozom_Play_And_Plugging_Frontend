<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
      <div class="flex items-center justify-between pb-5 border-b border-slate-100 flex-shrink-0">
        <div>
          <h3 class="text-xl font-bold text-slate-900">Submit an Official Offer</h3>
          <p class="text-sm text-slate-500 mt-1">{{ listingAddress }}</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-6 overflow-y-auto pr-2 flex-grow">
        <!-- Live Calculation Summary Card -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span class="text-xs text-slate-500 block">Offer Price</span>
            <span class="text-lg font-black text-slate-900">${{ (form.offer_amount || 0).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Seller Concessions</span>
            <span class="text-lg font-semibold text-rose-600">-${{ (form.seller_concessions || 0).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Bottom Line Offer</span>
            <span class="text-lg font-black text-emerald-600">${{ calculatedBottomLine.toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Net to Seller %</span>
            <span class="text-lg font-bold text-indigo-600">{{ calculatedPercentage }}%</span>
          </div>
        </div>

        <!-- Section 1: Financial Terms -->
        <div>
          <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">1. Financial & Closing Terms</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700">Proposed Purchase Price ($) *</label>
              <input
                v-model.number="form.offer_amount"
                type="number"
                step="1000"
                min="1000"
                required
                placeholder="e.g. 450000"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700">Earnest Money Deposit ($) *</label>
              <input
                v-model.number="form.earnest_money_deposit"
                type="number"
                step="500"
                min="0"
                required
                placeholder="e.g. 10000"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700">Financing / Payment Method *</label>
              <select
                v-model="form.payment_method"
                required
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              >
                <option value="conventional">Conventional Mortgage</option>
                <option value="cash">All Cash</option>
                <option value="fha">FHA Loan</option>
                <option value="va">VA Loan</option>
                <option value="land_contract">Land Contract</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div v-if="form.payment_method !== 'cash'">
              <label class="block text-sm font-semibold text-slate-700">Down Payment Amount ($)</label>
              <input
                v-model.number="form.down_payment_amount"
                type="number"
                step="1000"
                min="0"
                placeholder="e.g. 90000"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700">Requested Closing Date *</label>
              <input
                v-model="form.closing_date"
                type="date"
                required
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700">Seller Concessions / Closing Contribution ($)</label>
              <input
                v-model.number="form.seller_concessions"
                type="number"
                step="500"
                min="0"
                placeholder="e.g. 5000"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700">Occupancy</label>
              <select
                v-model="form.occupancy_type"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              >
                <option value="at_closing">At Closing</option>
                <option value="days_after_closing">Days After Closing</option>
              </select>
            </div>

            <div v-if="form.occupancy_type === 'days_after_closing'" class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs font-semibold text-slate-700">Days</label>
                <input
                  v-model.number="form.occupancy_days"
                  type="number"
                  min="1"
                  max="180"
                  placeholder="30"
                  class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700">Fee / Day ($)</label>
                <input
                  v-model.number="form.fee_per_day"
                  type="number"
                  min="0"
                  placeholder="50"
                  class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700">Offer Expiration Deadline</label>
              <select
                v-model="form.deadline_hours"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
              >
                <option :value="24">24 Hours</option>
                <option :value="48">48 Hours (Standard)</option>
                <option :value="72">72 Hours (3 Days)</option>
                <option :value="120">5 Days</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 2: Contingencies -->
        <div class="pt-4 border-t border-slate-100">
          <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">2. Contract Contingencies</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input type="checkbox" v-model="form.contingencies.property_inspection" class="rounded text-indigo-600" />
              <div>
                <span class="font-medium">Property Physical Inspection</span>
                <span class="block text-xs text-slate-500">10-14 business days evaluation</span>
              </div>
            </label>

            <label class="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input type="checkbox" v-model="form.contingencies.lead_paint_inspection" class="rounded text-indigo-600" />
              <div>
                <span class="font-medium">Lead-Based Paint Inspection</span>
                <span class="block text-xs text-slate-500">Applicable to pre-1978 homes</span>
              </div>
            </label>

            <label class="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input type="checkbox" v-model="form.contingencies.survey" class="rounded text-indigo-600" />
              <div>
                <span class="font-medium">Boundary & Staked Survey</span>
                <span class="block text-xs text-slate-500">Property lot boundary confirmation</span>
              </div>
            </label>

            <label class="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
              <input type="checkbox" v-model="form.contingencies.attorney_review" class="rounded text-indigo-600" />
              <div>
                <span class="font-medium">Buyer's Attorney Review</span>
                <span class="block text-xs text-slate-500">Subject to legal counsel review</span>
              </div>
            </label>
          </div>

          <!-- Sale of Buyer's Home Contingency -->
          <div class="mt-3 bg-amber-50 p-4 rounded-xl border border-amber-200">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.contingencies.sale_of_home" class="rounded text-amber-600" />
              <span class="font-bold text-amber-900">Contingent upon sale of Buyer's home</span>
            </label>
            <p class="text-xs text-amber-800 mt-1">
              Note: If accepted, this will move the listing to <strong>CCS (Contingent - Continue to Show)</strong> under Reozom rules.
            </p>

            <div v-if="form.contingencies.sale_of_home" class="mt-3 space-y-3 pt-3 border-t border-amber-200/60">
              <div>
                <label class="block text-xs font-semibold text-amber-900">Buyer's Current Home Address</label>
                <input
                  v-model="form.buyers_home_address"
                  type="text"
                  placeholder="Street address, City, State, ZIP"
                  class="mt-1 block w-full rounded-lg border border-amber-300 px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Pre-Approval Letter & Documents -->
        <div class="pt-4 border-t border-slate-100">
          <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">3. Pre-Approval Letter / Proof of Funds</h4>
          <p class="text-xs text-slate-500 mb-2">Attach bank proof of funds or mortgage lender pre-approval letter for seller review.</p>
          <input
            type="file"
            @change="handleFileUpload"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        <!-- Section 4: Notes / Messages -->
        <div class="pt-4 border-t border-slate-100">
          <label class="block text-sm font-semibold text-slate-700">Special Provisions & Note to Seller</label>
          <textarea
            v-model="form.comment"
            rows="3"
            placeholder="Introduce yourself, include earnest money depository details, or highlight contract specifics..."
            class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600 text-sm"
          ></textarea>
        </div>

        <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {{ errorMessage }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
          >
            {{ isSubmitting ? 'Submitting Offer...' : 'Submit Official Offer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useOfferStore } from '@/stores/offer'

const props = defineProps<{
  isOpen: boolean
  listingId: number
  listingAddress: string
}>()

const emit = defineEmits(['close', 'submitted'])

const offerStore = useOfferStore()
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const selectedFiles = ref<File[]>([])

const form = reactive({
  offer_amount: null as number | null,
  earnest_money_deposit: 5000,
  down_payment_amount: null as number | null,
  payment_method: 'conventional' as 'cash' | 'conventional' | 'fha' | 'va' | 'land_contract' | 'other',
  closing_date: '',
  occupancy_type: 'at_closing' as 'at_closing' | 'days_after_closing',
  occupancy_days: 0,
  fee_per_day: 0,
  seller_concessions: 0,
  deadline_hours: 48,
  buyers_home_address: '',
  contingencies: {
    property_inspection: true,
    lead_paint_inspection: false,
    survey: false,
    attorney_review: false,
    sale_of_home: false,
  },
  comment: '',
})

const calculatedBottomLine = computed(() => {
  const amount = form.offer_amount || 0
  const concessions = form.seller_concessions || 0
  return Math.max(0, amount - concessions)
})

const calculatedPercentage = computed(() => {
  const amount = form.offer_amount || 0
  if (amount <= 0) return '100.0'
  return ((calculatedBottomLine.value * 100) / amount).toFixed(1)
})

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFiles.value = Array.from(target.files)
  }
}

const handleSubmit = async () => {
  if (!form.offer_amount || !form.closing_date) {
    errorMessage.value = 'Please provide both purchase price and closing date.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null
  try {
    const payload: any = {
      offer_amount: form.offer_amount,
      earnest_money_deposit: form.earnest_money_deposit,
      down_payment_amount: form.down_payment_amount,
      payment_method: form.payment_method,
      closing_date: form.closing_date,
      occupancy_type: form.occupancy_type,
      occupancy_days: form.occupancy_days,
      fee_per_day: form.fee_per_day,
      seller_concessions: form.seller_concessions,
      deadline: form.deadline_hours,
      buyers_home_address: form.buyers_home_address,
      contingencies: form.contingencies,
      comment: form.comment,
    }

    const offer = await offerStore.submitNewOffer(props.listingId, payload, selectedFiles.value)
    emit('submitted', offer)
    emit('close')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to submit offer.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
