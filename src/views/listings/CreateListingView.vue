<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useListingStore } from '@/stores/listing'

const router = useRouter()
const listingStore = useListingStore()

const form = reactive({ address: '', city: '', state: '', zip: '' })
const isResolving = ref(false)
const routingFailed = ref(false)

const stateOptions = [
  { label: 'Michigan', value: 'Michigan' },
  { label: 'Ohio', value: 'Ohio' },
  { label: 'Indiana', value: 'Indiana' },
]

async function handleSubmit() {
  isResolving.value = true
  routingFailed.value = false
  const listing = await listingStore.startListing(form)
  isResolving.value = false
  if (listing) {
    router.push(`/listings/${listing.id}`)
  } else {
    routingFailed.value = true
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl">
    <PageHeader
      title="Where is your property located?"
      description="We'll use this address to determine the right listing process for your area."
    />

    <BaseCard class="mt-6">
      <ErrorState
        v-if="routingFailed"
        title="We couldn't determine the correct listing process"
        description="Please contact support or try a different address."
      >
        <template #action>
          <BaseButton size="sm" @click="routingFailed = false">Try Again</BaseButton>
        </template>
      </ErrorState>

      <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.address"
          label="Property Address"
          placeholder="123 Maple Street"
          required
        />
        <BaseInput v-model="form.city" label="City" placeholder="Ann Arbor" required />
        <BaseSelect v-model="form.state" label="State" :options="stateOptions" required />
        <BaseInput v-model="form.zip" label="ZIP Code" placeholder="48103" required />

        <BaseButton type="submit" block :loading="isResolving">
          Continue
          <ArrowRight class="ml-1.5 h-4 w-4" />
        </BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
