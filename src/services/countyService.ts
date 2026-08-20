import api from './api'
import type {
  CountyItem,
  CountyDetail,
  CountyListResponse,
  CreateCountyPayload,
  UpdateCountyPayload,
  CountyQueryParams,
} from '@/types/county'

/** Laravel validates snake_case keys (state_id, is_active) — translate at the API boundary. */
function toApiPayload(payload: Partial<CreateCountyPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.slug !== undefined) body.slug = payload.slug
  if (payload.code !== undefined) body.code = payload.code
  if (payload.stateId !== undefined) body.state_id = payload.stateId
  if (payload.isActive !== undefined) body.is_active = payload.isActive
  return body
}

/**
 * Fetch list of counties from Laravel REST API (/counties)
 */
export const fetchCounties = (params?: CountyQueryParams) => {
  return api.get<CountyListResponse | CountyItem[]>('/counties', { params })
}

/**
 * Fetch specific county details by ID (/counties/{id})
 */
export const fetchCounty = (id: number | string) => {
  return api.get<CountyDetail>(`/counties/${id}`)
}

/**
 * Create a new county (/counties)
 */
export const createCounty = (payload: CreateCountyPayload) => {
  return api.post<CountyItem>('/counties', toApiPayload(payload))
}

/**
 * Update an existing county (/counties/{id})
 */
export const updateCounty = (id: number | string, payload: UpdateCountyPayload) => {
  return api.put<CountyItem>(`/counties/${id}`, toApiPayload(payload))
}

/**
 * Delete a county (/counties/{id})
 */
export const deleteCounty = (id: number | string) => {
  return api.delete(`/counties/${id}`)
}

/**
 * Toggle active/inactive status for a county (PUT /counties/{id})
 */
export const toggleCountyStatus = (id: number | string, isActive: boolean) => {
  return api.put<CountyItem>(`/counties/${id}`, { is_active: isActive })
}
