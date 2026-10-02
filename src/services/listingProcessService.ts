import api from './api'

export interface ListingProcess {
  id: number;
  name: string;
  type: string | null;
  status: string | null;
  agent_id: number | null;
  assigned_zips: string[] | null;
  config: any[] | null;
  created_at?: string;
  updated_at?: string;
}

export const fetchListingProcesses = () => {
  return api.get<ListingProcess[]>('/listing-processes')
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
