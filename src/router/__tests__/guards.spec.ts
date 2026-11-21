import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/authService', () => ({
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))

import router from '../index'
import { useAuthStore } from '@/stores/auth'

/** Navigate, but fail instead of hanging if the guards redirect forever. */
async function go(path: string | { name: string }) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('navigation never finished (redirect loop)')), 3000))
  await Promise.race([router.push(path), timeout])
  return router.currentRoute.value.name
}

function signIn(user: Record<string, unknown>) {
  const auth = useAuthStore()
  auth.token = 'test-token'
  auth.user = { id: 1, email: 'u@example.com', ...user } as any
}

beforeEach(async () => {
  setActivePinia(createPinia())
  localStorage.clear()
  sessionStorage.clear()
  // Start every test from a neutral public page
  await router.push('/auth/callback').catch(() => {})
})

describe('router guards after sign-up', () => {
  it('a new agent (email not verified, no plan) lands on verify-email instead of looping', async () => {
    signIn({ role: 'agent', emailVerified: false, hasActivePackage: false })
    expect(await go({ name: 'agent-subscription' })).toBe('verify-email')
  })

  it('a verified agent without a plan is sent to choose one', async () => {
    signIn({ role: 'agent', emailVerified: true, hasActivePackage: false })
    expect(await go('/agent/dashboard')).toBe('agent-subscription')
  })

  it('a verified agent with a plan reaches the agent portal', async () => {
    signIn({ role: 'agent', emailVerified: true, hasActivePackage: true })
    expect(await go('/agent/dashboard')).toBe('agent-dashboard')
  })

  it('an unverified seller is held on verify-email', async () => {
    signIn({ role: 'seller_buyer', emailVerified: false })
    expect(await go('/dashboard')).toBe('verify-email')
  })

  it('guests are sent to login for portal pages', async () => {
    const auth = useAuthStore()
    auth.token = null
    auth.user = null
    expect(await go('/dashboard')).toBe('login')
  })
})
