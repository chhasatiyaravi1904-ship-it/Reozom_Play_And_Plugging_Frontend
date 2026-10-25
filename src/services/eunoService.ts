import api from './api'

export interface EunoAgreementStatus {
  has_agreement: boolean
  agreement_id?: number
  euno_agreement_id?: string
  status: 'not_initiated' | 'draft' | 'inprogress' | 'completed' | 'canceled'
  signing_url?: string
  is_completed?: boolean
  signed_at?: string
  has_signed_pdf?: boolean
  has_audit_pdf?: boolean
  signers?: Array<{
    name?: string
    email: string
    type?: string
  }>
}

export interface EunoInitiateResponse {
  agreement_id: number
  euno_agreement_id: string
  signing_url: string
  status: string
  signers?: any[]
}

/**
 * Initiate Eunodoc e-signing for a listing's disclosures & agreements packet.
 */
export async function initiateListingSigning(listingId: number): Promise<EunoInitiateResponse> {
  const res = await api.post(`/listings/${listingId}/euno-sign/initiate`)
  return (res.data as any)?.data ?? res.data
}

/**
 * Check e-signing status for a listing.
 */
export async function getListingSigningStatus(listingId: number): Promise<EunoAgreementStatus> {
  const res = await api.get(`/listings/${listingId}/euno-sign/status`)
  return (res.data as any)?.data ?? res.data
}

/**
 * Initiate Eunodoc e-signing for a purchase agreement offer.
 */
export async function initiateOfferSigning(offerId: number): Promise<EunoInitiateResponse> {
  const res = await api.post(`/offers/${offerId}/euno-sign/initiate`)
  return (res.data as any)?.data ?? res.data
}

/**
 * Check e-signing status for an offer.
 */
export async function getOfferSigningStatus(offerId: number): Promise<EunoAgreementStatus> {
  const res = await api.get(`/offers/${offerId}/euno-sign/status`)
  return (res.data as any)?.data ?? res.data
}

/**
 * Get direct download link for executed signed PDF.
 */
export function getSignedDocUrl(agreementId: number): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  return `${base}/euno-agreements/${agreementId}/signed-doc`
}

/**
 * Get direct download link for Eunodoc audit trail report.
 */
export function getAuditReportUrl(agreementId: number): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  return `${base}/euno-agreements/${agreementId}/audit`
}
