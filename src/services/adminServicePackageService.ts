import api from './api'

/** A service package an agent created (admin read-only list). */
export interface AdminServicePackage {
  id: number
  name: string
  price: string | null
  is_active: boolean
  agent: { id: number; name: string; email: string } | null
  listing_process: string | null
  zip_codes_count: number
  listings_count: number
  created_at: string | null
}

export interface AdminServicePackagePage {
  items: AdminServicePackage[]
  total: number
}

export async function fetchAdminServicePackages(params: {
  page: number
  per_page: number
  search?: string
  status?: string
}): Promise<AdminServicePackagePage> {
  // api.ts unwraps { success, data, meta }: data is the array, with meta attached to it.
  const { data } = await api.get('/admin/service-packages', { params })
  const items = Array.isArray(data) ? (data as AdminServicePackage[]) : []
  return { items, total: (data as any)?.meta?.total ?? items.length }
}
