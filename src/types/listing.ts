export type ListingStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'published'
  | 'under_contract'
  | 'sold'
  | 'rejected'
  | 'withdrawn'
  | 'canceled'
  | 'suspended'
  | 'expired'

export interface PropertyAddress {
  address?: string
  city?: string
  state?: string
  zip: string
  packageId?: number
  property_type?: 'residential' | 'vacant_land'
}

export interface ListingRouting {
  state: string
  county: string
  mls: string
  processId: number
}

export interface ListingSummary {
  id: number
  referenceCode: string
  status: ListingStatus
  address: PropertyAddress
  progressPercent: number
  stepsCompleted: number
  stepsTotal: number
  updatedAt: string
}
