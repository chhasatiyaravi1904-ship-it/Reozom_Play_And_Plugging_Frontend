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

    <div v-else class="grid gap-5 sm:grid-cols-3">
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
</template>
