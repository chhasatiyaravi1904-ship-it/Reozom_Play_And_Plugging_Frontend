<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUserRole } from '@/services/adminUsersData'

const props = defineProps<{
  role: AdminUserRole
}>()

const roleConfig = computed(() => {
  switch (props.role) {
    case 'admin':
      return {
        label: 'Admin',
        classes: 'bg-purple-50 text-purple-700 border-purple-200/80 ring-purple-600/10',
      }
    case 'agent':
      return {
        label: 'Agent',
        classes: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-600/10',
      }
    case 'seller':
      return {
        label: 'Seller',
        classes: 'bg-amber-50 text-amber-800 border-amber-200/80 ring-amber-600/10',
      }
    case 'buyer':
      return {
        label: 'Buyer',
        classes: 'bg-teal-50 text-teal-800 border-teal-200/80 ring-teal-600/10',
      }
    default:
      return {
        label: props.role,
        classes: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/10',
      }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-tight ring-1 capitalize"
    :class="roleConfig.classes"
  >
    {{ roleConfig.label }}
  </span>
</template>
