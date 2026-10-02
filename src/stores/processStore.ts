import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchListingProcesses,
  getListingProcess,
  createListingProcess,
  updateListingProcess as apiUpdateProcess,
  deleteListingProcess as apiDeleteProcess,
  type ListingProcess
} from '../services/listingProcessService'

export const useProcessStore = defineStore('processStore', () => {
  const processes = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadProcesses = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetchListingProcesses()
      // Map API data to the frontend shape
      processes.value = response.data.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type === 'default' ? 'Default - Michigan' : (p.type || 'Custom'),
        status: p.status === 'draft' ? 'Draft' : 'Active',
        isDefault: p.type === 'default',
        lastModified: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Just now',
        config: p.config
      }))
    } catch (e: any) {
      console.error('Failed to load processes', e)
      error.value = e.message || 'Failed to load processes'
    } finally {
      isLoading.value = false
    }
  }

  const addProcess = async (processData: any) => {
    try {
      const newProcData: any = {
        name: processData.name,
        type: processData.isDefault ? 'default' : 'custom',
        status: 'active',
      }
      if (processData.service_package_id) newProcData.service_package_id = processData.service_package_id;
      if (processData.assigned_zips) newProcData.assigned_zips = processData.assigned_zips;

      const response = await createListingProcess(newProcData)
      const p = response.data
      const newProcess = {
        id: p.id,
        name: p.name,
        type: p.type === 'default' ? 'Default - Michigan' : (p.type || 'Custom'),
        status: p.status === 'draft' ? 'Draft' : 'Active',
        isDefault: p.type === 'default',
        lastModified: 'Just now',
        config: p.config
      }
      processes.value.push(newProcess)
      return newProcess
    } catch (e: any) {
      console.error('Failed to create process', e)
      throw e
    }
  }

  const updateProcess = async (id: number | string, updates: any) => {
    try {
      const apiUpdates: any = {}
      if (updates.name !== undefined) apiUpdates.name = updates.name
      if (updates.status !== undefined) apiUpdates.status = updates.status === 'Active' ? 'active' : 'draft'
      if (updates.isDefault !== undefined) apiUpdates.type = updates.isDefault ? 'default' : 'custom'
      
      const response = await apiUpdateProcess(id, apiUpdates)
      
      const index = processes.value.findIndex(p => p.id == id)
      if (index !== -1) {
        processes.value[index] = { 
          ...processes.value[index], 
          ...updates, 
          lastModified: 'Just now' 
        }
      }
    } catch (e: any) {
      console.error('Failed to update process', e)
      throw e
    }
  }

  const deleteProcess = async (id: number | string) => {
    try {
      await apiDeleteProcess(id)
      processes.value = processes.value.filter(p => p.id != id)
    } catch (e: any) {
      console.error('Failed to delete process', e)
      throw e
    }
  }

  const getProcessById = (id: number | string) => {
    return processes.value.find(p => p.id == id)
  }

  return {
    processes,
    isLoading,
    error,
    loadProcesses,
    addProcess,
    updateProcess,
    deleteProcess,
    getProcessById,
  }
})
