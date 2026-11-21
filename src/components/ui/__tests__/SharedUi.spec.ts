import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import Modal from '../Modal.vue'
import Tabs from '../Tabs.vue'
import PaginationBar from '../PaginationBar.vue'
import SearchInput from '../SearchInput.vue'
import ConfirmDialog from '../ConfirmDialog.vue'
import EmptyState from '../EmptyState.vue'
import ErrorState from '../ErrorState.vue'

// Modal teleports to <body>; render it in place for the tests
const global = { stubs: { teleport: true } }

describe('Modal', () => {
  it('renders title, content and footer only when open', () => {
    const closed = mount(Modal, { props: { modelValue: false, title: 'Hi' }, slots: { default: 'Body' }, global })
    expect(closed.text()).toBe('')

    const open = mount(Modal, {
      props: { modelValue: true, title: 'Hi' },
      slots: { default: 'Body', footer: 'Foot' },
      global,
    })
    expect(open.text()).toContain('Hi')
    expect(open.text()).toContain('Body')
    expect(open.text()).toContain('Foot')
    expect(open.get('[role="dialog"]').attributes('aria-modal')).toBe('true')
  })

  it('closes from the X button and the backdrop', async () => {
    const wrapper = mount(Modal, { props: { modelValue: true, title: 'Hi' }, global })
    await wrapper.get('[aria-label="Close"]').trigger('click')
    await wrapper.get('.fixed.inset-0.bg-fg\\/40').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[false], [false]])
  })
})

describe('Tabs', () => {
  const tabs = [
    { label: 'All', value: 'all', count: 4 },
    { label: 'Mine', value: 'mine' },
  ]

  it('marks the selected tab and shows counts', () => {
    const wrapper = mount(Tabs, { props: { tabs, modelValue: 'all' } })
    const buttons = wrapper.findAll('[role="tab"]')
    expect(buttons[0]!.attributes('aria-selected')).toBe('true')
    expect(buttons[1]!.attributes('aria-selected')).toBe('false')
    expect(buttons[0]!.text()).toContain('4')
  })

  it('emits the clicked tab', async () => {
    const wrapper = mount(Tabs, { props: { tabs, modelValue: 'all' } })
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['mine']])
  })
})

describe('PaginationBar', () => {
  it('shows the visible range and total', () => {
    const wrapper = mount(PaginationBar, { props: { page: 2, perPage: 10, totalItems: 25, itemLabel: 'packages' } })
    expect(wrapper.text()).toContain('11–20')
    expect(wrapper.text()).toContain('25')
    expect(wrapper.text()).toContain('packages')
  })

  it('shows 0–0 for an empty list', () => {
    const wrapper = mount(PaginationBar, { props: { page: 1, perPage: 10, totalItems: 0 } })
    expect(wrapper.text()).toContain('0–0')
  })

  it('emits a new rows-per-page value', async () => {
    const wrapper = mount(PaginationBar, { props: { page: 1, perPage: 5, totalItems: 30 } })
    await wrapper.get('select').setValue('15')
    expect(wrapper.emitted('update:perPage')).toEqual([[15]])
  })

  it('emits page changes and ignores clicks outside the range', async () => {
    const wrapper = mount(PaginationBar, { props: { page: 1, perPage: 10, totalItems: 30 } })
    const pageButtons = wrapper.findAll('button').filter((b) => /^\d+$/.test(b.text()))
    expect(pageButtons.map((b) => b.text())).toEqual(['1', '2', '3'])
    await pageButtons[2]!.trigger('click')
    await pageButtons[0]!.trigger('click') // already on page 1
    expect(wrapper.emitted('update:page')).toEqual([[3]])
  })

  it('collapses long page lists with ellipses', () => {
    const wrapper = mount(PaginationBar, { props: { page: 6, perPage: 10, totalItems: 120 } })
    const labels = wrapper.findAll('button').map((b) => b.text()).filter((t) => /^\d+$/.test(t))
    expect(labels).toEqual(['1', '5', '6', '7', '12'])
    expect(wrapper.text()).toContain('…')
  })
})

describe('SearchInput', () => {
  it('emits typed text and offers a clear button only when there is text', async () => {
    const wrapper = mount(SearchInput, { props: { modelValue: '' } })
    expect(wrapper.find('[aria-label="Clear search"]').exists()).toBe(false)
    await wrapper.get('input').setValue('miami')
    expect(wrapper.emitted('update:modelValue')).toEqual([['miami']])

    await wrapper.setProps({ modelValue: 'miami' })
    await wrapper.get('[aria-label="Clear search"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual([''])
  })
})

describe('ConfirmDialog', () => {
  it('confirms or cancels', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Delete plan?', confirmLabel: 'Delete', tone: 'danger' },
      slots: { default: 'This cannot be undone.' },
      global,
    })
    expect(wrapper.text()).toContain('Delete plan?')
    expect(wrapper.text()).toContain('This cannot be undone.')

    const buttons = wrapper.findAll('button').filter((b) => ['Cancel', 'Delete'].includes(b.text()))
    await buttons.find((b) => b.text() === 'Delete')!.trigger('click')
    await buttons.find((b) => b.text() === 'Cancel')!.trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
  })
})

describe('EmptyState', () => {
  it('renders title, description and action', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'No packages yet', description: 'Create one.' },
      slots: { action: () => h('button', 'Add') },
    })
    expect(wrapper.text()).toContain('No packages yet')
    expect(wrapper.text()).toContain('Create one.')
    expect(wrapper.get('button').text()).toBe('Add')
  })
})

describe('ErrorState', () => {
  it('uses friendly defaults', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.text()).toContain('Something went wrong')
    expect(wrapper.text()).toContain('Please try again')
  })

  it('shows a Try again button that emits retry when the page listens for it', async () => {
    const wrapper = mount(ErrorState, { props: { description: 'Could not load offers', onRetry: () => {} } })
    const button = wrapper.get('button')
    expect(button.text()).toContain('Try again')
    await button.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('has no button when nobody listens for retry', () => {
    expect(mount(ErrorState).find('button').exists()).toBe(false)
  })

  it('uses the page’s own action instead of the default button', () => {
    const wrapper = mount(ErrorState, {
      props: { onRetry: () => {} },
      slots: { action: () => h('a', { href: '#' }, 'Reload page') },
    })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).toContain('Reload page')
  })
})
