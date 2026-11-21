<script setup lang="ts">
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import { onMounted, ref, watch } from 'vue'
import { BriefcaseBusiness, FilterX, RefreshCw } from 'lucide-vue-next'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import {
  fetchAdminServicePackages,
  type AdminServicePackage,
} from '@/services/adminServicePackageService'

/** Read-only list of the service packages agents created, with the agent's name. */
const packages = ref<AdminServicePackage[]>([])
const total = ref(0)
const page = ref(1)
const perPage = ref(15)
const search = ref('')
const statusFilter = ref('all')
const status = ref<'idle' | 'loading' | 'error'>('idle')
const error = ref<string | null>(null)

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

let requestId = 0
async function load() {
  const id = ++requestId
  status.value = 'loading'
  error.value = null
  try {
    const result = await fetchAdminServicePackages({
      page: page.value,
      per_page: perPage.value,
      search: search.value.trim() || undefined,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value,
    })
    if (id !== requestId) return // a newer search already started
    packages.value = result.items
    total.value = result.total
    status.value = 'idle'
  } catch (err: any) {
    if (id !== requestId) return
    status.value = 'error'
    error.value = err?.response?.data?.message || 'Please try again.'
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
})
watch(statusFilter, () => {
  page.value = 1
  load()
})
watch([page, perPage], load)

onMounted(load)

function resetFilters() {
  search.value = ''
  statusFilter.value = 'all'
}

function formatPrice(price: string | null): string {
  if (price === null || price === '' || Number(price) === 0) return 'Free'
  return Number(price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <Breadcrumb :items="[{ label: 'Admin' }, { label: 'Platform' }, { label: 'Agent Service Packages' }]" />

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-fg">Agent Service Packages</h1>
          <p class="mt-1 text-sm text-fg-muted">Service packages created by agents. View only.</p>
        </div>
        <BaseButton variant="secondary" size="sm" title="Refresh list" @click="load">
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': status === 'loading' }" />
          <span class="ml-1.5 hidden sm:inline">Refresh</span>
        </BaseButton>
      </div>
    </div>

    <div class="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      <div class="border-b border-border bg-surface p-4 sm:p-5">
        <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div class="w-full sm:w-72">
            <SearchInput v-model="search" placeholder="Search package or agent..." />
          </div>
          <div class="w-full sm:w-44">
            <FilterSelect v-model="statusFilter" :options="statusOptions" label="Status" />
          </div>
        </div>
      </div>

      <div class="relative overflow-x-auto">
        <div v-if="status === 'loading' && packages.length === 0" class="divide-y divide-border">
          <SkeletonTable :rows="5" :columns="6" />
        </div>

        <ErrorState
          v-else-if="status === 'error'"
          title="Couldn't load agent service packages"
          :description="error || undefined"
          class="m-4 sm:m-6"
        >
          <template #action>
            <BaseButton variant="secondary" size="sm" @click="load">
              <RefreshCw class="h-3 w-3" />
              <span class="ml-1.5">Retry</span>
            </BaseButton>
          </template>
        </ErrorState>

        <table v-else-if="packages.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-surface-raised text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
              <th scope="col" class="px-4 py-3.5">Package</th>
              <th scope="col" class="px-4 py-3.5">Agent</th>
              <th scope="col" class="px-4 py-3.5">Price</th>
              <th scope="col" class="px-4 py-3.5">Listing Process</th>
              <th scope="col" class="px-4 py-3.5">ZIP Codes</th>
              <th scope="col" class="px-4 py-3.5">Listings</th>
              <th scope="col" class="px-4 py-3.5">Status</th>
              <th scope="col" class="px-4 py-3.5">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border bg-surface text-xs">
            <tr v-for="pkg in packages" :key="pkg.id" class="transition-colors hover:bg-surface-raised">
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <BriefcaseBusiness class="h-4 w-4" />
                  </div>
                  <span class="text-sm font-semibold text-fg">{{ pkg.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <template v-if="pkg.agent">
                  <div class="text-sm font-medium text-fg">{{ pkg.agent.name }}</div>
                  <div class="text-[11px] text-fg-muted">{{ pkg.agent.email }}</div>
                </template>
                <span v-else class="text-fg-muted">—</span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-fg">{{ formatPrice(pkg.price) }}</td>
              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">{{ pkg.listing_process || '—' }}</td>
              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">{{ pkg.zip_codes_count }}</td>
              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">{{ pkg.listings_count }}</td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  :class="pkg.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-border text-fg-muted'"
                >
                  {{ pkg.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">
                {{ pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : '—' }}
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="p-4 sm:p-6">
          <EmptyState
            v-if="search || statusFilter !== 'all'"
            :icon="FilterX"
            title="No packages found"
            description="No agent service packages match your search or filter."
          >
            <template #action>
              <BaseButton variant="secondary" size="sm" @click="resetFilters">Clear Filters</BaseButton>
            </template>
          </EmptyState>
          <EmptyState
            v-else
            :icon="BriefcaseBusiness"
            title="No agent service packages yet"
            description="Packages appear here once agents create them."
          />
        </div>
      </div>

      <PaginationBar
        v-if="status !== 'error' && total > 0"
        :page="page"
        :per-page="perPage"
        :total-items="total"
        :per-page-options="[15, 30, 50]"
        item-label="packages"
        @update:page="page = $event"
        @update:per-page="perPage = $event"
      />
    </div>
  </div>
</template>
