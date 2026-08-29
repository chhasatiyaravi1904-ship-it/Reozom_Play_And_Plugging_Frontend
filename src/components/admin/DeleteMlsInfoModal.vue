<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { MlsInfoItem } from '@/types/mls'

defineProps<{
  modelValue: boolean
  info: MlsInfoItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirmDelete', info: MlsInfoItem): void
}>()

function handleConfirm(info: MlsInfoItem) {
  emit('confirmDelete', info)
  emit('update:modelValue', false)
}
</script>

<template>
  <ConfirmDialog
    v-if="info"
    :model-value="modelValue"
    title="Delete MLS Info Entry"
    tone="danger"
    confirm-label="Delete Entry"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm(info)"
  >
    Are you sure you want to delete
    <span class="font-semibold text-fg">{{ info.title || `Info #${info.id}` }}</span>?
    This action cannot be undone.
  </ConfirmDialog>
</template>
