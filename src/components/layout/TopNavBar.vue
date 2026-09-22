<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeHash = ref(route.hash || '#hero')

// Simple scroll spy to highlight the active section while scrolling
const updateActiveHash = () => {
  // Only apply scroll spy if we are on the landing page
  if (route.path !== '/') return

  const sections = ['#listings', '#how-it-works', '#sellers', '#listing-agents', '#buyers', '#pricing', '#trust']
  
  for (const id of sections) {
    const el = document.querySelector(id)
    if (el) {
      const rect = el.getBoundingClientRect()
      // Check if section is in the top portion of the viewport
      if (rect.top <= 150 && rect.bottom >= 150) {
        activeHash.value = id
        return
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveHash, { passive: true })
  setTimeout(updateActiveHash, 100)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHash)
})

const navItems = [
  { label: 'Listings', hash: '#listings' },
  { label: 'How It Works', hash: '#how-it-works' },
  { label: 'For Sellers', hash: '#sellers' },
  { label: 'For Agents', hash: '#listing-agents' },
  { label: 'For Buyers', hash: '#buyers' },
  { label: 'Pricing', hash: '#pricing' },
  { label: 'About', hash: '#trust' },
]
</script>

<template>
  <header
    class="bg-surface-container-lowest dark:bg-primary-container text-primary dark:text-inverse-primary docked full-width top sticky top-0 z-50 border-b border-outline-variant/30 dark:border-outline-variant/10 shadow-sm dark:shadow-none"
  >
    <div class="max-w-7xl mx-auto px-6 md:px-10 h-20 flex justify-between items-center w-full">
      <!-- Brand Logo Anchor -->
      <RouterLink class="flex items-center gap-3 group" to="/">
        <img
          alt="REOZOM Logo"
          class="h-10 w-10 object-contain rounded-md"
          src="https://lh3.googleusercontent.com/aida/AEtjO1XC5OIcOBhCVaDJep_6PTsv94jiDesgJgD67a1TVcMdBzPOXmrdrTPjevxl8QOhQ-eMz5Yv6xZvQQMEHu6sgPpx22DfFVtGebieL3T5ff6tNGFqgpCNiuZzuG6ey3mMXq7YHUimUA-GwqkroAPShYeL9G2MepHSrgNqRQi-AN_GPMcusYda7Dqrc3SZ8BulhX4TDKA7Py9MEsoXMP0yHcr7IQ5U380SNuaAcISk7f8ozx9l54oznuR6"
        />
        <span
          class="text-headline-md font-headline-md font-extrabold tracking-tight text-primary dark:text-inverse-primary"
          >REOZOM</span
        >
      </RouterLink>
      <!-- Desktop Nav Links -->
      <nav class="hidden lg:flex items-center space-x-7">
        <a
          v-for="item in navItems"
          :key="item.hash"
          :href="'/' + item.hash"
          class="transition-colors text-label-lg font-label-lg pb-1 border-b-2"
          :class="activeHash === item.hash ? 'text-secondary dark:text-secondary-fixed font-semibold border-secondary dark:border-secondary-fixed' : 'text-on-surface-variant dark:text-surface-variant font-medium hover:text-primary dark:hover:text-inverse-primary border-transparent'"
          @click="activeHash = item.hash"
        >
          {{ item.label }}
        </a>
      </nav>
      <!-- Trailing Auth CTAs -->
      <div class="hidden sm:flex items-center gap-3">
        <button
          class="px-4 py-2 border border-outline-variant/60 rounded-lg text-primary hover:bg-surface-container transition-colors text-label-lg font-label-lg"
          @click="router.push('/auth/login')"
        >
          Log In
        </button>
        <button
          class="px-5 py-2 bg-primary-container text-on-primary hover:bg-primary transition-all duration-150 rounded-lg shadow-sm font-label-lg text-label-lg flex items-center gap-1.5 active:scale-[0.99]"
          @click="router.push('/auth/register')"
        >
          <span class="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
          Register
        </button>
      </div>
      <!-- Mobile Hamburger Button -->
      <div class="lg:hidden flex items-center gap-2">
        <button
          class="px-3 py-1.5 bg-primary-container text-on-primary rounded-lg text-label-md font-label-md"
          @click="router.push('/auth/register')"
        >
          Sign In
        </button>
        <button
          aria-label="Toggle navigation menu"
          class="p-2 text-on-surface hover:bg-surface-container rounded-lg focus:outline-none"
          id="mobileMenuBtn"
        >
          <span class="material-symbols-outlined" data-icon="menu">menu</span>
        </button>
      </div>
    </div>
    <!-- Mobile Drawer Navigation -->
    <div
      class="hidden lg:hidden border-t border-outline-variant/30 bg-surface-container-lowest px-6 py-5 space-y-3 shadow-lg"
      id="mobileDrawer"
    >
      <a
        v-for="item in navItems"
        :key="item.hash"
        :href="'/' + item.hash"
        class="block py-2 text-label-lg"
        :class="activeHash === item.hash ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-primary'"
        @click="activeHash = item.hash"
      >
        {{ item.label }}
      </a>
      
      <div class="pt-3 border-t border-outline-variant/20 flex gap-3">
        <button
          class="flex-1 py-2.5 border border-outline-variant/80 rounded-lg text-primary text-label-md font-label-md text-center"
          @click="router.push('/auth/login')"
        >
          Log In
        </button>
        <button
          class="flex-1 py-2.5 bg-primary text-on-primary rounded-lg text-label-md font-label-md text-center"
          @click="router.push('/auth/register')"
        >
          Register
        </button>
      </div>
    </div>
  </header>
</template>
