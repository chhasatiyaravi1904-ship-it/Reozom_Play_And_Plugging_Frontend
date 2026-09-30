<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, KeyRound, LogOut, UserRound } from 'lucide-vue-next'
import ActionMenu from '@/components/ui/ActionMenu.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const { user, logout } = useAuth()
const toast = useToastStore()

const isLoggingOut = ref(false)

const menuItems = [
  { label: 'Profile', icon: UserRound, value: 'profile' },
  { label: 'Change Password', icon: KeyRound, value: 'change-password' },
  { label: 'Logout', icon: LogOut, value: 'logout', destructive: true },
]

async function handleSelect(value: string) {
  if (value === 'profile') {
    router.push({ name: 'admin-profile' })
    return
  }

  if (value !== 'logout') {
    toast.info('This isn’t available yet.')
    return
  }

  isLoggingOut.value = true
  try {
    await logout()
    await router.push('/')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <ActionMenu :items="menuItems" panel-class="w-56" item-class="text-sm" icon-class="h-4 w-4" @select="handleSelect">
    <template #trigger="{ toggle, isOpen }">
      <button
        type="button"
        class="focus-ring flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-70"
        :class="{ 'bg-surface-raised': isOpen }"
        aria-label="Admin account menu"
        :aria-expanded="isOpen"
        :disabled="isLoggingOut"
        @click="toggle"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-active ring-2 ring-primary/15"
        >
          {{ (user?.fullName || 'Admin').charAt(0).toUpperCase() }}
        </span>
        <span class="hidden min-w-0 text-left sm:block">
          <span class="block truncate text-sm font-semibold text-fg">
            {{ isLoggingOut ? 'Signing out…' : user?.fullName || 'Admin User' }}
          </span>
          <span class="block truncate text-xs text-fg-muted">{{ user?.email || user?.role }}</span>
        </span>
        <span
          v-if="isLoggingOut"
          class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-fg-muted/30 border-t-fg-muted"
          aria-hidden="true"
        ></span>
        <ChevronDown
          v-else
          class="h-4 w-4 shrink-0 text-fg-muted transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>
    </template>
  </ActionMenu>
</template>
