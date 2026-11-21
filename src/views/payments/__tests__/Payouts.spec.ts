import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/paymentService', () => ({
  formatMoney: (v: number | null | undefined) => `$${Number(v ?? 0).toFixed(2)}`,
  fetchAgentPayouts: vi.fn(),
  requestWithdrawal: vi.fn(),
  cancelWithdrawal: vi.fn(),
  saveBankAccount: vi.fn(),
  fetchAdminPayouts: vi.fn(),
  fetchAdminPayoutAccounts: vi.fn(),
  markPayoutPaid: vi.fn(),
  rejectPayout: vi.fn(),
}))

import * as paymentService from '@/services/paymentService'
import AgentPayoutsView from '../AgentPayoutsView.vue'
import AdminPayoutsView from '../AdminPayoutsView.vue'

const global = { stubs: { teleport: true } }
const bank = { account_holder_name: 'Ava Agent', bank_name: 'Chase', account_type: 'checking', account_last4: '6789', routing_last4: '0021', updated_at: null }

function overview(overrides: Record<string, unknown> = {}) {
  return {
    currency: 'usd',
    balance: { available: 286.14, pending: 0, withdrawn: 0 },
    min_withdrawal: 1,
    bank_account: bank,
    earnings: { sales: 1, gross: 295, platform_fee: 0, processing_fee: 8.86, net: 286.14 },
    payouts: [],
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetAllMocks()
})

describe('AgentPayoutsView', () => {
  it('asks for bank details first when none are saved', async () => {
    vi.mocked(paymentService.fetchAgentPayouts).mockResolvedValue(overview({ bank_account: null }) as any)
    const wrapper = mount(AgentPayoutsView, { global })
    await flushPromises()

    expect(wrapper.find('#bank-routing').exists()).toBe(true)
    expect(wrapper.get('input[aria-label="Withdrawal amount"]').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Add your bank account first.')
  })

  it('requests a withdrawal after confirmation and refreshes the balance', async () => {
    vi.mocked(paymentService.fetchAgentPayouts)
      .mockResolvedValueOnce(overview() as any)
      .mockResolvedValueOnce(overview({ balance: { available: 86.14, pending: 200, withdrawn: 0 } }) as any)
    vi.mocked(paymentService.requestWithdrawal).mockResolvedValue({} as any)
    const wrapper = mount(AgentPayoutsView, { global })
    await flushPromises()

    expect(wrapper.text()).toContain('Chase')
    expect(wrapper.text()).toContain('$286.14')

    await wrapper.get('input[aria-label="Withdrawal amount"]').setValue('200')
    await wrapper.findAll('button').find((b) => b.text() === 'Request withdrawal')!.trigger('click')
    expect(wrapper.text()).toContain('Request this withdrawal?')
    expect(wrapper.text()).toContain('ending in 6789')

    const confirm = wrapper.findAll('button').filter((b) => b.text() === 'Request withdrawal').at(-1)!
    await confirm.trigger('click')
    await flushPromises()

    expect(paymentService.requestWithdrawal).toHaveBeenCalledWith(200)
    expect(wrapper.text()).toContain('$86.14')
  })

  it('refuses amounts above the balance or with too many decimals', async () => {
    vi.mocked(paymentService.fetchAgentPayouts).mockResolvedValue(overview() as any)
    const wrapper = mount(AgentPayoutsView, { global })
    await flushPromises()
    const input = wrapper.get('input[aria-label="Withdrawal amount"]')
    const request = () => wrapper.findAll('button').find((b) => b.text() === 'Request withdrawal')!.trigger('click')

    await input.setValue('500')
    await request()
    expect(wrapper.text()).toContain('You can withdraw up to $286.14')

    await input.setValue('10.555')
    await request()
    expect(wrapper.text()).toContain('Use at most 2 decimals.')
    expect(paymentService.requestWithdrawal).not.toHaveBeenCalled()
  })

  it('shows request status, reference and reason, and lets the agent cancel a pending one', async () => {
    vi.mocked(paymentService.fetchAgentPayouts).mockResolvedValue(overview({
      payouts: [
        { id: 3, method: 'manual', amount: 50, currency: 'usd', status: 'pending', reference: null, failure_message: null, bank_last4: '6789', arrival_date: null, paid_at: null, processed_at: null, created_at: '2026-11-20T10:00:00Z' },
        { id: 2, method: 'manual', amount: 75, currency: 'usd', status: 'paid', reference: 'WIRE-7781', failure_message: null, bank_last4: '6789', arrival_date: null, paid_at: '2026-11-19T10:00:00Z', processed_at: null, created_at: '2026-11-18T10:00:00Z' },
        { id: 1, method: 'manual', amount: 20, currency: 'usd', status: 'rejected', reference: null, failure_message: 'Name mismatch', bank_last4: '6789', arrival_date: null, paid_at: null, processed_at: null, created_at: '2026-11-17T10:00:00Z' },
      ],
    }) as any)
    vi.mocked(paymentService.cancelWithdrawal).mockResolvedValue({} as any)
    const wrapper = mount(AgentPayoutsView, { global })
    await flushPromises()

    expect(wrapper.text()).toContain('Requested')
    expect(wrapper.text()).toContain('Ref WIRE-7781')
    expect(wrapper.text()).toContain('Name mismatch')

    const cancelButtons = wrapper.findAll('button').filter((b) => b.text() === 'Cancel')
    expect(cancelButtons).toHaveLength(1) // only the pending one
    await cancelButtons[0]!.trigger('click')
    await wrapper.findAll('button').find((b) => b.text() === 'Cancel request')!.trigger('click')
    await flushPromises()

    expect(paymentService.cancelWithdrawal).toHaveBeenCalledWith(3)
  })
})

describe('AdminPayoutsView', () => {
  const pending = {
    id: 9, method: 'manual', amount: 150, currency: 'usd', status: 'pending', reference: null, failure_message: null,
    bank_last4: '6789', arrival_date: null, paid_at: null, processed_at: null, created_at: '2026-11-20T10:00:00Z',
    agent: { id: 5, name: 'Ava Agent', email: 'ava@example.com' },
    bank_details: { account_holder_name: 'Ava Agent', bank_name: 'Chase', account_type: 'checking', routing_number: '021000021', account_number: '000123456789' },
  }

  it('lists requests to pay with the full bank details', async () => {
    vi.mocked(paymentService.fetchAdminPayouts).mockResolvedValue({ items: [pending], meta: { current_page: 1, last_page: 1, total: 1 }, pending_total: 150 } as any)
    const wrapper = mount(AdminPayoutsView, { global })
    await flushPromises()

    expect(paymentService.fetchAdminPayouts).toHaveBeenCalledWith('pending')
    expect(wrapper.text()).toContain('Ava Agent')
    expect(wrapper.text()).toContain('021000021')
    expect(wrapper.text()).toContain('000123456789')
    expect(wrapper.text()).toContain('Waiting for transfer: $150.00')
  })

  it('marks a request paid only with a transfer reference', async () => {
    vi.mocked(paymentService.fetchAdminPayouts).mockResolvedValue({ items: [pending], meta: { current_page: 1, last_page: 1, total: 1 }, pending_total: 150 } as any)
    vi.mocked(paymentService.markPayoutPaid).mockResolvedValue({} as any)
    const wrapper = mount(AdminPayoutsView, { global })
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text() === 'Mark as paid')!.trigger('click')
    const submit = () => wrapper.findAll('button').filter((b) => b.text() === 'Mark as paid').at(-1)!.trigger('click')

    await submit()
    expect(wrapper.text()).toContain('Enter the bank transfer reference.')
    expect(paymentService.markPayoutPaid).not.toHaveBeenCalled()

    await wrapper.get('#payout-reference').setValue('WIRE-7781')
    await submit()
    await flushPromises()
    expect(paymentService.markPayoutPaid).toHaveBeenCalledWith(9, 'WIRE-7781', undefined)
  })

  it('rejects a request only with a reason', async () => {
    vi.mocked(paymentService.fetchAdminPayouts).mockResolvedValue({ items: [pending], meta: { current_page: 1, last_page: 1, total: 1 }, pending_total: 150 } as any)
    vi.mocked(paymentService.rejectPayout).mockResolvedValue({} as any)
    const wrapper = mount(AdminPayoutsView, { global })
    await flushPromises()

    await wrapper.findAll('button').find((b) => b.text() === 'Reject')!.trigger('click')
    const submit = () => wrapper.findAll('button').find((b) => b.text() === 'Reject request')!.trigger('click')

    await submit()
    expect(wrapper.text()).toContain('Tell the agent why')

    await wrapper.get('#payout-reason').setValue('Bank name does not match')
    await submit()
    await flushPromises()
    expect(paymentService.rejectPayout).toHaveBeenCalledWith(9, 'Bank name does not match')
  })
})
