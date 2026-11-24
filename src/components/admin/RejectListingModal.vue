<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useToastStore } from '@/stores/toast'
import * as adminListingService from '@/services/adminListingService'
import type { AdminListingDetail } from '@/services/adminListingService'

/** Reject a listing with feedback the seller sees. */
const props = defineProps<{
  modelValue: boolean
  listing: AdminListingDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated', listing: AdminListingDetail | null): void
}>()

const toast = useToastStore()
const reason = ref('')
const isSaving = ref(false)

watch(() => props.modelValue, (open) => { if (open) reason.value = '' })

async function confirmReject() {
  if (!props.listing || !reason.value.trim()) return
  isSaving.value = true
  try {
    const res = await adminListingService.rejectListing(props.listing.id, reason.value.trim())
    toast.success('Listing rejected with feedback provided.')
    emit('update:modelValue', false)
    const updated = (res.data as any)?.data ?? res.data
    emit('updated', updated && typeof updated === 'object' && 'id' in updated ? updated : null)
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to reject listing.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Modal :model-value="modelValue" size="md" title="Reject Listing" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-4">
      <p class="text-sm text-fg-muted">
        Please provide a reason for rejecting listing
        <strong class="text-fg">{{ listing?.reference_code || listing?.id }}</strong>.
        The seller will receive this feedback to make corrections.
      </p>
      <div>
        <label class="block text-xs font-semibold text-fg mb-1">Rejection Reason / Feedback *</label>
        <textarea
          v-model="reason"
          rows="4"
          class="w-full rounded border border-border bg-surface p-2.5 text-sm text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="E.g., Property deed is unclear or blurry. Please upload a higher resolution document."
        ></textarea>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('update:modelValue', false)">Cancel</BaseButton>
        <BaseButton variant="danger" :disabled="!reason.trim() || isSaving" @click="confirmReject">
          Confirm Rejection
        </BaseButton>
      </div>
    </template>
  </Modal>
</template>
