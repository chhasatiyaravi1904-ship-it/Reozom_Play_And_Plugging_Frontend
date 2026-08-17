<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import FileUploader from '@/components/listing/FileUploader.vue'
import DocumentList from '@/components/listing/DocumentList.vue'
import { useDocumentStore } from '@/stores/document'
import { useListingSteps } from '@/composables/useListingSteps'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const listingId = computed(() => Number(route.params.listingId))

const documentStore = useDocumentStore()
const { steps, routeFor } = useListingSteps(listingId.value)

const pendingUploadId = ref<string | null>(null)
const hiddenInput = ref<HTMLInputElement | null>(null)

const uploadedCount = computed(
  () => documentStore.documents.filter((d) => d.status === 'uploaded').length,
)

onMounted(() => {
  documentStore.fetchDocuments(listingId.value)
})

function startUpload(documentId: string) {
  pendingUploadId.value = documentId
  hiddenInput.value?.click()
}

async function handleFileChosen(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && pendingUploadId.value) {
    const success = await documentStore.upload(listingId.value, pendingUploadId.value, file)
    if (success) toast.success('Document uploaded.')
    else toast.error('Upload failed. Please try again.')
  }
  ;(event.target as HTMLInputElement).value = ''
}

function handleFirstPendingUpload(file: File) {
  const nextPending = documentStore.documents.find((d) => d.status !== 'uploaded')
  if (nextPending) {
    documentStore.upload(listingId.value, nextPending.id, file).then((success) => {
      if (success) toast.success('Document uploaded.')
      else toast.error('Upload failed. Please try again.')
    })
  }
}

async function handleRemove(documentId: string) {
  await documentStore.remove(listingId.value, documentId)
}

function handleBack() {
  const index = steps.value.findIndex((s) => s.id === 'documents')
  const previous = steps.value[index - 1]
  if (index > 0 && previous) router.push(routeFor(previous.id))
}

function handleContinue() {
  router.push(routeFor('review'))
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <PageHeader title="Documents">
      <template #actions>
        <span class="text-sm text-fg-muted">
          {{ uploadedCount }} of {{ documentStore.documents.length }} uploaded
        </span>
      </template>
    </PageHeader>

    <BaseCard>
      <ErrorState
        v-if="documentStore.status === 'error'"
        :description="documentStore.error || undefined"
      >
        <template #action>
          <BaseButton size="sm" @click="documentStore.fetchDocuments(listingId)">
            Try Again
          </BaseButton>
        </template>
      </ErrorState>

      <template v-else>
        <FileUploader class="mb-6" @select="handleFirstPendingUpload" />

        <LoadingState v-if="documentStore.status === 'loading'" :rows="4" />

        <template v-else>
          <h2 class="mb-3 text-sm font-semibold text-fg">Required Documents</h2>
          <DocumentList
            :documents="documentStore.documents"
            @upload="startUpload"
            @remove="handleRemove"
          />
        </template>

        <input
          ref="hiddenInput"
          type="file"
          class="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          @change="handleFileChosen"
        />
      </template>

      <template #footer>
        <div class="flex items-center justify-between">
          <BaseButton variant="secondary" @click="handleBack">Back</BaseButton>
          <BaseButton @click="handleContinue">
            Save & Continue
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
