/** Stripe status of a plan (admin package or agent service package). */
export interface StripeSyncSummary {
  status: 'synced' | 'pending' | 'failed' | 'not_required'
  error: string | null
  synced_at: string | null
  product_id: string | null
}
