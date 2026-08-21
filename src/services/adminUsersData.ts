export type AdminUserRole = 'admin' | 'agent' | 'seller' | 'buyer'
export type AdminUserStatus = 'active' | 'inactive'

export interface AdminUserItem {
  id: number
  fullName: string
  email: string
  phone: string
  role: AdminUserRole
  status: AdminUserStatus
  isActive: boolean
  joinedDate: string // YYYY-MM-DD format
  location?: string | null
  lastActive?: string
  listingsCount?: number
  emailVerified?: boolean
}
