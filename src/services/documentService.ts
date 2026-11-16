import api, { getAuthToken } from './api'
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

export interface SignPayload {
  signer_name: string
  signature_image?: string
  signature_type?: 'drawn' | 'typed'
  initials_image?: string
  legal_consent?: boolean
}

export const signDocument = (
  listingId: number,
  documentId: string,
  payloadOrName?: string | SignPayload,
) => {
  const payload =
    typeof payloadOrName === 'string'
      ? { signer_name: payloadOrName }
      : payloadOrName || {}

  return api.post(`/listings/${listingId}/documents/${documentId}/sign`, payload)
}

export const signAllDocuments = (listingId: number, payload: SignPayload) => {
  return api.post(`/listings/${listingId}/documents/sign-all`, payload)
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

export const downloadDocument = (listingId: number, documentId: string, inline = false) => {
  return api.get(`/listings/${listingId}/documents/${documentId}/download${inline ? '?inline=1' : ''}`, {
    responseType: 'blob'
  })
}

export const viewDocument = (listingId: number, documentId: string) => {
  return api.get(`/listings/${listingId}/documents/${documentId}/view`, {
    responseType: 'blob'
  })
}

export const getDocumentViewUrl = (listingId: number, documentId: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  const token = getAuthToken()
  const url = `${baseUrl}/listings/${listingId}/documents/${documentId}/view`
  return token ? `${url}?token=${encodeURIComponent(token)}` : url
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

export const sendDocumentEmail = (
  listingId: number,
  documentId: string,
  emails: string[],
  note?: string,
) => {
  return api.post(`/listings/${listingId}/documents/${documentId}/send-email`, {
    emails,
    note,
  })
}

export const renameDocument = (
  listingId: number,
  documentId: string,
  name: string,
) => {
  return api.put(`/listings/${listingId}/documents/${documentId}/rename`, {
    name,
  })
}


export interface ManagedDocument {
  id: number
  listingId: number
  listingReference: string | null
  listingAddress: string
  state: string | null
  sellerName: string | null
  name: string
  fileName: string
  type: string
  kind: 'generated' | 'uploaded'
  status: string
  signedAt: string | null
  size: number | null
  updatedAt: string | null
  canManage: boolean
}

export interface ManagedDocumentsPage {
  items: ManagedDocument[]
  meta: { currentPage: number; lastPage: number; perPage: number; total: number }
}

/** Manage Documents: all documents the user can access across listings (admin: all, agent: their listings, seller: own). */
export const fetchManagedDocuments = (params: {
  search?: string
  state?: string
  status?: string
  kind?: string
  page?: number
}) => {
  return api.get<ManagedDocumentsPage>('/documents', { params })
}

/** Re-render a generated document from the current listing answers. */
export const regenerateDocument = (listingId: number, documentId: string | number) => {
  return api.post(`/listings/${listingId}/documents/${documentId}/regenerate`)
}
