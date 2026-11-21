import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/eunoService', () => ({
  getPendingSignatures: vi.fn(),
  getListingSigningStatus: vi.fn(),
}))

import * as eunoService from '@/services/eunoService'
import PendingSignaturesPopup from '../PendingSignaturesPopup.vue'
import { SIGN_PROMPT_KEY } from '@/stores/auth'
import { setImpersonationToken } from '@/services/api'

const item = {
  agreement_id: 5,
  listing_id: 3,
  listing_address: '1 Ocean Drive, Miami, FL 33139',
  document_name: 'Reozom Documents',
  document_count: 2,
  sent_at: null,
  signing_url: 'https://sign.example/esign/doc/rec',
}

// Render modals in place; the EunoDoc iframe modal is replaced by a simple marker
const global = {
  stubs: {
    teleport: true,
    EunoSignModal: {
      props: ['modelValue', 'signingUrl'],
      emits: ['close'],
      template: '<div v-if="modelValue" class="sign-modal" :data-url="signingUrl"><button class="close" @click="$emit(\'close\')">x</button></div>',
    },
  },
}

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
  vi.resetAllMocks()
})

describe('PendingSignaturesPopup', () => {
  it('after login, lists the documents waiting for the user’s signature', async () => {
    sessionStorage.setItem(SIGN_PROMPT_KEY, '1')
    vi.mocked(eunoService.getPendingSignatures).mockResolvedValue([item])

    const wrapper = mount(PendingSignaturesPopup, { global })
    await flushPromises()

    expect(wrapper.text()).toContain('Documents waiting for your signature')
    expect(wrapper.text()).toContain('You have 1 document packet to sign')
    expect(wrapper.text()).toContain('1 Ocean Drive, Miami, FL 33139')
    // The flag is consumed so a page refresh doesn't show it again
    expect(sessionStorage.getItem(SIGN_PROMPT_KEY)).toBeNull()
  })

  it('stays hidden on a normal page load (no fresh login)', async () => {
    vi.mocked(eunoService.getPendingSignatures).mockResolvedValue([item])
    const wrapper = mount(PendingSignaturesPopup, { global })
    await flushPromises()

    expect(eunoService.getPendingSignatures).not.toHaveBeenCalled()
    expect(wrapper.text()).toBe('')
  })

  it('stays hidden when nothing needs signing', async () => {
    sessionStorage.setItem(SIGN_PROMPT_KEY, '1')
    vi.mocked(eunoService.getPendingSignatures).mockResolvedValue([])
    const wrapper = mount(PendingSignaturesPopup, { global })
    await flushPromises()

    expect(wrapper.text()).toBe('')
  })

  it('never prompts an admin who is logged in as the user', async () => {
    sessionStorage.setItem(SIGN_PROMPT_KEY, '1')
    setImpersonationToken('user-token')
    vi.mocked(eunoService.getPendingSignatures).mockResolvedValue([item])
    mount(PendingSignaturesPopup, { global })
    await flushPromises()

    expect(eunoService.getPendingSignatures).not.toHaveBeenCalled()
    setImpersonationToken(null)
  })

  it('Sign now opens the signer’s own link; closing re-checks and hides the list when done', async () => {
    sessionStorage.setItem(SIGN_PROMPT_KEY, '1')
    vi.mocked(eunoService.getPendingSignatures).mockResolvedValueOnce([item]).mockResolvedValueOnce([])
    vi.mocked(eunoService.getListingSigningStatus).mockResolvedValue({} as any)
    const wrapper = mount(PendingSignaturesPopup, { global })
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text() === 'Sign now')!.trigger('click')
    expect(wrapper.get('.sign-modal').attributes('data-url')).toBe(item.signing_url)
    expect(wrapper.text()).not.toContain('Documents waiting for your signature')

    await wrapper.get('.sign-modal .close').trigger('click')
    await flushPromises()

    expect(eunoService.getListingSigningStatus).toHaveBeenCalledWith(3)
    expect(wrapper.find('.sign-modal').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Documents waiting for your signature')
  })
})
