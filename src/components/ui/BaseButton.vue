<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>()

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface-raised text-fg hover:bg-border',
  danger: 'bg-danger text-white hover:bg-danger/90',
  ghost: 'bg-transparent text-fg hover:bg-surface-raised',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const classes = computed(() => [
  'relative inline-flex items-center justify-center rounded-lg font-medium outline-none transition-colors',
  '[&:not(:disabled):active]:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60',
  'focus-visible:ring-3 focus-visible:ring-primary/30',
  variantClasses[props.variant || 'primary'],
  sizeClasses[props.size || 'md'],
  props.block && 'w-full',
])
</script>

<template>
  <button :class="classes" :disabled="disabled || loading">
    <span
      v-if="loading"
      class="absolute h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
    ></span>
    <span :class="['inline-flex items-center', { 'opacity-0': loading }]">
      <slot></slot>
    </span>
  </button>
</template>
