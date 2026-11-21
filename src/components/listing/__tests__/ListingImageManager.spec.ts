import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('@/services/listingImageService', () => ({
  fetchImages: vi.fn(),
  uploadImages: vi.fn(),
  updateImage: vi.fn(),
  setPrimaryImage: vi.fn(),
  deleteImage: vi.fn(),
  reorderImages: vi.fn(),
}))

import * as service from '@/services/listingImageService'
import ListingImageManager from '../ListingImageManager.vue'

const image = (id: number) => ({ id, url: `/storage/listing-images/${id}.jpg`, thumbnail_url: null, alt_text: '', sort_order: id, is_public: true, is_primary: id === 1 })

beforeEach(() => vi.resetAllMocks())

describe('ListingImageManager photo count (used by the Pictures & Virtual Tours step)', () => {
  it('reports how many photos the listing already has', async () => {
    vi.mocked(service.fetchImages).mockResolvedValue({ data: [image(1), image(2)] } as any)
    const wrapper = mount(ListingImageManager, { props: { listingId: 7 } })
    await flushPromises()

    expect(service.fetchImages).toHaveBeenCalledWith(7)
    expect(wrapper.emitted('count')!.at(-1)).toEqual([2])
  })

  it('reports the new count after uploading photos', async () => {
    vi.mocked(service.fetchImages)
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [image(1), image(2), image(3)] } as any)
    vi.mocked(service.uploadImages).mockResolvedValue({ data: [image(1), image(2), image(3)] } as any)
    const wrapper = mount(ListingImageManager, { props: { listingId: 7 } })
    await flushPromises()

    const input = wrapper.get('input[type="file"]')
    const files = [new File(['x'], 'a.jpg', { type: 'image/jpeg' }), new File(['y'], 'b.png', { type: 'image/png' })]
    Object.defineProperty(input.element, 'files', { value: files })
    await input.trigger('change')
    await flushPromises()

    expect(service.uploadImages).toHaveBeenCalledWith(7, files)
    expect(wrapper.emitted('count')!.at(-1)).toEqual([3])
  })

  it('rejects non-image files without uploading', async () => {
    vi.mocked(service.fetchImages).mockResolvedValue({ data: [] } as any)
    const wrapper = mount(ListingImageManager, { props: { listingId: 7 } })
    await flushPromises()

    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [new File(['x'], 'doc.pdf', { type: 'application/pdf' })] })
    await input.trigger('change')
    await flushPromises()

    expect(service.uploadImages).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Only JPEG, PNG, WEBP')
  })
})
