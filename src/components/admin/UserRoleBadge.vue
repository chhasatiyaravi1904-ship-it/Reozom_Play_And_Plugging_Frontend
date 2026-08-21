<script lang="ts">
import type { AdminUserRole } from '@/services/adminUsersData'

export interface RoleBadgeConfig {
  label: string
  badgeClasses: string
  avatarClasses: string
}

export const roleBadgeConfig: Record<AdminUserRole, RoleBadgeConfig> = {
  admin: {
    label: 'Admin',
    badgeClasses: 'bg-violet-50 text-violet-700 border-violet-200/80 ring-violet-600/10',
    avatarClasses: 'bg-violet-100/80 text-violet-700 ring-violet-600/20',
  },
  agent: {
    label: 'Agent',
    badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-600/10',
    avatarClasses: 'bg-blue-100/80 text-blue-700 ring-blue-600/20',
  },
  seller: {
    label: 'Seller',
    badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-600/10',
    avatarClasses: 'bg-amber-100/80 text-amber-800 ring-amber-600/20',
  },
  buyer: {
    label: 'Buyer',
    badgeClasses: 'bg-teal-50 text-teal-800 border-teal-200/80 ring-teal-600/10',
    avatarClasses: 'bg-teal-100/80 text-teal-800 ring-teal-600/20',
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  role: AdminUserRole
}>()

const config = computed(() => roleBadgeConfig[props.role])
</script>

<template>
  <span
    class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight ring-1 capitalize"
    :class="config.badgeClasses"
  >
    {{ config.label }}
  </span>
</template>
