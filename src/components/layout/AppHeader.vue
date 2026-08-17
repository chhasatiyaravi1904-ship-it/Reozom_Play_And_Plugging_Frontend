<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Bell, ChevronDown, Menu } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const navLinks = [
  { label: 'My Listing', to: '/dashboard' },
  { label: 'Progress', to: '/listings' },
  { label: 'Documents', to: '/listings' },
  { label: 'Help Center', to: '/help' },
]

async function handleLogout() {
  isUserMenuOpen.value = false
  await logout()
  router.push('/auth/login')
}
</script>

<template>
  <header class="border-b border-border bg-surface">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
      <RouterLink to="/dashboard" class="flex flex-col leading-tight">
        <span class="text-lg font-bold tracking-tight text-fg">REOZOM</span>
        <span class="text-[11px] text-fg-muted">Smart Listings. Simple Process.</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <BaseButton variant="ghost" size="sm" class="!rounded-full !px-2" aria-label="Notifications">
          <Bell class="h-4 w-4" />
        </BaseButton>

        <div class="relative">
          <BaseButton
            variant="ghost"
            size="sm"
            class="!rounded-full !py-1 !pr-2 !pl-1"
            @click="isUserMenuOpen = !isUserMenuOpen"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary-active"
            >
              {{ (user?.fullName || 'S').charAt(0) }}
            </span>
            <span class="ml-2">{{ user?.fullName || 'Seller' }}</span>
            <ChevronDown class="ml-1 h-4 w-4" />
          </BaseButton>

          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg"
          >
            <RouterLink
              to="/profile"
              class="block px-4 py-2 text-sm text-fg hover:bg-surface-raised"
              @click="isUserMenuOpen = false"
            >
              Profile
            </RouterLink>
            <button
              type="button"
              class="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-surface-raised"
              @click="handleLogout"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <BaseButton
        variant="ghost"
        size="sm"
        class="!px-2 md:hidden"
        aria-label="Open menu"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Menu class="h-4 w-4" />
      </BaseButton>
    </div>

    <div v-if="isMobileMenuOpen" class="border-t border-border px-4 py-3 md:hidden">
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-surface-raised"
          @click="isMobileMenuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
        <RouterLink
          to="/profile"
          class="rounded-lg px-3 py-2 text-sm font-medium text-fg hover:bg-surface-raised"
          @click="isMobileMenuOpen = false"
        >
          Profile
        </RouterLink>
        <button
          type="button"
          class="rounded-lg px-3 py-2 text-left text-sm font-medium text-danger hover:bg-surface-raised"
          @click="handleLogout"
        >
          Sign out
        </button>
      </nav>
    </div>
  </header>
</template>
