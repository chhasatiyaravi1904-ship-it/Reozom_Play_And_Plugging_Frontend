<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'
import type { DocumentRequirement } from '@/types/document'

defineProps<{
  documents: DocumentRequirement[]
}>()

defineEmits<{
  (e: 'upload', documentId: string): void
  (e: 'remove', documentId: string): void
}>()

const statusVariant: Record<string, 'success' | 'warning' | 'danger'> = {
  uploaded: 'success',
  pending: 'warning',
  failed: 'danger',
}

const statusLabel: Record<string, string> = {
  uploaded: 'Uploaded',
  pending: 'Pending',
  failed: 'Failed',
}
</script>

<template>
  <ul class="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
    <li
      v-for="doc in documents"
      :key="doc.id"
      class="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-fg">
          {{ doc.label }}<span v-if="doc.required" class="ml-0.5 text-danger">*</span>
        </p>
        <p v-if="doc.fileName" class="text-xs text-fg-muted">{{ doc.fileName }}</p>
      </div>

      <div class="flex items-center gap-3">
        <BaseBadge :variant="statusVariant[doc.status]">{{ statusLabel[doc.status] }}</BaseBadge>
        <button
          v-if="doc.status === 'uploaded'"
          type="button"
          class="text-xs font-medium text-danger hover:underline"
          @click="$emit('remove', doc.id)"
        >
          Remove
        </button>
        <button
          v-else
          type="button"
          class="text-xs font-medium text-primary hover:underline"
          @click="$emit('upload', doc.id)"
        >
          Upload
        </button>
      </div>
    </li>
  </ul>
</template>
