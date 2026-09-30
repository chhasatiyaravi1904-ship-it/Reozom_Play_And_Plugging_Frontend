import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import * as zipCodeService from '@/services/zipCodeService'
import type {
  ZipCodeItem,
  ZipCodeDetail,
  PaginationMeta,
  CreateZipCodePayload,
  UpdateZipCodePayload,
  ZipCodeQueryParams,
} from '@/types/zipCode'

export const useZipCodeStore = defineStore('zipCode', () => {
  const zipCodes = ref<ZipCodeItem[]>([])
  const activeZipCode = ref<ZipCodeDetail | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const detailStatus = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  const searchQuery = ref('')
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
  const stateFilter = ref<string | number | 'all'>('all')
  const countyFilter = ref<string | number | 'all'>('all')
  const cityFilter = ref<string | number | 'all'>('all')
  const sortBy = ref<string>('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const page = ref(1)
  const perPage = ref(10)

  function normalizeZipCodeItem(z: any): ZipCodeItem {
    if (!z || typeof z !== 'object') return z
    const isAct =
      z.isActive !== undefined
        ? Boolean(z.isActive)
        : z.is_active !== undefined
          ? Boolean(z.is_active)
          : z.status !== 'inactive'

    return {
      ...z,
      id: z.id,
      code: z.code || '',
      stateId: z.stateId ?? z.state_id ?? z.state?.id ?? '',
      countyId: z.countyId ?? z.county_id ?? z.county?.id ?? '',
      cityId: z.cityId ?? z.city_id ?? z.city?.id ?? '',
      status: isAct ? 'active' : 'inactive',
      isActive: isAct,
      state: z.state || null,
      county: z.county || null,
      city: z.city || null,
      createdAt: z.createdAt || z.created_at || '',
      updatedAt: z.updatedAt || z.updated_at || '',
    }
  }

  function extractItems(responsePayload: any): any[] {
    if (Array.isArray(responsePayload)) return responsePayload
    if (responsePayload && typeof responsePayload === 'object') {
      if (Array.isArray(responsePayload.items)) return responsePayload.items
      if (Array.isArray(responsePayload.data)) return responsePayload.data
      if (responsePayload.data && typeof responsePayload.data === 'object') {
        if (Array.isArray(responsePayload.data.items)) return responsePayload.data.items
        if (Array.isArray(responsePayload.data.data)) return responsePayload.data.data
      }
      if (Array.isArray(responsePayload.zipCodes)) return responsePayload.zipCodes
    }
    return []
  }

  function extractDetail(responsePayload: any): any {
    if (responsePayload && typeof responsePayload === 'object') {
      if (responsePayload.item && typeof responsePayload.item === 'object') return responsePayload.item
      if (responsePayload.data && typeof responsePayload.data === 'object' && !Array.isArray(responsePayload.data)) return responsePayload.data
      if (responsePayload.zipCode && typeof responsePayload.zipCode === 'object') return responsePayload.zipCode
    }
    return responsePayload
  }

  const filteredZipCodes = computed(() => {
    return zipCodes.value
      .filter((z) => {
        if (statusFilter.value !== 'all') {
          const isAct = z.status === 'active' || z.isActive === true
          if (statusFilter.value === 'active' && !isAct) return false
          if (statusFilter.value === 'inactive' && isAct) return false
        }
        if (stateFilter.value !== 'all' && String(z.stateId) !== String(stateFilter.value)) return false
        if (countyFilter.value !== 'all' && String(z.countyId) !== String(countyFilter.value)) return false
        if (cityFilter.value !== 'all' && String(z.cityId) !== String(cityFilter.value)) return false
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim()
          if (!z.code.toLowerCase().includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const field = sortBy.value as keyof ZipCodeItem
        let valA: any = a[field] ?? ''
        let valB: any = b[field] ?? ''
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        const dir = sortOrder.value === 'asc' ? 1 : -1
        if (valA < valB) return -1 * dir
        if (valA > valB) return 1 * dir
        return 0
      })
  })

  const paginatedZipCodes = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filteredZipCodes.value.slice(start, start + perPage.value)
  })

  watch([searchQuery, statusFilter, stateFilter, countyFilter, cityFilter, perPage], () => {
    page.value = 1
  })

  async function fetchZipCodes(params?: ZipCodeQueryParams) {
    status.value = 'loading'
    error.value = null
    try {
      const apiParams = {
        per_page: 100,
        sort: sortBy.value,
        direction: sortOrder.value,
        ...params
      }
      const response = await zipCodeService.fetchZipCodes(apiParams)
      const rawPayload = response.data
      const rawList = extractItems(rawPayload)
      zipCodes.value = rawList.map(normalizeZipCodeItem)
      if (rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) && rawPayload.meta) {
        meta.value = rawPayload.meta
      }
    } catch (err) {
      status.value = 'error'
      error.value = 'Unable to load ZIP codes.'
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function createZipCode(payload: CreateZipCodePayload) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await zipCodeService.createZipCode({
        ...payload,
        code: payload.code.trim(),
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      })
      const formatted = normalizeZipCodeItem(extractDetail(response.data))
      zipCodes.value.unshift(formatted)
      return formatted
    } catch (err: any) {
      status.value = 'error'
      error.value = err?.response?.data?.message || 'Failed to create ZIP code.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function updateZipCode(id: number | string, payload: UpdateZipCodePayload) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await zipCodeService.updateZipCode(id, payload)
      const formatted = normalizeZipCodeItem(extractDetail(response.data))
      const idx = zipCodes.value.findIndex((z) => String(z.id) === String(id))
      if (idx !== -1) zipCodes.value[idx] = { ...zipCodes.value[idx], ...formatted }
      return formatted
    } catch (err: any) {
      status.value = 'error'
      error.value = err?.response?.data?.message || 'Failed to update ZIP code.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function toggleStatus(id: number | string) {
    const target = zipCodes.value.find((z) => String(z.id) === String(id))
    if (!target) return false
    const newIsActive = !(target.status === 'active' || target.isActive)
    try {
      await zipCodeService.toggleZipCodeStatus(id, newIsActive)
      target.status = newIsActive ? 'active' : 'inactive'
      target.isActive = newIsActive
      return true
    } catch (err) {
      error.value = 'Failed to update status.'
      return false
    }
  }

  async function deleteZipCode(id: number | string) {
    try {
      await zipCodeService.deleteZipCode(id)
      zipCodes.value = zipCodes.value.filter((z) => String(z.id) !== String(id))
      return true
    } catch (err) {
      error.value = 'Failed to delete ZIP code.'
      return false
    }
  }

  function resetFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    stateFilter.value = 'all'
    countyFilter.value = 'all'
    cityFilter.value = 'all'
    sortBy.value = 'created_at'
    sortOrder.value = 'desc'
    page.value = 1
  }

  return {
    zipCodes,
    activeZipCode,
    meta,
    status,
    detailStatus,
    error,
    searchQuery,
    statusFilter,
    stateFilter,
    countyFilter,
    cityFilter,
    sortBy,
    sortOrder,
    page,
    perPage,
    filteredZipCodes,
    paginatedZipCodes,
    fetchZipCodes,
    createZipCode,
    updateZipCode,
    toggleStatus,
    deleteZipCode,
    resetFilters,
  }
})
