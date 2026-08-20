<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Plus,
  Search,
  RotateCcw,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Eye,
  Trash2,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Power,
} from 'lucide-vue-next'

import { useCityStore } from '@/stores/city'
import { useCountyStore } from '@/stores/county'
import { useToastStore } from '@/stores/toast'
import type { CityItem, CityDetail, CreateCityPayload } from '@/types/city'
import CityDetailModal from '@/components/admin/CityDetailModal.vue'
import AddEditCityModal from '@/components/admin/AddEditCityModal.vue'
import DeleteCityModal from '@/components/admin/DeleteCityModal.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'

const cityStore = useCityStore()
const countyStore = useCountyStore()
const toast = useToastStore()

// Modals
const isDetailModalOpen = ref(false)
const selectedCityDetail = ref<CityDetail | null>(null)

const isAddEditModalOpen = ref(false)
const cityToEdit = ref<CityItem | null>(null)

const isDeleteModalOpen = ref(false)
const cityToDelete = ref<CityItem | null>(null)

// Actions dropdown
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
  await Promise.all([cityStore.fetchCities(), countyStore.fetchCounties()])
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
})

// Handlers
async function handleRefresh() {
  await cityStore.fetchCities()
  toast.info('Cities refreshed.')
}

async function openDetailModal(cityItem: CityItem) {
  openDropdownId.value = null
  selectedCityDetail.value = { ...cityItem } as CityDetail
  isDetailModalOpen.value = true
  try {
    const detail = await cityStore.fetchCity(cityItem.id)
    if (detail) {
      selectedCityDetail.value = { ...detail }
    }
  } catch {
    // Keep cityItem if network error
  }
}

function openAddModal() {
  cityToEdit.value = null
  isAddEditModalOpen.value = true
}

function openEditModal(cityItem: CityItem) {
  cityToEdit.value = cityItem
  isAddEditModalOpen.value = true
  openDropdownId.value = null
}

function openDeleteModal(cityItem: CityItem) {
  cityToDelete.value = cityItem
  isDeleteModalOpen.value = true
  openDropdownId.value = null
}

async function handleSaveCity(payload: CreateCityPayload) {
  if (cityToEdit.value) {
    const updated = await cityStore.updateCity(cityToEdit.value.id, payload)
    if (updated) {
      toast.success(`City ${updated.name} was updated.`)
    } else if (cityStore.error) {
      toast.error(cityStore.error)
    }
  } else {
    const created = await cityStore.createCity(payload)
    if (created) {
      toast.success(`City ${created.name} was added.`)
    } else if (cityStore.error) {
      toast.error(cityStore.error)
    }
  }
}

async function handleToggleStatus(cityItem: CityItem | CityDetail) {
  openDropdownId.value = null
  const success = await cityStore.toggleStatus(cityItem.id)
  if (success) {
    const current = cityStore.cities.find((c) => c.id === cityItem.id)
    toast.info(`City ${cityItem.name} is now ${current?.status || 'updated'}.`)
  } else if (cityStore.error) {
    toast.error(cityStore.error)
  }
}

async function handleDeleteCity(cityItem: CityItem) {
  const success = await cityStore.deleteCity(cityItem.id)
  if (success) {
    toast.success(`City ${cityItem.name} was removed.`)
  } else if (cityStore.error) {
    toast.error(cityStore.error)
  }
}

function toggleSort(field: string) {
  if (cityStore.sortBy === field) {
    cityStore.sortOrder = cityStore.sortOrder === 'asc' ? 'desc' : 'asc'
  } else {
    cityStore.sortBy = field
    cityStore.sortOrder = 'asc'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="space-y-2">
      <!-- Subtle Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
        <span class="font-medium text-slate-400">Admin</span>
        <span>/</span>
        <span class="font-medium text-slate-400">Reference Data</span>
        <span>/</span>
        <span class="font-semibold text-slate-800">Cities</span>
      </nav>

      <!-- Main Header Row -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Cities</h1>
          <p class="mt-1 text-sm text-slate-500">
            Manage cities and which county each belongs to.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Refresh city list"
            @click="handleRefresh"
          >
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': cityStore.status === 'loading' }" />
            <span class="ml-1.5 hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" />
            <span>Add City</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Cities Card -->
    <div class="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-shadow">
      <!-- Filter Toolbar -->
      <div class="border-b border-slate-200/80 bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <!-- Search, County, Status -->
          <div class="flex flex-1 flex-wrap items-center gap-3">
            <!-- Search -->
            <div class="relative w-full sm:w-72">
              <Search class="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                v-model="cityStore.searchQuery"
                type="text"
                placeholder="Search city name, code, or slug..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
              <button
                v-if="cityStore.searchQuery"
                type="button"
                class="absolute inset-y-0 right-0 my-auto mr-2.5 text-xs text-slate-400 hover:text-slate-700"
                @click="cityStore.searchQuery = ''"
              >
                ✕
              </button>
            </div>

            <!-- County Filter -->
            <div class="relative min-w-[150px]">
              <select
                v-model="cityStore.countyFilter"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="all">All Counties</option>
                <option v-for="c in countyStore.counties" :key="c.id" :value="String(c.id)">
                  {{ c.name }}
                </option>
              </select>
              <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <!-- Status Filter -->
            <div class="relative min-w-[130px]">
              <select
                v-model="cityStore.statusFilter"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <!-- Reset Filter Button -->
          <div class="flex items-center gap-2">
            <button
              v-if="cityStore.searchQuery || cityStore.statusFilter !== 'all' || cityStore.countyFilter !== 'all'"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
              @click="cityStore.resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Cities Table Section -->
      <div class="relative overflow-x-auto">
        <!-- Skeleton Loading -->
        <div v-if="cityStore.status === 'loading'" class="divide-y divide-slate-100">
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

        <!-- Table View -->
        <table v-else-if="cityStore.filteredCities.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
              <!-- City Name -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-1.5">
                  <span>City Name</span>
                  <component
                    :is="cityStore.sortBy === 'name' ? (cityStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="cityStore.sortBy === 'name' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- County -->
              <th scope="col" class="px-4 py-3.5">
                <span>County</span>
              </th>

              <!-- State -->
              <th scope="col" class="px-4 py-3.5">
                <span>State</span>
              </th>

              <!-- Code -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('code')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Code</span>
                  <component
                    :is="cityStore.sortBy === 'code' ? (cityStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="cityStore.sortBy === 'code' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Status (Toggle Only) -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('status')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Status</span>
                  <component
                    :is="cityStore.sortBy === 'status' ? (cityStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="cityStore.sortBy === 'status' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Actions -->
              <th scope="col" class="px-4 py-3.5 text-right">
                <span class="sr-only">Actions</span>
                <span class="pr-2">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 bg-white text-xs">
            <tr
              v-for="city in cityStore.paginatedCities"
              :key="city.id"
              class="group transition-colors hover:bg-slate-50/80"
            >
              <!-- City Name Column -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div
                  class="flex items-center gap-2.5 cursor-pointer"
                  @click="openDetailModal(city)"
                >
                  <p class="text-sm font-semibold text-slate-900 group-hover:text-[#0f6b5c] transition-colors leading-snug truncate">
                    {{ city.name }}
                  </p>
                </div>
              </td>

              <!-- County Column -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  v-if="city.county?.name"
                  class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  {{ city.county.name }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>

              <!-- State Column -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span v-if="city.county?.state?.name" class="text-xs text-slate-600">
                  {{ city.county.state.name }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>

              <!-- Code Column -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex h-7 min-w-9 items-center justify-center rounded-md bg-teal-50 px-2 font-mono font-bold text-xs text-[#0f6b5c] ring-1 ring-teal-600/20"
                >
                  {{ city.code }}
                </span>
              </td>

              <!-- Status (Toggle Switch Only) -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="city.status === 'active' || city.isActive === true"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/30"
                  :class="city.status === 'active' || city.isActive === true ? 'bg-[#0f6b5c]' : 'bg-slate-300'"
                  :title="city.status === 'active' || city.isActive ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'"
                  @click="handleToggleStatus(city)"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
                    :class="city.status === 'active' || city.isActive === true ? 'translate-x-4' : 'translate-x-0'"
                  />
                </button>
              </td>

              <!-- Actions Menu -->
              <td class="px-4 py-3.5 whitespace-nowrap text-right">
                <div class="relative inline-flex items-center justify-end gap-1">
                  <!-- Quick View Button -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="View city details (GET /cities/{id})"
                    @click="openDetailModal(city)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </button>

                  <!-- Quick Edit Button -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit city & slug"
                    @click="openEditModal(city)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>

                  <!-- More Dropdown -->
                  <div class="relative">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      :class="{ 'bg-slate-100 text-slate-800': openDropdownId === city.id }"
                      aria-label="More actions"
                      @click="toggleDropdown(city.id, $event)"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </button>

                    <!-- Dropdown Panel -->
                    <div
                      v-if="openDropdownId === city.id"
                      class="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg ring-1 ring-black/5"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openDetailModal(city)"
                      >
                        <Eye class="h-3.5 w-3.5 text-slate-400" />
                        <span>City Detail API</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openEditModal(city)"
                      >
                        <Pencil class="h-3.5 w-3.5 text-slate-400" />
                        <span>Edit City / Slug</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="handleToggleStatus(city)"
                      >
                        <Power class="h-3.5 w-3.5 text-slate-400" />
                        <span>{{ city.status === 'active' || city.isActive ? 'Deactivate City' : 'Activate City' }}</span>
                      </button>

                      <div class="my-1 border-t border-slate-100"></div>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        @click="openDeleteModal(city)"
                      >
                        <Trash2 class="h-3.5 w-3.5 text-red-500" />
                        <span>Delete City</span>
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
            <h3 class="text-base font-semibold text-slate-900">No cities found</h3>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              No cities match your search query or filters. Try resetting your search, or add a
              new city to get started.
            </p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="cityStore.resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <PaginationBar
        v-if="cityStore.filteredCities.length > 0"
        :page="cityStore.page"
        :per-page="cityStore.perPage"
        :total-items="cityStore.filteredCities.length"
        item-label="cities"
        @update:page="cityStore.page = $event"
        @update:per-page="cityStore.perPage = $event"
      />
    </div>

    <!-- Modals -->
    <CityDetailModal
      v-model="isDetailModalOpen"
      :city="selectedCityDetail"
      @edit="openEditModal"
      @toggle-status="handleToggleStatus"
    />

    <AddEditCityModal
      v-model="isAddEditModalOpen"
      :city-to-edit="cityToEdit"
      @save="handleSaveCity"
    />

    <DeleteCityModal
      v-model="isDeleteModalOpen"
      :city="cityToDelete"
      @confirm-delete="handleDeleteCity"
    />
  </div>
</template>
