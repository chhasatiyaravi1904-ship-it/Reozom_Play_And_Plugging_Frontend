import api from './api'
import type {
  ZipCodeItem,
  ZipCodeDetail,
  ZipCodeListResponse,
  CreateZipCodePayload,
  UpdateZipCodePayload,
  ZipCodeQueryParams,
} from '@/types/zipCode'

function toApiPayload(payload: Partial<CreateZipCodePayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.code !== undefined) body.code = payload.code
  if (payload.stateId !== undefined) body.state_id = payload.stateId
  if (payload.countyId !== undefined) body.county_id = payload.countyId
  if (payload.cityId !== undefined) body.city_id = payload.cityId
  if (payload.isActive !== undefined) body.is_active = payload.isActive
  return body
}

export const fetchZipCodes = (params?: ZipCodeQueryParams) => {
  return api.get<ZipCodeListResponse | ZipCodeItem[]>('/zip-codes', { params })
}

export const fetchZipCode = (id: number | string) => {
  return api.get<ZipCodeDetail>(`/zip-codes/${id}`)
}

export const lookupZipCode = (code: string) => {
  return api.get<ZipCodeDetail>(`/zip-codes/${code}/lookup`)
}

export const createZipCode = (payload: CreateZipCodePayload) => {
  return api.post<ZipCodeItem>('/zip-codes', toApiPayload(payload))
}

export const updateZipCode = (id: number | string, payload: UpdateZipCodePayload) => {
  return api.put<ZipCodeItem>(`/zip-codes/${id}`, toApiPayload(payload))
}

export const deleteZipCode = (id: number | string) => {
  return api.delete(`/zip-codes/${id}`)
}

export const toggleZipCodeStatus = (id: number | string, isActive: boolean) => {
  return api.put<ZipCodeItem>(`/zip-codes/${id}`, { is_active: isActive })
}
