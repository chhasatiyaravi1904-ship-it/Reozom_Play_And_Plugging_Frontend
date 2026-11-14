<template>
  <div class="h-full bg-neutral-50 p-6 overflow-y-auto">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Listing Processes</h1>
        <p class="text-sm text-neutral-500 mt-1">Manage all listing process templates and forms.</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#0f6b5c] px-3.5 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40 focus:ring-offset-1 active:scale-[0.98]"
      >
        <IconPlus class="h-4 w-4" />
        <span>New Process</span>
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="flex gap-4 mb-6">
      <div class="relative flex-1 max-w-md">
        <IconSearch :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search processes..." 
          class="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]"
        />
      </div>
    </div>

    <!-- Processes List -->
    <div v-for="group in displayGroups" :key="group.title" class="mb-8">
      <h2 v-if="isAgent && group.processes.length > 0" class="text-lg font-bold text-neutral-900 mb-4">{{ group.title }} <span v-if="group.title === 'System Default'" class="text-xs font-normal text-neutral-500 ml-2">(Read Only)</span></h2>
      <div v-if="group.processes.length > 0" class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-neutral-50/50 border-b border-neutral-200">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Process Name</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Required Disclosures</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Modified</th>
              <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr v-for="process in group.processes" :key="process.id" class="hover:bg-neutral-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="font-medium text-neutral-900">{{ process.name }}</div>
                  <span v-if="process.agent_id === null && process.type === 'default'" class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1641d9]/10 text-[#1641d9] uppercase tracking-wider">System Default</span>
                  <span v-else-if="process.isDefault" class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1641d9]/10 text-[#1641d9] uppercase tracking-wider">Default</span>
                </div>
                <div class="text-xs text-neutral-500 mt-1">{{ process.type }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap items-center gap-1.5 max-w-xs">
                  <template v-if="process.required_disclosures && process.required_disclosures.length > 0">
                    <span 
                      v-for="code in process.required_disclosures" 
                      :key="code"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                      :title="getDisclosureTitle(code)"
                    >
                      {{ formatDisclosureCode(code) }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-neutral-400 italic">None selected</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <button
                  v-if="!isAgent || process.agent_id !== null"
                  @click="toggleStatus(process)"
                  class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition"
                  :class="process.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                  :title="process.status === 'Active' ? 'Click to set as Draft' : 'Click to activate for agents'"
                >
                  {{ process.status }}
                </button>
                <span v-else class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 cursor-not-allowed opacity-75">
                  {{ process.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-neutral-500">
                {{ process.lastModified }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    v-if="!isAgent || process.agent_id !== null"
                    @click="openEditSettingsModal(process)" 
                    class="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded transition" 
                    title="Configure Required Disclosures"
                  >
                    <IconFileText :size="18" />
                  </button>
                  <button @click="previewProcess(process.id)" class="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded transition" title="Preview Form">
                    <IconEye :size="18" />
                  </button>
                  <button @click="editProcess(process.id)" class="p-2 text-neutral-400 hover:text-[#1641d9] hover:bg-blue-50 rounded transition" :title="isAgent && process.agent_id === null ? 'View Process Structure' : 'Open Builder'">
                    <IconEdit :size="18" v-if="!isAgent || process.agent_id !== null" />
                    <IconEye :size="18" v-else />
                  </button>
                  <button v-if="!isAgent || process.agent_id !== null" @click="confirmDelete(process)" class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete Process">
                    <IconTrash :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="filteredProcesses.length === 0" class="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 text-center text-sm text-neutral-500">
      No processes found matching your criteria.
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-neutral-900">Create New Process</h3>
          <button @click="showCreateModal = false" class="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-lg transition">
            <IconX :size="20" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Process Name</label>
            <input 
              v-model="newProcessForm.name" 
              type="text" 
              @keyup.enter="handleCreate"
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]" 
              placeholder="e.g. Michigan Residential"
            />
          </div>
          <template v-if="authStore.user?.role === 'agent'">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-2">Process Type</label>
              <div class="flex flex-col gap-3">
                <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors" :class="newProcessForm.isDefault ? 'border-[#1641d9] bg-blue-50/50' : 'border-neutral-200 hover:border-neutral-300'">
                  <input type="radio" :value="true" v-model="newProcessForm.isDefault" class="w-4 h-4 text-[#1641d9] focus:ring-[#1641d9]">
                  <div>
                    <span class="block text-sm font-medium text-neutral-900">Default Use</span>
                    <span class="block text-xs text-neutral-500">Automatically use this process for all your new listings.</span>
                  </div>
                </label>
                
                <label class="flex items-center gap-3 cursor-pointer p-3 border rounded-lg transition-colors" :class="!newProcessForm.isDefault ? 'border-[#1641d9] bg-blue-50/50' : 'border-neutral-200 hover:border-neutral-300'">
                  <input type="radio" :value="false" v-model="newProcessForm.isDefault" class="w-4 h-4 text-[#1641d9] focus:ring-[#1641d9]">
                  <div>
                    <span class="block text-sm font-medium text-neutral-900">Custom</span>
                    <span class="block text-xs text-neutral-500">A specialized process that can be manually selected when needed.</span>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Service Package (Optional)</label>
              <select v-model="newProcessForm.service_package_id" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9] bg-white">
                <option value="">-- None --</option>
                <option v-for="pkg in servicePackages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Assigned Zip Codes (Optional)</label>
              <input 
                v-model="newProcessForm.assigned_zips" 
                type="text" 
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]" 
                placeholder="e.g. 48103, 48104"
              />
              <span class="block text-xs text-neutral-500 mt-1">Comma-separated list of zip codes.</span>
            </div>
          </template>

          <!-- Required Disclosures Selection -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-neutral-700">Required Disclosures</label>
              <span class="text-xs text-neutral-400">{{ newProcessForm.required_disclosures.length }} selected</span>
            </div>
            <p class="text-xs text-neutral-500 mb-2">
              Select which disclosure documents sellers must complete in the Disclosures step for listings under this process.
            </p>
            <div class="space-y-1.5 max-h-44 overflow-y-auto p-2 border border-neutral-200 rounded-lg bg-neutral-50">
              <label 
                v-for="d in availableDisclosures" 
                :key="d.code" 
                class="flex items-start gap-2.5 p-2 bg-white rounded border transition-colors cursor-pointer"
                :class="newProcessForm.required_disclosures.includes(d.code) ? 'border-emerald-300 bg-emerald-50/30' : 'border-neutral-200 hover:border-neutral-300'"
              >
                <input 
                  type="checkbox" 
                  :value="d.code" 
                  v-model="newProcessForm.required_disclosures" 
                  class="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div class="flex-1 min-w-0 text-xs">
                  <div class="font-medium text-neutral-900 truncate">{{ d.title }}</div>
                  <div class="text-[11px] text-neutral-500 line-clamp-1">{{ d.description }}</div>
                  <div class="mt-1 flex items-center gap-1.5">
                    <span v-if="d.state_code" class="px-1.5 py-0.2 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">{{ d.state_code }}</span>
                    <span v-if="d.is_required" class="px-1.5 py-0.2 rounded text-[10px] bg-amber-50 text-amber-700 font-medium">Statutory</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <button @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition" :disabled="isSubmitting">Cancel</button>
          <button @click="handleCreate" class="px-4 py-2 text-sm font-medium text-white bg-[#1641d9] rounded-lg hover:bg-blue-700 transition" :disabled="!newProcessForm.name || isSubmitting">
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Process</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-if="showDeleteModal && processToDelete" class="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div class="px-6 py-5 border-b border-neutral-100">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <IconTrash class="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-neutral-900">Delete Process</h3>
              <p class="text-sm text-neutral-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <p class="text-sm text-neutral-700">
            Are you sure you want to permanently delete the <span class="font-bold">"{{ processToDelete.name }}"</span> process? 
          </p>
          <p class="text-xs text-neutral-500 mt-2">
            Any existing listings using this process will still retain their snapshot, but this template will no longer be available.
          </p>
        </div>
        <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">Cancel</button>
          <button @click="executeDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">Yes, Delete Process</button>
        </div>
      </div>
    </div>

    <!-- Edit Process Settings / Disclosures Modal -->
    <div v-if="showEditSettingsModal && editingProcess" class="fixed inset-0 bg-neutral-900/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-neutral-900">Process Disclosures & Settings</h3>
            <p class="text-xs text-neutral-500 mt-0.5">{{ editingProcess.name }}</p>
          </div>
          <button @click="showEditSettingsModal = false" class="text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 p-1.5 rounded-lg transition">
            <IconX :size="20" />
          </button>
        </div>
        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Process Name</label>
            <input 
              v-model="editProcessForm.name" 
              type="text" 
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]" 
            />
          </div>

          <template v-if="isAgent">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Service Package (Optional)</label>
              <select v-model="editProcessForm.service_package_id" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9] bg-white">
                <option :value="null">-- None --</option>
                <option v-for="pkg in servicePackages" :key="pkg.id" :value="pkg.id">{{ pkg.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Assigned Zip Codes (Optional)</label>
              <input 
                v-model="editProcessForm.assigned_zips" 
                type="text" 
                class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]" 
                placeholder="e.g. 48103, 48104"
              />
              <span class="block text-xs text-neutral-500 mt-1">Comma-separated list of zip codes.</span>
            </div>
          </template>

          <!-- Required Disclosures Checklist -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-neutral-700">Required Disclosures for this Process</label>
              <span class="text-xs text-emerald-700 font-semibold">{{ editProcessForm.required_disclosures.length }} selected</span>
            </div>
            <p class="text-xs text-neutral-500 mb-2">
              Sellers who create listings under this process will have these disclosures pre-selected and rendered in the <strong>Disclosures Step</strong>.
            </p>
            <div class="space-y-2 max-h-56 overflow-y-auto p-2 border border-neutral-200 rounded-lg bg-neutral-50">
              <label 
                v-for="d in availableDisclosures" 
                :key="d.code" 
                class="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border transition-colors cursor-pointer"
                :class="editProcessForm.required_disclosures.includes(d.code) ? 'border-emerald-400 bg-emerald-50/40 shadow-xs' : 'border-neutral-200 hover:border-neutral-300'"
              >
                <input 
                  type="checkbox" 
                  :value="d.code" 
                  v-model="editProcessForm.required_disclosures" 
                  class="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div class="flex-1 min-w-0 text-xs">
                  <div class="font-semibold text-neutral-900">{{ d.title }}</div>
                  <div class="text-[11px] text-neutral-500 mt-0.5">{{ d.description }}</div>
                  <div class="mt-1.5 flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-600 font-mono">{{ d.code }}</span>
                    <span v-if="d.state_code" class="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">{{ d.state_code }}</span>
                    <span v-if="d.is_required" class="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-medium">Statutory</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <button @click="showEditSettingsModal = false" class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition" :disabled="isSubmitting">Cancel</button>
          <button @click="handleSaveSettings" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition" :disabled="!editProcessForm.name || isSubmitting">
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Save Settings & Disclosures</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcessStore } from '@/stores/processStore'
import { useAuthStore } from '@/stores/auth'
import { IconPlus, IconSearch, IconX, IconEdit, IconTrash, IconEye, IconFileText } from '@tabler/icons-vue'
import { fetchServicePackages } from '@/services/servicePackageService'
import { fetchAvailableDisclosures } from '@/services/listingProcessService'

const router = useRouter()
const processStore = useProcessStore()
const authStore = useAuthStore()

const getBasePath = () => authStore.user?.role === 'agent' ? '/agent' : '/admin'

const searchQuery = ref('')
const showCreateModal = ref(false)
const isSubmitting = ref(false)
const showDeleteModal = ref(false)
const processToDelete = ref(null)
const servicePackages = ref([])
const availableDisclosures = ref([])

const showEditSettingsModal = ref(false)
const editingProcess = ref(null)
const editProcessForm = ref({
  name: '',
  service_package_id: null,
  assigned_zips: '',
  required_disclosures: []
})

const newProcessForm = ref({
  name: '',
  type: '',
  isDefault: false,
  service_package_id: '',
  assigned_zips: '',
  required_disclosures: ['mi_residential_appliances', 'mi_residential_conditions', 'lead_paint_disclosure']
})

onMounted(async () => {
  processStore.loadProcesses()
  
  try {
    const discRes = await fetchAvailableDisclosures()
    availableDisclosures.value = discRes.data || []
  } catch (e) {
    console.error('Failed to load available disclosures', e)
  }

  if (authStore.user?.role === 'agent') {
    try {
      const res = await fetchServicePackages()
      servicePackages.value = res.data || []
    } catch (e) {
      console.error('Failed to load service packages', e)
    }
  }
})

const openEditSettingsModal = (process) => {
  editingProcess.value = process
  editProcessForm.value = {
    name: process.name,
    service_package_id: process.service_package_id || null,
    assigned_zips: Array.isArray(process.assigned_zips) ? process.assigned_zips.join(', ') : (process.assigned_zips || ''),
    required_disclosures: Array.isArray(process.required_disclosures) ? [...process.required_disclosures] : []
  }
  showEditSettingsModal.value = true
}

const handleSaveSettings = async () => {
  if (!editingProcess.value || !editProcessForm.value.name || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const payload = {
      name: editProcessForm.value.name,
      required_disclosures: editProcessForm.value.required_disclosures,
      service_package_id: editProcessForm.value.service_package_id || null,
      assigned_zips: editProcessForm.value.assigned_zips 
        ? editProcessForm.value.assigned_zips.split(',').map(z => z.trim()).filter(Boolean)
        : []
    }
    await processStore.updateProcess(editingProcess.value.id, payload)
    showEditSettingsModal.value = false
    editingProcess.value = null
  } catch (e) {
    console.error('Failed to update process settings', e)
  } finally {
    isSubmitting.value = false
  }
}

const getDisclosureTitle = (code) => {
  const d = availableDisclosures.value.find(item => item.code === code)
  return d ? d.title : code
}

const formatDisclosureCode = (code) => {
  if (code.includes('appliances')) return 'Appliances'
  if (code.includes('conditions')) return 'Conditions'
  if (code.includes('lead')) return 'Lead Paint'
  if (code.includes('vacant')) return 'Vacant Land'
  if (code.includes('condo') || code.includes('hoa')) return 'HOA / Condo'
  return code
}

const filteredProcesses = computed(() => {
  if (!searchQuery.value) return processStore.processes
  const q = searchQuery.value.toLowerCase()
  return processStore.processes.filter(p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))
})

const isAgent = computed(() => authStore.user?.role === 'agent')

const displayGroups = computed(() => {
  if (!isAgent.value) {
    return [{ title: 'All Processes', processes: filteredProcesses.value }]
  }
  
  return [
    { title: 'System Default', processes: filteredProcesses.value.filter(p => p.agent_id === null && p.type === 'default') },
    { title: 'My Processes', processes: filteredProcesses.value.filter(p => p.agent_id !== null) }
  ]
})

const editProcess = (id) => {
  router.push(`${getBasePath()}/processes/${id}/builder`)
}

const previewProcess = (id) => {
  router.push(`/preview/${id}`)
}

const handleCreate = async () => {
  if (!newProcessForm.value.name || isSubmitting.value) return
  isSubmitting.value = true
  
  try {
    const isAdmin = authStore.user?.role === 'admin'
    const payload = {
      name: newProcessForm.value.name,
      type: (isAdmin || newProcessForm.value.isDefault) ? 'default' : 'custom',
      isDefault: isAdmin || newProcessForm.value.isDefault,
    }
    
    if (newProcessForm.value.service_package_id) {
      payload.service_package_id = newProcessForm.value.service_package_id
    }
    
    if (newProcessForm.value.assigned_zips) {
      payload.assigned_zips = newProcessForm.value.assigned_zips.split(',').map(z => z.trim()).filter(z => z)
    }

    if (newProcessForm.value.required_disclosures && newProcessForm.value.required_disclosures.length > 0) {
      payload.required_disclosures = newProcessForm.value.required_disclosures
    }
    
    const newProc = await processStore.addProcess(payload)
    
    showCreateModal.value = false
    const createdName = newProcessForm.value.name
    newProcessForm.value = { 
      name: '', 
      type: '', 
      isDefault: false, 
      service_package_id: '', 
      assigned_zips: '',
      required_disclosures: ['mi_residential_appliances', 'mi_residential_conditions', 'lead_paint_disclosure']
    }
    
    let targetId = newProc?.id
    if (!targetId) {
      // Fallback: Reload processes and find the one we just created
      await processStore.loadProcesses()
      const fallbackProc = processStore.processes.find(p => p.name === createdName)
      targetId = fallbackProc?.id
    }
    
    if (targetId) {
      router.push(`${getBasePath()}/processes/${targetId}/builder`)
    } else {
      console.error('Could not determine new process ID for routing')
    }
  } catch (e) {
    console.error('Failed to create', e)
  } finally {
    isSubmitting.value = false
  }
}

const toggleStatus = async (process) => {
  await processStore.updateProcess(process.id, { status: process.status === 'Active' ? 'Draft' : 'Active' })
}

const confirmDelete = (process) => {
  processToDelete.value = process
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (processToDelete.value) {
    await processStore.deleteProcess(processToDelete.value.id)
    showDeleteModal.value = false
    processToDelete.value = null
  }
}
</script>
