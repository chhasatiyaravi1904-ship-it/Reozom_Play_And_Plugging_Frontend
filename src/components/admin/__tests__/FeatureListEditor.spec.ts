import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeatureListEditor from '../FeatureListEditor.vue'

function editor(modelValue: string[], props: Record<string, unknown> = {}) {
  return mount(FeatureListEditor, { props: { modelValue, label: 'Included', ...props } })
}

const lastEmit = (wrapper: ReturnType<typeof editor>) => wrapper.emitted('update:modelValue')!.at(-1)![0]

describe('FeatureListEditor', () => {
  it('adds a trimmed item with Enter and with the Add button', async () => {
    const wrapper = editor(['5 Listings'])
    const input = wrapper.get('input')

    await input.setValue('  Unlimited ZIPs  ')
    await input.trigger('keydown.enter')
    expect(lastEmit(wrapper)).toEqual(['5 Listings', 'Unlimited ZIPs'])

    await input.setValue('Priority support')
    await wrapper.findAll('button').find((b) => b.text() === 'Add')!.trigger('click')
    expect(lastEmit(wrapper)).toEqual(['5 Listings', 'Priority support'])
  })

  it('ignores blank text and duplicates (case-insensitive)', async () => {
    const wrapper = editor(['5 Listings'])
    const input = wrapper.get('input')

    await input.setValue('   ')
    await input.trigger('keydown.enter')
    await input.setValue('5 LISTINGS')
    await input.trigger('keydown.enter')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('already in the list')
  })

  it('removes and reorders items', async () => {
    const wrapper = editor(['A', 'B', 'C'])

    await wrapper.get('[aria-label="Remove B"]').trigger('click')
    expect(lastEmit(wrapper)).toEqual(['A', 'C'])

    await wrapper.get('[aria-label="Move C down"]').trigger('click') // last item: no-op
    await wrapper.get('[aria-label="Move C up"]').trigger('click')
    expect(lastEmit(wrapper)).toEqual(['A', 'C', 'B'])

    await wrapper.get('[aria-label="Move A down"]').trigger('click')
    expect(lastEmit(wrapper)).toEqual(['B', 'A', 'C'])
  })

  it('stops at the maximum number of items', async () => {
    const wrapper = editor(['A', 'B'], { max: 2 })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('2/2')
  })

  it('shows a check for included and a cross for not-included lists', () => {
    const included = editor(['A'], { tone: 'included' })
    const excluded = editor(['A'], { tone: 'excluded' })
    expect(included.get('li svg').classes()).toContain('text-success')
    expect(excluded.get('li svg').classes()).toContain('text-fg-muted')
  })
})
