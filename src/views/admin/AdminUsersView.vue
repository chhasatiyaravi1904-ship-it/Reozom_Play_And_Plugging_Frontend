<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Users as UsersIcon,
  UserPlus,
  Eye,
  Pencil,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  BadgeCheck,
  CircleAlert,
} from 'lucide-vue-next'
import type { AdminUserItem, AdminUserRole } from '@/services/adminUsersData'
import * as userService from '@/services/userService'
import { isNetworkError } from '@/services/api'
import UserRoleBadge from '@/components/admin/UserRoleBadge.vue'
import UserAvatar from '@/components/admin/UserAvatar.vue'
import AddEditUserModal from '@/components/admin/AddEditUserModal.vue'
import ViewUserModal from '@/components/admin/ViewUserModal.vue'
import ChangeRoleModal from '@/components/admin/ChangeRoleModal.vue'
import DeleteUserModal from '@/components/admin/DeleteUserModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import FilterSelect from '@/components/ui/FilterSelect.vue'
import FilterChips from '@/components/ui/FilterChips.vue'
import ActionMenu from '@/components/ui/ActionMenu.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

const toast = useToastStore()
const authStore = useAuthStore()

function isSelf(user: AdminUserItem): boolean {
  return authStore.user?.id === user.id
}

// State
const users = ref<AdminUserItem[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)

function timeAgo(iso?: string | null): string {
  if (!iso) return 'Never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString()
}

/** Normalize a raw API user record into the shape the table/modals expect. */
function normalizeUser(raw: any): AdminUserItem {
  const isActive = raw.isActive !== undefined ? Boolean(raw.isActive) : true
  return {
    id: raw.id,
    fullName: raw.fullName || raw.name || '',
    email: raw.email || '',
    phone: raw.phone || '',
    role: raw.role,
    isActive,
    status: isActive ? 'active' : 'inactive',
    joinedDate: (raw.createdAt || raw.created_at || '').slice(0, 10),
    location: raw.location || null,
    lastActive: timeAgo(raw.lastActiveAt || raw.last_active_at),
    listingsCount: raw.listingsCount ?? raw.listings_count ?? 0,
    emailVerified: raw.emailVerified,
  }
}

function extractItems(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.items)) return payload.items
    if (Array.isArray(payload.data)) return payload.data
  }
  return []
}

function extractRecord(payload: any): any {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === 'object') return payload.data
  }
  return payload
}

function firstValidationError(err: any): string | null {
  const errors = err?.response?.data?.errors
  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0]
    if (firstKey === undefined) return null
    const firstMsg = errors[firstKey]
    return Array.isArray(firstMsg) ? firstMsg[0] : String(firstMsg)
  }
  return null
}

function apiErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.message || firstValidationError(err) || fallback
}

async function fetchUsers() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await userService.fetchUsers({ per_page: 100 })
    users.value = extractItems(response.data).map(normalizeUser)
  } catch (err) {
    if (isNetworkError(err)) {
      loadError.value = 'Unable to reach the API. Please verify the backend is running.'
    } else {
      loadError.value = 'Unable to load users.'
    }
    toast.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

// Tabs
type RoleFilterTab = 'all' | AdminUserRole | 'unverified-agent'
const activeTab = ref<RoleFilterTab>('all')

const roleTabs: { label: string; value: RoleFilterTab }[] = [
  { label: 'All Users', value: 'all' },
  { label: 'Admins', value: 'admin' },
  { label: 'Agents', value: 'agent' },
  { label: 'Sellers', value: 'seller' },
  { label: 'Buyers', value: 'buyer' },
  { label: 'Unverified Agents', value: 'unverified-agent' },
]

// Tab counts (computed dynamically from all users)
const tabCounts = computed(() => {
  const counts = {
    all: users.value.length,
    admin: 0,
    agent: 0,
    seller: 0,
    buyer: 0,
    'unverified-agent': 0,
  }
  for (const u of users.value) {
    if (u.role in counts) {
      counts[u.role]++
    }
    if (u.role === 'agent' && !u.emailVerified) {
      counts['unverified-agent']++
    }
  }
  return counts
})

const roleTabsWithCounts = computed(() =>
  roleTabs.map((tab) => ({ ...tab, count: tabCounts.value[tab.value] })),
)

function onTabChange(value: string) {
  activeTab.value = value as RoleFilterTab
}

// Filters
const searchQuery = ref('')
const selectedRole = ref<string>('all')
const selectedStatus = ref<string>('all')
const selectedDateRange = ref<string>('all')

const roleFilterOptions = [
  { label: 'All Roles', value: 'all' },
  { label: 'Admin', value: 'admin' },
  { label: 'Agent', value: 'agent' },
  { label: 'Seller', value: 'seller' },
  { label: 'Buyer', value: 'buyer' },
]
const statusFilterOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]
const dateRangeLabels: Record<string, string> = {
  last30: 'Last 30 Days',
  last90: 'Last 90 Days',
  '2026': 'Year 2026',
  '2025': 'Year 2025',
  '2024': 'Year 2024',
}
const dateRangeFilterOptions = [
  { label: 'Select date range', value: 'all' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'Last 90 Days', value: 'last90' },
  { label: 'Year 2026', value: '2026' },
  { label: 'Year 2025', value: '2025' },
  { label: 'Year 2024', value: '2024' },
]

// Sync tab changes to role filter dropdown. "Unverified Agents" is a
// role+verification compound filter, not a real role value — point the
// dropdown at "agent" and let the tab-specific clause in filteredUsers
// narrow it further.
watch(activeTab, (newTab) => {
  selectedRole.value = newTab === 'unverified-agent' ? 'agent' : newTab
})

watch(selectedRole, (newRole) => {
  // The "Unverified Agents" tab drives selectedRole to "agent" itself (see
  // above) — don't let that echo back and downgrade the tab to plain "Agents".
  if (activeTab.value === 'unverified-agent' && newRole === 'agent') return

  if (['all', 'admin', 'agent', 'seller', 'buyer'].includes(newRole)) {
    activeTab.value = newRole as RoleFilterTab
  }
})

// Removable filter chips (role/status/date-range — search has its own inline clear)
const activeChips = computed(() => {
  const chips: { key: string; label: string }[] = []
  if (selectedRole.value !== 'all') {
    chips.push({ key: 'role', label: `Role: ${selectedRole.value.charAt(0).toUpperCase()}${selectedRole.value.slice(1)}` })
  }
  if (selectedStatus.value !== 'all') {
    chips.push({ key: 'status', label: `Status: ${selectedStatus.value.charAt(0).toUpperCase()}${selectedStatus.value.slice(1)}` })
  }
  if (selectedDateRange.value !== 'all') {
    chips.push({ key: 'dateRange', label: dateRangeLabels[selectedDateRange.value] || selectedDateRange.value })
  }
  return chips
})

function removeChip(key: string) {
  if (key === 'role') selectedRole.value = 'all'
  if (key === 'status') selectedStatus.value = 'all'
  if (key === 'dateRange') selectedDateRange.value = 'all'
}

function clearChips() {
  selectedRole.value = 'all'
  selectedStatus.value = 'all'
  selectedDateRange.value = 'all'
}

// Sorting
type SortField = 'fullName' | 'role' | 'status' | 'email' | 'joinedDate'
const sortField = ref<SortField>('joinedDate')
const sortDirection = ref<'asc' | 'desc'>('desc')

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)

onMounted(() => {
  fetchUsers()
})

// Modals state
const isAddEditModalOpen = ref(false)
const userToEdit = ref<AdminUserItem | null>(null)

const isViewModalOpen = ref(false)
const userToView = ref<AdminUserItem | null>(null)

const isChangeRoleModalOpen = ref(false)
const userToChangeRole = ref<AdminUserItem | null>(null)

const isDeleteModalOpen = ref(false)
const userToDelete = ref<AdminUserItem | null>(null)

// Actions handlers
function openAddUserModal() {
  userToEdit.value = null
  isAddEditModalOpen.value = true
}

function openEditUserModal(user: AdminUserItem) {
  userToEdit.value = user
  isAddEditModalOpen.value = true
}

function openViewUserModal(user: AdminUserItem) {
  userToView.value = user
  isViewModalOpen.value = true
}

function openChangeRoleModal(user: AdminUserItem) {
  userToChangeRole.value = user
  isChangeRoleModalOpen.value = true
}

function openDeleteUserModal(user: AdminUserItem) {
  userToDelete.value = user
  isDeleteModalOpen.value = true
}

async function handleSaveUser(userData: Partial<AdminUserItem> & { password?: string }) {
  const payload = {
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: userData.role,
    location: userData.location || undefined,
    isActive: userData.status ? userData.status === 'active' : undefined,
  }

  if (userToEdit.value) {
    const editId = userToEdit.value.id
    try {
      const response = await userService.updateUser(editId, payload)
      const updated = normalizeUser(extractRecord(response.data))
      const idx = users.value.findIndex((u) => u.id === editId)
      if (idx !== -1) users.value[idx] = updated
      toast.success(`User ${updated.fullName} was updated successfully.`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to update user.'))
    }
  } else {
    try {
      const response = await userService.createUser({
        fullName: payload.fullName || '',
        email: payload.email || '',
        phone: payload.phone,
        password: payload.password || '',
        role: payload.role || 'agent',
        location: payload.location,
        isActive: payload.isActive,
      })
      const created = normalizeUser(extractRecord(response.data))
      users.value.unshift(created)
      toast.success(`User ${created.fullName} was created.`)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Failed to create user.'))
    }
  }
}

async function handleRoleChanged(user: AdminUserItem, newRole: AdminUserRole) {
  try {
    const response = await userService.updateUser(user.id, { role: newRole })
    const updated = normalizeUser(extractRecord(response.data))
    const idx = users.value.findIndex((u) => u.id === user.id)
    if (idx !== -1) users.value[idx] = updated
    toast.success(`Role for ${user.fullName} changed to ${newRole}.`)
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to change role.'))
  }
}

const isStatusConfirmOpen = ref(false)
const userPendingStatusToggle = ref<AdminUserItem | null>(null)
const statusToggleLoading = ref(false)

function requestStatusToggle(user: AdminUserItem) {
  userPendingStatusToggle.value = user
  isStatusConfirmOpen.value = true
}

async function confirmStatusToggle() {
  const user = userPendingStatusToggle.value
  if (!user) return

  const newIsActive = !(user.status === 'active' || user.isActive)
  statusToggleLoading.value = true
  try {
    const response = await userService.toggleUserStatus(user.id, newIsActive)
    const updated = normalizeUser(extractRecord(response.data))
    const idx = users.value.findIndex((u) => u.id === user.id)
    if (idx !== -1) users.value[idx] = updated
    toast.info(`User ${user.fullName} is now ${updated.status}.`)
    isStatusConfirmOpen.value = false
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to update status.'))
  } finally {
    statusToggleLoading.value = false
  }
}

const isVerifyConfirmOpen = ref(false)
const userPendingVerification = ref<AdminUserItem | null>(null)
const verifyLoading = ref(false)

function requestAgentVerification(user: AdminUserItem) {
  userPendingVerification.value = user
  isVerifyConfirmOpen.value = true
}

async function confirmAgentVerification() {
  const user = userPendingVerification.value
  if (!user) return

  verifyLoading.value = true
  try {
    const response = await userService.verifyUserEmail(user.id)
    const updated = normalizeUser(extractRecord(response.data))
    const idx = users.value.findIndex((u) => u.id === user.id)
    if (idx !== -1) users.value[idx] = updated
    toast.success(`${user.fullName}'s email has been marked as verified.`)
    isVerifyConfirmOpen.value = false
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to verify user.'))
  } finally {
    verifyLoading.value = false
  }
}

async function handleDeleteUser(user: AdminUserItem) {
  try {
    await userService.deleteUser(user.id)
    users.value = users.value.filter((u) => u.id !== user.id)
    toast.success(`User ${user.fullName} was permanently removed.`)
  } catch (err) {
    toast.error(apiErrorMessage(err, 'Failed to delete user.'))
  }
}

function getActionMenuItems(user: AdminUserItem) {
  const items = [
    { label: 'View User', icon: Eye, value: 'view' },
    { label: 'Edit User', icon: Pencil, value: 'edit' },
    { label: 'Change Role', icon: Shield, value: 'changeRole' },
    {
      label: user.status === 'active' ? 'Deactivate User' : 'Activate User',
      icon: user.status === 'active' ? UserX : UserCheck,
      value: 'toggleStatus',
    },
    { label: 'Delete User', icon: Trash2, value: 'delete', destructive: true },
  ]

  // You can't deactivate or delete the account you're currently signed in
  // with — same guard the backend already enforces for delete.
  if (isSelf(user)) {
    return items.filter((item) => item.value !== 'toggleStatus' && item.value !== 'delete')
  }

  return items
}

function handleActionSelect(value: string, user: AdminUserItem) {
  switch (value) {
    case 'view':
      openViewUserModal(user)
      break
    case 'edit':
      openEditUserModal(user)
      break
    case 'changeRole':
      openChangeRoleModal(user)
      break
    case 'toggleStatus':
      requestStatusToggle(user)
      break
    case 'delete':
      openDeleteUserModal(user)
      break
  }
}

// Reset Filters
function resetFilters() {
  searchQuery.value = ''
  selectedRole.value = 'all'
  selectedStatus.value = 'all'
  selectedDateRange.value = 'all'
  activeTab.value = 'all'
}

const isFilterActive = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedRole.value !== 'all' ||
    selectedStatus.value !== 'all' ||
    selectedDateRange.value !== 'all' ||
    activeTab.value !== 'all'
  )
})

async function reloadUsers() {
  await fetchUsers()
  if (!loadError.value) toast.info('User directory refreshed.')
}

// Filtered & Sorted list
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    // Tab filter
    if (activeTab.value === 'unverified-agent') {
      if (user.role !== 'agent' || user.emailVerified) return false
    } else if (activeTab.value !== 'all' && user.role !== activeTab.value) {
      return false
    }

    // Role select filter
    if (selectedRole.value !== 'all' && user.role !== selectedRole.value) {
      return false
    }

    // Status filter
    if (selectedStatus.value !== 'all' && user.status !== selectedStatus.value) {
      return false
    }

    // Date Range filter
    if (selectedDateRange.value !== 'all') {
      const year = user.joinedDate.split('-')[0]
      if (selectedDateRange.value === '2026' && year !== '2026') return false
      if (selectedDateRange.value === '2025' && year !== '2025') return false
      if (selectedDateRange.value === '2024' && year !== '2024') return false

      if (selectedDateRange.value === 'last30') {
        const joined = new Date(user.joinedDate).getTime()
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        if (joined < thirtyDaysAgo) return false
      }
      if (selectedDateRange.value === 'last90') {
        const joined = new Date(user.joinedDate).getTime()
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000
        if (joined < ninetyDaysAgo) return false
      }
    }

    // Search query (fullName, email, phone)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = user.fullName.toLowerCase().includes(q)
      const matchEmail = user.email.toLowerCase().includes(q)
      const matchPhone = user.phone.includes(q)
      if (!matchName && !matchEmail && !matchPhone) {
        return false
      }
    }

    return true
  })
})

const sortedUsers = computed(() => {
  const list = [...filteredUsers.value]
  const field = sortField.value
  const dir = sortDirection.value === 'asc' ? 1 : -1

  return list.sort((a, b) => {
    let valA = a[field] || ''
    let valB = b[field] || ''

    if (typeof valA === 'string') valA = valA.toLowerCase()
    if (typeof valB === 'string') valB = valB.toLowerCase()

    if (valA < valB) return -1 * dir
    if (valA > valB) return 1 * dir
    return 0
  })
})

const totalUsers = computed(() => sortedUsers.value.length)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedUsers.value.slice(start, start + pageSize.value)
})

// Reset to page 1 whenever the filtered set or page size changes underneath the user
watch([searchQuery, selectedRole, selectedStatus, selectedDateRange, sortField, sortDirection, pageSize], () => {
  currentPage.value = 1
})

// Clamp page if it's now out of range (e.g. after a delete)
watch(totalUsers, (total) => {
  const maxPage = Math.max(1, Math.ceil(total / pageSize.value))
  if (currentPage.value > maxPage) currentPage.value = maxPage
})
</script>

<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="space-y-2">
      <Breadcrumb :items="[{ label: 'Admin' }, { label: 'Platform' }, { label: 'Users' }]" />

      <!-- Main Header Row -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-fg">Users</h1>
          <p class="mt-1 text-sm text-fg-muted">Manage admin, agent, seller, and buyer accounts.</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2.5">
          <BaseButton variant="secondary" size="sm" title="Refresh user list" @click="reloadUsers">
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
            <span class="ml-1.5 hidden sm:inline">Refresh</span>
          </BaseButton>

          <BaseButton variant="primary" @click="openAddUserModal">
            <UserPlus class="h-4 w-4" />
            <span class="ml-2">Add User</span>
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Main Card Container -->
    <div class="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      <!-- User Type Tabs with Counts -->
      <div class="border-b border-border px-4 sm:px-6 bg-surface-raised pt-2">
        <Tabs :tabs="roleTabsWithCounts" :model-value="activeTab" @update:model-value="onTabChange" />
      </div>

      <!-- Filter Toolbar -->
      <div class="border-b border-border bg-surface p-4 sm:p-5 space-y-3">
        <div class="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div class="lg:w-72">
            <SearchInput v-model="searchQuery" placeholder="Search by name, email or phone..." />
          </div>
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex lg:flex-1 lg:flex-wrap">
            <FilterSelect v-model="selectedRole" :options="roleFilterOptions" label="Filter by role" />
            <FilterSelect v-model="selectedStatus" :options="statusFilterOptions" label="Filter by status" />
            <FilterSelect v-model="selectedDateRange" :options="dateRangeFilterOptions" label="Filter by joined date" />
          </div>
        </div>

        <!-- Active filter chips & subtle reset -->
        <div v-if="activeChips.length > 0 || searchQuery" class="flex flex-wrap items-center justify-between gap-2">
          <FilterChips :chips="activeChips" @remove="removeChip" @clear="clearChips" />
          <button
            type="button"
            class="focus-ring text-xs font-medium text-fg-muted hover:text-fg transition-colors rounded-lg px-1"
            @click="resetFilters"
          >
            Reset all
          </button>
        </div>
      </div>

      <!-- Table Section -->
      <div class="relative overflow-x-auto">
        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="divide-y divide-border">
          <div v-for="i in 6" :key="i" class="flex items-center justify-between gap-4 p-4 animate-pulse">
            <!-- User col skeleton -->
            <div class="flex items-center gap-3 w-1/4">
              <div class="h-9 w-9 rounded-full bg-border"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 w-28 rounded bg-border"></div>
                <div class="h-2.5 w-16 rounded bg-surface-raised"></div>
              </div>
            </div>
            <!-- Role skeleton -->
            <div class="h-5 w-16 rounded bg-border"></div>
            <!-- Status skeleton -->
            <div class="h-3 w-14 rounded bg-border"></div>
            <!-- Email skeleton -->
            <div class="h-3 w-36 rounded bg-border"></div>
            <!-- Phone skeleton -->
            <div class="h-3 w-24 rounded bg-border"></div>
            <!-- Date skeleton -->
            <div class="h-3 w-20 rounded bg-border"></div>
            <!-- Actions skeleton -->
            <div class="flex gap-2">
              <div class="h-7 w-7 rounded bg-border"></div>
              <div class="h-7 w-7 rounded bg-border"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <ErrorState
          v-else-if="loadError"
          title="Couldn't load users"
          :description="loadError"
          class="m-4 sm:m-6"
        >
          <template #action>
            <BaseButton variant="secondary" size="sm" @click="fetchUsers">
              <RefreshCw class="h-3 w-3" />
              <span class="ml-1.5">Retry</span>
            </BaseButton>
          </template>
        </ErrorState>

        <!-- Users Table -->
        <table v-else-if="paginatedUsers.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-surface-raised text-[11px] font-semibold uppercase tracking-wider text-fg-muted select-none">
              <!-- User Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('fullName')"
              >
                <div class="flex items-center gap-1.5">
                  <span>User</span>
                  <component
                    :is="sortField === 'fullName' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'fullName' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <!-- Role Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('role')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Role</span>
                  <component
                    :is="sortField === 'role' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'role' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <!-- Status Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('status')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Status</span>
                  <component
                    :is="sortField === 'status' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'status' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <!-- Verified Column -->
              <th scope="col" class="px-4 py-3.5">
                <span>Verified</span>
              </th>

              <!-- Email Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('email')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Email</span>
                  <component
                    :is="sortField === 'email' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'email' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <!-- Phone Column -->
              <th scope="col" class="px-4 py-3.5">
                <span>Phone</span>
              </th>

              <!-- Joined Date Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-border/30"
                @click="toggleSort('joinedDate')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Joined Date</span>
                  <component
                    :is="sortField === 'joinedDate' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'joinedDate' ? 'text-primary' : 'text-fg-disabled'"
                  />
                </div>
              </th>

              <!-- Actions Column -->
              <th scope="col" class="px-4 py-3.5 text-right">
                <span class="sr-only">Actions</span>
                <span class="pr-2">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-border bg-surface text-xs">
            <tr v-for="user in paginatedUsers" :key="user.id" class="group transition-colors hover:bg-surface-raised">
              <!-- User Name & Avatar -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-3 cursor-pointer" @click="openViewUserModal(user)">
                  <UserAvatar :name="user.fullName" :role="user.role" size="md" />
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-fg group-hover:text-primary transition-colors leading-snug truncate">
                      {{ user.fullName }}
                    </p>
                    <p class="text-xs text-fg-muted truncate">{{ user.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Role Badge -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <UserRoleBadge :role="user.role" />
              </td>

              <!-- Status -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <ToggleSwitch
                    :model-value="user.status === 'active'"
                    :disabled="isSelf(user)"
                    :label="`Toggle active status for ${user.fullName}`"
                    :title="isSelf(user) ? 'You cannot deactivate your own account.' : undefined"
                    @update:model-value="requestStatusToggle(user)"
                  />
                  <span
                    class="text-xs font-medium"
                    :class="user.status === 'active' ? 'text-success' : 'text-fg-muted'"
                  >
                    {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </td>

              <!-- Verified -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1.5 text-xs font-medium"
                    :class="user.emailVerified ? 'text-success' : 'text-fg-muted'"
                    :title="user.emailVerified ? 'Email verified' : 'Email not verified yet'"
                  >
                    <component :is="user.emailVerified ? BadgeCheck : CircleAlert" class="h-3.5 w-3.5" />
                    {{ user.emailVerified ? 'Verified' : 'Not verified' }}
                  </span>
                  <button
                    v-if="!user.emailVerified && user.role === 'agent'"
                    type="button"
                    class="focus-ring rounded text-xs font-medium text-primary hover:underline"
                    @click="requestAgentVerification(user)"
                  >
                    Verify
                  </button>
                </div>
              </td>

              <!-- Email -->
              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">
                <a :href="`mailto:${user.email}`" class="hover:text-fg hover:underline transition-colors">
                  {{ user.email }}
                </a>
              </td>

              <!-- Phone -->
              <td class="px-4 py-3.5 whitespace-nowrap tabular-nums text-fg-muted">
                {{ user.phone }}
              </td>

              <!-- Joined Date -->
              <td class="px-4 py-3.5 whitespace-nowrap text-fg-muted">
                {{ user.joinedDate }}
              </td>

              <!-- Actions Menu & Quick Edit -->
              <td class="px-4 py-3.5 whitespace-nowrap text-right">
                <div class="inline-flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-raised hover:text-fg transition-colors"
                    title="Quick edit user"
                    @click="openEditUserModal(user)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>

                  <ActionMenu :items="getActionMenuItems(user)" @select="(value) => handleActionSelect(value, user)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty States -->
        <div v-else class="p-4 sm:p-6">
          <!-- Case A: Filters return no results -->
          <EmptyState
            v-if="isFilterActive"
            :icon="FilterX"
            title="No users found"
            description="No users match your current search and filter criteria. Try clearing or adjusting the filters."
          >
            <template #action>
              <BaseButton variant="secondary" size="sm" @click="resetFilters">Clear Filters</BaseButton>
            </template>
          </EmptyState>

          <!-- Case B: No users exist in the system at all -->
          <EmptyState
            v-else
            :icon="UsersIcon"
            title="There are no users in the system yet."
            description="Get started by provisioning the first administrator, agent, seller, or buyer account."
          >
            <template #action>
              <BaseButton variant="primary" size="sm" @click="openAddUserModal">
                <UserPlus class="h-3.5 w-3.5" />
                <span class="ml-1.5">Add First User</span>
              </BaseButton>
            </template>
          </EmptyState>
        </div>
      </div>

      <!-- Pagination Footer -->
      <PaginationBar
        v-if="!isLoading && !loadError && totalUsers > 0"
        :page="currentPage"
        :per-page="pageSize"
        :total-items="totalUsers"
        :per-page-options="[10, 25, 50]"
        item-label="users"
        @update:page="currentPage = $event"
        @update:per-page="pageSize = $event"
      />
    </div>

    <!-- Modals -->
    <AddEditUserModal v-model="isAddEditModalOpen" :user-to-edit="userToEdit" @save="handleSaveUser" />

    <ViewUserModal
      v-model="isViewModalOpen"
      :user="userToView"
      @edit="openEditUserModal"
      @change-role="openChangeRoleModal"
    />

    <ChangeRoleModal v-model="isChangeRoleModalOpen" :user="userToChangeRole" @role-changed="handleRoleChanged" />

    <DeleteUserModal v-model="isDeleteModalOpen" :user="userToDelete" @confirm-delete="handleDeleteUser" />

    <ConfirmDialog
      v-if="userPendingStatusToggle"
      v-model="isStatusConfirmOpen"
      :title="userPendingStatusToggle.status === 'active' ? 'Deactivate User' : 'Activate User'"
      :confirm-label="userPendingStatusToggle.status === 'active' ? 'Deactivate' : 'Activate'"
      :tone="userPendingStatusToggle.status === 'active' ? 'danger' : 'default'"
      :loading="statusToggleLoading"
      @confirm="confirmStatusToggle"
    >
      Are you sure you want to
      {{ userPendingStatusToggle.status === 'active' ? 'deactivate' : 'activate' }}
      <span class="font-semibold text-fg">{{ userPendingStatusToggle.fullName }}</span>?
      <template v-if="userPendingStatusToggle.status === 'active'">
        They will no longer be able to sign in until reactivated.
      </template>
    </ConfirmDialog>

    <ConfirmDialog
      v-if="userPendingVerification"
      v-model="isVerifyConfirmOpen"
      title="Verify Agent"
      confirm-label="Verify"
      :loading="verifyLoading"
      @confirm="confirmAgentVerification"
    >
      Are you sure you want to mark
      <span class="font-semibold text-fg">{{ userPendingVerification.fullName }}</span>'s email as
      verified? This skips them clicking the verification link themselves and lets them sign in
      immediately (once approved and active).
    </ConfirmDialog>
  </div>
</template>
