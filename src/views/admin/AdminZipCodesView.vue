<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Plus,
  Search,
  RotateCcw,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Power,
} from 'lucide-vue-next'

import { useZipCodeStore } from '@/stores/zipCode'
import { useStateStore } from '@/stores/state'
import { useCountyStore } from '@/stores/county'
import { useCityStore } from '@/stores/city'
import { useToastStore } from '@/stores/toast'
import type { ZipCodeItem, CreateZipCodePayload } from '@/types/zipCode'
import AddEditZipCodeModal from '@/components/admin/AddEditZipCodeModal.vue'
import DeleteZipCodeModal from '@/components/admin/DeleteZipCodeModal.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'

const zipCodeStore = useZipCodeStore()
const stateStore = useStateStore()
const countyStore = useCountyStore()
const cityStore = useCityStore()
const toast = useToastStore()

const isAddEditModalOpen = ref(false)
const zipCodeToEdit = ref<ZipCodeItem | null>(null)

const isDeleteModalOpen = ref(false)
const zipCodeToDelete = ref<ZipCodeItem | null>(null)

const openDropdownId = ref<string | number | null>(null)

function toggleDropdown(id: string | number, event: Event) {
  event.stopPropagation()
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function closeDropdowns() {
  openDropdownId.value = null
}

onMounted(async () => {
  window.addEventListener('click', closeDropdowns)
  await Promise.all([
    zipCodeStore.fetchZipCodes(),
    stateStore.fetchStates(),
    countyStore.fetchCounties(),
    cityStore.fetchCities()
  ])
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
})

async function handleRefresh() {
  await zipCodeStore.fetchZipCodes()
  toast.info('ZIP Codes refreshed.')
}

function openAddModal() {
  zipCodeToEdit.value = null
  isAddEditModalOpen.value = true
}

function openEditModal(item: ZipCodeItem) {
  zipCodeToEdit.value = item
  isAddEditModalOpen.value = true
  openDropdownId.value = null
}

function openDeleteModal(item: ZipCodeItem) {
  zipCodeToDelete.value = item
  isDeleteModalOpen.value = true
  openDropdownId.value = null
}

async function handleSaveZipCode(payload: CreateZipCodePayload) {
  if (zipCodeToEdit.value) {
    const updated = await zipCodeStore.updateZipCode(zipCodeToEdit.value.id, payload)
    if (updated) {
      toast.success(`ZIP Code ${updated.code} was updated.`)
    } else if (zipCodeStore.error) {
      toast.error(zipCodeStore.error)
    }
  } else {
    const created = await zipCodeStore.createZipCode(payload)
    if (created) {
      toast.success(`ZIP Code ${created.code} was added.`)
    } else if (zipCodeStore.error) {
      toast.error(zipCodeStore.error)
    }
  }
}

async function handleToggleStatus(item: ZipCodeItem) {
  openDropdownId.value = null
  const success = await zipCodeStore.toggleStatus(item.id)
  if (success) {
    const current = zipCodeStore.zipCodes.find((z) => z.id === item.id)
    toast.info(`ZIP Code ${item.code} is now ${current?.status || 'updated'}.`)
  } else if (zipCodeStore.error) {
    toast.error(zipCodeStore.error)
  }
}

async function handleDeleteZipCode(item: ZipCodeItem) {
  const success = await zipCodeStore.deleteZipCode(item.id)
  if (success) {
    toast.success(`ZIP Code ${item.code} was removed.`)
  } else if (zipCodeStore.error) {
    toast.error(zipCodeStore.error)
  }
}

function toggleSort(field: string) {
  if (zipCodeStore.sortBy === field) {
    zipCodeStore.sortOrder = zipCodeStore.sortOrder === 'asc' ? 'desc' : 'asc'
  } else {
    zipCodeStore.sortBy = field
    zipCodeStore.sortOrder = 'asc'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="space-y-2">
      <nav class="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <span class="font-medium text-slate-400">Admin</span>
        <span>/</span>
        <span class="font-medium text-slate-400">Reference Data</span>
        <span>/</span>
        <span class="font-semibold text-slate-800">ZIP Codes</span>
      </nav>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">ZIP Codes</h1>
          <p class="mt-1 text-sm text-slate-500">
            Manage ZIP codes and their geographical relationships.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Refresh ZIP code list"
            @click="handleRefresh"
          >
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': zipCodeStore.status === 'loading' }" />
            <span class="ml-1.5 hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" />
            <span>Add ZIP Code</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-shadow">
      <!-- Filter Toolbar -->
      <div class="border-b border-slate-200/80 bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-1 flex-wrap items-center gap-3">
            <div class="relative w-full sm:w-64">
              <Search class="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                v-model="zipCodeStore.searchQuery"
                type="text"
                placeholder="Search by ZIP code..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
              <button
                v-if="zipCodeStore.searchQuery"
                type="button"
                class="absolute inset-y-0 right-0 my-auto mr-2.5 text-xs text-slate-400 hover:text-slate-700"
                @click="zipCodeStore.searchQuery = ''"
              >
                ✕
              </button>
            </div>

            <!-- State Filter -->
            <div class="relative min-w-[130px]">
              <select
                v-model="zipCodeStore.stateFilter"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="all">All States</option>
                <option v-for="s in stateStore.states" :key="s.id" :value="String(s.id)">
                  {{ s.name }}
                </option>
              </select>
              <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <!-- County Filter -->
            <div class="relative min-w-[140px]">
              <select
                v-model="zipCodeStore.countyFilter"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="all">All Counties</option>
                <option v-for="c in countyStore.counties" :key="c.id" :value="String(c.id)">
                  {{ c.name }}
                </option>
              </select>
              <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <!-- City Filter -->
            <div class="relative min-w-[140px]">
              <select
                v-model="zipCodeStore.cityFilter"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="all">All Cities</option>
                <option v-for="c in cityStore.cities" :key="c.id" :value="String(c.id)">
                  {{ c.name }}
                </option>
              </select>
              <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <!-- Status Filter -->
            <div class="relative min-w-[120px]">
              <select
                v-model="zipCodeStore.statusFilter"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="zipCodeStore.searchQuery || zipCodeStore.statusFilter !== 'all' || zipCodeStore.stateFilter !== 'all' || zipCodeStore.countyFilter !== 'all' || zipCodeStore.cityFilter !== 'all'"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
              @click="zipCodeStore.resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="relative overflow-x-auto">
        <div v-if="zipCodeStore.status === 'loading'" class="divide-y divide-slate-100">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between gap-4 p-4 animate-pulse">
            <div class="h-4 w-36 rounded bg-slate-200"></div>
            <div class="h-6 w-12 rounded bg-slate-200"></div>
            <div class="h-4 w-28 rounded bg-slate-200"></div>
            <div class="h-5 w-9 rounded-full bg-slate-200"></div>
            <div class="flex gap-2">
              <div class="h-7 w-7 rounded bg-slate-200"></div>
              <div class="h-7 w-7 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>

        <table v-else-if="zipCodeStore.filteredZipCodes.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('code')"
              >
                <div class="flex items-center gap-1.5">
                  <span>ZIP Code</span>
                  <component
                    :is="zipCodeStore.sortBy === 'code' ? (zipCodeStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="zipCodeStore.sortBy === 'code' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>
              <th scope="col" class="px-4 py-3.5">City</th>
              <th scope="col" class="px-4 py-3.5">County</th>
              <th scope="col" class="px-4 py-3.5">State</th>
              <th scope="col" class="px-4 py-3.5 text-center">Status</th>
              <th scope="col" class="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 bg-white text-xs">
            <tr
              v-for="zip in zipCodeStore.paginatedZipCodes"
              :key="zip.id"
              class="group transition-colors hover:bg-slate-50/80"
            >
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex h-7 min-w-9 items-center justify-center rounded-md bg-teal-50 px-2 font-mono font-bold text-xs text-[#0f6b5c] ring-1 ring-teal-600/20"
                >
                  {{ zip.code }}
                </span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span class="text-slate-700 font-medium">{{ zip.city?.name || '—' }}</span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span class="text-slate-600">{{ zip.county?.name || '—' }}</span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span class="text-slate-600">{{ zip.state?.name || '—' }}</span>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-center">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="zip.status === 'active' || zip.isActive === true"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/30"
                  :class="zip.status === 'active' || zip.isActive === true ? 'bg-[#0f6b5c]' : 'bg-slate-300'"
                  :title="zip.status === 'active' || zip.isActive ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'"
                  @click="handleToggleStatus(zip)"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
                    :class="zip.status === 'active' || zip.isActive === true ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-right">
                <div class="relative inline-flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit ZIP Code"
                    @click="openEditModal(zip)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>

                  <div class="relative">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      :class="{ 'bg-slate-100 text-slate-800': openDropdownId === zip.id }"
                      aria-label="More actions"
                      @click="toggleDropdown(zip.id, $event)"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </button>

                    <div
                      v-if="openDropdownId === zip.id"
                      class="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg ring-1 ring-black/5"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openEditModal(zip)"
                      >
                        <Pencil class="h-3.5 w-3.5 text-slate-400" />
                        <span>Edit ZIP Code</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="handleToggleStatus(zip)"
                      >
                        <Power class="h-3.5 w-3.5 text-slate-400" />
                        <span>{{ zip.status === 'active' || zip.isActive ? 'Deactivate' : 'Activate' }}</span>
                      </button>

                      <div class="my-1 border-t border-slate-100"></div>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        @click="openDeleteModal(zip)"
                      >
                        <Trash2 class="h-3.5 w-3.5 text-red-500" />
                        <span>Delete ZIP Code</span>
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-else class="p-8 sm:p-12 text-center">
          <div class="flex flex-col items-center max-w-sm mx-auto">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3.5">
              <FilterX class="h-6 w-6" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">No ZIP codes found</h3>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              No ZIP codes match your search query or filters. Try resetting your search, or add a
              new ZIP code to get started.
            </p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="zipCodeStore.resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      <PaginationBar
        v-if="zipCodeStore.filteredZipCodes.length > 0"
        :page="zipCodeStore.page"
        :per-page="zipCodeStore.perPage"
        :total-items="zipCodeStore.filteredZipCodes.length"
        item-label="ZIP codes"
        @update:page="zipCodeStore.page = $event"
        @update:per-page="zipCodeStore.perPage = $event"
      />
    </div>

    <AddEditZipCodeModal
      v-model="isAddEditModalOpen"
      :zip-code-to-edit="zipCodeToEdit"
      @save="handleSaveZipCode"
    />

    <DeleteZipCodeModal
      v-model="isDeleteModalOpen"
      :zip-code="zipCodeToDelete"
      @confirm-delete="handleDeleteZipCode"
    />
  </div>
</template>
