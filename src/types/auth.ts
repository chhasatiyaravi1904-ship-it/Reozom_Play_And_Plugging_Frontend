export type UserRole = 'admin' | 'agent' | 'seller' | 'buyer'

export interface User {
  id: number
  fullName: string
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string
  role?: UserRole
  emailVerified?: boolean
  streetAddress?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  company?: string | null
  officeNumber?: string | null
  extension?: string | null
  profileFinished?: boolean
  permissions?: string[]
  hasActivePackage?: boolean
  currentPackage?: CurrentPackage | null
}

export interface CurrentPackage {
  id: string
  name: string
  slug: string
  startedAt: string
  expiresAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  userType: 'agent' | 'seller' | 'buyer'
  firstName: string
  lastName: string
  email: string
  phone: string
  streetAddress: string
  city: string
  state: string
  zip: string
  password: string
  passwordConfirmation: string
  packageId?: string
}

export interface AuthResponse {
  token?: string
  user?: User
  requires_2fa?: boolean
  email?: string
}

export interface Verify2FAPayload {
  email: string
  code: string
}

export interface RegisterResult {
  token?: string
  user: User
  pendingApproval?: boolean
}
