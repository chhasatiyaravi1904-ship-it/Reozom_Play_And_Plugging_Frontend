import api from './api'

export interface ListingProcess {
  id: number;
  name: string;
  type: string | null;
  status: string | null;
  agent_id: number | null;
  assigned_zips: string[] | null;
  required_disclosures?: string[] | null;
  documents?: string[] | null;
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

/** Copy a process (e.g. a system default) into a new custom process the user can edit. */
export const copyListingProcess = (id: string | number, name?: string) => {
  return api.post<ListingProcess>(`/listing-processes/${id}/copy`, name ? { name } : {})
}

/** Replace a customized disclosure step with a fresh copy of the master disclosure questions. */
export const resetDisclosureStep = (id: string | number, disclosureCode: string) => {
  return api.post<ListingProcess>(`/listing-processes/${id}/disclosure-steps/${disclosureCode}/reset`)
}

export interface DocumentTemplateOption {
  id: number
  code: string
  name: string
  state_code: string | null
  property_type: string | null
  source: 'disclosure' | 'static'
  disclosure_codes: string[] | null
  requires_signature: boolean
}

/** Documents a process can generate (for the Documents toggles in process settings). */
export const fetchDocumentTemplates = () => {
  return api.get<DocumentTemplateOption[]>('/listing-processes/document-templates')
}
