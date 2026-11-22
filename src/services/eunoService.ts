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
  /** Agent listings have no listing documents to sign (original Reozom). */
  is_agent_listing?: boolean
  /** In-progress agreement: who signs next, and whether the current user may sign now. */
  next_signer?: string | null
  can_sign_now?: boolean
  /** In signing order: owner first, then additional signers. */
  signers?: Array<{
    name?: string
    email: string
    type?: string
    signed?: boolean
    is_next?: boolean
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
/**
 * Send the listing's unsigned documents for signature. `forceRecreate` cancels an open request
 * and sends a new one (admin "regenerate and send", original Reozom).
 */
export async function initiateListingSigning(listingId: number, forceRecreate = false): Promise<EunoInitiateResponse> {
  const res = await api.post(`/listings/${listingId}/euno-sign/initiate`, forceRecreate ? { force_recreate: true } : {})
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
 * Cancel the open purchase agreement and send a new one (listing owner or admin).
 */
export async function resendOfferSigning(offerId: number): Promise<EunoInitiateResponse> {
  const res = await api.post(`/offers/${offerId}/euno-sign/resend`)
  return (res.data as any)?.data ?? res.data
}

/** Addendum/Amendment to an accepted purchase agreement (original Reozom Addendum). */
export interface OfferAddendum {
  id: number
  description: string
  created_at: string | null
  status: 'inprogress' | 'completed' | 'canceled' | 'not_sent' | string
  agreement_id: number | null
  has_signed_pdf: boolean
  /** The current user's own signing link, while the addendum waits for signatures. */
  signing_url: string | null
  signers: Array<{ name: string; email: string }>
}

export async function fetchOfferAddendums(offerId: number): Promise<OfferAddendum[]> {
  const res = await api.get(`/offers/${offerId}/addendums`)
  return ((res.data as any)?.data ?? res.data) as OfferAddendum[]
}

/** Cancel an addendum: its signing request and the copies shared with seller and buyer go too. */
export async function cancelOfferAddendum(offerId: number, addendumId: number): Promise<void> {
  await api.delete(`/offers/${offerId}/addendums/${addendumId}`)
}

export async function createOfferAddendum(offerId: number, description: string): Promise<OfferAddendum> {
  const res = await api.post(`/offers/${offerId}/addendums`, { description })
  return ((res.data as any)?.data ?? res.data) as OfferAddendum
}

/**
 * Check e-signing status for an offer.
 */
export async function getOfferSigningStatus(offerId: number): Promise<EunoAgreementStatus> {
  const res = await api.get(`/offers/${offerId}/euno-sign/status`)
  return (res.data as any)?.data ?? res.data
}

import { getAuthToken } from './api'

/**
 * Get direct download link for executed signed PDF.
 */
export function getSignedDocUrl(agreementId: number): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  const token = getAuthToken()
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${base}/euno-agreements/${agreementId}/signed-doc${query}`
}

/**
 * Get direct download link for Eunodoc audit trail report.
 */
export function getAuditReportUrl(agreementId: number): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  const token = getAuthToken()
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${base}/euno-agreements/${agreementId}/audit${query}`
}

export interface PendingSignature {
  agreement_id: number
  /** listing_documents, or (as Reozom's dashboard) a purchase agreement / addendum on an offer */
  kind?: 'listing_documents' | 'purchase_agreement' | 'addendum'
  offer_id?: number | null
  listing_id: number
  listing_address: string
  document_name: string
  document_count: number
  sent_at: string | null
  signing_url: string
}

/**
 * Listing documents waiting for the logged-in user's signature (each with their own link).
 */
export async function getPendingSignatures(): Promise<PendingSignature[]> {
  const res = await api.get('/me/pending-signatures')
  const data = (res.data as any)?.data ?? res.data
  return Array.isArray(data?.items) ? data.items : []
}
