export type ListingStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'published'
  | 'under_contract'
  | 'ccs'
  | 'contingent_continue_to_show'
  | 'sold'
  | 'rejected'
  | 'withdrawn'
  | 'canceled'
  | 'suspended'
  | 'expired'
  | 'unpublished'

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
  primaryPhotoUrl?: string | null
  offersCount?: number
  packageName?: string | null
  packagePrice?: number | null
  statusChangedDate?: string | null
  price?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  squareFeet?: number | null
  propertyType?: string | null
  listingTitle?: string | null
  remarks?: string | null
  directions?: string | null
  compensation?: number | null
  compensationType?: 1 | 2 | null
  directBuyerRebate?: number | null
  sellerConcessions?: number | null
  userId?: number
  isOwner?: boolean
  canMakeOffer?: boolean
  yearBuilt?: number | null
}
