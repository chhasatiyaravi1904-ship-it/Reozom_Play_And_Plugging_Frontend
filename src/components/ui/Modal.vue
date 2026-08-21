<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const sizeClass = computed(() => (props.size === 'lg' ? 'max-w-lg' : 'max-w-md'))

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div class="fixed inset-0 bg-fg/40 backdrop-blur-xs transition-opacity" @click="close"></div>

      <div class="relative w-full rounded-xl border border-border bg-surface p-6 shadow-lg" :class="sizeClass">
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
