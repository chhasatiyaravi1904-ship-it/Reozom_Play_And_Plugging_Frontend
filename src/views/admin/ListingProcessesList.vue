<template>
  <div class="h-full bg-neutral-50 p-6 overflow-y-auto">
    
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Listing Processes</h1>
        <p class="text-sm text-neutral-500 mt-1">Manage all listing process templates and forms.</p>
      </div>
      <button
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          @click="openCreateModal"
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

    <!-- Loading: shimmer table instead of an empty page -->
    <div
      v-if="processStore.isLoading && processStore.processes.length === 0"
      class="mb-8 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
      role="status"
      aria-label="Loading listing processes"
    >
      <SkeletonTable :rows="5" :columns="4" />
    </div>

    <!-- Processes List -->
    <div v-for="group in displayGroups" v-else :key="group.title" class="mb-8">
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
                  <span v-if="process.agent_id === null && process.isDefault" class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1641d9]/10 text-[#1641d9] uppercase tracking-wider">System Default</span>
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
                  <button
                    @click="handleCopy(process)"
                    :disabled="isCopying"
                    class="p-2 text-neutral-400 hover:text-violet-600 hover:bg-violet-50 rounded transition disabled:opacity-50"
                    :title="isAgent && process.agent_id === null ? 'Copy to My Processes (to customize steps & disclosure questions)' : 'Duplicate Process'"
                  >
                    <IconCopy :size="18" />
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
        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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

          <!-- Start from a System Default -->
          <div v-if="systemDefaults.length > 1">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Start from</label>
            <p class="text-xs text-neutral-500 mb-2">The new process copies the steps of the System Default you choose. You can edit them afterwards.</p>
            <div class="max-h-56 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-100">
              <label
                v-for="base in systemDefaults"
                :key="base.id"
                class="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors hover:bg-neutral-50"
                :class="newProcessForm.base_process_id === base.id ? 'bg-blue-50/60' : ''"
              >
                <input
                  type="radio"
                  name="base_process"
                  :value="base.id"
                  :checked="newProcessForm.base_process_id === base.id"
                  class="w-4 h-4 text-[#1641d9] focus:ring-[#1641d9]"
                  @change="selectBaseProcess(base.id)"
                >
                <span class="min-w-0 flex-1">
                  <span class="block font-medium text-neutral-900">{{ base.name }}</span>
                  <span class="block text-xs text-neutral-500">{{ stepCount(base) }} steps · {{ (base.required_disclosures || []).length }} disclosure(s)</span>
                </span>
              </label>
              <label
                class="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors hover:bg-neutral-50"
                :class="newProcessForm.base_process_id === null ? 'bg-blue-50/60' : ''"
              >
                <input
                  type="radio"
                  name="base_process"
                  :checked="newProcessForm.base_process_id === null"
                  class="w-4 h-4 text-[#1641d9] focus:ring-[#1641d9]"
                  @change="selectBaseProcess(null)"
                >
                <span class="min-w-0 flex-1">
                  <span class="block font-medium text-neutral-900">Blank process</span>
                  <span class="block text-xs text-neutral-500">Only the required steps; build the rest yourself.</span>
                </span>
              </label>
            </div>
          </div>
          <p v-else-if="systemDefaults.length === 1" class="text-xs text-neutral-500">
            Based on: <span class="font-medium text-neutral-800">{{ systemDefaults[0].name }}</span>
          </p>
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
            <PackageByZipPicker
              v-model="newProcessForm.service_package_ids"
              :packages="servicePackages"
            />
          </template>

          <!-- Required Disclosures Selection -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-neutral-700">Required Disclosures</label>
              <span class="text-xs text-neutral-400">{{ newProcessForm.required_disclosures.length }} selected</span>
            </div>
            <p class="text-xs text-neutral-500 mb-2">
              Each selected disclosure is added to this process as its own step (before Pictures). You can edit its questions in the builder.
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
            <PackageByZipPicker
              v-model="editProcessForm.service_package_ids"
              :packages="servicePackages"
              :current-process-id="editingProcess?.id"
            />
          </template>

          <!-- Required Disclosures Checklist -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-neutral-700">Required Disclosures for this Process</label>
              <span class="text-xs text-emerald-700 font-semibold">{{ editProcessForm.required_disclosures.length }} selected</span>
            </div>
            <p class="text-xs text-neutral-500 mb-2">
              Each selected disclosure becomes a <strong>Disclosure step</strong> in this process. Open the builder to add or edit its questions.
            </p>
            <div
              v-if="removedDisclosureSteps.length > 0"
              class="mb-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800"
            >
              Saving will remove these disclosure steps and any question edits made to them:
              <strong>{{ removedDisclosureSteps.map(s => s.name).join(', ') }}</strong>
            </div>
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
          <!-- Documents generated for listings under this process -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-neutral-700">Documents</label>
              <span class="text-xs text-emerald-700 font-semibold">{{ editProcessForm.documents.length }} enabled</span>
            </div>
            <p class="text-xs text-neutral-500 mb-2">
              Documents generated for each listing. A document is only created when it applies to the listing
              (state, property type, and rules like HOA membership or year built).
            </p>
            <div class="space-y-3 max-h-64 overflow-y-auto p-2 border border-neutral-200 rounded-lg bg-neutral-50">
              <div v-for="group in templateGroups" :key="group.key">
                <div class="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">{{ group.label }}</div>
                <label
                  v-for="t in group.templates"
                  :key="t.code"
                  class="flex items-center gap-2.5 p-2 mb-1 bg-white rounded border cursor-pointer text-xs"
                  :class="editProcessForm.documents.includes(t.code) ? 'border-emerald-300' : 'border-neutral-200'"
                >
                  <input type="checkbox" :value="t.code" v-model="editProcessForm.documents" class="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span class="flex-1 font-medium text-neutral-900">{{ t.name }}</span>
                  <span v-if="t.source === 'disclosure'" class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700">From disclosure answers</span>
                </label>
              </div>
              <div v-if="templateGroups.length === 0" class="text-xs text-neutral-400 italic p-2">No document templates found.</div>
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
import SkeletonTable from '@/components/ui/skeleton/SkeletonTable.vue'
import { useAuthStore } from '@/stores/auth'
import { IconPlus, IconSearch, IconX, IconEdit, IconTrash, IconEye, IconFileText, IconCopy } from '@tabler/icons-vue'
import { fetchServicePackages } from '@/services/servicePackageService'
import PackageByZipPicker from '@/components/form/PackageByZipPicker.vue'
import { fetchAvailableDisclosures, fetchDocumentTemplates } from '@/services/listingProcessService'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const processStore = useProcessStore()
const authStore = useAuthStore()
const toast = useToastStore()

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
  service_package_ids: [],
  required_disclosures: [],
  documents: []
})

const documentTemplates = ref([])

const TEMPLATE_TYPE_LABELS = { residential: 'Residential', vacant_land: 'Vacant Land' }

// Templates grouped by state and property type. Only the states of the selected disclosures
// are shown (all states when none are selected).
const templateGroups = computed(() => {
  const selectedStates = new Set(
    availableDisclosures.value
      .filter(d => editProcessForm.value.required_disclosures.includes(d.code) && d.state_code)
      .map(d => d.state_code)
  )
  const groups = {}
  for (const t of documentTemplates.value) {
    if (selectedStates.size > 0 && t.state_code && !selectedStates.has(t.state_code)) continue
    const key = `${t.state_code || 'ALL'}-${t.property_type || 'all'}`
    groups[key] ??= {
      key,
      label: `${t.state_code || 'All states'} – ${TEMPLATE_TYPE_LABELS[t.property_type] || 'All types'}`,
      templates: []
    }
    groups[key].templates.push(t)
  }
  return Object.values(groups)
})

// Disclosures pre-ticked for a blank process (the previous fixed default)
const BLANK_PROCESS_DISCLOSURES = ['mi_residential_appliances', 'mi_residential_conditions', 'lead_paint_disclosure']

const emptyCreateForm = () => ({
  name: '',
  type: '',
  isDefault: false,
  service_package_ids: [],
  base_process_id: null,
  required_disclosures: [...BLANK_PROCESS_DISCLOSURES]
})

const newProcessForm = ref(emptyCreateForm())

// Active System Default processes a new process can start from
const systemDefaults = computed(() =>
  processStore.processes.filter(p => p.agent_id === null && p.isDefault && p.status === 'Active')
)

const stepCount = (process) => (Array.isArray(process.config) ? process.config.length : 0)

// Picking a base pre-ticks that base's disclosures; they can still be changed below.
const selectBaseProcess = (id) => {
  newProcessForm.value.base_process_id = id
  const base = systemDefaults.value.find(p => p.id === id)
  newProcessForm.value.required_disclosures = base
    ? [...(base.required_disclosures || [])]
    : [...BLANK_PROCESS_DISCLOSURES]
}

const openCreateModal = () => {
  newProcessForm.value = emptyCreateForm()
  if (systemDefaults.value.length > 0) selectBaseProcess(systemDefaults.value[0].id)
  showCreateModal.value = true
}

onMounted(async () => {
  processStore.loadProcesses()
  
  try {
    const discRes = await fetchAvailableDisclosures()
    availableDisclosures.value = discRes.data || []
  } catch (e) {
    console.error('Failed to load available disclosures', e)
  }

  try {
    const tplRes = await fetchDocumentTemplates()
    documentTemplates.value = tplRes.data || []
  } catch (e) {
    console.error('Failed to load document templates', e)
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
    service_package_ids: [...(process.service_package_ids || [])],
    required_disclosures: Array.isArray(process.required_disclosures) ? [...process.required_disclosures] : [],
    // null on the server means "every document that applies"
    documents: Array.isArray(process.documents) ? [...process.documents] : documentTemplates.value.map(t => t.code)
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
      // All enabled = null, so new templates added later are included automatically
      documents: editProcessForm.value.documents.length === documentTemplates.value.length
        ? null
        : editProcessForm.value.documents,
    }
    // Only agents see the package picker; leaving the list out keeps the linked packages unchanged
    if (isAgent.value) {
      payload.service_package_ids = editProcessForm.value.service_package_ids || []
    }
    await processStore.updateProcess(editingProcess.value.id, payload)
    // The server adds/removes disclosure steps, so reload to get the synced config
    await processStore.loadProcesses()
    showEditSettingsModal.value = false
    editingProcess.value = null
  } catch (e) {
    console.error('Failed to update process settings', e)
  } finally {
    isSubmitting.value = false
  }
}

// Disclosure steps currently in the process whose disclosure is being unchecked
const removedDisclosureSteps = computed(() => {
  const config = editingProcess.value?.config
  if (!Array.isArray(config)) return []
  const selected = editProcessForm.value.required_disclosures
  return config.filter(s => s.type === 'disclosure' && !selected.includes(s.disclosure_code))
})

const isCopying = ref(false)

const handleCopy = async (process) => {
  if (isCopying.value) return
  isCopying.value = true
  try {
    const copy = await processStore.copyProcess(process.id, `${process.name} (My Copy)`)
    toast.success(`"${process.name}" copied. You can now edit its steps and disclosure questions.`)
    if (copy?.id) router.push(`${getBasePath()}/processes/${copy.id}/builder`)
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Failed to copy process.')
  } finally {
    isCopying.value = false
  }
}

const getDisclosureTitle = (code) => {
  const d = availableDisclosures.value.find(item => item.code === code)
  return d ? d.title : code
}

const formatDisclosureCode = (code) => {
  if (code.includes('single_family')) return 'Single Family'
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
    { title: 'System Default', processes: filteredProcesses.value.filter(p => p.agent_id === null && p.isDefault) },
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
    
    if (newProcessForm.value.service_package_ids?.length) {
      payload.service_package_ids = newProcessForm.value.service_package_ids
    }

    if (newProcessForm.value.base_process_id) {
      payload.base_process_id = newProcessForm.value.base_process_id
    }

    // With a base, always send the ticked list (even empty) so unticking a base disclosure is kept
    if (newProcessForm.value.base_process_id || newProcessForm.value.required_disclosures?.length > 0) {
      payload.required_disclosures = newProcessForm.value.required_disclosures
    }
    
    const newProc = await processStore.addProcess(payload)
    
    showCreateModal.value = false
    const createdName = newProcessForm.value.name
    newProcessForm.value = emptyCreateForm()
    
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
