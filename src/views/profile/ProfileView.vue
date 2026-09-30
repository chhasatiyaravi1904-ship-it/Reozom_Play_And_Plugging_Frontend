<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import { User, Mail, Phone, ShieldCheck, Camera, Save } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'
import { isNetworkError } from '@/services/api'
import * as sellerService from '@/services/sellerService'
import { useToastStore } from '@/stores/toast'

const { user } = useAuth()
const toast = useToastStore()

const form = reactive({ fullName: '', email: '', phone: '' })
const isSaving = ref(false)

watchEffect(() => {
  if (user.value) {
    form.fullName = user.value.fullName || ''
    form.email = user.value.email || ''
    form.phone = user.value.phone || ''
  }
})

const getInitials = (name: string) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

async function handleSubmit() {
  isSaving.value = true
  try {
    await sellerService.updateProfile(form)
    toast.success('Profile updated successfully.')
  } catch (err) {
    if (import.meta.env.DEV && isNetworkError(err)) {
      toast.success('Profile updated (Local Dev).')
    } else {
      toast.error('Unable to update your profile. Please try again.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl py-6 space-y-8 animate-in fade-in duration-500">
    <!-- Header with Background Gradient -->
    <div class="relative overflow-hidden rounded-2xl bg-surface border border-border/50 shadow-sm">
      <!-- Gradient Header Bar -->
      <div class="h-32 bg-gradient-to-r from-primary/80 to-primary"></div>
      
      <!-- Profile Content -->
      <div class="px-8 pb-6 relative pt-20 sm:pt-4">
        <!-- Avatar Container -->
        <div class="absolute -top-16 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 group z-10">
          <div class="w-32 h-32 rounded-full border-4 border-surface bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
            {{ getInitials(form.fullName) }}
          </div>
          <!-- Interactive Avatar Edit Button -->
          <button class="absolute bottom-1 right-1 p-2 bg-surface text-fg rounded-full border border-border shadow-md hover:bg-surface-container transition-colors group-hover:scale-110">
            <Camera class="w-4 h-4 text-primary" />
          </button>
        </div>

        <!-- Header Text -->
        <div class="flex-grow text-center sm:text-left sm:ml-40 pb-2">
          <h1 class="text-2xl font-bold text-fg flex items-center justify-center sm:justify-start gap-2">
            {{ form.fullName || 'User Profile' }}
            <ShieldCheck v-if="user?.role === 'agent'" class="w-5 h-5 text-secondary" title="Verified Agent" />
          </h1>
          <p class="text-fg-muted font-medium capitalize flex items-center justify-center sm:justify-start gap-1.5 mt-1">
            <User class="w-4 h-4 opacity-70" />
            {{ user?.role || 'User' }} Account
          </p>
        </div>
      </div>
    </div>

    <!-- Main Settings Layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Left Sidebar Information -->
      <div class="md:col-span-1 space-y-6">
        <BaseCard class="border-border/50 shadow-sm bg-surface" :padding="false">
          <div class="p-6">
            <h3 class="text-sm font-semibold text-fg uppercase tracking-wider mb-4">Account Security</h3>
            <p class="text-sm text-fg-muted mb-4 leading-relaxed">
              Ensure your account is using a long, random password to stay secure. 
            </p>
            <button class="text-primary text-sm font-medium hover:underline flex items-center gap-1.5 transition-colors">
              Change Password
            </button>
          </div>
        </BaseCard>
      </div>

      <!-- Right Form Area -->
      <div class="md:col-span-2">
        <form @submit.prevent="handleSubmit">
          <BaseCard class="border-border/50 shadow-sm bg-surface" :padding="false">
            
            <div class="px-8 pt-8 pb-6 border-b border-border/50 bg-surface">
              <h2 class="text-xl font-bold text-fg">Personal Information</h2>
              <p class="text-sm text-fg-muted mt-1">Update your personal details and contact information.</p>
            </div>

            <div class="p-8 space-y-6 max-w-lg">
              
              <!-- Full Name -->
              <div>
                <label class="block text-sm font-medium text-fg mb-1.5">Full Name</label>
                <div class="relative">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted" />
                  <input
                    v-model="form.fullName"
                    type="text"
                    required
                    class="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-surface text-fg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <!-- Email Address -->
              <div>
                <label class="block text-sm font-medium text-fg mb-1.5">Email Address</label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted" />
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    disabled
                    class="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-surface-container/50 text-fg-muted focus:outline-none cursor-not-allowed"
                    placeholder="Email address"
                  />
                </div>
                <p class="text-xs text-fg-muted mt-1.5">Email address cannot be changed directly.</p>
              </div>

              <!-- Phone Number -->
              <div>
                <label class="block text-sm font-medium text-fg mb-1.5">Phone Number</label>
                <div class="relative">
                  <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted" />
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-surface text-fg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

            </div>

            <!-- Form Action Footer -->
            <div class="px-8 py-5 border-t border-border/50 bg-surface-container/30 flex items-center justify-end">
              <BaseButton type="submit" size="lg" :loading="isSaving" class="px-8 shadow-sm">
                <template v-if="!isSaving">
                  <Save class="w-4 h-4 mr-2" />
                </template>
                Save Changes
              </BaseButton>
            </div>
          </BaseCard>
        </form>
      </div>

    </div>
  </div>
</template>
