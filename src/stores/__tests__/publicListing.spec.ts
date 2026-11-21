import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/publicListingService', () => ({
  fetchPublicListings: vi.fn(),
  fetchPublicListing: vi.fn(),
}))

import * as service from '@/services/publicListingService'
import { usePublicListingStore } from '../publicListing'

const listing = (id: number) => ({ id, reference_code: `R${id}`, status: 'published' }) as any

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

describe('public listing store', () => {
  it('reads the unwrapped array and its meta (the home page bug)', async () => {
    const items: any = [listing(1), listing(2)]
    items.meta = { current_page: 1, last_page: 3, per_page: 2, total: 6 }
    vi.mocked(service.fetchPublicListings).mockResolvedValue({ data: items } as any)
    const store = usePublicListingStore()

    await store.fetchListings()
    expect(store.listings.map((l) => l.id)).toEqual([1, 2])
    expect(store.meta).toEqual({ current_page: 1, last_page: 3, per_page: 2, total: 6 })
    expect(store.status).toBe('idle')
  })

  it('also accepts a { data, meta } payload', async () => {
    vi.mocked(service.fetchPublicListings).mockResolvedValue({
      data: { data: [listing(5)], meta: { total: 1 } },
    } as any)
    const store = usePublicListingStore()

    await store.fetchListings(2)
    expect(store.listings.map((l) => l.id)).toEqual([5])
    expect(store.meta.current_page).toBe(2)
    expect(store.meta.total).toBe(1)
  })

  it('a slow older request cannot overwrite newer results', async () => {
    let releaseOld!: (v: any) => void
    vi.mocked(service.fetchPublicListings)
      .mockImplementationOnce(() => new Promise((r) => (releaseOld = r)) as any)
      .mockResolvedValueOnce({ data: [listing(9)] } as any)
    const store = usePublicListingStore()

    const older = store.fetchListings(1, { type: 'condo' })
    await store.fetchListings(1, { type: 'house' })
    releaseOld({ data: [listing(1)] })
    await older

    expect(store.listings.map((l) => l.id)).toEqual([9])
  })

  it('reports an error and empties the list when loading fails', async () => {
    vi.mocked(service.fetchPublicListings).mockRejectedValue(new Error('500'))
    const store = usePublicListingStore()

    await store.fetchListings()
    expect(store.status).toBe('error')
    expect(store.listings).toEqual([])
  })
})
