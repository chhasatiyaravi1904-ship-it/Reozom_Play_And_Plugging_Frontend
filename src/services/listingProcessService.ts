import api from './api'

export interface ListingProcess {
  id: number;
  name: string;
  type: string | null;
  status: string | null;
  agent_id: number | null;
  assigned_zips: string[] | null;
  required_disclosures?: string[] | null;
  config: any[] | null;
  service_package_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export const fetchListingProcesses = () => {
  return api.get<ListingProcess[]>('/listing-processes')
}

export const fetchAvailableDisclosures = (stateCode?: string, propertyType?: string) => {
  return api.get<any[]>('/listing-processes/available-disclosures', {
    params: { state_code: stateCode, property_type: propertyType }
  })
}

export const getListingProcess = (id: string | number) => {
  return api.get<ListingProcess>(`/listing-processes/${id}`)
}

export const createListingProcess = (data: Partial<ListingProcess>) => {
  return api.post<ListingProcess>('/listing-processes', data)
}

export const updateListingProcess = (id: string | number, data: Partial<ListingProcess>) => {
  return api.put<ListingProcess>(`/listing-processes/${id}`, data)
}

export const deleteListingProcess = (id: string | number) => {
  return api.delete(`/listing-processes/${id}`)
}
