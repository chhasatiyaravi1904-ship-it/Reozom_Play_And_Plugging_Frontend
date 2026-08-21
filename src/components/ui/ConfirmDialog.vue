<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    confirmLabel?: string
    tone?: 'default' | 'danger'
    loading?: boolean
  }>(),
  {
    confirmLabel: 'Confirm',
    tone: 'default',
    loading: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-start gap-3.5">
      <div
        v-if="tone === 'danger'"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-danger-soft text-danger ring-1 ring-danger/20"
      >
        <AlertTriangle class="h-6 w-6" />
      </div>
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-fg">{{ title }}</h3>
        <p class="mt-1.5 text-xs text-fg-muted leading-relaxed">
          <slot></slot>
        </p>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('update:modelValue', false)">Cancel</BaseButton>
      <BaseButton
        :variant="tone === 'danger' ? 'danger' : 'primary'"
        :loading="loading"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </Modal>
</template>
