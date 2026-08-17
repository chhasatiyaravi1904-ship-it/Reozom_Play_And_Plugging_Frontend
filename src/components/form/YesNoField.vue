<script setup lang="ts">
defineProps<{
  label?: string
  modelValue: string
  error?: string
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const options = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
  { label: 'Not Sure', value: 'not_sure' },
]
</script>

<template>
  <div class="flex flex-col gap-2">
    <span v-if="label" class="text-sm font-medium text-fg">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </span>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
        :class="
          modelValue === option.value
            ? 'border-primary bg-primary text-white'
            : 'border-border bg-surface text-fg hover:bg-surface-raised'
        "
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <span v-if="error" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
