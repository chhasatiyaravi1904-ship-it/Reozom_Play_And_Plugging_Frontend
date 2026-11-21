import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Stepper, { type StepperItem } from '../Stepper.vue'

const steps: StepperItem[] = [
  { id: 'address', label: 'Property Type & Address', status: 'completed' },
  { id: 'info', label: 'Property Information', status: 'current' },
  { id: 'appliances', label: 'Disclosures - Appliances & Systems', status: 'upcoming' },
]

describe('Stepper', () => {
  it('renders every step with its full label available', () => {
    const wrapper = mount(Stepper, { props: { steps } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    // Long labels are clamped visually; the full text stays in the tooltip
    expect(buttons[2]!.attributes('title')).toBe('Disclosures - Appliances & Systems')
  })

  it('shows a check for completed, a dot for current and the number for upcoming steps', () => {
    const wrapper = mount(Stepper, { props: { steps } })
    const circles = wrapper.findAll('button > span:first-child')
    expect(circles[0]!.find('svg').exists()).toBe(true)
    expect(circles[1]!.find('.rounded-full.bg-secondary').exists()).toBe(true)
    expect(circles[2]!.text()).toBe('3')
  })

  it('marks the current step for screen readers', () => {
    const wrapper = mount(Stepper, { props: { steps } })
    const buttons = wrapper.findAll('button')
    expect(buttons[1]!.attributes('aria-current')).toBe('step')
    expect(buttons[0]!.attributes('aria-current')).toBeUndefined()
  })

  it('draws a connector between steps, filled only after completed steps', () => {
    const wrapper = mount(Stepper, { props: { steps } })
    const lines = wrapper.findAll('li > span[aria-hidden="true"]')
    expect(lines).toHaveLength(2) // no line after the last step
    expect(lines[0]!.classes()).toContain('bg-secondary')
    expect(lines[1]!.classes()).toContain('bg-border')
  })

  it('lets you open completed and current steps, not upcoming ones', async () => {
    const wrapper = mount(Stepper, { props: { steps } })
    const buttons = wrapper.findAll('button')
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    await buttons[2]!.trigger('click')
    expect(buttons[2]!.attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('select')).toEqual([['address'], ['info']])
  })
})
