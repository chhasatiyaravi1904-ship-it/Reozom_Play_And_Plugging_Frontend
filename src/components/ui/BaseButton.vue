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
  primary: 'bg-primary-container hover:bg-primary text-on-primary shadow-sm',
  secondary: 'bg-secondary hover:bg-secondary-fixed text-on-secondary shadow-sm',
  danger: 'bg-error hover:bg-error/90 text-on-error shadow-sm',
  ghost: 'border border-outline-variant text-primary hover:bg-surface-container',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-1.5 text-label-sm font-label-sm',
  md: 'px-5 py-2 text-label-md font-label-md h-11',
  lg: 'px-7 py-3.5 text-label-lg font-label-lg h-12',
}

const classes = computed(() => [
  'relative inline-flex items-center justify-center rounded-lg outline-none transition-colors',
  '[&:not(:disabled):active]:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60',
  'focus-visible:ring-3 focus-visible:ring-secondary/30',
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
