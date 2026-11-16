export type DocumentStatus = 'pending' | 'uploaded' | 'failed' | 'signed' | 'unsigned'

export interface DocumentRequirement {
  id: string
  documentId?: string | null
  label: string
  description?: string
  category?: 'statutory' | 'required' | 'supplementary'
  required: boolean
  status: DocumentStatus
  verificationStatus?: string
  adminNotes?: string | null
  signedAt?: string | null
  signedBy?: string | null
  signatureImage?: string | null
  signatureType?: 'drawn' | 'typed' | null
  verificationCode?: string | null
  isSignable?: boolean
  isPreviewable?: boolean
  /** Generated from a document template (can be regenerated from the listing answers) */
  isGenerated?: boolean
  fileName?: string | null
  uploadedAt?: string | null
  fileSize?: number | null
}
