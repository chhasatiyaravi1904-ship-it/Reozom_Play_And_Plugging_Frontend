<script setup lang="ts">
import { computed } from 'vue'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-vue-next'

const props = defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info'
  title?: string
}>()

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
}

const variantClasses: Record<string, string> = {
  success: 'border-success/30 bg-success-soft text-success',
  warning: 'border-warning/30 bg-warning-soft text-warning',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  info: 'border-info/30 bg-info-soft text-info',
}

const icon = computed(() => icons[props.variant || 'info'])
const classes = computed(() => variantClasses[props.variant || 'info'])
</script>

<template>
  <div class="flex items-start gap-2 rounded-lg border p-4 text-sm" :class="classes">
    <component :is="icon" class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
    <div class="flex flex-col gap-1">
      <p v-if="title" class="font-medium">{{ title }}</p>
      <div><slot></slot></div>
    </div>
  </div>
</template>
