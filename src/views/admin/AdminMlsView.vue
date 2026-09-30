<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Network,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from 'lucide-vue-next'

import { useMlsStore } from '@/stores/mls'
import { useToastStore } from '@/stores/toast'
import type { MlsDirectoryItem, CreateMlsDirectoryPayload } from '@/types/mls'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import ActionMenu from '@/components/ui/ActionMenu.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import MlsDirectoryDetailModal from '@/components/admin/MlsDirectoryDetailModal.vue'
import AddEditMlsDirectoryModal from '@/components/admin/AddEditMlsDirectoryModal.vue'
import DeleteMlsDirectoryModal from '@/components/admin/DeleteMlsDirectoryModal.vue'

const mlsStore = useMlsStore()
const toast = useToastStore()

// Modals
const isDetailModalOpen = ref(false)
const detailDirectoryId = ref<number | null>(null)

const isAddEditModalOpen = ref(false)
const directoryToEdit = ref<MlsDirectoryItem | null>(null)

const isDeleteModalOpen = ref(false)
const directoryToDelete = ref<MlsDirectoryItem | null>(null)

onMounted(() => {
  mlsStore.fetchDirectories()
})

async function handleRefresh() {
  await mlsStore.fetchDirectories()
  toast.info('MLS directories refreshed.')
}

function openDetailModal(directory: MlsDirectoryItem) {
  detailDirectoryId.value = directory.id
  isDetailModalOpen.value = true
}

function openAddModal() {
  directoryToEdit.value = null
  isAddEditModalOpen.value = true
}

function openEditModal(directory: MlsDirectoryItem) {
  directoryToEdit.value = directory
  isAddEditModalOpen.value = true
}

function openDeleteModal(directory: MlsDirectoryItem) {
  directoryToDelete.value = directory
  isDeleteModalOpen.value = true
}

async function handleSaveDirectory(payload: CreateMlsDirectoryPayload) {
  if (directoryToEdit.value) {
    const updated = await mlsStore.updateDirectory(directoryToEdit.value.id, payload)
    if (updated) {
      toast.success(`MLS directory "${updated.title}" was updated.`)
    } else if (mlsStore.error) {
      toast.error(mlsStore.error)
    }
  } else {
    const created = await mlsStore.createDirectory(payload)
    if (created) {
      toast.success(`MLS directory "${created.title}" was created.`)
    } else if (mlsStore.error) {
      toast.error(mlsStore.error)
    }
  }
}

async function handleDeleteDirectory(directory: MlsDirectoryItem) {
  const success = await mlsStore.deleteDirectory(directory.id)
  if (success) {
    toast.success(`MLS directory "${directory.title}" was removed.`)
  } else if (mlsStore.error) {
    toast.error(mlsStore.error)
  }
}

function getActionMenuItems() {
  return [
    { label: 'Manage Infos', icon: Eye, value: 'manage' },
    { label: 'Edit Directory', icon: Pencil, value: 'edit' },
    { label: 'Delete Directory', icon: Trash2, value: 'delete', destructive: true },
  ]
}

function handleActionSelect(value: string, directory: MlsDirectoryItem) {
  switch (value) {
    case 'manage':
      openDetailModal(directory)
      break
    case 'edit':
      openEditModal(directory)
      break
    case 'delete':
      openDeleteModal(directory)
      break
  }
}

function toggleSort(field: string) {
  if (mlsStore.sortBy === field) {
    mlsStore.sortOrder = mlsStore.sortOrder === 'asc' ? 'desc' : 'asc'
  } else {
    mlsStore.sortBy = field
    mlsStore.sortOrder = 'asc'
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="space-y-2">
      <Breadcrumb :items="[{ label: 'Admin' }, { label: 'Reference Data' }, { label: 'MLS' }]" />

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-fg">MLS</h1>
          <p class="mt-1 text-sm text-fg-muted">
            Manage MLS directories and the country/website coverage info under each.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <BaseButton variant="secondary" size="sm" title="Refresh directory list" @click="handleRefresh">
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': mlsStore.status === 'loading' }" />
            <span class="ml-1.5 hidden sm:inline">Refresh</span>
          </BaseButton>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
            @click="openAddModal"
          >
            <Plus class="h-4 w-4" />
            <span>Add Directory</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      <!-- Filter Toolbar -->
      <div class="border-b border-border bg-surface p-4 sm:p-5">
        <div class="flex items-center gap-2.5">
          <div class="w-full sm:w-72">
            <SearchInput v-model="mlsStore.searchQuery" placeholder="Search directory title..." />
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="relative overflow-x-auto">
        <!-- Skeleton Loading -->
        <div v-if="mlsStore.status === 'loading'" class="divide-y divide-border">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between gap-4 p-4 animate-pulse">
            <div class="h-4 w-48 rounded bg-border"></div>
            <div class="h-4 w-16 rounded bg-border"></div>
            <div class="h-4 w-28 rounded bg-border"></div>
            <div class="flex gap-2">
              <div class="h-7 w-7 rounded bg-border"></div>
              <div class="h-7 w-7 rounded bg-border"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <ErrorState
          v-else-if="mlsStore.status === 'error'"
          title="Couldn't load MLS directories"
          :description="mlsStore.error || undefined"
          class="m-4 sm:m-6"
        >
          <template #action>
            <BaseButton variant="secondary" size="sm" @click="mlsStore.fetchDirectories">
              <RefreshCw class="h-3 w-3" />
              <span class="ml-1.5">Retry</span>
            </BaseButton>
          </template>
        </ErrorState>

        <!-- Table View -->
        <table v-else-if="mlsStore.paginatedDirectories.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-surface-raised text-[11px] font-semibold uppercase tracking-wider text-fg-muted select-none">
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('title')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Directory Title</span>
                  <component
                    :is="mlsStore.sortBy === 'title' ? (mlsStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="mlsStore.sortBy === 'title' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <th scope="col" class="px-4 py-3.5">
                <span>Info Entries</span>
              </th>

              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('createdAt')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Created</span>
                  <component
                    :is="mlsStore.sortBy === 'createdAt' ? (mlsStore.sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="mlsStore.sortBy === 'createdAt' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <th scope="col" class="px-4 py-3.5 text-right">
                <span class="sr-only">Actions</span>
                <span class="pr-2">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border bg-surface text-xs">
            <tr
              v-for="directory in mlsStore.paginatedDirectories"
              :key="directory.id"
              class="group transition-colors hover:bg-surface-raised"
            >
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2.5 cursor-pointer" @click="openDetailModal(directory)">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Network class="h-4 w-4" />
                  </div>
                  <p class="text-sm font-semibold text-fg group-hover:text-primary transition-colors leading-snug truncate">
                    {{ directory.title }}
                  </p>
                </div>
              </td>

              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">
                {{ directory.infosCount ?? 0 }}
              </td>

              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">
                {{ directory.createdAt ? new Date(directory.createdAt).toLocaleDateString() : '—' }}
              </td>

              <td class="px-4 py-3.5 whitespace-nowrap text-right">
                <div class="inline-flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-raised hover:text-fg transition-colors"
                    title="Edit directory"
                    @click="openEditModal(directory)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>

                  <ActionMenu :items="getActionMenuItems()" @select="(value) => handleActionSelect(value, directory)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty States -->
        <div v-else class="p-4 sm:p-6">
          <EmptyState
            v-if="mlsStore.searchQuery"
            :icon="FilterX"
            title="No directories found"
            description="No MLS directories match your search. Try a different search term."
          >
            <template #action>
              <BaseButton variant="secondary" size="sm" @click="mlsStore.resetFilters">Clear Search</BaseButton>
            </template>
          </EmptyState>

          <EmptyState
            v-else
            :icon="Network"
            title="No MLS directories yet"
            description="Create your first MLS directory, then add its country and website coverage info."
          >
            <template #action>
              <button
                type="button"
                class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
                @click="openAddModal"
              >
                <Plus class="h-4 w-4" />
                <span>Add Directory</span>
              </button>
            </template>
          </EmptyState>
        </div>
      </div>

      <!-- Pagination -->
      <PaginationBar
        v-if="mlsStore.status !== 'error' && mlsStore.filteredDirectories.length > 0"
        :page="mlsStore.page"
        :per-page="mlsStore.perPage"
        :total-items="mlsStore.filteredDirectories.length"
        item-label="directories"
        @update:page="mlsStore.page = $event"
        @update:per-page="mlsStore.perPage = $event"
      />
    </div>

    <!-- Modals -->
    <MlsDirectoryDetailModal v-model="isDetailModalOpen" :directory-id="detailDirectoryId" />

    <AddEditMlsDirectoryModal
      v-model="isAddEditModalOpen"
      :directory-to-edit="directoryToEdit"
      @save="handleSaveDirectory"
    />

    <DeleteMlsDirectoryModal
      v-model="isDeleteModalOpen"
      :directory="directoryToDelete"
      @confirm-delete="handleDeleteDirectory"
    />
  </div>
</template>
