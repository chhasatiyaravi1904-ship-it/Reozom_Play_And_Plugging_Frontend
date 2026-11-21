import type { StripeSyncSummary } from './stripe'

export interface PackageItem {
  id: string
  name: string
  slug: string
  description?: string | null
  price?: string | number | null
  durationDays: number
  sortOrder: number
  isActive: boolean
  maxListingProcesses?: number | null
  features?: string[]
  /** Website card: what the plan includes (shown with ✓), in display order */
  includedFeatures?: string[]
  /** Website card: what the plan does not include (shown with ✕) */
  excludedFeatures?: string[]
  stripeSync?: StripeSyncSummary
  createdAt?: string
  updatedAt?: string
}

export interface PaginationMeta {
  currentPage?: number
  perPage?: number
  total?: number
  lastPage?: number
}

export interface PackageListResponse {
  items?: PackageItem[]
  data?: PackageItem[]
  meta?: PaginationMeta
}

export interface CreatePackagePayload {
  name: string
  slug: string
  description?: string | null
  price?: number | null
  durationDays: number
  sortOrder?: number
  isActive?: boolean
  maxListingProcesses?: number | null
  features?: string[]
  includedFeatures?: string[]
  excludedFeatures?: string[]
}

export interface UpdatePackagePayload extends Partial<CreatePackagePayload> {}

export interface PackageQueryParams {
  search?: string
  is_active?: boolean
  sort?: string
  direction?: 'asc' | 'desc'
  per_page?: number
}
