import api from './api'
import type {
  MlsDirectoryItem,
  MlsDirectoryDetail,
  MlsDirectoryListResponse,
  MlsInfoItem,
  MlsInfoListResponse,
  CreateMlsDirectoryPayload,
  UpdateMlsDirectoryPayload,
  CreateMlsInfoPayload,
  UpdateMlsInfoPayload,
} from '@/types/mls'

export interface MlsDirectoryQueryParams {
  search?: string
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

export interface MlsInfoQueryParams {
  search?: string
  mls_directory_id?: number
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

/** Laravel validates snake_case keys — translate at the API boundary. */
function directoryToApiPayload(payload: Partial<CreateMlsDirectoryPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.title !== undefined) body.title = payload.title
  return body
}

function infoToApiPayload(payload: Partial<CreateMlsInfoPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.mlsDirectoryId !== undefined) body.mls_directory_id = payload.mlsDirectoryId
  if (payload.title !== undefined) body.title = payload.title
  if (payload.countries !== undefined) body.countries = payload.countries
  if (payload.publicWebsitesTitle !== undefined) body.public_websites_title = payload.publicWebsitesTitle
  if (payload.websites !== undefined) body.websites = payload.websites
  if (payload.info !== undefined) body.info = payload.info
  return body
}

export const fetchMlsDirectories = (params?: MlsDirectoryQueryParams) => {
  return api.get<MlsDirectoryListResponse | MlsDirectoryItem[]>('/mls-directories', { params })
}

export const fetchMlsDirectory = (id: number | string) => {
  return api.get<MlsDirectoryDetail>(`/mls-directories/${id}`)
}

export const createMlsDirectory = (payload: CreateMlsDirectoryPayload) => {
  return api.post<MlsDirectoryItem>('/mls-directories', directoryToApiPayload(payload))
}

export const updateMlsDirectory = (id: number | string, payload: UpdateMlsDirectoryPayload) => {
  return api.put<MlsDirectoryItem>(`/mls-directories/${id}`, directoryToApiPayload(payload))
}

export const deleteMlsDirectory = (id: number | string) => {
  return api.delete(`/mls-directories/${id}`)
}

export const fetchMlsInfos = (params?: MlsInfoQueryParams) => {
  return api.get<MlsInfoListResponse | MlsInfoItem[]>('/mls-infos', { params })
}

export const fetchMlsInfo = (id: number | string) => {
  return api.get<MlsInfoItem>(`/mls-infos/${id}`)
}

export const createMlsInfo = (payload: CreateMlsInfoPayload) => {
  return api.post<MlsInfoItem>('/mls-infos', infoToApiPayload(payload))
}

export const updateMlsInfo = (id: number | string, payload: UpdateMlsInfoPayload) => {
  return api.put<MlsInfoItem>(`/mls-infos/${id}`, infoToApiPayload(payload))
}

export const deleteMlsInfo = (id: number | string) => {
  return api.delete(`/mls-infos/${id}`)
}
