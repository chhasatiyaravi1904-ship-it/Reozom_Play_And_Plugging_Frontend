import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import * as cityService from '@/services/cityService'
import type {
  CityItem,
  CityDetail,
  PaginationMeta,
  CreateCityPayload,
  UpdateCityPayload,
  CityQueryParams,
} from '@/types/city'

export const useCityStore = defineStore('city', () => {
  const cities = ref<CityItem[]>([])
  const activeCity = ref<CityDetail | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const detailStatus = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  // Filters & Search
  const searchQuery = ref('')
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
  const stateFilter = ref<string | number | 'all'>('all')
  const countyFilter = ref<string | number | 'all'>('all')
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
  function normalizeCityItem(c: any): CityItem {
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
      countyId: c.countyId ?? c.county_id ?? c.county?.id ?? '',
      status: isAct ? 'active' : 'inactive',
      isActive: isAct,
      county: c.county || null,
      createdAt: c.createdAt || c.created_at || '',
      updatedAt: c.updatedAt || c.updated_at || '',
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
      if (Array.isArray(responsePayload.cities)) return responsePayload.cities
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
      if (responsePayload.city && typeof responsePayload.city === 'object') {
        return responsePayload.city
      }
    }
    return responsePayload
  }

  // Computed summary metrics
  const totalCities = computed(() => (meta.value?.total ? meta.value.total : cities.value.length))
  const activeCitiesCount = computed(
    () => cities.value.filter((c) => c.status === 'active' || c.isActive).length,
  )

  // Filtered & sorted city list
  const filteredCities = computed(() => {
    return cities.value
      .filter((c) => {
        // Status filter
        if (statusFilter.value !== 'all') {
          const isAct = c.status === 'active' || c.isActive === true
          if (statusFilter.value === 'active' && !isAct) return false
          if (statusFilter.value === 'inactive' && isAct) return false
        }

        // County filter
        if (countyFilter.value !== 'all' && String(c.countyId) !== String(countyFilter.value)) {
          return false
        }

        // State filter (via nested county.state)
        if (stateFilter.value !== 'all' && String(c.county?.stateId ?? c.county?.state?.id ?? '') !== String(stateFilter.value)) {
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
        const field = sortBy.value as keyof CityItem
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
  const paginatedCities = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filteredCities.value.slice(start, start + perPage.value)
  })

  // Reset to page 1 whenever the filtered set or page size changes underneath the user
  watch([searchQuery, statusFilter, stateFilter, countyFilter, perPage], () => {
    page.value = 1
  })

  // Clamp page if it's now out of range (e.g. after a delete)
  watch(filteredCities, (list) => {
    const maxPage = Math.max(1, Math.ceil(list.length / perPage.value))
    if (page.value > maxPage) page.value = maxPage
  })

  /**
   * Fetch all cities listing from API (GET /cities)
   */
  async function fetchCities(params?: CityQueryParams) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await cityService.fetchCities({ per_page: 100, ...params })
      const rawPayload = response.data
      const rawList = extractItems(rawPayload)
      cities.value = rawList.map(normalizeCityItem)

      if (rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) && rawPayload.meta) {
        meta.value = rawPayload.meta
      }
    } catch (err) {
      status.value = 'error'
      error.value = 'Unable to load cities. Please verify your connection to the Laravel API.'
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Fetch single city details from API (GET /cities/{id})
   */
  async function fetchCity(id: number | string) {
    detailStatus.value = 'loading'
    error.value = null
    try {
      const response = await cityService.fetchCity(id)
      const raw = extractDetail(response.data)
      const normalized = normalizeCityItem(raw) as CityDetail
      activeCity.value = normalized
      return activeCity.value
    } catch (err) {
      detailStatus.value = 'error'
      error.value = `Unable to load city details for ID ${id}.`
      return null
    } finally {
      if (detailStatus.value !== 'error') detailStatus.value = 'idle'
    }
  }

  /**
   * Create a new city (POST /cities)
   */
  async function createCity(payload: CreateCityPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: CreateCityPayload = {
        name: payload.name.trim(),
        slug: payload.slug?.trim() || slugify(payload.name),
        code: payload.code.trim(),
        countyId: payload.countyId,
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      }
      const response = await cityService.createCity(cleanPayload)
      const raw = extractDetail(response.data)
      const formatted = normalizeCityItem(raw)
      cities.value.unshift(formatted)
      return formatted
    } catch (err: any) {
      status.value = 'error'
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        firstValidationError(err)
      error.value = backendMsg || 'Failed to create city. Please check your inputs.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Update an existing city (PUT /cities/{id})
   */
  async function updateCity(id: number | string, payload: UpdateCityPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: UpdateCityPayload = {}
      if (payload.name !== undefined) {
        cleanPayload.name = payload.name.trim()
        cleanPayload.slug = payload.slug?.trim() || slugify(payload.name)
      } else if (payload.slug !== undefined) {
        cleanPayload.slug = payload.slug.trim()
      }
      if (payload.code !== undefined) cleanPayload.code = payload.code.trim()
      if (payload.countyId !== undefined) cleanPayload.countyId = payload.countyId
      if (payload.isActive !== undefined) cleanPayload.isActive = Boolean(payload.isActive)

      const response = await cityService.updateCity(id, cleanPayload)
      const raw = extractDetail(response.data)
      const formatted = normalizeCityItem(raw)
      const idx = cities.value.findIndex((c) => String(c.id) === String(id))
      if (idx !== -1) {
        cities.value[idx] = { ...cities.value[idx], ...formatted }
      }
      if (activeCity.value && String(activeCity.value.id) === String(id)) {
        activeCity.value = { ...activeCity.value, ...formatted }
      }
      return formatted
    } catch (err: any) {
      status.value = 'error'
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        firstValidationError(err)
      error.value = backendMsg || 'Failed to update city.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Toggle city active/inactive status (PUT /cities/{id})
   */
  async function toggleStatus(id: number | string) {
    const target = cities.value.find((c) => String(c.id) === String(id))
    if (!target) return false

    const newIsActive = !(target.status === 'active' || target.isActive)
    try {
      await cityService.toggleCityStatus(id, newIsActive)
      target.status = newIsActive ? 'active' : 'inactive'
      target.isActive = newIsActive
      if (activeCity.value && String(activeCity.value.id) === String(id)) {
        activeCity.value.status = target.status
        activeCity.value.isActive = newIsActive
      }
      return true
    } catch (err) {
      error.value = 'Failed to update status.'
      return false
    }
  }

  /**
   * Delete a city (DELETE /cities/{id})
   */
  async function deleteCity(id: number | string) {
    try {
      await cityService.deleteCity(id)
      cities.value = cities.value.filter((c) => String(c.id) !== String(id))
      if (activeCity.value && String(activeCity.value.id) === String(id)) {
        activeCity.value = null
      }
      return true
    } catch (err) {
      error.value = 'Failed to delete city.'
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
    countyFilter.value = 'all'
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    page.value = 1
    perPage.value = 10
  }

  return {
    cities,
    activeCity,
    meta,
    status,
    detailStatus,
    error,
    searchQuery,
    statusFilter,
    stateFilter,
    countyFilter,
    sortBy,
    sortOrder,
    page,
    perPage,
    totalCities,
    activeCitiesCount,
    filteredCities,
    paginatedCities,
    fetchCities,
    fetchCity,
    createCity,
    updateCity,
    toggleStatus,
    deleteCity,
    resetFilters,
  }
})
