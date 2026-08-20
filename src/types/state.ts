export interface StateCountySummary {
  id: string | number
  name: string
  fipsCode?: string
  mlsCount?: number
  listingsCount?: number
}

export interface StateMlsSummary {
  id: string | number
  name: string
  code: string
  isActive?: boolean
}

export interface StateItem {
  id: string | number
  name: string
  slug?: string
  code: string // e.g. 'MI', 'TX', 'CA', 'FL'
  status?: 'active' | 'inactive'
  isActive?: boolean
  countiesCount?: number
  counties_count?: number
  mlsCount?: number
  mls_count?: number
  listingsCount?: number
  listings_count?: number
  disclosuresCount?: number
  disclosures_count?: number
  requiresDisclosure?: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface StateDetail extends StateItem {
  counties?: StateCountySummary[]
  mlsFeeds?: StateMlsSummary[]
  region?: string
  capital?: string
  taxRateStandard?: string
  standardDisclosureForm?: string
  notes?: string
}

export interface CreateStatePayload {
  name: string
  slug?: string
  code: string
  isActive?: boolean
  status?: 'active' | 'inactive'
}

export interface UpdateStatePayload extends Partial<CreateStatePayload> {}



export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
}

export interface StateListResponse {
  items?: StateItem[]
  data?: StateItem[]
  meta?: PaginationMeta
}

export interface StateQueryParams {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

