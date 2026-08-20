export interface CountyStateSummary {
  id: string | number
  name: string
  slug?: string
  code: string
  isActive?: boolean
}

export interface CountyCitySummary {
  id: string | number
  name: string
}

export interface CountyItem {
  id: string | number
  name: string
  slug?: string
  code: string
  stateId: string | number
  status?: 'active' | 'inactive'
  isActive?: boolean
  state?: CountyStateSummary | null
  citiesCount?: number
  cities_count?: number
  createdAt?: string
  updatedAt?: string
}

export interface CountyDetail extends CountyItem {
  cities?: CountyCitySummary[]
}

export interface CreateCountyPayload {
  name: string
  slug?: string
  code: string
  stateId: string
  isActive?: boolean
  status?: 'active' | 'inactive'
}

export interface UpdateCountyPayload extends Partial<CreateCountyPayload> {}

export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
}

export interface CountyListResponse {
  items?: CountyItem[]
  data?: CountyItem[]
  meta?: PaginationMeta
}

export interface CountyQueryParams {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  state_id?: string | number
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
