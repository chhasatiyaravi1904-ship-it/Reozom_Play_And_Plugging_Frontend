<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Building2, ChevronRight, Info, Landmark, Map, Network, Users as UsersIcon } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'
import { useStateStore } from '@/stores/state'
import { useCountyStore } from '@/stores/county'
import { useCityStore } from '@/stores/city'
import { useMlsStore } from '@/stores/mls'
import * as userService from '@/services/userService'
import type { AdminUserListResponse } from '@/services/userService'
import type { AdminUserItem } from '@/services/adminUsersData'
import { useToastStore } from '@/stores/toast'

const { user } = useAuth()
const toast = useToastStore()
const stateStore = useStateStore()
const countyStore = useCountyStore()
const cityStore = useCityStore()
const mlsStore = useMlsStore()

const usersLoading = ref(false)
const totalUsers = ref<number | null>(null)
const activeUsers = ref<number | null>(null)

async function loadUserCount() {
  usersLoading.value = true
  try {
    const response = await userService.fetchUsers({ per_page: 100 })
    const payload: AdminUserListResponse | AdminUserItem[] = response.data
    const items = Array.isArray(payload) ? payload : (payload.items ?? payload.data ?? [])
    totalUsers.value = Array.isArray(payload) ? items.length : (payload.meta?.total ?? items.length)
    activeUsers.value = items.filter((item) => item.isActive !== false).length
  } catch {
    toast.error('Unable to load user count.')
  } finally {
    usersLoading.value = false
  }
}

/** Active/total is derived from the same loaded page as the count itself, so it stays consistent even when the total exceeds one page. */
function activeOf(list: { isActive?: boolean }[]) {
  return list.filter((item) => item.isActive !== false).length
}

/** Surfaces what needs attention (inactive records) rather than repeating the total when everything is active. */
function inactiveLabel(total: number | null, active: number | null) {
  if (total === null || active === null) return null
  const inactive = total - active
  return inactive > 0 ? { text: `${inactive} inactive`, tone: 'warning' as const } : { text: 'All active', tone: 'success' as const }
}

const totalMlsInfos = computed(() =>
  mlsStore.directories.reduce((sum, d) => sum + (d.infosCount || 0), 0),
)

const toneClasses: Record<string, string> = {
  warning: 'bg-warning-soft text-warning group-hover:bg-warning/20',
  success: 'bg-success-soft text-success group-hover:bg-success/20',
  info: 'bg-info-soft text-info group-hover:bg-info/20',
  caution: 'bg-caution-soft text-caution group-hover:bg-caution/20',
}
const toneDotClasses: Record<string, string> = {
  warning: 'bg-warning',
  success: 'bg-success',
  info: 'bg-info',
  caution: 'bg-caution',
}

const stats = computed(() => [
  {
    key: 'users',
    label: 'Users',
    icon: UsersIcon,
    value: totalUsers.value,
    status: inactiveLabel(totalUsers.value, activeUsers.value),
    loading: usersLoading.value,
    to: { name: 'admin-users' },
    iconClass: 'bg-primary-soft text-primary',
  },
  {
    key: 'states',
    label: 'States',
    icon: Landmark,
    value: stateStore.totalStates,
    status: inactiveLabel(stateStore.totalStates, activeOf(stateStore.states)),
    loading: stateStore.status === 'loading',
    to: { name: 'admin-states' },
    iconClass: 'bg-info-soft text-info',
  },
  {
    key: 'counties',
    label: 'Counties',
    icon: Map,
    value: countyStore.totalCounties,
    status: inactiveLabel(countyStore.totalCounties, activeOf(countyStore.counties)),
    loading: countyStore.status === 'loading',
    to: { name: 'admin-counties' },
    iconClass: 'bg-warning-soft text-warning',
  },
  {
    key: 'cities',
    label: 'Cities',
    icon: Building2,
    value: cityStore.totalCities,
    status: inactiveLabel(cityStore.totalCities, activeOf(cityStore.cities)),
    loading: cityStore.status === 'loading',
    to: { name: 'admin-cities' },
    iconClass: 'bg-success-soft text-success',
  },
  {
    key: 'mls',
    label: 'MLS',
    icon: Network,
    value: mlsStore.totalDirectories,
    status: totalMlsInfos.value > 0 ? { text: `${totalMlsInfos.value} info entries`, tone: 'caution' as const } : null,
    loading: mlsStore.status === 'loading',
    to: { name: 'admin-mls' },
    iconClass: 'bg-caution-soft text-caution',
  },
])

onMounted(() => {
  loadUserCount()
  stateStore.fetchStates()
  countyStore.fetchCounties()
  cityStore.fetchCities()
  mlsStore.fetchDirectories()
})
</script>

<template>
  <div>
    <PageHeader
      title="Admin Dashboard"
      :description="`Signed in as ${user?.fullName} (${user?.role})`"
    />

    <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink v-for="stat in stats" :key="stat.key" :to="stat.to" class="group block">
        <BaseCard interactive class="h-full group min-h-[200px]">
          <div class="flex flex-col items-center justify-center h-full text-center py-4">
            <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg mb-4" :class="stat.iconClass">
              <component :is="stat.icon" class="h-8 w-8 transition-transform duration-300" />
            </span>

            <p v-if="stat.loading" class="h-10 w-20 animate-pulse rounded bg-surface-raised mb-2"></p>
            <div v-else class="mb-2">
              <p class="text-5xl font-extrabold tracking-tight text-fg tabular-nums transition-colors duration-300 group-hover:text-primary drop-shadow-sm">
                {{ stat.value ?? '—' }}
              </p>
            </div>

            <p class="text-base font-semibold text-fg-muted transition-colors duration-300 group-hover:text-fg mb-4">{{ stat.label }}</p>

            <p v-if="!stat.loading && stat.status" class="flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300 shadow-sm" :class="toneClasses[stat.status.tone]">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="toneDotClasses[stat.status.tone]"></span>
                <span class="relative inline-flex rounded-full h-2 w-2" :class="toneDotClasses[stat.status.tone]"></span>
              </span>
              {{ stat.status.text }}
            </p>
          </div>
        </BaseCard>
      </RouterLink>
    </div>

    <div class="mt-6 flex gap-3 rounded-xl border border-info/20 bg-info-soft p-5">
      <Info class="mt-0.5 h-5 w-5 shrink-0 text-info" />
      <div>
        <h2 class="text-sm font-semibold text-fg">Welcome to Reozom Admin</h2>
        <p class="mt-1 text-sm text-fg-muted">
          This is a placeholder landing page. Listing-process configuration, county/MLS routing,
          and disclosure management (Phase 1&ndash;3 of the Plug-and-Play build) will live here.
        </p>
      </div>
    </div>
  </div>
</template>
