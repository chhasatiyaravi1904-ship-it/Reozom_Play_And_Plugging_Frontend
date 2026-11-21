<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import * as paymentService from '@/services/paymentService'
import type { BankAccountInput, BankAccountSummary } from '@/services/paymentService'

/**
 * The US bank account an admin pays this agent's withdrawals into. The full numbers are sent once
 * and stored encrypted; afterwards the agent only sees the last 4 digits.
 */
const props = defineProps<{
  existing?: BankAccountSummary | null
}>()

const emit = defineEmits<{
  (e: 'saved', value: BankAccountSummary): void
  (e: 'cancel'): void
}>()

const form = reactive<BankAccountInput>({
  account_holder_name: props.existing?.account_holder_name ?? '',
  bank_name: props.existing?.bank_name ?? '',
  routing_number: '',
  account_number: '',
  account_number_confirmation: '',
  account_type: props.existing?.account_type ?? 'checking',
})
const errors = reactive<Record<string, string>>({})
const isSaving = ref(false)
const formError = ref('')

function validate(): boolean {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.account_holder_name.trim()) errors.account_holder_name = 'Enter the name on the account.'
  if (!form.bank_name.trim()) errors.bank_name = 'Enter the bank name.'
  if (!/^\d{9}$/.test(form.routing_number)) errors.routing_number = 'The routing number is 9 digits.'
  if (!/^\d{4,17}$/.test(form.account_number)) errors.account_number = 'The account number is 4 to 17 digits.'
  else if (form.account_number !== form.account_number_confirmation) errors.account_number_confirmation = 'The account numbers do not match.'
  return Object.keys(errors).length === 0
}

async function submit() {
  formError.value = ''
  if (!validate()) return
  isSaving.value = true
  try {
    const saved = await paymentService.saveBankAccount({
      ...form,
      account_holder_name: form.account_holder_name.trim(),
      bank_name: form.bank_name.trim(),
    })
    emit('saved', saved)
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors as Record<string, string[]> | undefined
    if (serverErrors) {
      for (const [key, messages] of Object.entries(serverErrors)) errors[key] = messages[0] ?? ''
    }
    formError.value = e?.response?.data?.message || 'Could not save your bank details.'
  } finally {
    isSaving.value = false
  }
}

const inputClass =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none'
</script>

<template>
  <form class="grid gap-4 sm:grid-cols-2" novalidate @submit.prevent="submit">
    <div class="sm:col-span-2">
      <label for="bank-holder" class="mb-1 block text-xs font-semibold text-fg">Name on the account</label>
      <input id="bank-holder" v-model="form.account_holder_name" type="text" autocomplete="name" :class="inputClass" />
      <p v-if="errors.account_holder_name" class="mt-1 text-xs text-rose-600">{{ errors.account_holder_name }}</p>
    </div>
    <div>
      <label for="bank-name" class="mb-1 block text-xs font-semibold text-fg">Bank name</label>
      <input id="bank-name" v-model="form.bank_name" type="text" :class="inputClass" />
      <p v-if="errors.bank_name" class="mt-1 text-xs text-rose-600">{{ errors.bank_name }}</p>
    </div>
    <div>
      <label for="bank-type" class="mb-1 block text-xs font-semibold text-fg">Account type</label>
      <select id="bank-type" v-model="form.account_type" :class="inputClass">
        <option value="checking">Checking</option>
        <option value="savings">Savings</option>
      </select>
    </div>
    <div>
      <label for="bank-routing" class="mb-1 block text-xs font-semibold text-fg">Routing number</label>
      <input
        id="bank-routing"
        v-model="form.routing_number"
        type="text"
        inputmode="numeric"
        maxlength="9"
        autocomplete="off"
        :placeholder="existing ? `••••${existing.routing_last4}` : '9 digits'"
        :class="inputClass"
      />
      <p v-if="errors.routing_number" class="mt-1 text-xs text-rose-600">{{ errors.routing_number }}</p>
    </div>
    <div>
      <label for="bank-account" class="mb-1 block text-xs font-semibold text-fg">Account number</label>
      <input
        id="bank-account"
        v-model="form.account_number"
        type="password"
        inputmode="numeric"
        maxlength="17"
        autocomplete="off"
        :placeholder="existing ? `••••${existing.account_last4}` : ''"
        :class="inputClass"
      />
      <p v-if="errors.account_number" class="mt-1 text-xs text-rose-600">{{ errors.account_number }}</p>
    </div>
    <div class="sm:col-span-2 sm:w-1/2 sm:pr-2">
      <label for="bank-account-confirm" class="mb-1 block text-xs font-semibold text-fg">Confirm account number</label>
      <input
        id="bank-account-confirm"
        v-model="form.account_number_confirmation"
        type="text"
        inputmode="numeric"
        maxlength="17"
        autocomplete="off"
        :class="inputClass"
      />
      <p v-if="errors.account_number_confirmation" class="mt-1 text-xs text-rose-600">{{ errors.account_number_confirmation }}</p>
    </div>

    <p v-if="formError" class="sm:col-span-2 text-sm text-rose-600" role="alert">{{ formError }}</p>
    <div class="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
      <p class="text-xs text-fg-muted">Stored encrypted. Only admins see the full numbers, to send your transfers.</p>
      <div class="flex gap-2">
        <BaseButton v-if="existing" type="button" variant="secondary" @click="emit('cancel')">Cancel</BaseButton>
        <BaseButton type="submit" :loading="isSaving">Save bank details</BaseButton>
      </div>
    </div>
  </form>
</template>
