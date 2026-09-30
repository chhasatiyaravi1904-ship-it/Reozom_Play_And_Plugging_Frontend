import api from './api'

export interface ServicePackage {
  id: number;
  agent_id: number;
  name: string;
  description: string | null;
  price: number | null;
  zip_codes?: { id: string, code: string }[];
  is_active: boolean;
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
  return api.get<any[]>(`/public/service-packages/search`, { params: { zipcode } })
}
