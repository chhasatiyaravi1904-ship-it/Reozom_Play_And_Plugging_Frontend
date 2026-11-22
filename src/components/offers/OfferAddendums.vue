<script setup lang="ts">
/**
 * Addendum/Amendment to an accepted purchase agreement (original Reozom Addendum), for both
 * parties: list, add (sent through EunoDoc to every purchase agreement signer), sign, signed PDF
 * and cancel.
 */
import { onMounted, ref } from 'vue'
import * as eunoService from '@/services/eunoService'
import type { OfferAddendum } from '@/services/eunoService'

const props = defineProps<{ offerId: number }>()

const addendums = ref<OfferAddendum[]>([])
const isFormOpen = ref(false)
const text = ref('')
const isSaving = ref(false)
const error = ref('')

async function load() {
  try {
    addendums.value = await eunoService.fetchOfferAddendums(props.offerId)
  } catch {
    addendums.value = []
  }
}

onMounted(load)
defineExpose({ load })

async function create() {
  isSaving.value = true
  error.value = ''
  // Reozom opens the signing page for whoever wrote the addendum. Open the tab now:
  // browsers block pop-ups opened after an await.
  const signingWindow = window.open('', '_blank')
  try {
    const created = await eunoService.createOfferAddendum(props.offerId, text.value.trim())
    text.value = ''
    isFormOpen.value = false
    addendums.value = [created, ...addendums.value]
    if (created.signing_url && signingWindow) signingWindow.location.href = created.signing_url
    else signingWindow?.close()
  } catch (err: any) {
    signingWindow?.close()
    error.value = err?.response?.data?.errors?.description?.[0] || err?.response?.data?.message || 'Failed to send the addendum.'
  } finally {
    isSaving.value = false
  }
}

async function cancel(addendum: OfferAddendum) {
  const warning = addendum.status === 'completed'
    ? 'This addendum is already signed by everyone. Cancel it anyway? The signed copies shared with the seller and buyer are removed too.'
    : 'Cancel this addendum? The signing request is withdrawn for every signer.'
  if (!confirm(warning)) return
  try {
    await eunoService.cancelOfferAddendum(props.offerId, addendum.id)
    addendums.value = addendums.value.filter((a) => a.id !== addendum.id)
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to cancel the addendum.')
  }
}

function statusLabel(status: string): string {
  if (status === 'completed') return 'Signed by all parties'
  if (status === 'inprogress') return 'Waiting for signatures'
  return status
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Addendums</h4>
      <button
        type="button"
        class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
        @click="isFormOpen = !isFormOpen"
      >
        {{ isFormOpen ? 'Cancel' : 'Add Addendum' }}
      </button>
    </div>

    <div v-if="isFormOpen" class="space-y-2">
      <label :for="`addendum-${offerId}`" class="block text-xs font-semibold text-slate-700">
        What is being added to or changed in the purchase agreement?
      </label>
      <textarea
        :id="`addendum-${offerId}`"
        v-model="text"
        rows="3"
        maxlength="2000"
        class="w-full rounded-lg border border-slate-200 p-2 text-sm"
        placeholder="e.g. The closing date is moved to June 30."
      ></textarea>
      <p v-if="error" class="text-xs text-rose-700" role="alert">{{ error }}</p>
      <button
        type="button"
        class="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold disabled:opacity-50"
        :disabled="isSaving || !text.trim()"
        @click="create"
      >
        {{ isSaving ? 'Sending…' : 'Send Addendum for Signature' }}
      </button>
    </div>

    <p v-if="!addendums.length && !isFormOpen" class="text-xs text-slate-500">No addendums yet.</p>
    <ul v-else class="divide-y divide-slate-100">
      <li v-for="a in addendums" :key="a.id" class="py-2 flex flex-wrap items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-sm text-slate-800 whitespace-pre-line">{{ a.description }}</p>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ a.created_at ? new Date(a.created_at).toLocaleDateString() : '' }} · {{ statusLabel(a.status) }}
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <a
            v-if="a.signing_url"
            :href="a.signing_url"
            target="_blank"
            rel="noopener"
            class="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
          >
            Sign
          </a>
          <a
            v-if="a.has_signed_pdf && a.agreement_id"
            :href="eunoService.getSignedDocUrl(a.agreement_id)"
            target="_blank"
            rel="noopener"
            class="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
          >
            Signed PDF
          </a>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
            @click="cancel(a)"
          >
            Cancel Addendum
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
