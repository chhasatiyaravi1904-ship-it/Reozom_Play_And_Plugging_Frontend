import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingState from '../LoadingState.vue'
import SkeletonTableRows from '../skeleton/SkeletonTableRows.vue'

describe('LoadingState', () => {
  it('is announced to screen readers with its label', () => {
    const wrapper = mount(LoadingState, { props: { label: 'Loading offers' } })
    const status = wrapper.get('[role="status"]')
    expect(status.attributes('aria-label')).toBe('Loading offers')
    expect(wrapper.find('.sr-only').text()).toBe('Loading offers')
  })

  it('uses shimmer blocks, not the old pulse', () => {
    const wrapper = mount(LoadingState)
    expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0)
    expect(wrapper.find('.animate-pulse').exists()).toBe(false)
  })

  it('list variant renders one row per `rows`', () => {
    const wrapper = mount(LoadingState, { props: { rows: 4 } })
    expect(wrapper.findAll('.rounded-xl.border').length).toBe(4)
  })

  it('table variant renders header + body rows with the given columns', () => {
    const wrapper = mount(LoadingState, { props: { variant: 'table', rows: 3, columns: 5 } })
    const [header, body] = wrapper.get('[aria-hidden="true"]').element.children
    expect(header!.children.length).toBe(5)
    expect(body!.children.length).toBe(3)
  })

  it('cards variant renders one card per `rows`', () => {
    const wrapper = mount(LoadingState, { props: { variant: 'cards', rows: 2 } })
    expect(wrapper.get('.grid').element.children.length).toBe(2)
  })

  it('detail and lines variants render', () => {
    expect(mount(LoadingState, { props: { variant: 'detail' } }).findAll('.skeleton').length).toBeGreaterThan(5)
    expect(mount(LoadingState, { props: { variant: 'lines', rows: 3 } }).findAll('.rounded-full').length).toBe(3)
  })
})

describe('SkeletonTableRows', () => {
  it('renders the requested rows and cells inside a table body', () => {
    const wrapper = mount({
      components: { SkeletonTableRows },
      template: '<table><tbody><SkeletonTableRows :rows="2" :columns="3" /></tbody></table>',
    })
    const rows = wrapper.findAll('tr')
    expect(rows.length).toBe(2)
    expect(rows[0]!.findAll('td').length).toBe(3)
  })
})
