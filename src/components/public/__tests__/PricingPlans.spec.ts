import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/services/packageService', () => ({ fetchPackages: vi.fn() }))

import * as packageService from '@/services/packageService'
import PricingPlans from '../PricingPlans.vue'

const plan = (overrides: Record<string, unknown>) => ({
  id: 'p1', name: 'Plan', slug: 'plan', description: null, price: null, durationDays: 30,
  sortOrder: 0, isActive: true, includedFeatures: [], excludedFeatures: [], ...overrides,
})

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { template: '<div />' } }] })

async function render() {
  const wrapper = mount(PricingPlans, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => vi.resetAllMocks())

describe('PricingPlans (website "Listing Agent Packages")', () => {
  it('shows each active plan with its price and Included / Not included lists, in order', async () => {
    vi.mocked(packageService.fetchPackages).mockResolvedValue({
      data: [
        plan({ id: 'a', name: 'Independent Agent', description: 'For new agents', price: '79.00',
          includedFeatures: ['5 Active Property Listings', 'Up to 3 ZIP Codes'], excludedFeatures: ['Builder Webhooks'] }),
        plan({ id: 'b', name: 'Growth Broker', price: '149.50', durationDays: 365 }),
      ],
    } as any)
    const wrapper = await render()
    const cards = wrapper.findAll('article')

    expect(cards.map((c) => c.get('h3').text())).toEqual(['Independent Agent', 'Growth Broker'])
    expect(cards[0]!.text()).toContain('For new agents')
    expect(cards[0]!.text()).toContain('$79/month')
    expect(cards[1]!.text()).toContain('$149.50/year')

    const items = cards[0]!.findAll('li').map((li) => li.text())
    expect(items).toEqual([
      'Included: 5 Active Property Listings',
      'Included: Up to 3 ZIP Codes',
      'Not included: Builder Webhooks',
    ])
  })

  it('shows Free for plans without a price, and no list when none is set', async () => {
    vi.mocked(packageService.fetchPackages).mockResolvedValue({ data: [plan({ name: 'Minor Access', price: null })] } as any)
    const wrapper = await render()

    expect(wrapper.get('article').text()).toContain('Free')
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  it('Get Started opens agent registration with the plan preselected', async () => {
    vi.mocked(packageService.fetchPackages).mockResolvedValue({ data: [plan({ id: 'uuid-7' })] } as any)
    const wrapper = await render()

    expect(wrapper.get('article a').attributes('href')).toBe('/auth/register?type=agent&package=uuid-7')
  })

  it('shows shimmer while loading, then a friendly message when there are no plans', async () => {
    let resolve!: (v: any) => void
    vi.mocked(packageService.fetchPackages).mockReturnValue(new Promise((r) => (resolve = r)) as any)
    const wrapper = mount(PricingPlans, { global: { plugins: [router] } })

    expect(wrapper.find('[role="status"]').exists()).toBe(true)
    expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)

    resolve({ data: [] })
    await flushPromises()
    expect(wrapper.text()).toContain('New agent plans are coming soon.')
  })

  it('says plans are unavailable when loading fails', async () => {
    vi.mocked(packageService.fetchPackages).mockRejectedValue(new Error('500'))
    const wrapper = await render()
    expect(wrapper.text()).toContain('Plans are unavailable right now')
  })
})
