<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tabs from '@/components/ui/Tabs.vue'
import ReceivedOffersList from '@/components/offers/ReceivedOffersList.vue'
import MyOffersView from '@/views/dashboard/MyOffersView.vue'
import { useAuthStore } from '@/stores/auth'
import type { InvolvementOffersResponse } from '@/services/offerService'

/**
 * Offers page (seller/buyer and agent portals): "Received Offers" on the user's
 * listings and "Sent Offers" the user made as a buyer. The tab lives in ?tab=.
 */
type OffersTab = 'received' | 'sent'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAgent = computed(() => authStore.user?.role === 'agent')
const counts = ref<InvolvementOffersResponse['counts'] | null>(null)

const tabFromQuery = (): OffersTab => (route.query.tab === 'sent' ? 'sent' : 'received')
const activeTab = ref<OffersTab>(tabFromQuery())

watch(() => route.query.tab, () => {
  activeTab.value = tabFromQuery()
})

function selectTab(value: string) {
  const tab: OffersTab = value === 'sent' ? 'sent' : 'received'
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

const tabs = computed(() => [
  { value: 'received', label: 'Received Offers', count: counts.value?.received },
  { value: 'sent', label: 'Sent Offers', count: counts.value?.sent },
])
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-fg">Offers</h1>
      <p class="mt-2 text-sm text-fg-muted">
        <template v-if="isAgent">Offers received on your and your clients' listings, and offers you've sent as a buyer.</template>
        <template v-else>Offers received on your listings, and offers you've sent as a buyer.</template>
      </p>
    </div>

    <div class="border-b border-border">
      <Tabs :tabs="tabs" :model-value="activeTab" @update:model-value="selectTab" />
    </div>

    <!-- Both stay mounted so switching tabs keeps filters and loaded data. -->
    <div v-show="activeTab === 'received'">
      <ReceivedOffersList :is-agent="isAgent" @counts="counts = $event" />
    </div>
    <div v-show="activeTab === 'sent'">
      <MyOffersView embedded />
    </div>
  </div>
</template>
