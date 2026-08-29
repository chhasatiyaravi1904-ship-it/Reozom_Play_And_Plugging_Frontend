<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { MlsDirectoryItem } from '@/types/mls'

defineProps<{
  modelValue: boolean
  directory: MlsDirectoryItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirmDelete', directory: MlsDirectoryItem): void
}>()

function handleConfirm(directory: MlsDirectoryItem) {
  emit('confirmDelete', directory)
  emit('update:modelValue', false)
}
</script>

<template>
  <ConfirmDialog
    v-if="directory"
    :model-value="modelValue"
    title="Delete MLS Directory"
    tone="danger"
    confirm-label="Delete Directory"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm(directory)"
  >
    Are you sure you want to delete
    <span class="font-semibold text-fg">{{ directory.title }}</span>?
    This will permanently remove it and all
    <span class="font-medium text-fg-muted">{{ directory.infosCount || 0 }} info entries</span>
    under it. This action cannot be undone.
  </ConfirmDialog>
</template>
