import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import * as mlsService from '@/services/mlsService'
import type {
  MlsDirectoryItem,
  MlsDirectoryDetail,
  MlsInfoItem,
  PaginationMeta,
  CreateMlsDirectoryPayload,
  UpdateMlsDirectoryPayload,
  CreateMlsInfoPayload,
  UpdateMlsInfoPayload,
} from '@/types/mls'

export const useMlsStore = defineStore('mls', () => {
  const directories = ref<MlsDirectoryItem[]>([])
  const activeDirectory = ref<MlsDirectoryDetail | null>(null)
  const meta = ref<PaginationMeta | null>(null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const detailStatus = ref<'idle' | 'loading' | 'error'>('idle')
  const infoStatus = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  // Filters & Search
  const searchQuery = ref('')
  const sortBy = ref<string>('title')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  // Pagination (client-side, over the full fetched + filtered dataset)
  const page = ref(1)
  const perPage = ref(10)

  function normalizeDirectory(raw: any): MlsDirectoryItem {
    return {
      id: raw.id,
      title: raw.title || '',
      infosCount: raw.infosCount ?? (Array.isArray(raw.infos) ? raw.infos.length : 0),
      createdAt: raw.createdAt || raw.created_at || '',
      updatedAt: raw.updatedAt || raw.updated_at || '',
    }
  }

  function normalizeInfo(raw: any): MlsInfoItem {
    return {
      id: raw.id,
      mlsDirectoryId: raw.mlsDirectoryId ?? raw.mls_directory_id,
      title: raw.title ?? null,
      countries: raw.countries || [],
      publicWebsitesTitle: raw.publicWebsitesTitle ?? raw.public_websites_title ?? null,
      websites: raw.websites || [],
      info: raw.info ?? null,
      createdAt: raw.createdAt || raw.created_at || '',
      updatedAt: raw.updatedAt || raw.updated_at || '',
    }
  }

  function extractItems(payload: any): any[] {
    if (Array.isArray(payload)) return payload
    if (payload && typeof payload === 'object') {
      if (Array.isArray(payload.items)) return payload.items
      if (Array.isArray(payload.data)) return payload.data
    }
    return []
  }

  function extractRecord(payload: any): any {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      if (payload.data && typeof payload.data === 'object') return payload.data
    }
    return payload
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

  function apiErrorMessage(err: any, fallback: string): string {
    return err?.response?.data?.message || firstValidationError(err) || fallback
  }

  const totalDirectories = computed(() =>
    meta.value?.total ? meta.value.total : directories.value.length,
  )

  const filteredDirectories = computed(() => {
    return directories.value
      .filter((d) => {
        if (searchQuery.value.trim()) {
          const q = searchQuery.value.toLowerCase().trim()
          return d.title.toLowerCase().includes(q)
        }
        return true
      })
      .sort((a, b) => {
        const field = sortBy.value as keyof MlsDirectoryItem
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

  const paginatedDirectories = computed(() => {
    const start = (page.value - 1) * perPage.value
    return filteredDirectories.value.slice(start, start + perPage.value)
  })

  watch([searchQuery, perPage], () => {
    page.value = 1
  })

  watch(filteredDirectories, (list) => {
    const maxPage = Math.max(1, Math.ceil(list.length / perPage.value))
    if (page.value > maxPage) page.value = maxPage
  })

  async function fetchDirectories() {
    status.value = 'loading'
    error.value = null
    try {
      const response = await mlsService.fetchMlsDirectories({ per_page: 100 })
      const rawPayload = response.data
      directories.value = extractItems(rawPayload).map(normalizeDirectory)
      if (rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) && rawPayload.meta) {
        meta.value = rawPayload.meta
      }
    } catch (err) {
      status.value = 'error'
      error.value = 'Unable to load MLS directories. Please verify your connection to the API.'
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function fetchDirectory(id: number | string) {
    detailStatus.value = 'loading'
    error.value = null
    try {
      const response = await mlsService.fetchMlsDirectory(id)
      const raw = extractRecord(response.data)
      activeDirectory.value = {
        ...normalizeDirectory(raw),
        infos: (raw.infos || []).map(normalizeInfo),
      }
      return activeDirectory.value
    } catch (err) {
      detailStatus.value = 'error'
      error.value = `Unable to load MLS directory ${id}.`
      return null
    } finally {
      if (detailStatus.value !== 'error') detailStatus.value = 'idle'
    }
  }

  async function createDirectory(payload: CreateMlsDirectoryPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await mlsService.createMlsDirectory({ title: payload.title.trim() })
      const formatted = normalizeDirectory(extractRecord(response.data))
      directories.value.unshift(formatted)
      return formatted
    } catch (err: any) {
      status.value = 'error'
      error.value = apiErrorMessage(err, 'Failed to create MLS directory.')
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function updateDirectory(id: number | string, payload: UpdateMlsDirectoryPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const cleanPayload: UpdateMlsDirectoryPayload = {}
      if (payload.title !== undefined) cleanPayload.title = payload.title.trim()

      const response = await mlsService.updateMlsDirectory(id, cleanPayload)
      const formatted = normalizeDirectory(extractRecord(response.data))
      const idx = directories.value.findIndex((d) => String(d.id) === String(id))
      if (idx !== -1) directories.value[idx] = { ...directories.value[idx], ...formatted }
      if (activeDirectory.value && String(activeDirectory.value.id) === String(id)) {
        activeDirectory.value = { ...activeDirectory.value, ...formatted }
      }
      return formatted
    } catch (err: any) {
      status.value = 'error'
      error.value = apiErrorMessage(err, 'Failed to update MLS directory.')
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function deleteDirectory(id: number | string) {
    try {
      await mlsService.deleteMlsDirectory(id)
      directories.value = directories.value.filter((d) => String(d.id) !== String(id))
      if (activeDirectory.value && String(activeDirectory.value.id) === String(id)) {
        activeDirectory.value = null
      }
      return true
    } catch (err) {
      error.value = 'Failed to delete MLS directory.'
      return false
    }
  }

  // --- Info CRUD, scoped to whichever directory is currently open in activeDirectory ---

  async function createInfo(payload: CreateMlsInfoPayload) {
    infoStatus.value = 'loading'
    error.value = null
    try {
      const response = await mlsService.createMlsInfo(payload)
      const formatted = normalizeInfo(extractRecord(response.data))
      if (activeDirectory.value && activeDirectory.value.id === payload.mlsDirectoryId) {
        activeDirectory.value.infos = [...(activeDirectory.value.infos || []), formatted]
        activeDirectory.value.infosCount = activeDirectory.value.infos.length
      }
      const dir = directories.value.find((d) => d.id === payload.mlsDirectoryId)
      if (dir) {
        dir.infosCount = (dir.infosCount || 0) + 1
      }
      infoStatus.value = 'idle'
      return formatted
    } catch (err: any) {
      infoStatus.value = 'error'
      error.value = apiErrorMessage(err, 'Failed to create MLS info.')
      return null
    }
  }

  async function updateInfo(id: number | string, payload: UpdateMlsInfoPayload) {
    infoStatus.value = 'loading'
    error.value = null
    try {
      const response = await mlsService.updateMlsInfo(id, payload)
      const formatted = normalizeInfo(extractRecord(response.data))
      if (activeDirectory.value?.infos) {
        const idx = activeDirectory.value.infos.findIndex((i) => String(i.id) === String(id))
        if (idx !== -1) activeDirectory.value.infos[idx] = formatted
      }
      infoStatus.value = 'idle'
      return formatted
    } catch (err: any) {
      infoStatus.value = 'error'
      error.value = apiErrorMessage(err, 'Failed to update MLS info.')
      return null
    }
  }

  async function deleteInfo(id: number | string) {
    try {
      await mlsService.deleteMlsInfo(id)
      if (activeDirectory.value?.infos) {
        activeDirectory.value.infos = activeDirectory.value.infos.filter(
          (i) => String(i.id) !== String(id),
        )
        activeDirectory.value.infosCount = activeDirectory.value.infos.length
      }
      const dirId = activeDirectory.value?.id
      if (dirId !== undefined) {
        const dir = directories.value.find((d) => d.id === dirId)
        if (dir) {
          dir.infosCount = Math.max(0, (dir.infosCount || 1) - 1)
        }
      }
      return true
    } catch (err) {
      error.value = 'Failed to delete MLS info.'
      return false
    }
  }

  function resetFilters() {
    searchQuery.value = ''
    sortBy.value = 'title'
    sortOrder.value = 'asc'
    page.value = 1
    perPage.value = 10
  }

  return {
    directories,
    activeDirectory,
    meta,
    status,
    detailStatus,
    infoStatus,
    error,
    searchQuery,
    sortBy,
    sortOrder,
    page,
    perPage,
    totalDirectories,
    filteredDirectories,
    paginatedDirectories,
    fetchDirectories,
    fetchDirectory,
    createDirectory,
    updateDirectory,
    deleteDirectory,
    createInfo,
    updateInfo,
    deleteInfo,
    resetFilters,
  }
})
