<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useToastStore } from '@/stores/toast'
import * as adminListingService from '@/services/adminListingService'
import type { AdminListingDetail } from '@/services/adminListingService'

/** Reozom admin status change (with mandatory audit comment and pending/sold details). */
const props = defineProps<{
  modelValue: boolean
  listing: AdminListingDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated', listing: AdminListingDetail | null): void
}>()

const toast = useToastStore()
const isSaving = ref(false)

const form = reactive({
  status: 'published' as string,
  comment: '',
  anticipated_closed_date: '',
  agent: 1 as 1 | 2,
  agent_name: '',
  closed_date: '',
  sales_price: undefined as number | undefined,
  sellers_concessions: 1 as 1 | 2,
  amount: undefined as number | undefined,
  finance_type: '',
})

// Fill the form from the listing each time the dialog opens
watch(
  () => props.modelValue,
  (open) => {
    if (!open || !props.listing) return
    const sold = props.listing.sold_details
    form.status = props.listing.status || 'published'
    form.comment = ''
    form.anticipated_closed_date = sold?.anticipated_closed_date || ''
    form.agent = (sold?.agent as 1 | 2) || 1
    form.agent_name = sold?.agent_name || ''
    form.closed_date = sold?.closed_date || ''
    form.sales_price = sold?.sales_price
    form.sellers_concessions = (sold?.sellers_concessions as 1 | 2) || 1
    form.amount = sold?.amount
    form.finance_type = sold?.finance_type || ''
  },
)

async function submit() {
  if (!props.listing || !form.comment.trim()) {
    toast.error('Audit comment is required for status changes.')
    return
  }

  isSaving.value = true
  try {
    const payload: any = { status: form.status, comment: form.comment.trim() }

    if (['under_contract', 'ccs', '2', '3'].includes(String(form.status))) {
      if (form.anticipated_closed_date) payload.anticipated_closed_date = form.anticipated_closed_date
      if (form.agent) payload.agent = Number(form.agent)
      if (form.agent_name) payload.agent_name = form.agent_name
    }

    if (['sold', '4'].includes(String(form.status))) {
      if (form.closed_date) payload.closed_date = form.closed_date
      if (form.sales_price !== undefined && form.sales_price !== null) payload.sales_price = Number(form.sales_price)
      if (form.sellers_concessions) payload.sellers_concessions = Number(form.sellers_concessions)
      if (form.amount !== undefined && form.amount !== null) payload.amount = Number(form.amount)
      if (form.finance_type) payload.finance_type = form.finance_type
      if (form.agent_name) payload.agent_name = form.agent_name
    }

    const res = await adminListingService.changeAdminListingStatus(props.listing.id, payload)
    toast.success(`Listing status updated to ${form.status}.`)
    emit('update:modelValue', false)
    const updated = (res.data as any)?.listing ?? (res.data as any)?.data ?? res.data
    emit('updated', updated && typeof updated === 'object' && 'id' in updated ? updated : null)
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to update listing status.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    size="md"
    :title="`Change Listing Status: ${listing?.reference_code || listing?.id}`"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-fg mb-1">Target Status *</label>
        <select
          v-model="form.status"
          required
          class="w-full rounded border border-border bg-surface p-2 text-sm text-fg focus:border-primary focus:outline-none"
        >
          <option value="published">1 - Active / Published</option>
          <option value="under_contract">2 - Pending / Under Contract</option>
          <option value="ccs">3 - Contingent - Continue to Show (CCS)</option>
          <option value="sold">4 - Sold</option>
          <option value="suspended">6 - Suspended</option>
          <option value="canceled">5 - Canceled</option>
          <option value="expired">7 - Expired</option>
          <option value="submitted">0 - Waiting Approval</option>
          <option value="rejected">-1 - Not Approved / Rejected</option>
          <option value="unpublished">Unpublished</option>
        </select>
        <p class="text-[11px] text-fg-muted mt-1">
          Replicating Reozom Administration status transitions with mandatory audit log.
        </p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-fg mb-1">Audit Comment *</label>
        <textarea
          v-model="form.comment"
          rows="3"
          maxlength="250"
          required
          placeholder="Reason for changing status (max 250 characters)..."
          class="w-full rounded border border-border bg-surface p-2.5 text-sm text-fg focus:border-primary focus:outline-none"
        ></textarea>
        <div class="text-right text-[11px] text-fg-muted">{{ form.comment.length }} / 250</div>
      </div>

      <!-- Pending / CCS (2 or 3) -->
      <div v-if="['under_contract', 'ccs', '2', '3'].includes(String(form.status))" class="p-3 bg-surface-raised rounded-lg border border-border space-y-3">
        <span class="text-xs font-bold text-fg block">Pending / Contingent Contract Details</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-medium text-fg-muted mb-1">Anticipated Closing Date</label>
            <input v-model="form.anticipated_closed_date" type="date" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs" />
          </div>
          <div>
            <label class="block font-medium text-fg-muted mb-1">Agent Representation</label>
            <select v-model.number="form.agent" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs">
              <option :value="1">Listing Agent</option>
              <option :value="2">Co-Agent / Buyer Agent</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block font-medium text-fg-muted mb-1">Agent / Agency Name</label>
            <input v-model="form.agent_name" type="text" placeholder="Agent or brokerage name" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs" />
          </div>
        </div>
      </div>

      <!-- Sold (4) -->
      <div v-if="['sold', '4'].includes(String(form.status))" class="p-3 bg-surface-raised rounded-lg border border-border space-y-3">
        <span class="text-xs font-bold text-fg block">Closing & Sold Contract Details</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block font-medium text-fg-muted mb-1">Final Closed Date</label>
            <input v-model="form.closed_date" type="date" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs" />
          </div>
          <div>
            <label class="block font-medium text-fg-muted mb-1">Final Sales Price ($)</label>
            <input v-model.number="form.sales_price" type="number" min="0" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs" />
          </div>
          <div>
            <label class="block font-medium text-fg-muted mb-1">Financing Type</label>
            <input v-model="form.finance_type" type="text" placeholder="Cash, Conventional, FHA, VA" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs" />
          </div>
          <div>
            <label class="block font-medium text-fg-muted mb-1">Seller Concessions ($)</label>
            <input v-model.number="form.amount" type="number" min="0" class="w-full rounded border border-border bg-surface p-2 text-fg text-xs" />
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t border-border">
        <BaseButton variant="secondary" @click="emit('update:modelValue', false)">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="!form.comment.trim() || isSaving">
          {{ isSaving ? 'Updating...' : 'Update Status' }}
        </BaseButton>
      </div>
    </form>
  </Modal>
</template>
