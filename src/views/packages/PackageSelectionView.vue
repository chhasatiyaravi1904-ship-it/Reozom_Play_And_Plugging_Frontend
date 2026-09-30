<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, PackageCheck } from 'lucide-vue-next'
import * as packageService from '@/services/packageService'
import { isNetworkError } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import type { PackageItem, PackageListResponse } from '@/types/package'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()

const packages = ref<PackageItem[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const selectingId = ref<string | null>(null)

function extractItems(payload: PackageListResponse | PackageItem[] | undefined): PackageItem[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

async function fetchPackages() {
  isLoading.value = true
  loadError.value = null
  try {
    const response = await packageService.fetchPackages()
    packages.value = extractItems(response.data)
  } catch (err) {
    loadError.value = isNetworkError(err)
      ? 'Unable to reach the API. Please verify the backend is running.'
      : 'Unable to load packages.'
  } finally {
    isLoading.value = false
  }
}

async function handleSelect(pkg: PackageItem) {
  selectingId.value = pkg.id
  try {
    const response = await packageService.selectPackage(pkg.id)
    authStore.user = response.data
    toast.success(`You're all set with the ${pkg.name} package.`)
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to select package. Please try again.')
  } finally {
    selectingId.value = null
  }
}

onMounted(fetchPackages)
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 py-4">
    
    <!-- Packages Listing (Hidden) -->
    <div v-if="false">
      <div class="text-center">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-1 ring-primary/20"
        >
          <PackageCheck class="h-6 w-6" />
        </div>
        <h1 class="mt-4 text-2xl font-semibold text-fg">Choose your package</h1>
        <p class="mt-1 text-sm text-fg-muted">
          Your email is verified — pick a package to start using your agent account.
        </p>
      </div>

      <LoadingState v-if="isLoading" label="Loading packages" :rows="3" />
      <ErrorState v-else-if="loadError" :description="loadError" @retry="fetchPackages">
        <template #action>
          <BaseButton variant="secondary" @click="fetchPackages">Try again</BaseButton>
        </template>
      </ErrorState>

      <div v-else class="grid gap-5 sm:grid-cols-3 mt-6">
        <BaseCard v-for="pkg in packages" :key="pkg.id" :padding="true" class="flex flex-col">
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-fg">{{ pkg.name }}</h2>
            <p v-if="pkg.description" class="mt-1.5 text-sm text-fg-muted">{{ pkg.description }}</p>
            <p class="mt-3 text-xs text-fg-muted">{{ pkg.durationDays }}-day access</p>
          </div>
          <BaseButton
            class="mt-5"
            block
            :loading="selectingId === pkg.id"
            :disabled="selectingId !== null"
            @click="handleSelect(pkg)"
          >
            <Check class="h-4 w-4" />
            <span class="ml-1.5">Select {{ pkg.name }}</span>
          </BaseButton>
        </BaseCard>
      </div>
    </div>

    <!-- Purchase History Mockup -->
    <div v-if="!isLoading && !loadError" class="mt-16">
      <h2 class="text-xl font-semibold text-neutral-900 mb-6">Purchase History</h2>
      <BaseCard class="overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Purchase Date</th>
                <th class="px-6 py-4">Package</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Expires</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 bg-white">
              <tr class="hover:bg-neutral-50/50 transition">
                <td class="px-6 py-4 text-neutral-900 font-medium">Sep 28, 2026</td>
                <td class="px-6 py-4 text-neutral-600">Premium Listing Service</td>
                <td class="px-6 py-4 text-neutral-600">$500.00</td>
                <td class="px-6 py-4 text-neutral-600">Oct 28, 2026</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Active</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <a href="#" class="text-primary hover:text-primary-active font-medium">Download</a>
                </td>
              </tr>
              <tr class="hover:bg-neutral-50/50 transition opacity-60">
                <td class="px-6 py-4 text-neutral-900 font-medium">Aug 28, 2026</td>
                <td class="px-6 py-4 text-neutral-600">Basic Package</td>
                <td class="px-6 py-4 text-neutral-600">$100.00</td>
                <td class="px-6 py-4 text-neutral-600">Sep 27, 2026</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">Expired</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <a href="#" class="text-primary hover:text-primary-active font-medium">Download</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
