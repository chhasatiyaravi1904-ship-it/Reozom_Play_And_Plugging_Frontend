export type DocumentStatus = 'pending' | 'uploaded' | 'failed'

export interface DocumentRequirement {
  id: string
  label: string
  required: boolean
  status: DocumentStatus
  fileName?: string
  uploadedAt?: string
}
