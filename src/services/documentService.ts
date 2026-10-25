import api from './api'
import type { DocumentRequirement } from '@/types/document'

export const fetchDocuments = (listingId: number) => {
  return api.get<DocumentRequirement[]>(`/listings/${listingId}/documents`)
}

export const uploadDocument = (
  listingId: number,
  documentId: string,
  file: File,
  customNameOrProgress?: string | ((percent: number) => void),
  onProgress?: (percent: number) => void,
) => {
  const customName = typeof customNameOrProgress === 'string' ? customNameOrProgress : undefined
  const progressCallback = typeof customNameOrProgress === 'function' ? customNameOrProgress : onProgress

  const formData = new FormData()
  formData.append('document_id', documentId)
  formData.append('file', file)
  if (customName) {
    formData.append('custom_name', customName)
  }

  return api.post(`/listings/${listingId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (progressCallback && event.total) {
        progressCallback(Math.round((event.loaded / event.total) * 100))
      }
    },
  })
}

export const signDocument = (listingId: number, documentId: string, signerName?: string) => {
  return api.post(`/listings/${listingId}/documents/${documentId}/sign`, {
    signer_name: signerName,
  })
}

export const previewDocument = (listingId: number, documentId: string) => {
  return api.get<{
    success: boolean
    data: {
      id: string
      type: string
      name: string
      status: string
      signedAt: string | null
      signedBy: string | null
      html: string
    }
  }>(`/listings/${listingId}/documents/${documentId}/preview`)
}

export const deleteDocument = (listingId: number, documentId: string) => {
  return api.delete(`/listings/${listingId}/documents/${documentId}`)
}

export const downloadDocument = (listingId: number, documentId: string) => {
  return api.get(`/listings/${listingId}/documents/${documentId}/download`, {
    responseType: 'blob'
  })
}

export const reviewDocument = (
  listingId: number,
  documentId: string,
  status: 'approved' | 'rejected' | 'pending_review',
  adminNotes?: string
) => {
  return api.put(`/listings/${listingId}/documents/${documentId}/review`, {
    status,
    admin_notes: adminNotes,
  })
}

export const downloadAllDocuments = (listingId: number) => {
  return api.get(`/listings/${listingId}/documents-download-all`, {
    responseType: 'blob'
  })
}

