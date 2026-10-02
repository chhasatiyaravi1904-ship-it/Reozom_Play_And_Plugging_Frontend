<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Search, Check, MapPin, Package, ShieldCheck, Info } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import { useListingStore } from '@/stores/listing'
import { searchServicePackagesByZip } from '@/services/servicePackageService'

const router = useRouter()
const listingStore = useListingStore()

const zipSearchInput = ref('')
const isSearchingZip = ref(false)
const availablePackages = ref<any[]>([])
const searchError = ref<string | null>(null)
const selectedPackage = ref<any>(null)
const isResolving = ref(false)
const routingFailed = ref(false)

let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

watch(zipSearchInput, (newVal) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  if (!newVal.trim()) {
    availablePackages.value = [];
    selectedPackage.value = null;
    return;
  }
  
  debounceTimeout = setTimeout(() => {
    handleZipSearch();
  }, 400); // 400ms debounce delay
});

const handleZipSearch = async () => {
  const query = zipSearchInput.value.trim();
  if (!query) return;

  isSearchingZip.value = true;
  searchError.value = null;
  availablePackages.value = [];
  selectedPackage.value = null;
  
  try {
    const response = await searchServicePackagesByZip(query);
    let packages = Array.isArray(response.data) ? response.data : 
                     (response.data?.data ? response.data.data : []);
    
    // Flatten and inject agent details directly into the package
    availablePackages.value = packages.map((pkg: any) => {
      const agentName = pkg.agent?.full_name || pkg.agent?.first_name ? `${pkg.agent.first_name} ${pkg.agent.last_name || ''}`.trim() : 'Verified Agent';
      const agentInitials = pkg.agent?.first_name ? `${pkg.agent.first_name[0]}${pkg.agent.last_name ? pkg.agent.last_name[0] : ''}` : 'VA';
      const agentLicense = pkg.agent?.license || 'State Licensed';
      
      return {
        ...pkg,
        agentName,
        agentInitials,
        agentLicense
      };
    });
  } catch (e) {
    console.error(e);
    searchError.value = 'Failed to fetch available packages for this ZIP code.';
  } finally {
    isSearchingZip.value = false;
  }
};

async function handleSubmit() {
  if (!selectedPackage.value) return;
  
  isResolving.value = true
  routingFailed.value = false
  const listing = await listingStore.startListing({ zip: zipSearchInput.value, packageId: selectedPackage.value.id })
  isResolving.value = false
  if (listing) {
    const basePath = router.currentRoute.value.path.startsWith('/agent') ? '/agent' : ''
    router.push(`${basePath}/listings/${listing.id}`)
  } else {
    routingFailed.value = true
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl py-6">
    <!-- Premium Header Section -->
    <div class="text-center mb-10">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
        <MapPin class="w-4 h-4" />
        <span>Location Verification</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-fg tracking-tight mb-3">
        Discover Verified Agents in Your Area
      </h1>
      <p class="text-lg text-fg-muted max-w-2xl mx-auto">
        Enter your property's ZIP code to unlock tailored listing packages from our network of verified professionals.
      </p>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 gap-8">
      <!-- Search Card -->
      <div class="bg-surface border border-border/50 rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden">
        <!-- Decorative background gradient -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <ErrorState
          v-if="routingFailed"
          title="Listing Initialization Failed"
          description="We couldn't determine the correct listing process. Please contact support or try a different address."
        >
          <template #action>
            <BaseButton size="sm" @click="routingFailed = false">Try Again</BaseButton>
          </template>
        </ErrorState>

        <div v-else class="relative z-10 flex flex-col gap-8">
          <div class="max-w-xl mx-auto w-full">
            <label class="block text-sm font-semibold text-fg mb-2 uppercase tracking-wide">Property ZIP Code</label>
            <div class="relative flex items-center group">
              <Search class="absolute left-4 w-5 h-5 text-fg-muted transition-colors group-focus-within:text-primary" />
              <input
                v-model="zipSearchInput"
                type="text"
                class="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-surface text-lg text-fg placeholder:text-fg-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="Enter 5-digit ZIP (e.g. 90210)"
              />
              <div v-if="isSearchingZip" class="absolute right-4">
                <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>

          <ErrorState v-if="searchError" :description="searchError" />

          <!-- Packages Container -->
          <div v-if="availablePackages.length > 0 && !isSearchingZip" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 border-t border-border/50">
            
            <!-- Packages Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div 
                v-for="pkg in availablePackages" 
                :key="pkg.id"
                class="group relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col"
                :class="selectedPackage?.id === pkg.id ? 'border-primary bg-primary/[0.02] shadow-md scale-[1.02]' : 'border-border/60 bg-surface hover:border-primary/40 hover:shadow-sm'"
                @click="selectedPackage = pkg"
              >
                <!-- Selection Indicator -->
                <div v-if="selectedPackage?.id === pkg.id" class="absolute top-4 right-4 bg-primary text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-200">
                  <Check class="w-4 h-4" />
                </div>

                <div class="flex flex-col h-full">
                  <!-- Agent info integrated into package card -->
                  <div class="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {{ pkg.agentInitials }}
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <h3 class="text-sm font-bold text-fg line-clamp-1">{{ pkg.agentName }}</h3>
                        <ShieldCheck class="w-3.5 h-3.5 text-secondary shrink-0" />
                      </div>
                      <div class="text-[10px] text-fg-muted uppercase tracking-wider">{{ pkg.agentLicense }}</div>
                    </div>
                  </div>

                  <div class="flex items-start gap-3 mb-3">
                    <div class="p-2 rounded-lg" :class="selectedPackage?.id === pkg.id ? 'bg-primary/10 text-primary' : 'bg-surface-container text-fg-muted'">
                      <Package class="w-6 h-6" />
                    </div>
                    <div class="pr-6">
                      <h4 class="font-bold text-fg text-lg leading-tight">{{ pkg.name }}</h4>
                    </div>
                  </div>
                  
                  <p class="text-sm text-fg-muted leading-relaxed flex-grow mb-6">
                    {{ pkg.description || 'Comprehensive real estate services designed to maximize your property value.' }}
                  </p>
                  
                  <div class="mt-auto pt-4 border-t border-border/50 flex items-end justify-between">
                    <div class="text-xs font-semibold text-fg-muted uppercase tracking-wider">Package Price</div>
                    <div class="text-2xl font-black text-fg" :class="selectedPackage?.id === pkg.id ? 'text-primary' : ''">
                      ${{ Number(pkg.price || 0).toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sticky Action Bar -->
            <div class="sticky bottom-4 z-20 mt-8 p-4 bg-surface/90 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-8">
              <div class="flex items-center gap-3 text-sm text-fg font-medium">
                <Info class="w-5 h-5 text-secondary" />
                <span v-if="selectedPackage">
                  Selected <span class="font-bold text-primary">{{ selectedPackage.name }}</span> package.
                </span>
                <span v-else class="text-fg-muted">
                  Please select a package to proceed.
                </span>
              </div>
              <BaseButton 
                size="lg" 
                :disabled="!selectedPackage" 
                :loading="isResolving" 
                @click="handleSubmit"
                class="w-full sm:w-auto px-8"
              >
                Start My Listing
                <ArrowRight class="ml-2 h-5 w-5" />
              </BaseButton>
            </div>
          </div>
          
          <div v-else-if="!isSearchingZip && zipSearchInput.length >= 5 && availablePackages.length === 0" class="text-center py-12 px-4 rounded-xl border border-dashed border-border/60 bg-surface-container/30">
            <div class="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4 text-fg-muted">
              <Search class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-semibold text-fg mb-2">No agents found</h3>
            <p class="text-fg-muted max-w-sm mx-auto">We couldn't find any active agent packages for {{ zipSearchInput }}. Please try another ZIP code nearby.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
