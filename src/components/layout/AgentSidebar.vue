<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  Building,
  Building2,
  FileText,
  Flag,
  LayoutDashboard,
  MapPin,
  Network,
  Package,
  ShieldCheck,
  Users,
  Workflow,
  X,
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const { user } = useAuth()

const navGroups = computed(() => {
  const hasPackage = user.value?.hasActivePackage
  const permissions = user.value?.permissions || []
  const canAccessListingProcess = permissions.includes('listing_process')
  const canAccessListings = permissions.includes('listings')

  const agentItems = [
    { label: 'Dashboard', to: '/agent/dashboard', icon: LayoutDashboard },
    hasPackage 
      ? { label: 'My Subscription', to: '/agent/subscription', icon: Package }
      : { label: 'Available Subscriptions', to: '/agent/subscription', icon: Package }
  ]

  agentItems.push({ label: 'Service Packages', to: '/agent/service-packages', icon: FileText })
  agentItems.push({ label: 'Listing Processes', to: '/agent/listing-processes', icon: Workflow })
  agentItems.push({ label: 'Listings', to: '/agent/listings', icon: Building2 })
  agentItems.push({ label: 'Profile', to: '/agent/profile', icon: Users })

  return [
    {
      label: 'Agent',
      items: agentItems
    }
  ]
})



function isItemActive(path: string) {
  if (route.path === path || route.path.startsWith(path + '/')) return true
  if (path.endsWith('/listing-processes') && route.path.startsWith(path.replace('/listing-processes', '/processes/'))) {
    return true
  }
  return false
}
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-fg/40 backdrop-blur-xs transition-opacity lg:hidden"
    aria-hidden="true"
    @click="emit('close')"
  ></div>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-border bg-surface transition-transform duration-200 ease-in-out lg:static lg:translate-x-0"
    :class="{ 'translate-x-0 shadow-lg lg:shadow-none': open }"
  >
    <!-- Brand / Header -->
    <div class="flex h-16 items-center justify-between border-b border-border px-5">
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20"
        >
          <ShieldCheck class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold tracking-tight text-fg">Reozom Agent</p>
          <p class="text-[11px] font-medium text-fg-muted">Agent Portal</p>
        </div>
      </div>
      <button
        type="button"
        class="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-raised hover:text-fg lg:hidden"
        aria-label="Close navigation"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div v-for="group in navGroups" :key="group.label">
        <p class="px-3 pb-2 text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
          {{ group.label }}
        </p>
        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="focus-ring group relative flex items-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="[
              isItemActive(item.to)
                ? 'bg-primary-soft text-primary-active font-semibold'
                : 'text-fg-muted hover:bg-surface-raised hover:text-fg',
            ]"
            @click="emit('close')"
          >
            <!-- Left accent bar for active item -->
            <span
              v-if="isItemActive(item.to)"
              class="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary"
              aria-hidden="true"
            ></span>

            <component
              :is="item.icon"
              class="mt-0.5 h-4 w-4 shrink-0 transition-colors"
              :class="isItemActive(item.to) ? 'text-primary' : 'text-fg-disabled group-hover:text-fg-muted'"
            />
            <span class="leading-snug tracking-tight">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </aside>
</template>

