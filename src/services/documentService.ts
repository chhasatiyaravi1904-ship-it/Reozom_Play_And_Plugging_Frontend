import api from './api'
import type { DocumentRequirement } from '@/types/document'

export const fetchDocuments = (listingId: number) => {
  return api.get<DocumentRequirement[]>(`/listings/${listingId}/documents`)
}

export const uploadDocument = (
  listingId: number,
  documentId: string,
  file: File,
  onProgress?: (percent: number) => void,
) => {
  const formData = new FormData()
  formData.append('document_id', documentId)
  formData.append('file', file)

  return api.post(`/listings/${listingId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    },
  })
}

export const deleteDocument = (listingId: number, documentId: string) => {
  return api.delete(`/listings/${listingId}/documents/${documentId}`)
}
