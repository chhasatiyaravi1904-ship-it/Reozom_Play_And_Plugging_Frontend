<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight, CheckCircle2, Check } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseRadioGroup from '@/components/form/BaseRadioGroup.vue'
import BaseCheckbox from '@/components/form/BaseCheckbox.vue'
import SocialLoginButtons from '@/components/form/SocialLoginButtons.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'
import * as publicGeographyService from '@/services/publicGeographyService'
import * as packageService from '@/services/packageService'
import type { PublicState, PublicCity } from '@/services/publicGeographyService'
import type { RegisterPayload } from '@/types/auth'
import type { PackageItem, PackageListResponse } from '@/types/package'

const router = useRouter()
const toast = useToastStore()
const { register, status, error } = useAuth()

const userTypeOptions = [
  { label: 'Agent', value: 'agent' },
  { label: 'Seller', value: 'seller' },
  { label: 'Buyer', value: 'buyer' },
]

const form = reactive({
  userType: 'seller' as RegisterPayload['userType'],
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  streetAddress: '',
  zip: '',
  password: '',
  passwordConfirmation: '',
})

const selectedStateId = ref('')
const selectedCityId = ref('')
const acceptedTerms = ref(false)
const formError = ref<string | null>(null)
const isPendingApproval = ref(false)

const states = ref<PublicState[]>([])
const cities = ref<PublicCity[]>([])
const citiesLoading = ref(false)

const packages = ref<PackageItem[]>([])
const packagesLoading = ref(false)
const packagesError = ref<string | null>(null)
const selectedPackageId = ref('')
let packagesFetched = false

function extractPackageItems(payload: PackageListResponse | PackageItem[] | undefined): PackageItem[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  if (payload && Array.isArray(payload.data)) return payload.data
  return []
}

async function fetchPackages() {
  if (packagesFetched) return
  packagesFetched = true
  packagesLoading.value = true
  packagesError.value = null
  try {
    const { data } = await packageService.fetchPackages()
    packages.value = extractPackageItems(data)
  } catch {
    packagesError.value = 'Unable to load packages right now.'
  } finally {
    packagesLoading.value = false
  }
}

watch(
  () => form.userType,
  (userType) => {
    if (userType === 'agent') {
      fetchPackages()
    } else {
      selectedPackageId.value = ''
    }
  },
  { immediate: true },
)

const stateOptions = computed(() =>
  states.value.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id })),
)
const cityOptions = computed(() => cities.value.map((c) => ({ label: c.name, value: c.id })))

onMounted(async () => {
  try {
    const { data } = await publicGeographyService.fetchPublicStates()
    states.value = data
  } catch {
    // Non-fatal — the state select will just stay empty; the field-level
    // required check below still stops submission cleanly.
  }
})

watch(selectedStateId, async (stateId) => {
  selectedCityId.value = ''
  cities.value = []
  if (!stateId) return

  citiesLoading.value = true
  try {
    const { data } = await publicGeographyService.fetchPublicCities(stateId)
    cities.value = data
  } catch {
    // Same non-fatal handling as the state fetch above.
  } finally {
    citiesLoading.value = false
  }
})

const passwordsMatch = computed(
  () => !form.passwordConfirmation || form.password === form.passwordConfirmation,
)

async function handleSubmit() {
  formError.value = null
  if (!acceptedTerms.value || !passwordsMatch.value) return

  const state = states.value.find((s) => s.id === selectedStateId.value)
  const city = cities.value.find((c) => c.id === selectedCityId.value)
  if (!state || !city) {
    formError.value = 'Please select your state and city.'
    return
  }

  const payload: RegisterPayload = {
    ...form,
    state: state.code,
    city: city.name,
    packageId: form.userType === 'agent' && selectedPackageId.value ? selectedPackageId.value : undefined,
  }

  const result = await register(payload)
  if (result === 'active') {
    toast.success('Account created! Welcome to REOZOM.')
    router.push('/dashboard')
  } else if (result === 'pending') {
    isPendingApproval.value = true
  }
}
</script>

<template>
  <div>
    <template v-if="isPendingApproval">
      <PageHeader title="Almost there" description="Your agent account is awaiting approval" />

      <div class="mt-8 flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-raised p-6 text-center">
        <CheckCircle2 class="h-10 w-10 text-success" />
        <p class="text-sm text-fg">
          Your agent account has been created and is pending admin approval. We'll email you once
          it's approved and you're able to sign in.
        </p>
        <RouterLink to="/auth/login" class="mt-2 text-sm font-medium text-primary hover:underline">
          Back to sign in
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <PageHeader title="Create your account" description="List your property in a few guided steps" />

      <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseRadioGroup v-model="form.userType" label="I am a" :options="userTypeOptions" inline required />

        <div v-if="form.userType === 'agent'" class="rounded-xl border border-border bg-surface-raised p-4">
          <p class="text-sm font-semibold text-fg">Choose a package</p>
          <p class="mt-0.5 text-xs text-fg-muted">
            Optional — pick one now, or select it after your account is approved.
          </p>

          <p v-if="packagesLoading" class="mt-3 text-sm text-fg-muted">Loading packages…</p>
          <p v-else-if="packagesError" class="mt-3 text-sm text-danger">{{ packagesError }}</p>
          <p v-else-if="packages.length === 0" class="mt-3 text-sm text-fg-muted">
            No packages are available right now.
          </p>

          <div v-else class="mt-3 grid gap-3 sm:grid-cols-3">
            <button
              v-for="pkg in packages"
              :key="pkg.id"
              type="button"
              class="focus-ring flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors"
              :class="
                selectedPackageId === pkg.id
                  ? 'border-primary bg-primary-soft'
                  : 'border-border bg-surface hover:border-primary/50'
              "
              @click="selectedPackageId = selectedPackageId === pkg.id ? '' : pkg.id"
            >
              <span class="flex w-full items-center justify-between gap-2">
                <span class="text-sm font-semibold text-fg">{{ pkg.name }}</span>
                <Check v-if="selectedPackageId === pkg.id" class="h-4 w-4 shrink-0 text-primary" />
              </span>
              <span v-if="pkg.description" class="text-xs text-fg-muted">{{ pkg.description }}</span>
              <span class="text-xs text-fg-muted">{{ pkg.durationDays }}-day access</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.firstName" label="First name" placeholder="Jane" required />
          <BaseInput v-model="form.lastName" label="Last name" placeholder="Seller" required />
        </div>

        <BaseInput
          v-model="form.email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          required
        />
        <BaseInput
          v-model="form.phone"
          type="tel"
          label="Phone number"
          placeholder="(555) 123-4567"
          required
        />

        <BaseInput
          v-model="form.streetAddress"
          label="Street address"
          placeholder="123 Main St"
          required
        />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <BaseSelect
            v-model="selectedStateId"
            label="State"
            placeholder="Select a state"
            :options="stateOptions"
            required
          />
          <BaseSelect
            v-model="selectedCityId"
            label="City"
            :placeholder="selectedStateId ? 'Select a city' : 'Select a state first'"
            :options="cityOptions"
            :disabled="!selectedStateId || citiesLoading"
            required
          />
          <BaseInput v-model="form.zip" label="ZIP code" placeholder="48104" required />
        </div>

        <BaseInput v-model="form.password" type="password" label="Password" required />
        <BaseInput
          v-model="form.passwordConfirmation"
          type="password"
          label="Confirm password"
          required
          :error="!passwordsMatch ? 'Passwords do not match' : undefined"
        />

        <BaseCheckbox v-model="acceptedTerms">
          I agree to the
          <a href="#" class="text-primary hover:underline">Terms of Service</a>
          and
          <a href="#" class="text-primary hover:underline">Privacy Policy</a>
        </BaseCheckbox>

        <p v-if="formError" class="text-sm text-danger">{{ formError }}</p>
        <p v-if="error" class="text-sm text-danger">{{ error }}</p>

        <BaseButton type="submit" block :disabled="!acceptedTerms" :loading="status === 'loading'">
          Create Account
          <ArrowRight class="ml-1.5 h-4 w-4" />
        </BaseButton>
      </form>

      <SocialLoginButtons />

      <p class="mt-6 text-center text-sm text-fg-muted">
        Already have an account?
        <RouterLink to="/auth/login" class="font-medium text-primary hover:underline"
          >Sign in</RouterLink
        >
      </p>
    </template>
  </div>
</template>
