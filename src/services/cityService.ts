import api from './api'
import type {
  CityItem,
  CityDetail,
  CityListResponse,
  CreateCityPayload,
  UpdateCityPayload,
  CityQueryParams,
} from '@/types/city'

/** Laravel validates snake_case keys (county_id, is_active) — translate at the API boundary. */
function toApiPayload(payload: Partial<CreateCityPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.slug !== undefined) body.slug = payload.slug
  if (payload.code !== undefined) body.code = payload.code
  if (payload.countyId !== undefined) body.county_id = payload.countyId
  if (payload.isActive !== undefined) body.is_active = payload.isActive
  return body
}

/**
 * Fetch list of cities from Laravel REST API (/cities)
 */
export const fetchCities = (params?: CityQueryParams) => {
  return api.get<CityListResponse | CityItem[]>('/cities', { params })
}

/**
 * Fetch specific city details by ID (/cities/{id})
 */
export const fetchCity = (id: number | string) => {
  return api.get<CityDetail>(`/cities/${id}`)
}

/**
 * Create a new city (/cities)
 */
export const createCity = (payload: CreateCityPayload) => {
  return api.post<CityItem>('/cities', toApiPayload(payload))
}

/**
 * Update an existing city (/cities/{id})
 */
export const updateCity = (id: number | string, payload: UpdateCityPayload) => {
  return api.put<CityItem>(`/cities/${id}`, toApiPayload(payload))
}

/**
 * Delete a city (/cities/{id})
 */
export const deleteCity = (id: number | string) => {
  return api.delete(`/cities/${id}`)
}

/**
 * Toggle active/inactive status for a city (PUT /cities/{id})
 */
export const toggleCityStatus = (id: number | string, isActive: boolean) => {
  return api.put<CityItem>(`/cities/${id}`, { is_active: isActive })
}
