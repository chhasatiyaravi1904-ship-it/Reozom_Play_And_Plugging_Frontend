<script setup lang="ts">
import { ChevronDown, KeyRound, LogOut, UserRound } from 'lucide-vue-next'
import ActionMenu from '@/components/ui/ActionMenu.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const { user, logout } = useAuth()
const toast = useToastStore()

const menuItems = [
  { label: 'Profile', icon: UserRound, value: 'profile' },
  { label: 'Change Password', icon: KeyRound, value: 'change-password' },
  { label: 'Logout', icon: LogOut, value: 'logout', destructive: true },
]

function handleSelect(value: string) {
  if (value === 'logout') {
    logout()
  } else {
    toast.info('This isn’t available yet.')
  }
}
</script>

<template>
  <ActionMenu :items="menuItems" panel-class="w-56" item-class="text-sm" icon-class="h-4 w-4" @select="handleSelect">
    <template #trigger="{ toggle, isOpen }">
      <button
        type="button"
        class="focus-ring flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors hover:bg-surface-raised"
        :class="{ 'bg-surface-raised': isOpen }"
        aria-label="Admin account menu"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-active ring-2 ring-primary/15"
        >
          {{ (user?.fullName || 'Admin').charAt(0).toUpperCase() }}
        </span>
        <span class="hidden min-w-0 text-left sm:block">
          <span class="block truncate text-sm font-semibold text-fg">
            {{ user?.fullName || 'Admin User' }}
          </span>
          <span class="block truncate text-xs text-fg-muted">{{ user?.email || user?.role }}</span>
        </span>
        <ChevronDown
          class="h-4 w-4 shrink-0 text-fg-muted transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>
    </template>
  </ActionMenu>
</template>
