<script setup lang="ts">
import { X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  modelValue: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-fg/40" @click="close"></div>

      <div class="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg">
        <div class="mb-4 flex items-start justify-between gap-4">
          <h2 v-if="title" class="text-lg font-semibold text-fg">{{ title }}</h2>
          <BaseButton variant="ghost" size="sm" class="ml-auto !px-1.5" aria-label="Close" @click="close">
            <X class="h-4 w-4" />
          </BaseButton>
        </div>

        <slot></slot>

        <div v-if="$slots.footer" class="mt-6 flex justify-end gap-3">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>
