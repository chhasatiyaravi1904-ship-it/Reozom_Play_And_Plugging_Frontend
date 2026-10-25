<template>
  <div class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition flex flex-col">
    <RouterLink :to="`/properties/${listing.id}`" class="block flex-1 flex flex-col">
      <!-- Image Section -->
      <div class="bg-neutral-100 aspect-[4/3] flex items-center justify-center border-b border-neutral-200 overflow-hidden relative">
        <img v-if="listing.images?.length" :src="listing.images[0]?.url" :alt="listing.images[0]?.alt || 'Property Image'" class="w-full h-full object-cover" loading="lazy" />
        <IconImage v-else class="w-10 h-10 text-neutral-300" />
      </div>

      <div class="p-5 flex flex-col gap-4 flex-1">
        <!-- Header -->
        <div>
          <h3 class="text-lg font-bold text-neutral-900 truncate">
            {{ titleField ? formatField(titleField) : 'Untitled Property' }}
          </h3>
          <div class="text-primary font-bold text-xl mt-1" v-if="priceField">
            {{ formatField(priceField) }}
          </div>
          <div class="text-sm text-neutral-500 mt-2 flex items-center gap-1">
            <IconMapPin class="w-4 h-4" />
            {{ listing.address.city }}, {{ listing.address.state }} {{ listing.address.zip }}
          </div>
        </div>

        <!-- Dynamic Fields Grid -->
        <div class="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-neutral-100">
          <div v-for="field in displayFields" :key="field.id" class="flex flex-col">
            <span class="text-xs text-neutral-500 font-medium">{{ field.label }}</span>
            <span class="text-sm font-medium text-neutral-900 truncate">
              {{ formatField(field) }}
            </span>
          </div>
        </div>
      </div>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Image as IconImage, MapPin as IconMapPin } from 'lucide-vue-next'
import type { PublicListing, PublicFieldConfig } from '@/services/publicListingService'
import { formatPublicField } from '@/utils/fieldFormatters'

const props = defineProps<{
  listing: PublicListing
}>()

// Use system identifiers created in Chunk 2
const titleField = computed(() => props.listing.public_info.find(f => f.id === 'listing_title'))
const priceField = computed(() => props.listing.public_info.find(f => f.id === 'listing_price'))

const displayFields = computed(() => {
  return props.listing.public_info.filter(f => 
    f.public_display !== false && 
    f.show_on_card !== false &&
    f.id !== 'listing_title' && 
    f.id !== 'listing_price'
  ).slice(0, 4) // Limit to 4 for card aesthetics
})

const formatField = (field: PublicFieldConfig) => {
  return formatPublicField(field, props.listing.values[field.id])
}
</script>
