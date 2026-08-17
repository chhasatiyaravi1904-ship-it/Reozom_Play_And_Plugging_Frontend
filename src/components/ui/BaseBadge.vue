<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
}>()

const variantClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary-active',
  secondary: 'border border-border bg-surface-raised text-fg-muted',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
}

const classes = computed(() => [
  'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold',
  variantClasses[props.variant || 'primary'],
])
</script>

<template>
  <span :class="classes">
    <slot></slot>
  </span>
</template>
