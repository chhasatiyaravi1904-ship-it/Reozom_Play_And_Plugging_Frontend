import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as publicListingService from '@/services/publicListingService'
import type { PublicListing } from '@/services/publicListingService'

export const samplePublishedListings: PublicListing[] = [
  {
    id: 7,
    reference_code: 'RZ-TX78701',
    status: 'published',
    address: { street: '1428 Congress Ave', city: 'Austin', state: 'TX', zip: '78701' },
    public_info: [],
    values: {
      listing_title: 'Modern Family Home with Pool',
      listing_price: '425000',
      property_type: 'single_family',
      bedrooms: '4',
      bathrooms: '3',
      square_feet: '2850',
    },
    images: [{
      id: 6,
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      alt: 'Modern contemporary family home exterior in Austin Texas',
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 8,
    reference_code: 'RZ-WA98004',
    status: 'published',
    address: { street: '320 Horizon Crest Way', city: 'Bellevue', state: 'WA', zip: '98004' },
    public_info: [],
    values: {
      listing_title: 'Luxury Waterfront Villa',
      listing_price: '1850000',
      property_type: 'single_family',
      bedrooms: '5',
      bathrooms: '4.5',
      square_feet: '4200',
    },
    images: [{
      id: 7,
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      alt: 'Luxury waterfront villa with lake views and glass architecture',
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 9,
    reference_code: 'RZ-FL33131',
    status: 'published',
    address: { street: '950 Brickell Bay Dr #420', city: 'Miami', state: 'FL', zip: '33131' },
    public_info: [],
    values: {
      listing_title: 'Urban Loft Penthouse',
      listing_price: '680000',
      property_type: 'condo',
      bedrooms: '2',
      bathrooms: '2',
      square_feet: '1450',
    },
    images: [{
      id: 8,
      url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      alt: 'High-rise urban penthouse loft overlooking Miami skyline',
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 10,
    reference_code: 'RZ-CO80302',
    status: 'published',
    address: { street: '740 Chautauqua Alpine Rd', city: 'Boulder', state: 'CO', zip: '80302' },
    public_info: [],
    values: {
      listing_title: 'Modern Mountain Alpine Retreat',
      listing_price: '920000',
      property_type: 'single_family',
      bedrooms: '3',
      bathrooms: '3',
      square_feet: '2800',
    },
    images: [{
      id: 9,
      url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      alt: 'Scenic alpine mountain home with timber and stone finishes',
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 11,
    reference_code: 'RZ-DC20007',
    status: 'published',
    address: { street: '2804 O St NW', city: 'Washington', state: 'DC', zip: '20007' },
    public_info: [],
    values: {
      listing_title: 'Historic Georgetown Townhouse',
      listing_price: '1250000',
      property_type: 'townhouse',
      bedrooms: '3',
      bathrooms: '3.5',
      square_feet: '2600',
    },
    images: [{
      id: 10,
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      alt: 'Renovated historic Georgetown townhouse with private brick terrace',
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 12,
    reference_code: 'RZ-CA92101',
    status: 'published',
    address: { street: '1250 Coronado Bay Way', city: 'San Diego', state: 'CA', zip: '92101' },
    public_info: [],
    values: {
      listing_title: 'Sunlit Mediterranean Residence',
      listing_price: '750000',
      property_type: 'single_family',
      bedrooms: '4',
      bathrooms: '3',
      square_feet: '3100',
    },
    images: [{
      id: 11,
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      thumbnail_url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Sunlit Mediterranean coastal estate with private courtyard',
    }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const usePublicListingStore = defineStore('publicListing', () => {
  const listings = ref<PublicListing[]>([...samplePublishedListings])
  const activeListing = ref<PublicListing | null>(null)
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: samplePublishedListings.length,
  })
  
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  async function fetchListings(page = 1, params?: Record<string, any>) {
    status.value = 'loading'
    error.value = null
    try {
      const response = await publicListingService.fetchPublicListings(page, params)
      const payload: any = response.data

      let items: PublicListing[] = []
      if (Array.isArray(payload)) {
        items = payload
      } else if (payload && Array.isArray(payload.data)) {
        items = payload.data
      } else if (payload && typeof payload === 'object' && Array.isArray((payload as any).items)) {
        items = (payload as any).items
      }

      if (items.length > 0) {
        listings.value = items
      }

      if (payload && typeof payload === 'object' && payload.meta) {
        meta.value = {
          current_page: payload.meta.current_page || page,
          last_page: payload.meta.last_page || 1,
          per_page: payload.meta.per_page || 12,
          total: payload.meta.total ?? listings.value.length,
        }
      } else {
        meta.value = {
          current_page: page,
          last_page: 1,
          per_page: listings.value.length || 12,
          total: listings.value.length,
        }
      }
    } catch (err: any) {
      status.value = 'error'
      error.value = 'Unable to load listings'
      // Keep existing listings or fallback if none
      if (!Array.isArray(listings.value) || listings.value.length === 0) {
        listings.value = [...samplePublishedListings]
      }
    } finally {
      status.value = 'idle'
    }
  }

  async function fetchListing(id: number) {
    status.value = 'loading'
    error.value = null
    activeListing.value = null
    try {
      const response = await publicListingService.fetchPublicListing(id)
      const payload: any = response.data
      activeListing.value = payload?.data ?? payload
    } catch (err: any) {
      status.value = 'error'
      error.value = 'Unable to load listing details'
      // Fallback to sample matching id
      activeListing.value = samplePublishedListings.find(item => item.id === Number(id)) || null
    } finally {
      status.value = 'idle'
    }
  }

  return {
    listings,
    activeListing,
    meta,
    status,
    error,
    fetchListings,
    fetchListing,
  }
})
