import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

vi.mock('@/services/paymentService', () => ({ saveBankAccount: vi.fn() }))

import * as paymentService from '@/services/paymentService'
import BankAccountForm from '../BankAccountForm.vue'

async function fill(wrapper: ReturnType<typeof mount>, values: Record<string, string>) {
  for (const [id, value] of Object.entries(values)) await wrapper.get(`#${id}`).setValue(value)
}

const valid = {
  'bank-holder': 'Ava Agent',
  'bank-name': 'Chase',
  'bank-routing': '021000021',
  'bank-account': '000123456789',
  'bank-account-confirm': '000123456789',
}

beforeEach(() => vi.resetAllMocks())

describe('BankAccountForm', () => {
  it('saves valid US bank details and emits the masked result', async () => {
    const saved = { account_holder_name: 'Ava Agent', bank_name: 'Chase', account_type: 'checking', account_last4: '6789', routing_last4: '0021', updated_at: null }
    vi.mocked(paymentService.saveBankAccount).mockResolvedValue(saved as any)
    const wrapper = mount(BankAccountForm)

    await fill(wrapper, valid)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(paymentService.saveBankAccount).toHaveBeenCalledWith({
      account_holder_name: 'Ava Agent', bank_name: 'Chase', routing_number: '021000021',
      account_number: '000123456789', account_number_confirmation: '000123456789', account_type: 'checking',
    })
    expect(wrapper.emitted('saved')![0]).toEqual([saved])
  })

  it('checks the routing number, account number and confirmation before sending', async () => {
    const wrapper = mount(BankAccountForm)

    await fill(wrapper, { ...valid, 'bank-routing': '1234', 'bank-account-confirm': '999' })
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('The routing number is 9 digits.')
    expect(wrapper.text()).toContain('The account numbers do not match.')
    expect(paymentService.saveBankAccount).not.toHaveBeenCalled()

    await fill(wrapper, { 'bank-account': '12ab', 'bank-account-confirm': '12ab' })
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('The account number is 4 to 17 digits.')
  })

  it('shows server validation errors', async () => {
    vi.mocked(paymentService.saveBankAccount).mockRejectedValue({
      response: { data: { message: 'The given data was invalid.', errors: { routing_number: ['The routing number field must be 9 digits.'] } } },
    })
    const wrapper = mount(BankAccountForm)
    await fill(wrapper, valid)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('The routing number field must be 9 digits.')
    expect(wrapper.emitted('saved')).toBeUndefined()
  })

  it('never pre-fills the numbers when editing, only shows the last digits as a hint', () => {
    const wrapper = mount(BankAccountForm, {
      props: { existing: { account_holder_name: 'Ava', bank_name: 'Chase', account_type: 'savings', account_last4: '6789', routing_last4: '0021', updated_at: null } },
    })
    expect((wrapper.get('#bank-account').element as HTMLInputElement).value).toBe('')
    expect(wrapper.get('#bank-account').attributes('placeholder')).toBe('••••6789')
    expect((wrapper.get('#bank-holder').element as HTMLInputElement).value).toBe('Ava')
    expect((wrapper.get('#bank-type').element as HTMLSelectElement).value).toBe('savings')
  })
})
