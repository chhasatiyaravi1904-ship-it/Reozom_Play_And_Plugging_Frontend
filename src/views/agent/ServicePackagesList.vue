<template>
  <div class="h-full bg-neutral-50/50 flex flex-col p-4 md:p-6 overflow-hidden">
    <div class="max-w-6xl w-full mx-auto flex-1 flex flex-col">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Service Packages</h1>
          <p class="text-sm text-neutral-500 mt-1">Manage the packages you offer to sellers and assign zip codes to them.</p>
        </div>
        <button @click="openCreateModal" class="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition shadow-sm">
          <IconPlus :size="18" />
          <span>New Service Package</span>
        </button>
      </div>

      <!-- Main Content -->
      <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex-1 flex flex-col">
        <div class="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="relative w-full sm:w-72 shrink-0">
            <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" :size="18" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search packages..." 
              class="w-full pl-9 pr-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition shadow-sm"
            >
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="bg-white border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                <th class="px-6 py-4">Package Name</th>
                <th class="px-6 py-4">Price</th>
                <th class="px-6 py-4">Zip Codes</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              <tr v-if="isLoading" class="bg-white">
                <td colspan="5" class="px-6 py-8 text-center text-sm text-neutral-500">Loading packages...</td>
              </tr>
              <tr v-else-if="filteredPackages.length === 0" class="bg-white">
                <td colspan="5" class="px-6 py-12 text-center">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-soft text-primary mb-3">
                    <IconFileText :size="24" />
                  </div>
                  <h3 class="text-base font-medium text-neutral-900 mb-1">No packages found</h3>
                  <p class="text-sm text-neutral-500 max-w-sm mx-auto mb-4">You haven't created any service packages yet.</p>
                  <button @click="openCreateModal" class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-active">
                    <IconPlus :size="16" /> Create your first package
                  </button>
                </td>
              </tr>
              <tr v-for="pkg in filteredPackages" :key="pkg.id" class="bg-white hover:bg-neutral-50/50 transition group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div>
                      <div class="text-sm font-semibold text-neutral-900">{{ pkg.name }}</div>
                      <div class="text-xs text-neutral-500 mt-0.5 line-clamp-1 max-w-[200px]">{{ pkg.description || 'No description' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-medium text-neutral-700">${{ pkg.price || '0.00' }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="!pkg.zip_codes || pkg.zip_codes.length === 0" class="text-xs text-neutral-400">None assigned</span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                      {{ pkg.zip_codes.length }} zip(s)
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    pkg.is_active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                  ]">
                    {{ pkg.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="editPackage(pkg)" class="p-2 text-neutral-400 hover:text-primary hover:bg-primary-soft rounded transition" title="Edit Package">
                      <IconEdit :size="18" />
                    </button>
                    <button @click="confirmDelete(pkg)" class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition" title="Delete Package">
                      <IconTrash :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <h3 class="text-lg font-semibold text-neutral-900">{{ form.id ? 'Edit' : 'Create' }} Service Package</h3>
          <button @click="showModal = false" class="text-neutral-400 hover:text-neutral-600 transition p-1 rounded-md hover:bg-neutral-100">
            <IconX :size="20" />
          </button>
        </div>
        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Package Name *</label>
            <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Premium Listing Service" />
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Package details..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1">Price ($)</label>
            <input v-model="form.price" type="number" step="0.01" class="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 500.00" />
          </div>
          <div class="relative">
            <label class="block text-sm font-medium text-neutral-700 mb-1">Assigned Zip Codes</label>
            <div class="relative">
              <div 
                class="min-h-[42px] w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary flex flex-wrap gap-2 items-center bg-white cursor-text"
                @click="openDropdown"
              >
                <!-- Selected Tags -->
                <div v-for="(z, idx) in form.selectedZips" :key="idx" class="flex items-center gap-1 bg-primary-soft text-primary px-2 py-1 rounded-md text-sm border border-primary/20">
                  <span>{{ z.code }}</span>
                  <button @click.stop="removeZip(idx)" class="hover:text-primary-active rounded-full p-0.5 transition-colors">
                    <IconX :size="14" />
                  </button>
                </div>
                
                <!-- Input -->
                <input 
                  ref="zipInputRef"
                  v-model="zipSearchInput" 
                  @input="onZipSearch" 
                  @focus="isDropdownOpen = true"
                  @keydown.enter.prevent="selectFirstZip"
                  type="text" 
                  class="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-neutral-400" 
                  :placeholder="form.selectedZips.length ? '' : 'Select zip codes...'" 
                />
              </div>

              <!-- Icons -->
              <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-400 pointer-events-none">
                <IconLoader2 v-if="isSearchingZips" class="animate-spin text-primary" :size="18" />
                <IconChevronDown v-else class="transition-transform" :class="{ 'rotate-180': isDropdownOpen }" :size="18" />
              </div>
            </div>
            
            <!-- Dropdown Panel -->
            <div v-if="isDropdownOpen" class="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
              <button v-for="z in zipSearchResults" :key="z.id" @click.prevent="selectZip(z)" class="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-soft hover:text-primary flex items-center justify-between border-b border-neutral-100 last:border-0 transition-colors">
                <span class="font-medium">{{ z.code }}</span>
                <span class="text-xs opacity-70" v-if="z.city || z.state">{{ z.city?.name }}, {{ z.state?.code }}</span>
              </button>
              <div v-if="zipSearchResults.length === 0 && !isSearchingZips" class="p-4 text-center text-sm text-neutral-500">
                No zip codes found {{ zipSearchInput ? `matching "${zipSearchInput}"` : '' }}
              </div>
            </div>
            
            <p class="text-xs text-neutral-500 mt-1">Sellers searching these zip codes will see this package.</p>
          </div>
          
          <!-- Invisible overlay to close dropdown when clicking outside -->
          <div v-if="isDropdownOpen" class="fixed inset-0 z-10" @click="isDropdownOpen = false"></div>
          <label class="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" v-model="form.is_active" class="w-4 h-4 text-primary rounded border-neutral-300 focus:ring-primary">
            <span class="text-sm font-medium text-neutral-700">Package is Active</span>
          </label>
        </div>
        <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end gap-3 shrink-0">
          <button @click="showModal = false" class="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">Cancel</button>
          <button @click="handleSave" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition" :disabled="isSaving || !form.name">
            {{ isSaving ? 'Saving...' : 'Save Package' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IconPlus, IconSearch, IconX, IconEdit, IconTrash, IconFileText, IconLoader2, IconChevronDown } from '@tabler/icons-vue'
import { fetchServicePackages, createServicePackage, updateServicePackage, deleteServicePackage, searchZipCodes, type ServicePackage } from '@/services/servicePackageService'
import { useZipCodeStore } from '@/stores/zipCode'

const zipCodeStore = useZipCodeStore()
const packages = ref<ServicePackage[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const isDropdownOpen = ref(false)
const zipInputRef = ref<HTMLInputElement | null>(null)

const openDropdown = () => {
  isDropdownOpen.value = true
  zipInputRef.value?.focus()
  onZipSearch()
}

const form = ref({
  id: null as number | null,
  name: '',
  description: '',
  price: '',
  selectedZips: [] as { id: string, code: string, city?: any, state?: any }[],
  is_active: true
})

const zipSearchInput = ref('')
const isSearchingZips = ref(false) // Left for template compatibility, though local search is instant

const zipSearchResults = computed(() => {
  const query = zipSearchInput.value.trim().toLowerCase()
  const selectedIds = form.value.selectedZips.map(z => z.id)
  
  return zipCodeStore.zipCodes.filter(z => {
    if (!z.code) return false
    return z.code.toLowerCase().includes(query) && !selectedIds.includes(z.id)
  })
})

const filteredPackages = computed(() => {
  if (!searchQuery.value) return packages.value
  const q = searchQuery.value.toLowerCase()
  return packages.value.filter(p => p.name.toLowerCase().includes(q))
})

const loadPackages = async () => {
  isLoading.value = true
  try {
    const response = await fetchServicePackages()
    packages.value = response.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPackages()
  zipCodeStore.fetchZipCodes()
})

const openCreateModal = () => {
  form.value = {
    id: null,
    name: '',
    description: '',
    price: '',
    selectedZips: [],
    is_active: true
  }
  zipSearchInput.value = ''
  showModal.value = true
}

const editPackage = (pkg: ServicePackage) => {
  form.value = {
    id: pkg.id,
    name: pkg.name,
    description: pkg.description || '',
    price: pkg.price?.toString() || '',
    selectedZips: pkg.zip_codes ? [...pkg.zip_codes] : [],
    is_active: pkg.is_active
  }
  zipSearchInput.value = ''
  showModal.value = true
}

const onZipSearch = () => {
  // No-op because zipSearchResults is now a computed property
}

const selectZip = (zip: any) => {
  form.value.selectedZips.push(zip)
  zipSearchInput.value = ''
  zipInputRef.value?.focus()
}

const selectFirstZip = () => {
  if (zipSearchResults.value.length > 0) {
    selectZip(zipSearchResults.value[0])
  }
}

const removeZip = (index: number) => {
  form.value.selectedZips.splice(index, 1)
}

const handleSave = async () => {
  isSaving.value = true
  
  const zipCodesArray = form.value.selectedZips.map(z => z.code)
  const pendingInput = zipSearchInput.value.trim()
  if (pendingInput.length >= 5 && !zipCodesArray.includes(pendingInput)) {
    // If they typed a zip code but forgot to select it before saving
    zipCodesArray.push(pendingInput)
  }

  const payload = {
    name: form.value.name,
    description: form.value.description,
    price: parseFloat(form.value.price) || 0,
    assigned_zips: zipCodesArray,
    is_active: form.value.is_active
  }

  try {
    if (form.value.id) {
      await updateServicePackage(form.value.id, payload)
    } else {
      await createServicePackage(payload)
    }
    showModal.value = false
    loadPackages()
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async (pkg: ServicePackage) => {
  if (confirm(`Are you sure you want to delete ${pkg.name}?`)) {
    try {
      await deleteServicePackage(pkg.id)
      loadPackages()
    } catch (e) {
      console.error(e)
    }
  }
}
</script>
