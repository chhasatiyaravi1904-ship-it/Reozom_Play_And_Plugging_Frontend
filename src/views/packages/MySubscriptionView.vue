<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import BaseCard from '@/components/ui/BaseCard.vue'

const authStore = useAuthStore()

function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 py-4">
    <!-- Purchase History -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-neutral-900 mb-6">Purchase History</h2>
      <BaseCard class="overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Package</th>
                <th class="px-6 py-4">Started</th>
                <th class="px-6 py-4">Expires</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 bg-white">
              <tr v-if="authStore.user?.currentPackage" class="hover:bg-neutral-50/50 transition">
                <td class="px-6 py-4 text-neutral-900 font-medium">{{ authStore.user.currentPackage.name }}</td>
                <td class="px-6 py-4 text-neutral-600">{{ formatDate(authStore.user.currentPackage.startedAt) }}</td>
                <td class="px-6 py-4 text-neutral-600">{{ formatDate(authStore.user.currentPackage.expiresAt) }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Active</span>
                </td>
              </tr>
              <tr v-else>
                <td colspan="4" class="px-6 py-8 text-center text-neutral-500">No active package found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
