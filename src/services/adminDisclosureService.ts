import api from '@/services/api'

export interface DisclosureFieldOption {
  label: string
  value: string
}

export interface DisclosureField {
  id: string
  name?: string
  label: string
  type: 'select' | 'radio' | 'text' | 'textarea' | 'checkbox' | 'number'
  required: boolean
  placeholder?: string
  options?: DisclosureFieldOption[]
}

export interface DisclosureSection {
  id: string
  name: string
  order?: number
  fields: DisclosureField[]
}

export interface PropertyDisclosure {
  id: number
  code: string
  title: string
  state_code: string | null
  property_type: string | null
  category: string
  description: string | null
  order: number
  is_required: boolean
  is_active: boolean
  schema: {
    sections: DisclosureSection[]
  }
  created_at: string
  updated_at: string
}

export interface DisclosureFilterParams {
  state_code?: string
  property_type?: string
  is_active?: boolean | string
  search?: string
}

export async function fetchAdminDisclosures(params?: DisclosureFilterParams) {
  const res = await api.get('/admin/disclosures', { params })
  return (res.data as any)?.data ?? res.data
}

export async function fetchAdminDisclosure(id: number) {
  const res = await api.get(`/admin/disclosures/${id}`)
  return (res.data as any)?.data ?? res.data
}

export async function createAdminDisclosure(payload: Partial<PropertyDisclosure>) {
  const res = await api.post('/admin/disclosures', payload)
  return (res.data as any)?.data ?? res.data
}

export async function updateAdminDisclosure(id: number, payload: Partial<PropertyDisclosure>) {
  const res = await api.put(`/admin/disclosures/${id}`, payload)
  return (res.data as any)?.data ?? res.data
}

export async function deleteAdminDisclosure(id: number) {
  const res = await api.delete(`/admin/disclosures/${id}`)
  return (res.data as any)?.data ?? res.data
}

export async function toggleAdminDisclosure(id: number) {
  const res = await api.post(`/admin/disclosures/${id}/toggle`)
  return (res.data as any)?.data ?? res.data
}

export async function duplicateAdminDisclosure(id: number) {
  const res = await api.post(`/admin/disclosures/${id}/duplicate`)
  return (res.data as any)?.data ?? res.data
}

