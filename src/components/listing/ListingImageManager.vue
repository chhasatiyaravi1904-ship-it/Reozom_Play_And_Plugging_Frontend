<template>
  <div class="rounded-xl border border-border bg-surface p-6 shadow-sm mt-6">
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-fg">Listing Images</h2>
        <p class="text-sm text-fg-muted mt-1">Upload and manage photos for this property. The primary image will be used as the main cover.</p>
      </div>
      <div>
        <input 
          type="file" 
          multiple 
          accept="image/jpeg,image/png,image/jpg,image/webp" 
          class="hidden" 
          ref="fileInput" 
          @change="handleFileSelect"
        />
        <BaseButton @click="() => fileInput?.click()" :disabled="isUploading">
          <IconUpload class="w-4 h-4 mr-2" />
          {{ isUploading ? 'Uploading...' : 'Upload Images' }}
        </BaseButton>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="mb-6 p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-if="!images.length && !isLoading" class="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl bg-surface-muted text-center">
      <IconImage class="w-12 h-12 text-fg-muted mb-4" />
      <h3 class="text-lg font-medium text-fg">No images yet</h3>
      <p class="text-sm text-fg-muted mt-1">Upload photos to showcase this listing to the public.</p>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="(img, index) in images" 
        :key="img.id"
        class="flex flex-col border border-border rounded-xl overflow-hidden bg-white shadow-sm transition-all"
        :class="{'ring-2 ring-primary': img.is_primary}"
      >
        <!-- Image display -->
        <div class="relative aspect-[4/3] bg-neutral-100 group">
          <img
            :src="getImageUrl(img.url)"
            :alt="img.alt_text || 'Property image'"
            class="w-full h-full object-cover"
            @error="(e) => handleImageError(e, img)"
          />
          <div v-if="img.is_primary" class="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded shadow">
            PRIMARY
          </div>
          <div v-if="!img.is_public" class="absolute top-2 right-2 bg-neutral-800/80 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow">
            <IconLock class="w-3 h-3" /> PRIVATE
          </div>
        </div>

        <!-- Controls -->
        <div class="p-4 flex flex-col gap-3 flex-1">
          <!-- Metadata -->
          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 cursor-pointer text-fg">
              <input type="checkbox" :checked="img.is_public" @change="e => toggleVisibility(img, (e.target as HTMLInputElement).checked)" class="rounded text-primary focus:ring-primary h-4 w-4" />
              Public
            </label>
            <button 
              v-if="!img.is_primary"
              @click="setPrimary(img)"
              class="text-primary hover:underline font-medium text-xs uppercase"
            >
              Set Primary
            </button>
          </div>

          <!-- Alt text -->
          <div>
            <label class="block text-xs font-medium text-fg-muted mb-1">Alt Text</label>
            <input 
              type="text" 
              :value="img.alt_text" 
              @blur="e => updateAltText(img, (e.target as HTMLInputElement).value)"
              class="w-full text-sm rounded border-border px-2 py-1.5 focus:border-primary focus:ring-primary shadow-sm"
              placeholder="Describe image..."
            />
          </div>

          <!-- Actions -->
          <div class="mt-auto pt-3 border-t border-border flex items-center justify-between">
            <div class="flex items-center gap-1">
              <button 
                title="Move Left"
                @click="moveImage(index, -1)" 
                :disabled="index === 0"
                class="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 transition"
              >
                <IconChevronLeft class="w-4 h-4" />
              </button>
              <button 
                title="Move Right"
                @click="moveImage(index, 1)" 
                :disabled="index === images.length - 1"
                class="p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 disabled:opacity-30 transition"
              >
                <IconChevronRight class="w-4 h-4" />
              </button>
            </div>
            
            <button 
              title="Delete"
              @click="removeImage(img)" 
              class="p-1.5 rounded text-danger hover:bg-danger/10 transition"
            >
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Upload as IconUpload, Image as IconImage, Lock as IconLock, Trash as IconTrash, ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import * as listingImageService from '@/services/listingImageService'
import type { ListingImage } from '@/services/listingImageService'

const props = defineProps<{
  listingId: number
}>()

const images = ref<ListingImage[]>([])
const isLoading = ref(true)
const isUploading = ref(false)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function getImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('/storage')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const backendHost = apiBase.replace(/\/api\/?$/, '')
    return `${backendHost}${url}`
  }
  if (window.location.hostname === '127.0.0.1' && url.includes('//localhost:8000')) {
    return url.replace('//localhost:8000', '//127.0.0.1:8000')
  }
  if (window.location.hostname === 'localhost' && url.includes('//127.0.0.1:8000')) {
    return url.replace('//127.0.0.1:8000', '//localhost:8000')
  }
  return url
}

function handleImageError(e: Event, img: ListingImage) {
  const el = e.target as HTMLImageElement
  if (!el || el.dataset.retried) return
  el.dataset.retried = 'true'
  if (el.src.includes('localhost:8000')) {
    el.src = el.src.replace('localhost:8000', '127.0.0.1:8000')
  } else if (el.src.includes('127.0.0.1:8000')) {
    el.src = el.src.replace('127.0.0.1:8000', 'localhost:8000')
  }
}

const loadImages = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await listingImageService.fetchImages(props.listingId)
    // Axios interceptor already unwraps {success, data} envelope
    images.value = res.data ?? []
  } catch (err: any) {
    error.value = 'Failed to load images.'
  } finally {
    isLoading.value = false
  }
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files?.length) return
  
  const files = Array.from(target.files)
  
  // Basic frontend validation
  const invalidFile = files.find(f => !['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(f.type) || f.size > 5 * 1024 * 1024)
  if (invalidFile) {
    error.value = 'One or more files are invalid. Only JPEG, PNG, WEBP up to 5MB are allowed.'
    target.value = ''
    return
  }

  isUploading.value = true
  error.value = null
  try {
    const res = await listingImageService.uploadImages(props.listingId, files)
    const newImages = res.data ?? []
    images.value = [...images.value, ...newImages]
    // Refresh to sync sort_order and ensure clean state
    await loadImages()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to upload images.'
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

const toggleVisibility = async (img: ListingImage, is_public: boolean) => {
  try {
    img.is_public = is_public
    await listingImageService.updateImage(props.listingId, img.id, { is_public })
  } catch (err) {
    img.is_public = !is_public // revert
    error.value = 'Failed to update visibility.'
  }
}

const updateAltText = async (img: ListingImage, alt_text: string) => {
  if (img.alt_text === alt_text) return
  const oldVal = img.alt_text
  try {
    img.alt_text = alt_text
    await listingImageService.updateImage(props.listingId, img.id, { alt_text })
  } catch (err) {
    img.alt_text = oldVal // revert
    error.value = 'Failed to update alt text.'
  }
}

const setPrimary = async (img: ListingImage) => {
  try {
    await listingImageService.setPrimaryImage(props.listingId, img.id)
    images.value.forEach(i => i.is_primary = false)
    img.is_primary = true
  } catch (err) {
    error.value = 'Failed to set primary image.'
  }
}

const removeImage = async (img: ListingImage) => {
  if (!confirm('Are you sure you want to delete this image?')) return
  try {
    await listingImageService.deleteImage(props.listingId, img.id)
    images.value = images.value.filter(i => i.id !== img.id)
  } catch (err) {
    error.value = 'Failed to delete image.'
  }
}

const moveImage = async (index: number, direction: number) => {
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= images.value.length) return
  
  // Swap locally
  const temp = images.value[index]
  const target = images.value[targetIndex]
  if (!temp || !target) return
  images.value[index] = target
  images.value[targetIndex] = temp
  
  // Update sort_order locally
  images.value.forEach((img, i) => img.sort_order = i + 1)
  
  // Persist
  try {
    await listingImageService.reorderImages(props.listingId, images.value.map(i => i.id))
  } catch (err) {
    // Revert on failure
    const revTemp = images.value[index]
    const targetItem = images.value[targetIndex]
    if (revTemp && targetItem) {
      images.value[index] = targetItem
      images.value[targetIndex] = revTemp
    }
    error.value = 'Failed to reorder images.'
  }
}

onMounted(() => {
  loadImages()
})
</script>
