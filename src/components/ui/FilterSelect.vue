<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  options: { label: string; value: string }[]
  label: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="relative">
    <select
      :value="modelValue"
      :aria-label="label"
      class="focus-ring w-full appearance-none rounded-lg border border-border bg-surface py-2 pl-3 pr-8 text-xs font-medium text-fg shadow-xs hover:bg-surface-raised transition-colors"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-fg-muted" />
  </div>
</template>
