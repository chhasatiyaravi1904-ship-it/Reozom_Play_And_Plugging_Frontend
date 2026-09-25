export interface ZipCodeStateSummary {
  id: string | number
  name: string
  code: string
}

export interface ZipCodeCountySummary {
  id: string | number
  name: string
  code: string
}

export interface ZipCodeCitySummary {
  id: string | number
  name: string
  code: string
}

export interface ZipCodeItem {
  id: string | number
  code: string
  stateId: string | number
  countyId: string | number
  cityId: string | number
  status?: 'active' | 'inactive'
  isActive?: boolean
  state?: ZipCodeStateSummary | null
  county?: ZipCodeCountySummary | null
  city?: ZipCodeCitySummary | null
  createdAt?: string
  updatedAt?: string
}

export interface ZipCodeDetail extends ZipCodeItem {}

export interface CreateZipCodePayload {
  code: string
  stateId: string
  countyId: string
  cityId: string
  isActive?: boolean
  status?: 'active' | 'inactive'
}

export interface UpdateZipCodePayload extends Partial<CreateZipCodePayload> {}

export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
}

export interface ZipCodeListResponse {
  items?: ZipCodeItem[]
  data?: ZipCodeItem[]
  meta?: PaginationMeta
}

export interface ZipCodeQueryParams {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  state_id?: string | number
  county_id?: string | number
  city_id?: string | number
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
