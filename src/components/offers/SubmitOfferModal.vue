<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 overflow-hidden transform transition-all">
      <div class="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h3 class="text-xl font-bold text-slate-900">Submit an Offer</h3>
          <p class="text-sm text-slate-500 mt-1">{{ listingAddress }}</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700">Offer Amount ($) *</label>
            <input
              v-model.number="form.offer_amount"
              type="number"
              step="1000"
              required
              placeholder="e.g. 450000"
              class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700">Earnest Money Deposit ($)</label>
            <input
              v-model.number="form.earnest_money_deposit"
              type="number"
              step="500"
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
              <option value="conventional">Conventional Loan</option>
              <option value="cash">All Cash</option>
              <option value="fha">FHA Loan</option>
              <option value="va">VA Loan</option>
              <option value="other">Other</option>
            </select>
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
            <label class="block text-sm font-semibold text-slate-700">Seller Concessions Requested ($)</label>
            <input
              v-model.number="form.seller_concessions"
              type="number"
              step="500"
              placeholder="e.g. 5000 for closing costs"
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
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Contingencies</label>
          <div class="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.contingencies.property_inspection" class="rounded text-indigo-600" />
              Property Inspection
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.contingencies.financing" class="rounded text-indigo-600" />
              Financing Contingency
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.contingencies.appraisal" class="rounded text-indigo-600" />
              Appraisal Contingency
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.contingencies.sale_of_home" class="rounded text-indigo-600" />
              Sale of Buyer's Home
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700">Pre-Approval Letter / Proof of Funds</label>
          <input
            type="file"
            @change="handleFileUpload"
            accept=".pdf,.png,.jpg,.jpeg"
            class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700">Note / Comment to Seller</label>
          <textarea
            v-model="form.comment"
            rows="2"
            placeholder="Introduce yourself or highlight terms..."
            class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
          ></textarea>
        </div>

        <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm">
          {{ errorMessage }}
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
import { ref, reactive } from 'vue'
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
  payment_method: 'conventional' as 'cash' | 'conventional' | 'fha' | 'va' | 'other',
  closing_date: '',
  occupancy_type: 'at_closing' as 'at_closing' | 'days_after_closing',
  seller_concessions: 0,
  contingencies: {
    property_inspection: true,
    financing: true,
    appraisal: true,
    sale_of_home: false,
  },
  comment: '',
})

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFiles.value = Array.from(target.files)
  }
}

const handleSubmit = async () => {
  if (!form.offer_amount || !form.closing_date) {
    errorMessage.value = 'Please fill out all required fields.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null
  try {
    const offer = await offerStore.submitNewOffer(
      props.listingId,
      { ...form, offer_amount: form.offer_amount! },
      selectedFiles.value,
    )
    emit('submitted', offer)
    emit('close')
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to submit offer.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
