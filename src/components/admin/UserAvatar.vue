<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUserRole } from '@/services/adminUsersData'
import { roleBadgeConfig } from '@/components/admin/UserRoleBadge.vue'

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
  if (parts.length === 1) return (parts[0]?.charAt(0) || '?').toUpperCase()
  const first = parts[0]?.charAt(0) || ''
  const last = parts[parts.length - 1]?.charAt(0) || ''
  return (first + last).toUpperCase()
})

const colorScheme = computed(() =>
  props.role ? roleBadgeConfig[props.role].avatarClasses : 'bg-surface-raised text-fg-muted ring-border',
)

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
