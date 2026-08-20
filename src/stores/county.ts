import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import * as countyService from '@/services/countyService'
import type {
  CountyItem,
  CountyDetail,
  PaginationMeta,
  CreateCountyPayload,
  UpdateCountyPayload,
  CountyQueryParams,
} from '@/types/county'

export const useCountyStore = defineStore('county', () => {
  const counties = ref<CountyItem[]>([])
  const activeCounty = ref<CountyDetail | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const detailStatus = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  // Filters & Search
  const searchQuery = ref('')
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
  const stateFilter = ref<string | number | 'all'>('all')
  const sortBy = ref<string>('name')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  // Pagination (client-side, over the full fetched + filtered dataset)
  const page = ref(1)
  const perPage = ref(10)

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Normalization helper
  function normalizeCountyItem(c: any): CountyItem {
    if (!c || typeof c !== 'object') return c
    const isAct =
      c.isActive !== undefined
        ? Boolean(c.isActive)
        : c.is_active !== undefined
          ? Boolean(c.is_active)
          : c.status !== 'inactive'

    return {
      ...c,
      id: c.id,
      name: c.name || '',
      slug: c.slug || (c.name ? slugify(c.name) : ''),
      code: c.code || '',
      stateId: c.stateId ?? c.state_id ?? c.state?.id ?? '',
      status: isAct ? 'active' : 'inactive',
      isActive: isAct,
      state: c.state || null,
      createdAt: c.createdAt || c.created_at || '',
      updatedAt: c.updatedAt || c.updated_at || '',
      citiesCount:
        c.citiesCount ?? c.cities_count ?? (Array.isArray(c.cities) ? c.cities.length : 0),
    }
  }

  // Safe items extractor from various Laravel API shapes:
  // { items: [...] }, { data: [...] }, or [...]
  function extractItems(responsePayload: any): any[] {
    if (Array.isArray(responsePayload)) {
      return responsePayload
    }
    if (responsePayload && typeof responsePayload === 'object') {
      if (Array.isArray(responsePayload.items)) return responsePayload.items
      if (Array.isArray(responsePayload.data)) return responsePayload.data
      if (Array.isArray(responsePayload.counties)) return responsePayload.counties
    }
    return []
  }

  function extractDetail(responsePayload: any): any {
    if (responsePayload && typeof responsePayload === 'object') {
      if (responsePayload.item && typeof responsePayload.item === 'object') {
        return responsePayload.item
      }
      if (
        responsePayload.data &&
        typeof responsePayload.data === 'object' &&
        !Array.isArray(responsePayload.data)
      ) {
        return responsePayload.data
      }
      if (responsePayload.county && typeof responsePayload.county === 'object') {
        return responsePayload.county
      }
    }
    return responsePayload
  }

  // Computed summary metrics
  const totalCounties = computed(() =>
    meta.value?.total ? meta.value.total : counties.value.length,
  )
  const activeCountiesCount = computed(
    () => counties.value.filter((c) => c.status === 'active' || c.isActive).length,
  )

  // Filtered & sorted county list
  const filteredCounties = computed(() => {
    return counties.value
      .filter((c) => {
        // Status filter
        if (statusFilter.value !== 'all') {
          const isAct = c.status === 'active' || c.isActive === true
          if (statusFilter.value === 'active' && !isAct) return false
          if (statusFilter.value === 'inactive' && isAct) return false
        }

        // State filter
        if (stateFilter.value !== 'all' && String(c.stateId) !== String(stateFilter.value)) {
          return false
        }

        // Search query (matches name, code, or slug)
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim()
          const matchName = c.name.toLowerCase().includes(q)
          const matchCode = (c.code || '').toLowerCase().includes(q)
          const matchSlug = (c.slug || '').toLowerCase().includes(q)
          if (!matchName && !matchCode && !matchSlug) return false
        }

        return true
      })
      .sort((a, b) => {
        const field = sortBy.value as keyof CountyItem
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

  // Current page slice of the filtered/sorted list
  const paginatedCounties = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filteredCounties.value.slice(start, start + perPage.value)
  })

  // Reset to page 1 whenever the filtered set or page size changes underneath the user
  watch([searchQuery, statusFilter, stateFilter, perPage], () => {
    page.value = 1
  })

  // Clamp page if it's now out of range (e.g. after a delete)
  watch(filteredCounties, (list) => {
    const maxPage = Math.max(1, Math.ceil(list.length / perPage.value))
    if (page.value > maxPage) page.value = maxPage
  })

  /**
   * Fetch all counties listing from API (GET /counties)
   */
  async function fetchCounties(params?: CountyQueryParams) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await countyService.fetchCounties({ per_page: 100, ...params })
      const rawPayload = response.data
      const rawList = extractItems(rawPayload)
      counties.value = rawList.map(normalizeCountyItem)

      if (rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) && rawPayload.meta) {
        meta.value = rawPayload.meta
      }
    } catch (err) {
      status.value = 'error'
      error.value = 'Unable to load counties. Please verify your connection to the Laravel API.'
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Fetch single county details from API (GET /counties/{id})
   */
  async function fetchCounty(id: number | string) {
    detailStatus.value = 'loading'
    error.value = null
    try {
      const response = await countyService.fetchCounty(id)
      const raw = extractDetail(response.data)
      const normalized = normalizeCountyItem(raw) as CountyDetail
      activeCounty.value = {
        ...normalized,
        cities: raw.cities || [],
      }
      return activeCounty.value
    } catch (err) {
      detailStatus.value = 'error'
      error.value = `Unable to load county details for ID ${id}.`
      return null
    } finally {
      if (detailStatus.value !== 'error') detailStatus.value = 'idle'
    }
  }

  /**
   * Create a new county (POST /counties)
   */
  async function createCounty(payload: CreateCountyPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: CreateCountyPayload = {
        name: payload.name.trim(),
        slug: payload.slug?.trim() || slugify(payload.name),
        code: payload.code.trim(),
        stateId: payload.stateId,
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      }
      const response = await countyService.createCounty(cleanPayload)
      const raw = extractDetail(response.data)
      const formatted = normalizeCountyItem(raw)
      counties.value.unshift(formatted)
      return formatted
    } catch (err: any) {
      status.value = 'error'
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        firstValidationError(err)
      error.value = backendMsg || 'Failed to create county. Please check your inputs.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Update an existing county (PUT /counties/{id})
   */
  async function updateCounty(id: number | string, payload: UpdateCountyPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: UpdateCountyPayload = {}
      if (payload.name !== undefined) {
        cleanPayload.name = payload.name.trim()
        cleanPayload.slug = payload.slug?.trim() || slugify(payload.name)
      } else if (payload.slug !== undefined) {
        cleanPayload.slug = payload.slug.trim()
      }
      if (payload.code !== undefined) cleanPayload.code = payload.code.trim()
      if (payload.stateId !== undefined) cleanPayload.stateId = payload.stateId
      if (payload.isActive !== undefined) cleanPayload.isActive = Boolean(payload.isActive)

      const response = await countyService.updateCounty(id, cleanPayload)
      const raw = extractDetail(response.data)
      const formatted = normalizeCountyItem(raw)
      const idx = counties.value.findIndex((c) => String(c.id) === String(id))
      if (idx !== -1) {
        counties.value[idx] = { ...counties.value[idx], ...formatted }
      }
      if (activeCounty.value && String(activeCounty.value.id) === String(id)) {
        activeCounty.value = { ...activeCounty.value, ...formatted }
      }
      return formatted
    } catch (err: any) {
      status.value = 'error'
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        firstValidationError(err)
      error.value = backendMsg || 'Failed to update county.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Toggle county active/inactive status (PUT /counties/{id})
   */
  async function toggleStatus(id: number | string) {
    const target = counties.value.find((c) => String(c.id) === String(id))
    if (!target) return false

    const newIsActive = !(target.status === 'active' || target.isActive)
    try {
      await countyService.toggleCountyStatus(id, newIsActive)
      target.status = newIsActive ? 'active' : 'inactive'
      target.isActive = newIsActive
      if (activeCounty.value && String(activeCounty.value.id) === String(id)) {
        activeCounty.value.status = target.status
        activeCounty.value.isActive = newIsActive
      }
      return true
    } catch (err) {
      error.value = 'Failed to update status.'
      return false
    }
  }

  /**
   * Delete a county (DELETE /counties/{id})
   */
  async function deleteCounty(id: number | string) {
    try {
      await countyService.deleteCounty(id)
      counties.value = counties.value.filter((c) => String(c.id) !== String(id))
      if (activeCounty.value && String(activeCounty.value.id) === String(id)) {
        activeCounty.value = null
      }
      return true
    } catch (err) {
      error.value = 'Failed to delete county.'
      return false
    }
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

  function resetFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    stateFilter.value = 'all'
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    page.value = 1
    perPage.value = 10
  }

  return {
    counties,
    activeCounty,
    meta,
    status,
    detailStatus,
    error,
    searchQuery,
    statusFilter,
    stateFilter,
    sortBy,
    sortOrder,
    page,
    perPage,
    totalCounties,
    activeCountiesCount,
    filteredCounties,
    paginatedCounties,
    fetchCounties,
    fetchCounty,
    createCounty,
    updateCounty,
    toggleStatus,
    deleteCounty,
    resetFilters,
  }
})
