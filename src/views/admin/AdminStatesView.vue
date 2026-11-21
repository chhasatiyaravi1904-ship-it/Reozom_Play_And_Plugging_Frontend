<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
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


import { useStateStore } from '@/stores/state'
import { useToastStore } from '@/stores/toast'
import type { StateItem, StateDetail, CreateStatePayload } from '@/types/state'
import StateDetailModal from '@/components/admin/StateDetailModal.vue'
import AddEditStateModal from '@/components/admin/AddEditStateModal.vue'
import DeleteStateModal from '@/components/admin/DeleteStateModal.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'

const stateStore = useStateStore()
const toast = useToastStore()

// Modals
const isDetailModalOpen = ref(false)
const selectedStateDetail = ref<StateDetail | null>(null)

const isAddEditModalOpen = ref(false)
const stateToEdit = ref<StateItem | null>(null)

const isDeleteModalOpen = ref(false)
const stateToDelete = ref<StateItem | null>(null)

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
  await stateStore.fetchStates()
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
})

// Handlers
async function handleRefresh() {
  await stateStore.fetchStates()
  toast.info('State jurisdictions refreshed.')
}

async function openDetailModal(stateItem: StateItem) {
  openDropdownId.value = null
  selectedStateDetail.value = { ...stateItem } as StateDetail
  isDetailModalOpen.value = true
  try {
    const detail = await stateStore.fetchState(stateItem.id)
    if (detail) {
      selectedStateDetail.value = { ...detail }
    }
  } catch {
    // Keep stateItem if network error
  }
}


function openAddModal() {
  stateToEdit.value = null
  isAddEditModalOpen.value = true
}

function openEditModal(stateItem: StateItem) {
  stateToEdit.value = stateItem
  isAddEditModalOpen.value = true
  openDropdownId.value = null
}

function openDeleteModal(stateItem: StateItem) {
  stateToDelete.value = stateItem
  isDeleteModalOpen.value = true
  openDropdownId.value = null
}

async function handleSaveState(payload: CreateStatePayload) {
  if (stateToEdit.value) {
    const updated = await stateStore.updateState(stateToEdit.value.id, payload)
    if (updated) {
      toast.success(`State ${updated.name} (${updated.code}) was updated.`)
    } else if (stateStore.error) {
      toast.error(stateStore.error)
    }
  } else {
    const created = await stateStore.createState(payload)
    if (created) {
      toast.success(`State ${created.name} (${created.code}) was added to jurisdiction list.`)
    } else if (stateStore.error) {
      toast.error(stateStore.error)
    }
  }
}


async function handleToggleStatus(stateItem: StateItem | StateDetail) {
  openDropdownId.value = null
  const success = await stateStore.toggleStatus(stateItem.id)
  if (success) {
    const current = stateStore.states.find((s) => s.id === stateItem.id)
    toast.info(`State ${stateItem.name} is now ${current?.status || 'updated'}.`)
  }
}

async function handleDeleteState(stateItem: StateItem) {
  const success = await stateStore.deleteState(stateItem.id)
  if (success) {
    toast.success(`State ${stateItem.name} was removed.`)
  }
}

function toggleSort(field: string) {
  if (stateStore.sortBy === field) {
    stateStore.sortOrder = stateStore.sortOrder === 'asc' ? 'desc' : 'asc'
  } else {
    stateStore.sortBy = field
    stateStore.sortOrder = 'asc'
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
        <span class="font-semibold text-slate-800">States</span>
      </nav>

      <!-- Main Header Row -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">States</h1>
          <p class="mt-1 text-sm text-slate-500">
            Manage operational state jurisdictions, county routing, and MLS associations.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Refresh state list"
            @click="handleRefresh"
          >
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': stateStore.status === 'loading' }" />
            <span class="ml-1.5 hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" />
            <span>Add State</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main States Card -->
    <div class="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-shadow">
      <!-- Filter Toolbar -->
      <div class="border-b border-slate-200/80 bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <!-- Search & Status dropdown -->
          <div class="flex flex-1 flex-wrap items-center gap-3">
            <!-- Search -->
            <div class="relative w-full sm:w-72">
              <Search class="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                v-model="stateStore.searchQuery"
                type="text"
                placeholder="Search state name, code, or slug..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
              <button
                v-if="stateStore.searchQuery"
                type="button"
                class="absolute inset-y-0 right-0 my-auto mr-2.5 text-xs text-slate-400 hover:text-slate-700"
                @click="stateStore.searchQuery = ''"
              >
                ✕
              </button>
            </div>

            <!-- Status Filter -->
            <div class="relative min-w-[130px]">
              <select
                v-model="stateStore.statusFilter"
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
              v-if="stateStore.searchQuery || stateStore.statusFilter !== 'all'"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
              @click="stateStore.resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- States Table Section -->
      <div class="relative overflow-x-auto">
        <!-- Skeleton Loading -->
        <div v-if="stateStore.status === 'loading'" class="divide-y divide-slate-100">
          <SkeletonTable :rows="5" :columns="5" />
        </div>

        <!-- Table View -->
        <table v-else-if="stateStore.filteredStates.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none">
              <!-- State Name -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('name')"
              >
                <div class="flex items-center gap-1.5">
                  <span>State Name</span>
                  <component
                    :is="stateStore.sortBy === 'name' ? (stateStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="stateStore.sortBy === 'name' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Code (Separate Column) -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('code')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Code</span>
                  <component
                    :is="stateStore.sortBy === 'code' ? (stateStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="stateStore.sortBy === 'code' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Slug -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('slug')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Slug</span>
                  <component
                    :is="stateStore.sortBy === 'slug' ? (stateStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="stateStore.sortBy === 'slug' ? 'text-[#0f6b5c]' : 'text-slate-400'"
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
                    :is="stateStore.sortBy === 'status' ? (stateStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="stateStore.sortBy === 'status' ? 'text-[#0f6b5c]' : 'text-slate-400'"
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
              v-for="state in stateStore.paginatedStates"
              :key="state.id"
              class="group transition-colors hover:bg-slate-50/80"
            >
              <!-- State Name Column -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div
                  class="flex items-center gap-2.5 cursor-pointer"
                  @click="openDetailModal(state)"
                >
                  <p class="text-sm font-semibold text-slate-900 group-hover:text-[#0f6b5c] transition-colors leading-snug truncate">
                    {{ state.name }}
                  </p>
                </div>
              </td>

              <!-- Code Column (Separate) -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <span
                  class="inline-flex h-7 w-9 items-center justify-center rounded-md bg-teal-50 font-mono font-bold text-xs text-[#0f6b5c] ring-1 ring-teal-600/20"
                >
                  {{ state.code }}
                </span>
              </td>

              <!-- Slug Column -->
              <td class="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-slate-600">
                <span class="rounded bg-slate-100 px-2 py-1 font-medium text-slate-700">
                  {{ state.slug || state.name.toLowerCase().replace(/\s+/g, '-') }}
                </span>
              </td>

              <!-- Status (Toggle Switch Only) -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="state.status === 'active' || state.isActive === true"
                  class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/30"
                  :class="state.status === 'active' || state.isActive === true ? 'bg-[#0f6b5c]' : 'bg-slate-300'"
                  :title="state.status === 'active' || state.isActive ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'"
                  @click="handleToggleStatus(state)"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
                    :class="state.status === 'active' || state.isActive === true ? 'translate-x-4' : 'translate-x-0'"
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
                    title="View state details (GET /states/{id})"
                    @click="openDetailModal(state)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </button>

                  <!-- Quick Edit Button -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit state & slug"
                    @click="openEditModal(state)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>

                  <!-- More Dropdown -->
                  <div class="relative">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      :class="{ 'bg-slate-100 text-slate-800': openDropdownId === state.id }"
                      aria-label="More actions"
                      @click="toggleDropdown(state.id, $event)"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </button>

                    <!-- Dropdown Panel -->
                    <div
                      v-if="openDropdownId === state.id"
                      class="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg ring-1 ring-black/5"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openDetailModal(state)"
                      >
                        <Eye class="h-3.5 w-3.5 text-slate-400" />
                        <span>State Detail API</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openEditModal(state)"
                      >
                        <Pencil class="h-3.5 w-3.5 text-slate-400" />
                        <span>Edit State / Slug</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="handleToggleStatus(state)"
                      >
                        <Power class="h-3.5 w-3.5 text-slate-400" />
                        <span>{{ state.status === 'active' || state.isActive ? 'Deactivate State' : 'Activate State' }}</span>
                      </button>

                      <div class="my-1 border-t border-slate-100"></div>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        @click="openDeleteModal(state)"
                      >
                        <Trash2 class="h-3.5 w-3.5 text-red-500" />
                        <span>Delete State</span>
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
            <h3 class="text-base font-semibold text-slate-900">No states found</h3>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              No states match your search query or status filter. Try resetting your search.
            </p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="stateStore.resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <PaginationBar
        v-if="stateStore.filteredStates.length > 0"
        :page="stateStore.page"
        :per-page="stateStore.perPage"
        :total-items="stateStore.filteredStates.length"
        item-label="jurisdictions"
        @update:page="stateStore.page = $event"
        @update:per-page="stateStore.perPage = $event"
      />
    </div>



    <!-- Modals -->
    <StateDetailModal
      v-model="isDetailModalOpen"
      :state="selectedStateDetail"
      @edit="openEditModal"
      @toggle-status="handleToggleStatus"
    />

    <AddEditStateModal
      v-model="isAddEditModalOpen"
      :state-to-edit="stateToEdit"
      @save="handleSaveState"
    />

    <DeleteStateModal
      v-model="isDeleteModalOpen"
      :state="stateToDelete"
      @confirm-delete="handleDeleteState"
    />
  </div>
</template>

