import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AxiosError } from 'axios'

vi.mock('@/services/listingService', () => ({
  fetchListings: vi.fn(),
  fetchListing: vi.fn(),
  createListing: vi.fn(),
}))

import * as listingService from '@/services/listingService'
import { useListingStore } from '../listing'

const listing = (id: number, extra: Record<string, unknown> = {}) => ({ id, status: 'published', ...extra }) as any
const serverError = () =>
  new AxiosError('fail', '500', undefined, undefined, {
    status: 500, statusText: 'Error', headers: {}, config: {} as any, data: {},
  })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

describe('listing store', () => {
  it('loads listings and selects the first one', async () => {
    vi.mocked(listingService.fetchListings).mockResolvedValue({ data: [listing(3), listing(8)] } as any)
    const store = useListingStore()

    const pending = store.fetchListings()
    expect(store.status).toBe('loading') // drives the shimmer placeholders
    await pending

    expect(store.status).toBe('idle')
    expect(store.listings.map((l) => l.id)).toEqual([3, 8])
    expect(store.activeListing?.id).toBe(3)
  })

  it('shows an error (not sample data) when the server answers with an error', async () => {
    vi.mocked(listingService.fetchListings).mockRejectedValue(serverError())
    const store = useListingStore()

    await store.fetchListings()
    expect(store.status).toBe('error')
    expect(store.error).toContain('Unable to load your listings')
    expect(store.listings).toEqual([])
  })

  it('loads a single listing', async () => {
    vi.mocked(listingService.fetchListing).mockResolvedValue({ data: listing(12, { isOwner: true }) } as any)
    const store = useListingStore()

    await store.fetchListing(12)
    expect(store.activeListing?.id).toBe(12)
    expect(store.status).toBe('idle')
  })

  it('reports an error when a single listing fails to load', async () => {
    vi.mocked(listingService.fetchListing).mockRejectedValue(serverError())
    const store = useListingStore()

    await store.fetchListing(99)
    expect(store.status).toBe('error')
  })
})
