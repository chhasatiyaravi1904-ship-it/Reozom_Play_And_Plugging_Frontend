<script setup lang="ts">
import { Search } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
  }>(),
  {
    placeholder: 'Search...',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative w-full">
    <Search class="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-fg-muted pointer-events-none" />
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="focus-ring w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-xs text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute inset-y-0 right-0 my-auto mr-2.5 text-xs text-fg-muted hover:text-fg transition-colors"
      aria-label="Clear search"
      @click="emit('update:modelValue', '')"
    >
      ✕
    </button>
  </div>
</template>
