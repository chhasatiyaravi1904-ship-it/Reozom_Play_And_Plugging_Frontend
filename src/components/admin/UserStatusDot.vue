<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUserStatus } from '@/services/adminUsersData'

const props = defineProps<{
  status: AdminUserStatus
}>()

const isStatusActive = computed(() => props.status === 'active')
</script>

<template>
  <span class="inline-flex items-center gap-1.5 text-xs font-medium">
    <span
      class="h-2 w-2 shrink-0 rounded-full"
      :class="isStatusActive ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500 ring-2 ring-rose-500/20'"
      aria-hidden="true"
    ></span>
    <span :class="isStatusActive ? 'text-slate-700' : 'text-slate-500'">
      {{ isStatusActive ? 'Active' : 'Inactive' }}
    </span>
  </span>
</template>
