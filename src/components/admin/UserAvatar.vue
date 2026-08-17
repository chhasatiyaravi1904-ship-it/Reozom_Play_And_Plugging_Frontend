<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUserRole } from '@/services/adminUsersData'

const props = withDefaults(
  defineProps<{
    name: string
    role?: AdminUserRole
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})

const colorScheme = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'bg-purple-100/80 text-purple-700 ring-purple-600/20'
    case 'agent':
      return 'bg-blue-100/80 text-blue-700 ring-blue-600/20'
    case 'seller':
      return 'bg-amber-100/80 text-amber-800 ring-amber-600/20'
    case 'buyer':
      return 'bg-teal-100/80 text-teal-800 ring-teal-600/20'
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-400/20'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-7 w-7 text-xs'
    case 'lg':
      return 'h-12 w-12 text-base'
    case 'md':
    default:
      return 'h-9 w-9 text-xs font-semibold'
  }
})
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full ring-1 select-none font-semibold transition-transform"
    :class="[colorScheme, sizeClasses]"
  >
    {{ initials }}
  </span>
</template>
