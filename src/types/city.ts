export interface CityStateSummary {
  id: string | number
  name: string
  code: string
}

export interface CityCountySummary {
  id: string | number
  name: string
  slug?: string
  code: string
  stateId?: string | number
  isActive?: boolean
  state?: CityStateSummary | null
}

export interface CityItem {
  id: string | number
  name: string
  slug?: string
  code: string
  countyId: string | number
  status?: 'active' | 'inactive'
  isActive?: boolean
  county?: CityCountySummary | null
  createdAt?: string
  updatedAt?: string
}

export interface CityDetail extends CityItem {}

export interface CreateCityPayload {
  name: string
  slug?: string
  code: string
  countyId: string
  isActive?: boolean
  status?: 'active' | 'inactive'
}

export interface UpdateCityPayload extends Partial<CreateCityPayload> {}

export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
}

export interface CityListResponse {
  items?: CityItem[]
  data?: CityItem[]
  meta?: PaginationMeta
}

export interface CityQueryParams {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  county_id?: string | number
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
