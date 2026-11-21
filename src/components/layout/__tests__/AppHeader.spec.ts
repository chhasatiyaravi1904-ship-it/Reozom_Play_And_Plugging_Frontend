import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from '../AppHeader.vue'

const Blank = { template: '<div />' }

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: Blank },
      { path: '/listings', component: Blank },
      { path: '/listings/:id', component: Blank },
      { path: '/my-offers', component: Blank },
      { path: '/my-documents', component: Blank },
      { path: '/properties', component: Blank },
      { path: '/profile', component: Blank },
    ],
  })
}

async function headerAt(url: string) {
  const router = makeRouter()
  await router.push(url)
  const wrapper = mount(AppHeader, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

/** Labels of the highlighted links in the desktop menu. */
function activeLinks(wrapper: Awaited<ReturnType<typeof headerAt>>): string[] {
  return wrapper
    .findAll('nav a')
    .filter((a) => a.classes().includes('text-primary'))
    .map((a) => a.text())
}

beforeEach(() => setActivePinia(createPinia()))

describe('AppHeader (seller / buyer menu)', () => {
  it('has a My Listings item next to Listings', async () => {
    const wrapper = await headerAt('/dashboard')
    const labels = wrapper.findAll('nav a').map((a) => a.text())
    expect(labels).toEqual(['Dashboard', 'Listings', 'My Listings', 'Offers', 'My Documents', 'Browse Properties'])
    const myListings = wrapper.findAll('nav a').find((a) => a.text() === 'My Listings')!
    expect(myListings.attributes('href')).toBe('/listings?tab=my_listings')
  })

  it('highlights only Listings on the listings page', async () => {
    expect(activeLinks(await headerAt('/listings'))).toEqual(['Listings'])
  })

  it('highlights only My Listings on the "my listings" tab', async () => {
    expect(activeLinks(await headerAt('/listings?tab=my_listings'))).toEqual(['My Listings'])
  })

  it('keeps Listings highlighted for other tabs and listing detail pages', async () => {
    expect(activeLinks(await headerAt('/listings?tab=published'))).toEqual(['Listings'])
    expect(activeLinks(await headerAt('/listings/12'))).toEqual(['Listings'])
  })

  it('highlights other sections normally', async () => {
    expect(activeLinks(await headerAt('/my-offers'))).toEqual(['Offers'])
  })
})
