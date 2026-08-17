export type UserRole = 'admin' | 'agent' | 'seller' | 'buyer'

export interface User {
  id: number
  fullName: string
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
  /** Fine-grained admin-portal permissions from the RBAC layer — separate
   * from `role`, which only gates which portal a user can enter. */
  permissions?: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  password: string
  passwordConfirmation: string
}

export interface AuthResponse {
  token: string
  user: User
}
