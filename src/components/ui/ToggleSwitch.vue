<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    disabled?: boolean
    label?: string
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    :disabled="disabled"
    class="focus-ring relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="modelValue ? 'bg-success' : 'bg-border'"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span
      class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
      :class="modelValue ? 'translate-x-[18px]' : 'translate-x-1'"
    ></span>
  </button>
</template>
