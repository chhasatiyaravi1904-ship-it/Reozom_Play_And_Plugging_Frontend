import api from './api'
import type { StripeSyncSummary } from '@/types/stripe'

export interface ServicePackage {
  id: number;
  agent_id: number;
  name: string;
  description: string | null;
  price: number | null;
  zip_codes?: { id: string, code: string }[];
  listing_process_id?: number | null;
  listing_process?: any;
  is_active: boolean;
  stripe_sync?: StripeSyncSummary;
  created_at?: string;
  updated_at?: string;
}

export const fetchServicePackages = () => {
  return api.get<ServicePackage[]>('/agent/service-packages')
}

export const getServicePackage = (id: string | number) => {
  return api.get<ServicePackage>(`/agent/service-packages/${id}`)
}

export const createServicePackage = (data: Partial<ServicePackage>) => {
  return api.post<ServicePackage>('/agent/service-packages', data)
}

export const updateServicePackage = (id: string | number, data: Partial<ServicePackage>) => {
  return api.put<ServicePackage>(`/agent/service-packages/${id}`, data)
}

export const deleteServicePackage = (id: string | number) => {
  return api.delete(`/agent/service-packages/${id}`)
}

export const searchZipCodes = (query: string) => {
  return api.get<any>(`/zip-codes`, { params: { search: query } })
}

export const searchServicePackagesByZip = (zipcode: string) => {
  return api.get<any>(`/public/service-packages/search`, { params: { zipcode } })
}

export interface PublicPackageMatch {
  id: number
  name: string
  description: string | null
  price: string | number | null
  agent: { id: number; first_name: string | null; last_name: string | null }
  zip_codes: string[]
  zip_codes_count: number
}

export interface PublicPackageMatchPage {
  data: PublicPackageMatch[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

/** Public ZIP matching engine: paginated, optional ZIP prefix. */
export const listPublicServicePackages = (params: { zip?: string; page?: number; per_page?: number }) => {
  return api.get<PublicPackageMatchPage>('/public/service-packages', { params })
}


/** Create/refresh this plan in Stripe now (Retry for a failed or pending sync). */
export const syncServicePackageToStripe = (id: number) => {
  return api.post<StripeSyncSummary>(`/agent/service-packages/${id}/stripe-sync`)
}
