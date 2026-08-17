<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Eye,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-vue-next'
import {
  initialAdminUsers,
  type AdminUserItem,
  type AdminUserRole,
  type AdminUserStatus,
} from '@/services/adminUsersData'
import UserRoleBadge from '@/components/admin/UserRoleBadge.vue'
import UserStatusDot from '@/components/admin/UserStatusDot.vue'
import UserAvatar from '@/components/admin/UserAvatar.vue'
import AddEditUserModal from '@/components/admin/AddEditUserModal.vue'
import ViewUserModal from '@/components/admin/ViewUserModal.vue'
import ChangeRoleModal from '@/components/admin/ChangeRoleModal.vue'
import DeleteUserModal from '@/components/admin/DeleteUserModal.vue'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

// State
const users = ref<AdminUserItem[]>([...initialAdminUsers])
const isLoading = ref(false)

// Tabs
type RoleFilterTab = 'all' | AdminUserRole
const activeTab = ref<RoleFilterTab>('all')

const roleTabs = [
  { label: 'All Users', value: 'all' as RoleFilterTab },
  { label: 'Admins', value: 'admin' as RoleFilterTab },
  { label: 'Agents', value: 'agent' as RoleFilterTab },
  { label: 'Sellers', value: 'seller' as RoleFilterTab },
  { label: 'Buyers', value: 'buyer' as RoleFilterTab },
]

// Tab counts (computed dynamically from all users)
const tabCounts = computed(() => {
  const counts = {
    all: users.value.length,
    admin: 0,
    agent: 0,
    seller: 0,
    buyer: 0,
  }
  for (const u of users.value) {
    if (u.role in counts) {
      counts[u.role]++
    }
  }
  return counts
})

// Filters
const searchQuery = ref('')
const selectedRole = ref<string>('all')
const selectedStatus = ref<string>('all')
const selectedDateRange = ref<string>('all')

// Sync tab changes to role filter dropdown
watch(activeTab, (newTab) => {
  selectedRole.value = newTab
  currentPage.value = 1
})

watch(selectedRole, (newRole) => {
  if (['all', 'admin', 'agent', 'seller', 'buyer'].includes(newRole)) {
    activeTab.value = newRole as RoleFilterTab
  }
})

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
  currentPage.value = 1
}

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 25, 50]

// Active dropdown state
const openDropdownId = ref<number | null>(null)

function toggleDropdown(id: number, event: Event) {
  event.stopPropagation()
  openDropdownId.value = openDropdownId.value === id ? null : id
}

function closeDropdowns() {
  openDropdownId.value = null
}

onMounted(() => {
  window.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
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
  openDropdownId.value = null
}

function openViewUserModal(user: AdminUserItem) {
  userToView.value = user
  isViewModalOpen.value = true
  openDropdownId.value = null
}

function openChangeRoleModal(user: AdminUserItem) {
  userToChangeRole.value = user
  isChangeRoleModalOpen.value = true
  openDropdownId.value = null
}

function openDeleteUserModal(user: AdminUserItem) {
  userToDelete.value = user
  isDeleteModalOpen.value = true
  openDropdownId.value = null
}

function handleSaveUser(userData: Partial<AdminUserItem>) {
  if (userToEdit.value) {
    // Update existing user
    const idx = users.value.findIndex((u) => u.id === userToEdit.value?.id)
    if (idx !== -1) {
      users.value[idx] = {
        ...users.value[idx],
        ...userData,
      } as AdminUserItem
      toast.success(`User @${users.value[idx].username} was updated successfully.`)
    }
  } else {
    // Create new user
    const newId = Math.max(...users.value.map((u) => u.id), 0) + 1
    const today = new Date().toISOString().split('T')[0]
    const newUser: AdminUserItem = {
      id: newId,
      fullName: userData.fullName || '',
      username: userData.username || `user${newId}`,
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'agent',
      status: userData.status || 'active',
      joinedDate: today,
      location: userData.location || '',
      lastActive: 'Just now',
      listingsCount: 0,
    }
    users.value.unshift(newUser)
    toast.success(`User ${newUser.fullName} (@${newUser.username}) was created.`)
  }
}

function handleRoleChanged(user: AdminUserItem, newRole: AdminUserRole) {
  const idx = users.value.findIndex((u) => u.id === user.id)
  if (idx !== -1) {
    users.value[idx].role = newRole
    toast.success(`Role for @${user.username} changed to ${newRole}.`)
  }
}

function toggleUserStatus(user: AdminUserItem) {
  const idx = users.value.findIndex((u) => u.id === user.id)
  if (idx !== -1) {
    const newStatus: AdminUserStatus = user.status === 'active' ? 'inactive' : 'active'
    users.value[idx].status = newStatus
    toast.info(`User @${user.username} is now ${newStatus}.`)
  }
  openDropdownId.value = null
}

function handleDeleteUser(user: AdminUserItem) {
  users.value = users.value.filter((u) => u.id !== user.id)
  toast.success(`User @${user.username} was permanently removed.`)
}

// Reset Filters
function resetFilters() {
  searchQuery.value = ''
  selectedRole.value = 'all'
  selectedStatus.value = 'all'
  selectedDateRange.value = 'all'
  activeTab.value = 'all'
  currentPage.value = 1
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

// Simulated reload for skeleton preview
function reloadUsers() {
  isLoading.value = true
  window.setTimeout(() => {
    isLoading.value = false
    toast.info('User directory refreshed.')
  }, 600)
}

// Filtered & Sorted list
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    // Tab filter
    if (activeTab.value !== 'all' && user.role !== activeTab.value) {
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

    // Search query (fullName, username, email, phone)
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = user.fullName.toLowerCase().includes(q)
      const matchUsername = user.username.toLowerCase().includes(q)
      const matchEmail = user.email.toLowerCase().includes(q)
      const matchPhone = user.phone.includes(q)
      if (!matchName && !matchUsername && !matchEmail && !matchPhone) {
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

// Pagination logic
const totalUsers = computed(() => sortedUsers.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalUsers.value / pageSize.value)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedUsers.value.slice(start, start + pageSize.value)
})

const paginationInfo = computed(() => {
  if (totalUsers.value === 0) return 'Showing 0 users'
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(start + pageSize.value - 1, totalUsers.value)
  return `Showing ${start} to ${end} of ${totalUsers.value} users`
})

// Pagination pages array with ellipsis
const paginationPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

function goToPage(page: number | string) {
  if (typeof page !== 'number') return
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
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
        <span class="font-medium text-slate-400">Platform</span>
        <span>/</span>
        <span class="font-semibold text-slate-800">Users</span>
      </nav>

      <!-- Main Header Row -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Users</h1>
          <p class="mt-1 text-sm text-slate-500">
            Manage admin, agent, seller, and buyer accounts.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2.5">
          <button
            type="button"
            class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Refresh user list"
            @click="reloadUsers"
          >
            <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
            <span class="ml-1.5 hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
            @click="openAddUserModal"
          >
            <UserPlus class="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Card Container -->
    <div
      class="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-shadow"
    >
      <!-- User Type Tabs with Counts -->
      <div class="border-b border-slate-200/80 px-4 sm:px-6 bg-slate-50/40">
        <div class="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar pt-2">
          <button
            v-for="tab in roleTabs"
            :key="tab.value"
            type="button"
            class="group relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none"
            :class="[
              activeTab === tab.value
                ? 'border-[#0f6b5c] text-[#0f6b5c] font-semibold'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800',
            ]"
            @click="activeTab = tab.value"
          >
            <span>{{ tab.label }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-xs transition-colors"
              :class="[
                activeTab === tab.value
                  ? 'bg-teal-100/70 text-teal-900 font-semibold'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700',
              ]"
            >
              {{ tabCounts[tab.value] }}
            </span>
          </button>
        </div>
      </div>

      <!-- Filter Toolbar -->
      <div class="border-b border-slate-200/80 bg-white p-4 sm:p-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <!-- Left: Search & Dropdowns -->
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
            <!-- Search Input -->
            <div class="relative min-w-[260px] sm:col-span-2 lg:col-span-1 lg:w-72">
              <Search
                class="absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400 pointer-events-none"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by name, email or phone..."
                class="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                @input="currentPage = 1"
              />
              <button
                v-if="searchQuery"
                type="button"
                class="absolute inset-y-0 right-0 my-auto mr-2.5 text-xs text-slate-400 hover:text-slate-700"
                @click="searchQuery = ''; currentPage = 1"
              >
                ✕
              </button>
            </div>

            <!-- Role Dropdown -->
            <div class="relative">
              <select
                v-model="selectedRole"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                @change="currentPage = 1"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
              <ChevronDown
                class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400"
              />
            </div>

            <!-- Status Dropdown -->
            <div class="relative">
              <select
                v-model="selectedStatus"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                @change="currentPage = 1"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown
                class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400"
              />
            </div>

            <!-- Joined Date Range Selector -->
            <div class="relative">
              <select
                v-model="selectedDateRange"
                class="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                @change="currentPage = 1"
              >
                <option value="all">Select date range</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="2026">Year 2026</option>
                <option value="2025">Year 2025</option>
                <option value="2024">Year 2024</option>
              </select>
              <ChevronDown
                class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400"
              />
            </div>
          </div>

          <!-- Right: Active filter status & Reset Button -->
          <div class="flex items-center justify-between sm:justify-end gap-2.5 pt-1 lg:pt-0">
            <span
              v-if="isFilterActive"
              class="inline-flex items-center gap-1.5 text-xs text-slate-500"
            >
              <SlidersHorizontal class="h-3 w-3 text-slate-400" />
              <span>Filters active ({{ totalUsers }} found)</span>
            </span>

            <button
              v-if="isFilterActive"
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
              @click="resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="relative overflow-x-auto">
        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="divide-y divide-slate-100">
          <div
            v-for="i in 6"
            :key="i"
            class="flex items-center justify-between gap-4 p-4 animate-pulse"
          >
            <!-- User col skeleton -->
            <div class="flex items-center gap-3 w-1/4">
              <div class="h-9 w-9 rounded-full bg-slate-200"></div>
              <div class="space-y-1.5 flex-1">
                <div class="h-3.5 w-28 rounded bg-slate-200"></div>
                <div class="h-2.5 w-16 rounded bg-slate-100"></div>
              </div>
            </div>
            <!-- Role skeleton -->
            <div class="h-5 w-16 rounded bg-slate-200"></div>
            <!-- Status skeleton -->
            <div class="h-3 w-14 rounded bg-slate-200"></div>
            <!-- Email skeleton -->
            <div class="h-3 w-36 rounded bg-slate-200"></div>
            <!-- Phone skeleton -->
            <div class="h-3 w-24 rounded bg-slate-200"></div>
            <!-- Date skeleton -->
            <div class="h-3 w-20 rounded bg-slate-200"></div>
            <!-- Actions skeleton -->
            <div class="flex gap-2">
              <div class="h-7 w-7 rounded bg-slate-200"></div>
              <div class="h-7 w-7 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>

        <!-- Users Table -->
        <table v-else-if="paginatedUsers.length > 0" class="w-full text-left border-collapse">
          <thead>
            <tr
              class="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 select-none"
            >
              <!-- User Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('fullName')"
              >
                <div class="flex items-center gap-1.5">
                  <span>User</span>
                  <component
                    :is="sortField === 'fullName' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'fullName' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Role Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('role')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Role</span>
                  <component
                    :is="sortField === 'role' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'role' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Status Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('status')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Status</span>
                  <component
                    :is="sortField === 'status' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'status' ? 'text-[#0f6b5c]' : 'text-slate-400'"
                  />
                </div>
              </th>

              <!-- Email Column -->
              <th
                scope="col"
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('email')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Email</span>
                  <component
                    :is="sortField === 'email' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'email' ? 'text-[#0f6b5c]' : 'text-slate-400'"
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
                class="cursor-pointer px-4 py-3.5 transition-colors hover:bg-slate-100/60"
                @click="toggleSort('joinedDate')"
              >
                <div class="flex items-center gap-1.5">
                  <span>Joined Date</span>
                  <component
                    :is="sortField === 'joinedDate' ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown"
                    class="h-3.5 w-3.5"
                    :class="sortField === 'joinedDate' ? 'text-[#0f6b5c]' : 'text-slate-400'"
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

          <tbody class="divide-y divide-slate-100 bg-white text-xs">
            <tr
              v-for="user in paginatedUsers"
              :key="user.id"
              class="group transition-colors hover:bg-slate-50/80"
            >
              <!-- User Name & Username & Avatar -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div
                  class="flex items-center gap-3 cursor-pointer"
                  @click="openViewUserModal(user)"
                >
                  <UserAvatar :name="user.fullName" :role="user.role" size="md" />
                  <div class="min-w-0">
                    <p
                      class="text-sm font-semibold text-slate-900 group-hover:text-[#0f6b5c] transition-colors leading-snug truncate"
                    >
                      {{ user.fullName }}
                    </p>
                    <p class="text-xs text-slate-500 truncate">@{{ user.username }}</p>
                  </div>
                </div>
              </td>

              <!-- Role Badge -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <UserRoleBadge :role="user.role" />
              </td>

              <!-- Status Dot -->
              <td class="px-4 py-3.5 whitespace-nowrap">
                <UserStatusDot :status="user.status" />
              </td>

              <!-- Email -->
              <td class="px-4 py-3.5 whitespace-nowrap text-slate-600">
                <a
                  :href="`mailto:${user.email}`"
                  class="hover:text-slate-900 hover:underline transition-colors"
                >
                  {{ user.email }}
                </a>
              </td>

              <!-- Phone -->
              <td class="px-4 py-3.5 whitespace-nowrap tabular-nums text-slate-600">
                {{ user.phone }}
              </td>

              <!-- Joined Date -->
              <td class="px-4 py-3.5 whitespace-nowrap text-slate-600">
                {{ user.joinedDate }}
              </td>

              <!-- Actions Menu & Quick Edit -->
              <td class="px-4 py-3.5 whitespace-nowrap text-right">
                <div class="relative inline-flex items-center justify-end gap-1">
                  <!-- Quick Edit Icon Button -->
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                    title="Quick edit user"
                    @click="openEditUserModal(user)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>

                  <!-- Three-dot Menu Button -->
                  <div class="relative">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                      :class="{ 'bg-slate-100 text-slate-800': openDropdownId === user.id }"
                      aria-label="More actions"
                      @click="toggleDropdown(user.id, $event)"
                    >
                      <MoreHorizontal class="h-4 w-4" />
                    </button>

                    <!-- Dropdown Panel -->
                    <div
                      v-if="openDropdownId === user.id"
                      class="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg ring-1 ring-black/5"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openViewUserModal(user)"
                      >
                        <Eye class="h-3.5 w-3.5 text-slate-400" />
                        <span>View User</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openEditUserModal(user)"
                      >
                        <Pencil class="h-3.5 w-3.5 text-slate-400" />
                        <span>Edit User</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="openChangeRoleModal(user)"
                      >
                        <Shield class="h-3.5 w-3.5 text-slate-400" />
                        <span>Change Role</span>
                      </button>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        @click="toggleUserStatus(user)"
                      >
                        <component
                          :is="user.status === 'active' ? UserX : UserCheck"
                          class="h-3.5 w-3.5 text-slate-400"
                        />
                        <span>{{ user.status === 'active' ? 'Deactivate User' : 'Activate User' }}</span>
                      </button>

                      <div class="my-1 border-t border-slate-100"></div>

                      <button
                        type="button"
                        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        @click="openDeleteUserModal(user)"
                      >
                        <Trash2 class="h-3.5 w-3.5 text-red-500" />
                        <span>Delete User</span>
                      </button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty States -->
        <div v-else class="p-8 sm:p-12 text-center">
          <!-- Case A: Filters return no results -->
          <div
            v-if="isFilterActive"
            class="flex flex-col items-center max-w-sm mx-auto"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-3.5"
            >
              <FilterX class="h-6 w-6" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">No users found</h3>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              No users match your current search and filter criteria. Try clearing or adjusting the filters.
            </p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              @click="resetFilters"
            >
              <RotateCcw class="h-3 w-3 text-slate-400" />
              <span>Clear Filters</span>
            </button>
          </div>

          <!-- Case B: No users exist in the system at all -->
          <div v-else class="flex flex-col items-center max-w-sm mx-auto">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#0f6b5c] ring-1 ring-teal-600/20 mb-3.5"
            >
              <UsersIcon class="h-6 w-6" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">There are no users in the system yet.</h3>
            <p class="mt-1 text-xs text-slate-500 leading-relaxed">
              Get started by provisioning the first administrator, agent, seller, or buyer account.
            </p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0f6b5c] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#0b564a]"
              @click="openAddUserModal"
            >
              <UserPlus class="h-3.5 w-3.5" />
              <span>Add First User</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="!isLoading && totalUsers > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 bg-slate-50/40 px-4 sm:px-6 py-3.5 text-xs text-slate-600"
      >
        <!-- Showing entries counter -->
        <div class="flex items-center gap-3">
          <span class="font-medium text-slate-700">{{ paginationInfo }}</span>

          <!-- Page size selector -->
          <div class="flex items-center gap-1.5">
            <span class="text-slate-400">Show</span>
            <select
              v-model="pageSize"
              class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-1 focus:ring-[#0f6b5c]"
              @change="currentPage = 1"
            >
              <option v-for="size in pageSizeOptions" :key="size" :value="size">
                {{ size }} / page
              </option>
            </select>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center gap-1">
          <!-- Previous Button -->
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white transition-colors"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            <ChevronLeft class="h-3.5 w-3.5" />
            <span class="hidden sm:inline">Previous</span>
          </button>

          <!-- Page Number Buttons -->
          <div class="flex items-center gap-1">
            <template v-for="(p, index) in paginationPages" :key="index">
              <span v-if="p === '...'" class="px-1 text-slate-400">...</span>
              <button
                v-else
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors"
                :class="[
                  currentPage === p
                    ? 'bg-[#0f6b5c] text-white font-semibold shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                ]"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>
            </template>
          </div>

          <!-- Next Button -->
          <button
            type="button"
            class="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white transition-colors"
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            <span class="hidden sm:inline">Next</span>
            <ChevronRight class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddEditUserModal
      v-model="isAddEditModalOpen"
      :user-to-edit="userToEdit"
      @save="handleSaveUser"
    />

    <ViewUserModal
      v-model="isViewModalOpen"
      :user="userToView"
      @edit="openEditUserModal"
      @change-role="openChangeRoleModal"
    />

    <ChangeRoleModal
      v-model="isChangeRoleModalOpen"
      :user="userToChangeRole"
      @role-changed="handleRoleChanged"
    />

    <DeleteUserModal
      v-model="isDeleteModalOpen"
      :user="userToDelete"
      @confirm-delete="handleDeleteUser"
    />
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

