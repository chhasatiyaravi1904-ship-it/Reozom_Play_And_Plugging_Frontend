<script setup lang="ts">
import { ref, watch } from 'vue'
import { Edit3, X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useToastStore } from '@/stores/toast'
import * as documentService from '@/services/documentService'

const props = defineProps<{
  modelValue: boolean
  listingId: number
  documentId: string | number
  currentName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'renamed', newName: string): void
}>()

const toast = useToastStore()
const docName = ref('')
const isRenaming = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      docName.value = props.currentName || ''
      isRenaming.value = false
    }
  },
)

function handleClose() {
  emit('update:modelValue', false)
}

async function handleRename() {
  const trimmed = docName.value.trim()
  if (!trimmed) {
    toast.error('Please enter a document name.')
    return
  }

  isRenaming.value = true
  try {
    await documentService.renameDocument(props.listingId, String(props.documentId), trimmed)
    toast.success('Document renamed successfully.')
    emit('renamed', trimmed)
    handleClose()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to rename document.')
  } finally {
    isRenaming.value = false
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      class="relative flex flex-col w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden"
    >
      <div class="flex items-center justify-between border-b border-border bg-surface-raised/40 px-5 py-4">
        <div class="flex items-center gap-2">
          <Edit3 class="h-4 w-4 text-primary" />
          <h3 class="text-sm font-bold text-fg">Rename Document</h3>
        </div>
        <button
          class="rounded-lg p-1.5 text-fg-muted hover:bg-surface-raised hover:text-fg transition-colors"
          @click="handleClose"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="p-5 space-y-3 text-xs">
        <label class="block font-semibold text-fg">Enter document name:</label>
        <input
          v-model="docName"
          type="text"
          placeholder="e.g. Deed_2026.pdf"
          class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-fg focus:border-primary focus:outline-none"
          @keydown.enter="handleRename"
        />
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-border bg-surface-raised/20 px-5 py-3.5">
        <BaseButton variant="secondary" size="sm" @click="handleClose">
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="isRenaming"
          @click="handleRename"
        >
          Rename
        </BaseButton>
      </div>
    </div>
  </div>
</template>

