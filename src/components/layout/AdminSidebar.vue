<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  Building,
  Building2,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  MapPin,
  Network,
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
const { user, logout } = useAuth()

const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Platform',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'Listings', to: '/admin/listings', icon: Building2 },
      { label: 'Listing Process Management', to: '/admin/listing-processes', icon: Workflow },
      { label: 'Disclosures', to: '/admin/disclosures', icon: FileText },
    ],
  },
  {
    label: 'Reference Data',
    items: [
      { label: 'MLS', to: '/admin/mls', icon: Network },
      { label: 'State', to: '/admin/states', icon: Flag },
      { label: 'County', to: '/admin/counties', icon: MapPin },
      { label: 'City', to: '/admin/cities', icon: Building },
    ],
  },
]

function isItemActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

async function handleLogout() {
  emit('close')
  await logout()
}
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
    aria-hidden="true"
    @click="emit('close')"
  ></div>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-slate-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0"
    :class="{ 'translate-x-0 shadow-xl lg:shadow-none': open }"
  >
    <!-- Brand / Header -->
    <div class="flex h-16 items-center justify-between border-b border-slate-200/80 px-5">
      <div class="flex items-center gap-3">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-600/20"
        >
          <ShieldCheck class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold tracking-tight text-slate-900">Reozom Admin</p>
          <p class="text-[11px] font-medium text-slate-400">Enterprise Control</p>
        </div>
      </div>
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        aria-label="Close navigation"
        @click="emit('close')"
      >
        <X class="h-4 w-4" />
      </button>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      <div v-for="group in navGroups" :key="group.label">
        <p class="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          {{ group.label }}
        </p>
        <div class="flex flex-col gap-1">
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="group relative flex items-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all"
            :class="[
              isItemActive(item.to)
                ? 'bg-teal-50/90 text-teal-900 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900',
            ]"
            @click="emit('close')"
          >
            <!-- Left accent bar for active item -->
            <span
              v-if="isItemActive(item.to)"
              class="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-[#0f6b5c]"
              aria-hidden="true"
            ></span>

            <component
              :is="item.icon"
              class="h-4 w-4 shrink-0 transition-colors"
              :class="[
                item.label === 'Listing Process Management' ? 'mt-0.5' : 'mt-0.5',
                isItemActive(item.to)
                  ? 'text-[#0f6b5c]'
                  : 'text-slate-400 group-hover:text-slate-700',
              ]"
            />
            <span class="leading-snug tracking-tight">{{ item.label }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Bottom Admin User Profile & Sign Out -->
    <div class="border-t border-slate-200/80 bg-slate-50/50 p-3">
      <div
        class="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white p-2.5 shadow-2xs"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100/70 text-xs font-semibold text-teal-800 ring-2 ring-teal-600/15"
        >
          {{ (user?.fullName || 'Admin').charAt(0).toUpperCase() }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-semibold text-slate-800">
            {{ user?.fullName || 'Admin User' }}
          </p>
          <div class="flex items-center gap-1.5">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <p class="truncate text-[11px] font-medium text-slate-500 capitalize">
              {{ user?.role || 'Administrator' }}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-500/20"
        @click="handleLogout"
      >
        <LogOut class="h-3.5 w-3.5" />
        <span>Sign out</span>
      </button>
    </div>
  </aside>
</template>

