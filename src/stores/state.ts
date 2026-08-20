import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import * as stateService from '@/services/stateService'
import { isNetworkError } from '@/services/api'
import { sampleStates } from '@/services/sampleData'
import type {
  StateItem,
  StateDetail,
  PaginationMeta,
  CreateStatePayload,
  UpdateStatePayload,
  StateQueryParams,
} from '@/types/state'

export const useStateStore = defineStore('state', () => {
  const states = ref<StateItem[]>([])
  const activeState = ref<StateDetail | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const detailStatus = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  // Filters & Search
  const searchQuery = ref('')
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
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
  function normalizeStateItem(s: any): StateItem {
    if (!s || typeof s !== 'object') return s
    const isAct =
      s.isActive !== undefined
        ? Boolean(s.isActive)
        : s.is_active !== undefined
          ? Boolean(s.is_active)
          : s.status !== 'inactive'

    return {
      ...s,
      id: s.id,
      name: s.name || '',
      slug: s.slug || (s.name ? slugify(s.name) : ''),
      code: (s.code || '').toUpperCase(),
      status: isAct ? 'active' : 'inactive',
      isActive: isAct,
      createdAt: s.createdAt || s.created_at || '',
      updatedAt: s.updatedAt || s.updated_at || '',
      countiesCount:
        s.countiesCount ?? s.counties_count ?? (Array.isArray(s.counties) ? s.counties.length : 0),
      mlsCount: s.mlsCount ?? s.mls_count ?? (Array.isArray(s.mlsFeeds) ? s.mlsFeeds.length : 0),
      listingsCount: s.listingsCount ?? s.listings_count ?? 0,
      disclosuresCount: s.disclosuresCount ?? s.disclosures_count ?? 0,
      requiresDisclosure: s.requiresDisclosure ?? true,
      description: s.description || '',
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
      if (Array.isArray(responsePayload.states)) return responsePayload.states
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
      if (responsePayload.state && typeof responsePayload.state === 'object') {
        return responsePayload.state
      }
    }
    return responsePayload
  }

  // Computed summary metrics
  const totalStates = computed(() => (meta.value?.total ? meta.value.total : states.value.length))
  const activeStatesCount = computed(
    () => states.value.filter((s) => s.status === 'active' || s.isActive).length,
  )
  const totalCountiesCount = computed(() =>
    states.value.reduce((acc, s) => acc + (s.countiesCount || 0), 0),
  )
  const totalMlsCount = computed(() =>
    states.value.reduce((acc, s) => acc + (s.mlsCount || 0), 0),
  )
  const totalListingsCount = computed(() =>
    states.value.reduce((acc, s) => acc + (s.listingsCount || 0), 0),
  )

  // Filtered & sorted state list
  const filteredStates = computed(() => {
    return states.value
      .filter((s) => {
        // Status filter
        if (statusFilter.value !== 'all') {
          const isAct = s.status === 'active' || s.isActive === true
          if (statusFilter.value === 'active' && !isAct) return false
          if (statusFilter.value === 'inactive' && isAct) return false
        }

        // Search query (matches name, code, or slug)
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim()
          const matchName = s.name.toLowerCase().includes(q)
          const matchCode = s.code.toLowerCase().includes(q)
          const matchSlug = (s.slug || '').toLowerCase().includes(q)
          if (!matchName && !matchCode && !matchSlug) return false
        }

        return true
      })
      .sort((a, b) => {
        const field = sortBy.value as keyof StateItem
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
  const paginatedStates = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filteredStates.value.slice(start, start + perPage.value)
  })

  // Reset to page 1 whenever the filtered set or page size changes underneath the user
  watch([searchQuery, statusFilter, perPage], () => {
    page.value = 1
  })

  // Clamp page if it's now out of range (e.g. after a delete)
  watch(filteredStates, (list) => {
    const maxPage = Math.max(1, Math.ceil(list.length / perPage.value))
    if (page.value > maxPage) page.value = maxPage
  })

  /**
   * Fetch all states listing from API (GET /states)
   */
  async function fetchStates(params?: StateQueryParams) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await stateService.fetchStates({ per_page: 100, ...params })
      const rawPayload = response.data
      const rawList = extractItems(rawPayload)
      states.value = rawList.map(normalizeStateItem)

      if (rawPayload && typeof rawPayload === 'object' && rawPayload.meta) {
        meta.value = rawPayload.meta
      }
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        // DEV fallback: Use sample states
        states.value = (sampleStates as any[]).map(normalizeStateItem)
      } else {
        status.value = 'error'
        error.value = 'Unable to load states. Please verify your connection to the Laravel API.'
      }
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Fetch single state details from API (GET /states/{id})
   */
  async function fetchState(id: number | string) {
    detailStatus.value = 'loading'
    error.value = null
    try {
      const response = await stateService.fetchState(id)
      const raw = extractDetail(response.data)
      const normalized = normalizeStateItem(raw) as StateDetail
      activeState.value = {
        ...normalized,
        counties: raw.counties || [],
        mlsFeeds: raw.mlsFeeds || raw.mls_feeds || [],
        region: raw.region || '',
        capital: raw.capital || '',
        standardDisclosureForm: raw.standardDisclosureForm || raw.standard_disclosure_form || '',
      }
      return activeState.value
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        const found = sampleStates.find(
          (s) =>
            String(s.id) === String(id) ||
            s.code.toLowerCase() === String(id).toLowerCase() ||
            (s as any).slug === String(id),
        )
        if (found) {
          activeState.value = normalizeStateItem(found) as StateDetail
          return activeState.value
        }
      }
      detailStatus.value = 'error'
      error.value = `Unable to load state details for ID ${id}.`
      return null
    } finally {
      if (detailStatus.value !== 'error') detailStatus.value = 'idle'
    }
  }

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Create a new state (POST /states)
   */
  async function createState(payload: CreateStatePayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: CreateStatePayload = {
        name: payload.name.trim(),
        slug: payload.slug?.trim() || slugify(payload.name),
        code: payload.code.toUpperCase().trim(),
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
      }
      const response = await stateService.createState(cleanPayload)
      const raw = extractDetail(response.data)
      const formatted = normalizeStateItem(raw)
      states.value.unshift(formatted)
      return formatted
    } catch (err: any) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        const mockNew = normalizeStateItem({
          id: `mock-${Date.now()}`,
          name: payload.name,
          slug: payload.slug || slugify(payload.name),
          code: payload.code.toUpperCase(),
          status: payload.isActive === false ? 'inactive' : 'active',
          isActive: payload.isActive !== false,
          countiesCount: 0,
          mlsCount: 0,
          listingsCount: 0,
        })
        states.value.unshift(mockNew)
        return mockNew
      }
      status.value = 'error'
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error
      error.value = backendMsg || 'Failed to create state. Please check your inputs.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  /**
   * Update an existing state (PUT /states/{id})
   */
  async function updateState(id: number | string, payload: UpdateStatePayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: UpdateStatePayload = {}
      if (payload.name !== undefined) {
        cleanPayload.name = payload.name.trim()
        cleanPayload.slug = payload.slug?.trim() || slugify(payload.name)
      } else if (payload.slug !== undefined) {
        cleanPayload.slug = payload.slug.trim()
      }
      if (payload.code !== undefined) cleanPayload.code = payload.code.toUpperCase().trim()
      if (payload.isActive !== undefined) cleanPayload.isActive = Boolean(payload.isActive)

      const response = await stateService.updateState(id, cleanPayload)
      const raw = extractDetail(response.data)
      const formatted = normalizeStateItem(raw)
      const idx = states.value.findIndex((s) => String(s.id) === String(id))
      if (idx !== -1) {
        states.value[idx] = { ...states.value[idx], ...formatted }
      }
      if (activeState.value && String(activeState.value.id) === String(id)) {
        activeState.value = { ...activeState.value, ...formatted }
      }
      return formatted
    } catch (err: any) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        const idx = states.value.findIndex((s) => String(s.id) === String(id))
        if (idx !== -1) {
          states.value[idx] = normalizeStateItem({
            ...states.value[idx],
            ...payload,
            code: (payload.code || states.value[idx].code).toUpperCase(),
          })
          if (activeState.value && String(activeState.value.id) === String(id)) {
            activeState.value = { ...activeState.value, ...states.value[idx] }
          }
          return states.value[idx]
        }
      }
      status.value = 'error'
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error
      error.value = backendMsg || 'Failed to update state.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }



  /**
   * Toggle state active/inactive status (PATCH /states/{id}/status)
   */
  async function toggleStatus(id: number | string) {
    const target = states.value.find((s) => String(s.id) === String(id))
    if (!target) return false

    const newStatus: 'active' | 'inactive' =
      target.status === 'active' || target.isActive ? 'inactive' : 'active'
    const newIsActive = newStatus === 'active'
    try {
      await stateService.toggleStateStatus(id, newStatus)
      target.status = newStatus
      target.isActive = newIsActive
      if (activeState.value && String(activeState.value.id) === String(id)) {
        activeState.value.status = newStatus
        activeState.value.isActive = newIsActive
      }
      return true
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        target.status = newStatus
        target.isActive = newIsActive
        if (activeState.value && String(activeState.value.id) === String(id)) {
          activeState.value.status = newStatus
          activeState.value.isActive = newIsActive
        }
        return true
      }
      error.value = 'Failed to update status.'
      return false
    }
  }

  /**
   * Delete a state (DELETE /states/{id})
   */
  async function deleteState(id: number | string) {
    try {
      await stateService.deleteState(id)
      states.value = states.value.filter((s) => String(s.id) !== String(id))
      if (activeState.value && String(activeState.value.id) === String(id)) {
        activeState.value = null
      }
      return true
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        states.value = states.value.filter((s) => String(s.id) !== String(id))
        if (activeState.value && String(activeState.value.id) === String(id)) {
          activeState.value = null
        }
        return true
      }
      error.value = 'Failed to delete state.'
      return false
    }
  }

  function resetFilters() {
    searchQuery.value = ''
    statusFilter.value = 'all'
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    page.value = 1
    perPage.value = 10
  }

  return {
    states,
    activeState,
    meta,
    status,
    detailStatus,
    error,
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    page,
    perPage,
    totalStates,
    activeStatesCount,
    totalCountiesCount,
    totalMlsCount,
    totalListingsCount,
    filteredStates,
    paginatedStates,
    fetchStates,
    fetchState,
    createState,
    updateState,
    toggleStatus,
    deleteState,
    resetFilters,
  }
})

