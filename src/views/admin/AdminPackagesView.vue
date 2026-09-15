<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Package as PackageIcon,
  Plus,
  Pencil,
  Trash2,
  Power,
  FilterX,
  RefreshCw,
} from 'lucide-vue-next'
import * as packageService from '@/services/packageService'
import { isNetworkError } from '@/services/api'
import { useToastStore } from '@/stores/toast'
import type { PackageItem, CreatePackagePayload, PackageListResponse } from '@/types/package'
import PageHeader from '@/components/ui/PageHeader.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import ActionMenu from '@/components/ui/ActionMenu.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import AddEditPackageModal from '@/components/admin/AddEditPackageModal.vue'

const toast = useToastStore()

const packages = ref<PackageItem[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active Only', value: 'active' },
  { label: 'Inactive Only', value: 'inactive' },
]

function extractItems(payload: PackageListResponse | PackageItem[] | undefined): PackageItem[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

function extractRecord(payload: any): PackageItem {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.data) {
    return payload.data
  }
  return payload
}

function apiErrorMessage(err: any, fallback: string): string {
  const errors = err?.response?.data?.errors
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0]
    const firstMsg = firstKey !== undefined ? errors[firstKey] : null
    if (firstMsg) return Array.isArray(firstMsg) ? firstMsg[0] : String(firstMsg)
  }
  return err?.response?.data?.message || fallback
}

async function fetchPackages() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await packageService.fetchAdminPackages({ per_page: 100 })
    packages.value = extractItems(response.data)
  } catch (err) {
    loadError.value = isNetworkError(err)
      ? 'Unable to reach the API. Please verify the backend is running.'
      : 'Unable to load packages.'
    toast.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchPackages)

const filteredPackages = computed(() => {
  return packages.value
    .filter((pkg) => {
      if (statusFilter.value !== 'all') {
        const wantActive = statusFilter.value === 'active'
        if (pkg.isActive !== wantActive) return false
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        if (!pkg.name.toLowerCase().includes(q) && !pkg.slug.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => a.sortOrder - b.sortOrder)
})

// Modals
const isAddEditModalOpen = ref(false)
const packageToEdit = ref<PackageItem | null>(null)

const isDeleteModalOpen = ref(false)
const packageToDelete = ref<PackageItem | null>(null)
const isDeleting = ref(false)

function openAddModal() {
  packageToEdit.value = null
  isAddEditModalOpen.value = true
}

function openEditModal(pkg: PackageItem) {
  packageToEdit.value = pkg
  isAddEditModalOpen.value = true
}

function openDeleteModal(pkg: PackageItem) {
  packageToDelete.value = pkg
  isDeleteModalOpen.value = true
}

async function handleSave(payload: CreatePackagePayload) {
  if (packageToEdit.value) {
    const editId = packageToEdit.value.id
    try {
      const response = await packageService.updatePackage(editId, payload)
      const updated = extractRecord(response.data)
      const idx = packages.value.findIndex((p) => p.id === editId)
      if (idx !== -1) packages.value[idx] = updated
      toast.success(`Package ${updated.name} was updated.`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to update package.'))
    }
  } else {
    try {
      const response = await packageService.createPackage(payload)
      const created = extractRecord(response.data)
      packages.value.push(created)
      toast.success(`Package ${created.name} was created.`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to create package.'))
    }
  }
}

async function toggleActive(pkg: PackageItem) {
  try {
    const response = await packageService.updatePackage(pkg.id, { isActive: !pkg.isActive })
    const updated = extractRecord(response.data)
    const idx = packages.value.findIndex((p) => p.id === pkg.id)
    if (idx !== -1) packages.value[idx] = updated
    toast.info(`Package ${pkg.name} is now ${updated.isActive ? 'active' : 'inactive'}.`)
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to update status.'))
  }
}

async function handleDelete() {
  if (!packageToDelete.value) return
  isDeleting.value = true
  try {
    await packageService.deletePackage(packageToDelete.value.id)
    packages.value = packages.value.filter((p) => p.id !== packageToDelete.value!.id)
    toast.success(`Package ${packageToDelete.value.name} was removed.`)
    isDeleteModalOpen.value = false
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete package.'))
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb :items="[{ label: 'Admin' }, { label: 'Packages' }]" />

    <PageHeader title="Packages" description="Manage the packages agents can select after verifying their account.">
      <template #actions>
        <div class="flex items-center gap-2.5">
          <BaseButton variant="secondary" size="sm" @click="fetchPackages">
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
            <span class="ml-1.5">Refresh</span>
          </BaseButton>
          <BaseButton size="sm" @click="openAddModal">
            <Plus class="h-4 w-4" />
            <span class="ml-1.5">Add Package</span>
          </BaseButton>
        </div>
      </template>
    </PageHeader>

    <div class="rounded-xl border border-border bg-surface">
      <div class="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="w-full sm:w-72">
            <SearchInput v-model="searchQuery" placeholder="Search package name or slug..." />
          </div>
          <div class="min-w-[150px]">
            <FilterSelect v-model="statusFilter" :options="statusOptions" label="Filter by status" />
          </div>
        </div>
      </div>

      <div class="p-4">
        <LoadingState v-if="isLoading" label="Loading packages" :rows="3" />
        <ErrorState v-else-if="loadError" :description="loadError" @retry="fetchPackages">
          <template #action>
            <BaseButton variant="secondary" @click="fetchPackages">Try again</BaseButton>
          </template>
        </ErrorState>

        <div v-else-if="filteredPackages.length > 0" class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-border text-[11px] font-semibold tracking-wider text-fg-muted uppercase">
                <th class="px-3 py-3">Name</th>
                <th class="px-3 py-3">Slug</th>
                <th class="px-3 py-3">Duration</th>
                <th class="px-3 py-3">Price</th>
                <th class="px-3 py-3">Status</th>
                <th class="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-sm">
              <tr v-for="pkg in filteredPackages" :key="pkg.id" class="hover:bg-surface-raised">
                <td class="px-3 py-3">
                  <p class="font-semibold text-fg">{{ pkg.name }}</p>
                  <p v-if="pkg.description" class="mt-0.5 max-w-xs truncate text-xs text-fg-muted">
                    {{ pkg.description }}
                  </p>
                </td>
                <td class="px-3 py-3 font-mono text-xs text-fg-muted">{{ pkg.slug }}</td>
                <td class="px-3 py-3 text-fg-muted">{{ pkg.durationDays }} days</td>
                <td class="px-3 py-3 text-fg-muted">{{ pkg.price ?? '—' }}</td>
                <td class="px-3 py-3">
                  <StatusBadge :status="pkg.isActive ? 'active' : 'inactive'" kind="user" />
                </td>
                <td class="px-3 py-3 text-right">
                  <ActionMenu
                    :items="[
                      { label: 'Edit Package', icon: Pencil, value: 'edit' },
                      {
                        label: pkg.isActive ? 'Deactivate' : 'Activate',
                        icon: Power,
                        value: 'toggle',
                      },
                      { label: 'Delete Package', icon: Trash2, value: 'delete', destructive: true },
                    ]"
                    @select="
                      (value) => {
                        if (value === 'edit') openEditModal(pkg)
                        if (value === 'toggle') toggleActive(pkg)
                        if (value === 'delete') openDeleteModal(pkg)
                      }
                    "
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState
          v-else
          title="No packages found"
          description="No packages match your search or filter."
          :icon="FilterX"
        >
          <template #action>
            <BaseButton variant="secondary" size="sm" @click="openAddModal">
              <PackageIcon class="h-3.5 w-3.5" />
              <span class="ml-1.5">Add your first package</span>
            </BaseButton>
          </template>
        </EmptyState>
      </div>
    </div>

    <AddEditPackageModal v-model="isAddEditModalOpen" :package-to-edit="packageToEdit" @save="handleSave" />

    <ConfirmDialog
      v-model="isDeleteModalOpen"
      title="Delete Package"
      confirm-label="Delete Package"
      tone="danger"
      :loading="isDeleting"
      @confirm="handleDelete"
    >
      Are you sure you want to delete
      <span class="font-semibold text-fg">{{ packageToDelete?.name }}</span>? This can't be undone,
      and only succeeds if no agent has selected this package yet.
    </ConfirmDialog>
  </div>
</template>
