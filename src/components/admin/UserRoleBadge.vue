<script lang="ts">
import type { AdminUserRole } from '@/services/adminUsersData'

export interface RoleBadgeConfig {
  label: string
  badgeClasses: string
  avatarClasses: string
}

export const roleBadgeConfig: Record<string, RoleBadgeConfig> = {
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
  seller_buyer: {
    label: 'Seller / Buyer',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-emerald-600/10',
    avatarClasses: 'bg-emerald-100/80 text-emerald-800 ring-emerald-600/20',
  },
  client: {
    label: 'Seller / Buyer',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-emerald-600/10',
    avatarClasses: 'bg-emerald-100/80 text-emerald-800 ring-emerald-600/20',
  },
  seller: {
    label: 'Seller / Buyer',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-emerald-600/10',
    avatarClasses: 'bg-emerald-100/80 text-emerald-800 ring-emerald-600/20',
  },
  buyer: {
    label: 'Seller / Buyer',
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-emerald-600/10',
    avatarClasses: 'bg-emerald-100/80 text-emerald-800 ring-emerald-600/20',
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  role: AdminUserRole
}>()

const config = computed(() => roleBadgeConfig[props.role] || roleBadgeConfig.seller_buyer)
</script>

<template>
  <span
    class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight ring-1"
    :class="config.badgeClasses"
  >
    {{ config.label }}
  </span>
</template>
