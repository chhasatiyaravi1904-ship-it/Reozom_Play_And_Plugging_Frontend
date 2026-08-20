import api from './api'
import type {
  StateItem,
  StateDetail,
  StateListResponse,
  CreateStatePayload,
  UpdateStatePayload,
  StateQueryParams,
} from '@/types/state'

/**
 * Fetch list of states from Laravel REST API (/states)
 */
export const fetchStates = (params?: StateQueryParams) => {
  return api.get<StateListResponse | StateItem[]>('/states', { params })
}


/**
 * Fetch specific state details by ID (/states/{id})
 */
export const fetchState = (id: number | string) => {
  return api.get<StateDetail>(`/states/${id}`)
}

/**
 * Create a new state (/states)
 */
export const createState = (payload: CreateStatePayload) => {
  return api.post<StateItem>('/states', payload)
}

/**
 * Update an existing state (/states/{id})
 */
export const updateState = (id: number | string, payload: UpdateStatePayload) => {
  return api.put<StateItem>(`/states/${id}`, payload)
}

/**
 * Delete a state (/states/{id})
 */
export const deleteState = (id: number | string) => {
  return api.delete(`/states/${id}`)
}

/**
 * Toggle active/inactive status for a state (/states/{id}/status or /states/{id})
 */
export const toggleStateStatus = (id: number | string, status: 'active' | 'inactive') => {
  return api.patch<StateItem>(`/states/${id}/status`, { status }).catch(() => {
    // Fallback to PUT if PATCH /status is not implemented on backend
    return api.put<StateItem>(`/states/${id}`, { status, isActive: status === 'active' })
  })
}
