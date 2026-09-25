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
        class="flex items-center gap-2 bg-[#1641d9] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
      >
        <IconPlus :size="18" />
        New Process
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
    <div class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-neutral-50/50 border-b border-neutral-200">
          <tr>
            <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Process Name</th>
            <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Last Modified</th>
            <th class="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100">
          <tr v-for="process in filteredProcesses" :key="process.id" class="hover:bg-neutral-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="font-medium text-neutral-900">{{ process.name }}</div>
                <span v-if="process.isDefault" class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1641d9]/10 text-[#1641d9] uppercase tracking-wider">Default</span>
              </div>
              <div class="text-xs text-neutral-500 mt-1">{{ process.type }}</div>
            </td>
            <td class="px-6 py-4">
              <button
                @click="toggleStatus(process)"
                class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium transition"
                :class="process.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'"
                :title="process.status === 'Active' ? 'Click to set as Draft' : 'Click to activate for agents'"
              >
                {{ process.status }}
              </button>
            </td>
            <td class="px-6 py-4 text-sm text-neutral-500">
              {{ process.lastModified }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="editProcess(process.id)" class="p-2 text-neutral-400 hover:text-[#1641d9] hover:bg-blue-50 rounded transition" title="Open Builder">
                  <IconEdit :size="18" />
                </button>
                <button @click="confirmDelete(process)" class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete Process">
                  <IconTrash :size="18" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredProcesses.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-sm text-neutral-500">
              No processes found matching your criteria.
            </td>
          </tr>
        </tbody>
      </table>
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
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]" 
              placeholder="e.g. Michigan Residential"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Process Type</label>
            <input 
              v-model="newProcessForm.type" 
              type="text" 
              class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20 focus:border-[#1641d9]" 
              placeholder="e.g. Default - Michigan"
            />
          </div>
          <label class="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" v-model="newProcessForm.isDefault" class="w-4 h-4 text-[#1641d9] rounded border-neutral-300 focus:ring-[#1641d9]">
            <span class="text-sm font-medium text-neutral-700">Set as Default Form for Agents</span>
          </label>
        </div>
        <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3">
          <button @click="showCreateModal = false" class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">Cancel</button>
          <button @click="handleCreate" class="px-4 py-2 text-sm font-medium text-white bg-[#1641d9] rounded-lg hover:bg-blue-700 transition" :disabled="!newProcessForm.name">Create Process</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProcessStore } from '@/stores/processStore'
import { IconPlus, IconSearch, IconX, IconEdit, IconTrash } from '@tabler/icons-vue'

const router = useRouter()
const processStore = useProcessStore()

const searchQuery = ref('')
const showCreateModal = ref(false)

const newProcessForm = ref({
  name: '',
  type: '',
  isDefault: false
})

onMounted(() => {
  processStore.loadProcesses()
})

const filteredProcesses = computed(() => {
  if (!searchQuery.value) return processStore.processes
  const q = searchQuery.value.toLowerCase()
  return processStore.processes.filter(p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))
})

const editProcess = (id) => {
  router.push(`/admin/processes/${id}/builder`)
}

const handleCreate = async () => {
  if (!newProcessForm.value.name) return
  
  try {
    const newProc = await processStore.addProcess({
      name: newProcessForm.value.name,
      type: newProcessForm.value.type || 'Custom',
      isDefault: newProcessForm.value.isDefault
    })
    
    showCreateModal.value = false
    newProcessForm.value = { name: '', type: '', isDefault: false }
    
    // Immediately navigate to builder
    router.push(`/admin/processes/${newProc.id}/builder`)
  } catch (e) {
    console.error('Failed to create', e)
  }
}

const toggleStatus = async (process) => {
  await processStore.updateProcess(process.id, { status: process.status === 'Active' ? 'Draft' : 'Active' })
}

const confirmDelete = async (process) => {
  if (confirm(`Are you sure you want to delete ${process.name}?`)) {
    await processStore.deleteProcess(process.id)
  }
}
</script>
