import api from './api'

export interface ListingImage {
  id: number
  url: string
  thumbnail_url: string | null
  alt_text: string
  sort_order: number
  is_public: boolean
  is_primary: boolean
}

export const fetchImages = (listingId: number) => {
  // Note: Axios interceptor unwraps {success, data} → res.data is ListingImage[]
  return api.get<ListingImage[]>(`/listings/${listingId}/images`)
}

export const uploadImages = (listingId: number, files: File[]) => {
  const formData = new FormData()
  files.forEach(file => formData.append('images[]', file))
  return api.post<ListingImage[]>(`/listings/${listingId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const updateImage = (listingId: number, imageId: number, data: Partial<ListingImage>) => {
  return api.put<{ success: boolean; data: ListingImage; message: string }>(`/listings/${listingId}/images/${imageId}`, data)
}

export const reorderImages = (listingId: number, imageIds: number[]) => {
  return api.post<{ success: boolean; message: string }>(`/listings/${listingId}/images/reorder`, { image_ids: imageIds })
}

export const setPrimaryImage = (listingId: number, imageId: number) => {
  return api.post<{ success: boolean; message: string }>(`/listings/${listingId}/images/${imageId}/primary`)
}

export const deleteImage = (listingId: number, imageId: number) => {
  return api.delete<{ success: boolean; message: string }>(`/listings/${listingId}/images/${imageId}`)
}
