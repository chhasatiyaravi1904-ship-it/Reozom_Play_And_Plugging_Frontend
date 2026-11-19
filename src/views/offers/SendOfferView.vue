<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Breadcrumb & Back -->
      <div class="mb-4 flex items-center justify-between">
        <router-link
          :to="`/properties/${listingId}`"
          class="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Listing Details
        </router-link>
        <span class="text-xs text-slate-400 font-mono">Reozom Official Offer Engine</span>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingConfig" class="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-r-transparent"></div>
        <p class="mt-4 text-sm font-medium text-slate-600">Loading offer details and listing specifications...</p>
      </div>

      <!-- Main Form Container -->
      <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- Header Banner -->
        <div class="bg-slate-900 text-white p-6 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800/50">
                Official Purchase Contract
              </span>
              <h1 class="text-2xl sm:text-3xl font-extrabold mt-2">
                Submit Offer to Listing #{{ listingId }}
              </h1>
              <p class="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Listing #{{ listingId }} - {{ config?.listing?.full_address || 'Property' }}
              </p>
            </div>
            <div class="text-right sm:border-l sm:border-slate-800 sm:pl-6">
              <span class="text-xs text-slate-400 block font-medium">Listing Price</span>
              <span class="text-2xl sm:text-3xl font-black text-emerald-400">
                ${{ (config?.listing?.price || 0).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Warning / Status Banners -->
        <div v-if="config?.is_listing_owner" class="p-4 bg-rose-50 border-b border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
          <svg class="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-bold">You are the owner of this listing. You are not allowed to send an offer to yourself!</span>
        </div>

        <div v-if="config?.has_open_offer" class="p-4 bg-amber-50 border-b border-amber-200 flex items-center gap-3 text-amber-800 text-sm">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>You currently have an active open offer on this listing. Submitting another will register as a subsequent offer.</span>
        </div>

        <!-- Offer Form -->
        <form @submit.prevent="handleSubmit" class="p-6 sm:p-8 space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- ================= LEFT COLUMN ================= -->
            <div class="space-y-6">
              <!-- Section: Buyers / Purchasers -->
              <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buyers / Purchasers
                  </h3>
                  <button
                    type="button"
                    @click="addPurchaser"
                    class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm"
                  >
                    + Add Co-Purchaser
                  </button>
                </div>

                <!-- Main Purchaser Card -->
                <div class="p-4 bg-white rounded-lg border border-slate-200 space-y-3">
                  <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">Primary Purchaser</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700">First Name <span class="text-rose-500">*</span></label>
                      <input
                        v-model="form.main_purchaser_first_name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-700">Last Name <span class="text-rose-500">*</span></label>
                      <input
                        v-model="form.main_purchaser_last_name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700">Email Address <span class="text-rose-500">*</span></label>
                      <input
                        v-model="form.main_purchaser_email"
                        type="email"
                        required
                        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div class="pt-4">
                      <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          v-model="form.main_purchaser_non_us_citizen"
                          type="checkbox"
                          class="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Non-U.S. Citizen (FIRPTA compliance)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Additional Co-Purchasers -->
                <div
                  v-for="(purchaser, idx) in form.purchasers"
                  :key="idx"
                  class="p-4 bg-white rounded-lg border border-slate-200 space-y-3 relative"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-700">Co-Purchaser #{{ idx + 1 }}</span>
                    <button
                      type="button"
                      @click="removePurchaser(idx)"
                      class="text-xs text-rose-500 hover:text-rose-700 font-bold"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700">First Name <span class="text-rose-500">*</span></label>
                      <input
                        v-model="purchaser.first_name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-700">Last Name <span class="text-rose-500">*</span></label>
                      <input
                        v-model="purchaser.last_name"
                        type="text"
                        required
                        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700">Email Address <span class="text-rose-500">*</span></label>
                      <input
                        v-model="purchaser.email"
                        type="email"
                        required
                        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div class="pt-4">
                      <label class="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                        <input
                          v-model="purchaser.non_us_citizen"
                          type="checkbox"
                          class="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Non-U.S. Citizen</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Offer Amount -->
              <div>
                <label class="block text-sm font-bold text-slate-900">
                  Offer Amount ($) <span class="text-rose-500">*</span>
                </label>
                <div class="mt-1 relative rounded-xl shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    v-model.number="form.offer_amount"
                    type="number"
                    step="500"
                    min="1000"
                    required
                    placeholder="Enter purchase price offer"
                    class="block w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-lg text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <!-- Seller Concessions (Closing costs paid by seller) -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    Buyer's Closing Costs Paid by Seller (Seller Concessions)
                    <span
                      class="cursor-pointer text-slate-400 hover:text-indigo-600"
                      title="Seller concessions are fees paid for by the seller to help with buyer closing costs (e.g. transfer taxes, title fees, loan fees)."
                    >
                      ⓘ
                    </span>
                  </label>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <input
                      v-model.number="form.seller_concessions"
                      type="number"
                      step="any"
                      min="0"
                      :max="form.closing_amount_type === 1 ? 10 : form.offer_amount"
                      placeholder="0"
                      class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div class="flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <label class="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        :value="1"
                        v-model="form.closing_amount_type"
                        class="text-indigo-600"
                      />
                      Percent (%)
                    </label>
                    <label class="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        :value="2"
                        v-model="form.closing_amount_type"
                        class="text-indigo-600"
                      />
                      Dollar ($)
                    </label>
                  </div>
                </div>
              </div>

              <!-- Home Warranty Included -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div class="sm:col-span-2">
                  <label class="block text-xs font-semibold text-slate-700">Home Warranty Included:</label>
                  <select
                    v-model="form.home_warranty_included"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                  >
                    <option :value="false">No</option>
                    <option :value="true">Yes</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-500">Warranty Price</label>
                  <input
                    type="text"
                    disabled
                    :value="form.home_warranty_included ? `$${config?.home_warranty_price || 499}` : '$0'"
                    class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 font-semibold"
                  />
                </div>
              </div>

              <!-- Agent Commission (if agent representation) -->
              <div v-if="config?.buyer?.is_agent || form.has_agent_representation" class="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
                <label class="block text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Buyer Agent Commission Request
                </label>
                <div class="grid grid-cols-3 gap-3">
                  <div class="col-span-2">
                    <input
                      v-model.number="form.commission"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 2.5 or 5000"
                      class="block w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <select
                      v-model="form.commission_type"
                      class="block w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm"
                    >
                      <option :value="1">%</option>
                      <option :value="2">$</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Reozom Bottom Line Offer (Live Calculated - Read Only) -->
              <div class="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-lg border border-indigo-900/50">
                <div class="flex items-center justify-between pb-3 border-b border-indigo-800/60">
                  <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Bottom Line Offer (Reozom Auto-Calculated)
                  </span>
                  <span class="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                    Net to Seller
                  </span>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-xs text-slate-400 block">Calculated Net Price</span>
                    <span class="text-2xl sm:text-3xl font-black text-emerald-400">
                      ${{ calculatedBottomLine.toLocaleString() }}
                    </span>
                  </div>
                  <div class="text-right">
                    <span class="text-xs text-slate-400 block">Offer Ratio / Net %</span>
                    <span class="text-2xl sm:text-3xl font-black text-indigo-300">
                      {{ calculatedPercentage }}%
                    </span>
                  </div>
                </div>
              </div>

              <!-- Earnest Money Deposit -->
              <div>
                <label class="block text-sm font-semibold text-slate-800">
                  Earnest Money Deposit (EMD) ($) <span class="text-rose-500">*</span>
                </label>
                <input
                  v-model.number="form.earnest_money_deposit"
                  type="number"
                  step="500"
                  min="500"
                  :max="form.offer_amount || 10000000"
                  required
                  placeholder="1000"
                  class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
                />
                <span class="text-xs text-slate-400 mt-1 block">To be deposited into broker/title escrow upon acceptance.</span>
              </div>

              <!-- Method of Payment -->
              <div>
                <label class="block text-sm font-semibold text-slate-800">
                  Method of Payment <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="form.payment_method"
                  required
                  class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
                >
                  <option
                    v-for="method in config?.payment_methods || []"
                    :key="method.id"
                    :value="method.id"
                  >
                    {{ method.name }}
                  </option>
                </select>
              </div>

              <!-- Financing Dates & Down Payment Fields (Shown when payment != Cash) -->
              <div v-if="form.payment_method !== 'cash'" class="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span class="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  Financing Milestones & Loan Schedule
                </span>

                <div>
                  <label class="block text-xs font-semibold text-slate-700">
                    Mortgage application and appraisal shall be ordered by <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="form.mortgage_application_provided_by"
                    type="date"
                    :required="form.payment_method !== 'cash'"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                  />
                  <span class="text-[11px] text-slate-400 mt-0.5 block">Must be prior to loan approval and closing date.</span>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-slate-700">
                    Evidence of loan approval shall be provided by <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="form.loan_approval_provided_by"
                    type="date"
                    :required="form.payment_method !== 'cash'"
                    class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label class="block text-xs font-semibold text-slate-700">Down Payment (%)</label>
                    <input
                      v-model.number="form.down_payment_percent"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-500">Down Payment ($)</label>
                    <input
                      type="text"
                      disabled
                      :value="`$${calculatedDownPaymentDollars.toLocaleString()}`"
                      class="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <!-- Closing Date & Expiration Deadline -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-800">
                    Target Closing Date <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="form.closing_date"
                    type="date"
                    required
                    :min="todayDateString"
                    class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label class="block text-sm font-semibold text-slate-800">
                    Offer Response Deadline <span class="text-rose-500">*</span>
                  </label>
                  <select
                    v-model="form.deadline"
                    required
                    class="mt-1 block w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                  >
                    <option
                      v-for="d in config?.deadlines || []"
                      :key="d.hours"
                      :value="d.hours"
                    >
                      {{ d.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Occupancy -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label class="block text-sm font-bold text-slate-900">
                  Occupancy & Possession <span class="text-rose-500">*</span>
                </label>
                <div class="flex items-center gap-6 text-sm font-medium text-slate-700">
                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="at_closing"
                      v-model="form.occupancy_type"
                      class="text-indigo-600"
                    />
                    At Closing
                  </label>
                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="days_after_closing"
                      v-model="form.occupancy_type"
                      class="text-indigo-600"
                    />
                    Days After Close
                  </label>
                </div>

                <div v-if="form.occupancy_type === 'days_after_closing'" class="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div>
                    <label class="block text-xs font-semibold text-slate-700">Days After Closing</label>
                    <input
                      v-model.number="form.occupancy_days"
                      type="number"
                      min="1"
                      max="180"
                      class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-700">
                      Fee Per Day ($)
                      <span class="text-[10px] text-slate-400 font-normal">(Seller occupancy rental)</span>
                    </label>
                    <input
                      v-model.number="form.fee_per_day"
                      type="number"
                      min="0"
                      class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- ================= RIGHT COLUMN ================= -->
            <div class="space-y-6">
              <!-- Contingencies Container -->
              <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Contract Contingencies
                </h3>

                <!-- Property Physical Inspection -->
                <div class="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-800">
                      Offer contingent upon a property inspection: <span class="text-rose-500">*</span>
                    </label>
                    <select
                      v-model="form.oc_property_inspection"
                      class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 font-medium"
                    >
                      <option :value="1">Yes</option>
                      <option :value="0">No</option>
                    </select>
                  </div>
                  <div v-if="form.oc_property_inspection === 1" class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span class="text-slate-600">Inspection completed within calendar days:</span>
                    <input
                      v-model.number="form.oc_property_inspection_days"
                      type="number"
                      min="1"
                      max="60"
                      class="w-20 rounded-md border border-slate-300 px-2 py-1 text-center font-bold"
                    />
                  </div>
                </div>

                <!-- Lead-Based Paint (if pre-1978) -->
                <div v-if="(config?.listing?.year_built || 2000) < 1978" class="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-800">
                      Lead-based Paint Inspection (Pre-1978 Home):
                    </label>
                    <select
                      v-model="form.oc_property_paint_inspection"
                      class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 font-medium"
                    >
                      <option :value="1">Yes</option>
                      <option :value="0">No</option>
                    </select>
                  </div>
                  <div v-if="form.oc_property_paint_inspection === 1" class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span class="text-slate-600">Lead inspection days:</span>
                    <input
                      v-model.number="form.oc_property_paint_inspection_days"
                      type="number"
                      min="1"
                      max="60"
                      class="w-20 rounded-md border border-slate-300 px-2 py-1 text-center font-bold"
                    />
                  </div>
                </div>

                <!-- Sale of Buyer's Home Contingency -->
                <div class="p-3.5 bg-white rounded-lg border border-slate-200 space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-800">
                      Offer contingent upon sale of buyer's home:
                    </label>
                    <select
                      v-model="form.oc_sale_buyers_home"
                      class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 font-medium"
                    >
                      <option :value="0">No</option>
                      <option :value="1">Yes</option>
                    </select>
                  </div>

                  <div v-if="form.oc_sale_buyers_home === 1" class="space-y-3 pt-2 border-t border-slate-100 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-slate-700">Is there an accepted offer on buyer's home?</span>
                      <select
                        v-model="form.any_offer_accepted"
                        class="rounded-md border border-slate-300 px-2 py-1"
                      >
                        <option :value="1">Yes</option>
                        <option :value="0">No</option>
                      </select>
                    </div>

                    <div v-if="form.any_offer_accepted === 1">
                      <label class="block font-medium text-slate-700">Anticipated Close Date:</label>
                      <input
                        v-model="form.anticipated_close_date"
                        type="date"
                        class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </div>
                    <div v-else>
                      <label class="block font-medium text-slate-700">Buyer's home to be under contract by:</label>
                      <input
                        v-model="form.buyers_home_under_contract"
                        type="date"
                        class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                    </div>

                    <!-- Contingent Property Address -->
                    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <span class="font-bold text-slate-800 block">Buyer's Current Home Address:</span>
                      <input
                        v-model="form.buyers_home_address"
                        type="text"
                        placeholder="Street Address"
                        class="block w-full rounded-md border border-slate-300 px-2 py-1.5"
                      />
                      <div class="grid grid-cols-2 gap-2">
                        <input
                          v-model="form.buyers_home_city"
                          type="text"
                          placeholder="City"
                          class="rounded-md border border-slate-300 px-2 py-1.5"
                        />
                        <input
                          v-model="form.buyers_home_zip"
                          type="text"
                          placeholder="ZIP Code"
                          class="rounded-md border border-slate-300 px-2 py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Well & Septic Inspections (if present on listing) -->
                <div v-if="config?.listing?.has_well" class="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-800">Well Inspection Contingency:</label>
                    <select
                      v-model="form.oc_well_inspection"
                      class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 font-medium"
                    >
                      <option :value="1">Yes</option>
                      <option :value="0">No</option>
                    </select>
                  </div>
                  <div v-if="form.oc_well_inspection === 1" class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span class="text-slate-600">Payment:</span>
                      <select v-model="form.oc_well_payment" class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1">
                        <option value="Buyer">Buyer to pay</option>
                        <option value="Seller">Seller to pay</option>
                      </select>
                    </div>
                    <div>
                      <span class="text-slate-600">Days:</span>
                      <input v-model.number="form.oc_well_days" type="number" min="1" class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1" />
                    </div>
                  </div>
                </div>

                <div v-if="config?.listing?.has_septic" class="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-800">Septic Inspection Contingency:</label>
                    <select
                      v-model="form.oc_septic_inspection"
                      class="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 font-medium"
                    >
                      <option :value="1">Yes</option>
                      <option :value="0">No</option>
                    </select>
                  </div>
                  <div v-if="form.oc_septic_inspection === 1" class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span class="text-slate-600">Payment:</span>
                      <select v-model="form.oc_septic_payment" class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1">
                        <option value="Buyer">Buyer to pay</option>
                        <option value="Seller">Seller to pay</option>
                      </select>
                    </div>
                    <div>
                      <span class="text-slate-600">Days:</span>
                      <input v-model.number="form.oc_septic_days" type="number" min="1" class="mt-1 block w-full rounded-md border border-slate-300 px-2 py-1" />
                    </div>
                  </div>
                </div>

                <!-- Survey & Attorney Review -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="p-3 bg-white rounded-lg border border-slate-200">
                    <label class="block text-xs font-bold text-slate-800 mb-1.5">Survey Contingency:</label>
                    <select v-model="form.oc_survey" class="w-full text-xs rounded-md border border-slate-300 px-2 py-1.5">
                      <option :value="0">No</option>
                      <option :value="1">Yes</option>
                    </select>
                  </div>
                  <div class="p-3 bg-white rounded-lg border border-slate-200">
                    <label class="block text-xs font-bold text-slate-800 mb-1.5">Buyer Attorney Review:</label>
                    <select v-model="form.oc_review_buyers_attorney" class="w-full text-xs rounded-md border border-slate-300 px-2 py-1.5">
                      <option :value="0">No</option>
                      <option :value="1">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Appliances Included -->
              <div class="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label class="block text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Appliances Included
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-medium text-slate-700">
                  <label
                    v-for="appliance in config?.appliances || []"
                    :key="appliance.id"
                    class="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      :value="appliance.name"
                      v-model="form.appliances"
                      class="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{{ appliance.name }}</span>
                  </label>
                </div>

                <!-- Other Appliances dynamic list -->
                <div v-if="form.appliances.includes('Other')" class="pt-2 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-700">Other Specified Appliances:</span>
                    <button
                      type="button"
                      @click="addOtherAppliance"
                      class="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div
                    v-for="(item, idx) in form.other_appliances"
                    :key="idx"
                    class="flex items-center gap-2"
                  >
                    <input
                      v-model="form.other_appliances[idx]"
                      type="text"
                      placeholder="e.g. Wine Cooler, Second Refrigerator"
                      class="flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      @click="removeOtherAppliance(idx)"
                      class="text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              <!-- Other Conditions & Special Provisions -->
              <div>
                <label class="block text-sm font-semibold text-slate-800">
                  Other Conditions & Special Provisions:
                </label>
                <textarea
                  v-model="form.other_conditions"
                  rows="3"
                  placeholder="Specify any custom clauses, seller credits, or inspection requirements..."
                  class="mt-1 block w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                ></textarea>
              </div>

              <!-- Message for Seller -->
              <div>
                <label class="block text-sm font-semibold text-slate-800">
                  Message for Seller:
                </label>
                <textarea
                  v-model="form.message"
                  rows="2"
                  placeholder="Add a personal introduction or note to accompany your offer submission..."
                  class="mt-1 block w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-600 focus:ring-indigo-600"
                ></textarea>
              </div>

              <!-- Required Document Upload: Pre-Approval Letter / Proof of Funds -->
              <div class="p-5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
                <label class="block text-sm font-bold text-slate-900">
                  Pre-Approval Letter / Proof of Funds <span class="text-rose-500">*</span>
                </label>
                <p class="text-xs text-slate-500">
                  Upload lender pre-approval letter or verified bank funds statement (PDF, DOC, DOCX, PNG, JPG). Required by Michigan purchase agreement standards.
                </p>
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  required
                  class="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                <div v-if="selectedFileName" class="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-1">
                  ✓ Selected: {{ selectedFileName }}
                </div>
              </div>

              <!-- Additional Document Upload (Optional) -->
              <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label class="block text-xs font-bold text-slate-800">
                  Additional Supporting Document (Optional)
                </label>
                <input
                  type="file"
                  @change="handleAdditionalFileUpload"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  class="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
                />
              </div>

              <!-- Helpful Resource Links -->
              <div class="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-200">
                <a
                  :href="examplePurchaseAgreementUrl"
                  target="_blank"
                  class="text-indigo-600 hover:text-indigo-800 font-semibold underline flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Example Purchase Agreement (PDF)
                </a>
                <span class="text-slate-400">Strict UETA & E-SIGN Enforced</span>
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Submit Button Action Footer -->
          <div class="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <router-link
              :to="`/properties/${listingId}`"
              class="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-center transition"
            >
              Cancel
            </router-link>

            <button
              type="submit"
              :disabled="isSubmitting || config?.is_listing_owner"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <div v-if="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
              <span>{{ isSubmitting ? 'Submitting Official Offer...' : 'Submit Official Offer' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getSendOfferConfig,
  submitOffer,
  getExamplePurchaseAgreementUrl,
  type SendOfferConfig,
} from '@/services/offerService'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const listingId = computed(() => Number(route.params.id))

const isLoadingConfig = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const config = ref<SendOfferConfig | null>(null)

const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string | null>(null)
const additionalFile = ref<File | null>(null)

const todayDateString = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

const examplePurchaseAgreementUrl = computed(() => {
  return getExamplePurchaseAgreementUrl(listingId.value)
})

const form = reactive({
  main_purchaser_first_name: '',
  main_purchaser_last_name: '',
  main_purchaser_email: '',
  main_purchaser_non_us_citizen: false,
  purchasers: [] as Array<{
    first_name: string
    last_name: string
    email: string
    non_us_citizen: boolean
  }>,
  offer_amount: null as number | null,
  seller_concessions: 0,
  closing_amount_type: 1 as 1 | 2, // 1 - %, 2 - $
  home_warranty_included: false,
  commission: 0,
  commission_type: 1 as 1 | 2,
  has_agent_representation: false,
  earnest_money_deposit: 1000,
  payment_method: 'conventional',
  mortgage_application_provided_by: '',
  loan_approval_provided_by: '',
  down_payment_percent: 20,
  closing_date: '',
  deadline: 48,
  occupancy_type: 'at_closing' as 'at_closing' | 'days_after_closing',
  occupancy_days: 30,
  fee_per_day: 50,
  oc_property_inspection: 1,
  oc_property_inspection_days: 10,
  oc_property_paint_inspection: 0,
  oc_property_paint_inspection_days: 10,
  oc_sale_buyers_home: 0,
  any_offer_accepted: 0,
  anticipated_close_date: '',
  buyers_home_under_contract: '',
  buyers_home_address: '',
  buyers_home_city: '',
  buyers_home_zip: '',
  oc_well_inspection: 0,
  oc_well_payment: 'Buyer',
  oc_well_days: 10,
  oc_septic_inspection: 0,
  oc_septic_payment: 'Buyer',
  oc_septic_days: 10,
  oc_survey: 0,
  oc_review_buyers_attorney: 0,
  appliances: ['Refrigerator', 'Stove', 'Microwave', 'Dryer', 'Washing Machine'] as string[],
  other_appliances: [] as string[],
  other_conditions: '',
  message: '',
})

// Auto-calculation: Bottom line offer
const calculatedBottomLine = computed(() => {
  const amount = form.offer_amount || 0
  const concessions = form.seller_concessions || 0

  let net = amount
  if (form.closing_amount_type === 1) { // %
    net = Math.max(0, amount - (amount * (concessions / 100)))
  } else { // $
    net = Math.max(0, amount - concessions)
  }

  // Deduct commission if agent
  if (config.value?.buyer?.is_agent || form.has_agent_representation) {
    const comm = form.commission || 0
    if (form.commission_type === 1) {
      net = Math.max(0, net - (net * (comm / 100)))
    } else {
      net = Math.max(0, net - comm)
    }
  }

  return Math.round(net)
})

// Auto-calculation: Percentage net
const calculatedPercentage = computed(() => {
  const amount = form.offer_amount || 0
  if (amount <= 0) return '100.0'
  return ((calculatedBottomLine.value * 100) / amount).toFixed(1)
})

// Auto-calculation: Down Payment Dollar
const calculatedDownPaymentDollars = computed(() => {
  const amount = form.offer_amount || 0
  const percent = form.down_payment_percent || 0
  return Math.round(amount * (percent / 100))
})

const addPurchaser = () => {
  form.purchasers.push({
    first_name: '',
    last_name: '',
    email: '',
    non_us_citizen: false,
  })
}

const removePurchaser = (index: number) => {
  form.purchasers.splice(index, 1)
}

const addOtherAppliance = () => {
  form.other_appliances.push('')
}

const removeOtherAppliance = (index: number) => {
  form.other_appliances.splice(index, 1)
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    selectedFileName.value = target.files[0].name
  }
}

const handleAdditionalFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    additionalFile.value = target.files[0]
  }
}

onMounted(async () => {
  try {
    isLoadingConfig.value = true
    const res = await getSendOfferConfig(listingId.value)
    config.value = res.data

    // Prefill fields from listing & buyer
    if (config.value.listing?.price) {
      form.offer_amount = config.value.listing.price
    }
    if (config.value.fee_per_day) {
      form.fee_per_day = config.value.fee_per_day
    }
    if (config.value.buyer) {
      form.main_purchaser_first_name = config.value.buyer.first_name || ''
      form.main_purchaser_last_name = config.value.buyer.last_name || ''
      form.main_purchaser_email = config.value.buyer.email || ''
      form.has_agent_representation = config.value.buyer.is_agent
    }

    // Default dates
    const closeDate = new Date()
    closeDate.setDate(closeDate.getDate() + 30)
    form.closing_date = closeDate.toISOString().split('T')[0]

    const morgDate = new Date()
    morgDate.setDate(morgDate.getDate() + 7)
    form.mortgage_application_provided_by = morgDate.toISOString().split('T')[0]

    const loanDate = new Date()
    loanDate.setDate(loanDate.getDate() + 21)
    form.loan_approval_provided_by = loanDate.toISOString().split('T')[0]
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to initialize send offer view.'
  } finally {
    isLoadingConfig.value = false
  }
})

const handleSubmit = async () => {
  if (config.value?.is_listing_owner) {
    errorMessage.value = 'You are the owner of this listing. You cannot submit an offer to yourself!'
    return
  }

  if (!form.offer_amount || !form.closing_date) {
    errorMessage.value = 'Please provide an offer purchase price and closing date.'
    return
  }

  if (!selectedFile.value) {
    errorMessage.value = 'Please attach a mandatory Pre-Approval Letter or Proof of Funds document.'
    return
  }

  // Validate financing dates sequence
  if (form.payment_method !== 'cash') {
    if (!form.mortgage_application_provided_by || !form.loan_approval_provided_by) {
      errorMessage.value = 'Please specify both mortgage application date and loan approval date.'
      return
    }

    const morg = new Date(form.mortgage_application_provided_by).getTime()
    const loan = new Date(form.loan_approval_provided_by).getTime()
    const close = new Date(form.closing_date).getTime()

    if (morg >= loan) {
      errorMessage.value = 'The mortgage application date must be an earlier date than the loan approval date.'
      return
    }
    if (loan >= close) {
      errorMessage.value = 'The loan approval date must be prior to the closing date.'
      return
    }
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const payload: Record<string, any> = {
      offer_amount: form.offer_amount,
      earnest_money_deposit: form.earnest_money_deposit,
      down_payment_amount: calculatedDownPaymentDollars.value,
      payment_method: form.payment_method,
      closing_date: form.closing_date,
      occupancy_type: form.occupancy_type,
      occupancy_days: form.occupancy_type === 'days_after_closing' ? form.occupancy_days : 0,
      fee_per_day: form.occupancy_type === 'days_after_closing' ? form.fee_per_day : 0,
      seller_concessions: form.seller_concessions,
      closing_amount_type: form.closing_amount_type,
      home_warranty_included: form.home_warranty_included ? 1 : 0,
      commission: form.commission,
      commission_type: form.commission_type,
      deadline: form.deadline,
      mortgage_application_provided_by: form.mortgage_application_provided_by,
      loan_approval_provided_by: form.loan_approval_provided_by,
      oc_property_inspection: form.oc_property_inspection,
      oc_property_inspection_days: form.oc_property_inspection_days,
      oc_property_paint_inspection: form.oc_property_paint_inspection,
      oc_property_paint_inspection_days: form.oc_property_paint_inspection_days,
      oc_sale_buyers_home: form.oc_sale_buyers_home,
      any_offer_accepted: form.any_offer_accepted,
      anticipated_close_date: form.anticipated_close_date,
      buyers_home_under_contract: form.buyers_home_under_contract,
      buyers_home_address: form.buyers_home_address,
      buyers_home_city: form.buyers_home_city,
      buyers_home_zip: form.buyers_home_zip,
      oc_well_inspection: form.oc_well_inspection,
      oc_well_payment: form.oc_well_payment,
      oc_well_days: form.oc_well_days,
      oc_septic_inspection: form.oc_septic_inspection,
      oc_septic_payment: form.oc_septic_payment,
      oc_septic_days: form.oc_septic_days,
      oc_survey: form.oc_survey,
      oc_review_buyers_attorney: form.oc_review_buyers_attorney,
      appliances: form.appliances,
      other_appliances: form.other_appliances,
      other_conditions: form.other_conditions,
      message: form.message,
      main_purchaser_first_name: form.main_purchaser_first_name,
      main_purchaser_last_name: form.main_purchaser_last_name,
      main_purchaser_email: form.main_purchaser_email,
      main_purchaser_non_us_citizen: form.main_purchaser_non_us_citizen ? 1 : 0,
      purchasers: form.purchasers,
    }

    const filesToUpload: { file: File; type: string }[] = []
    if (selectedFile.value) {
      filesToUpload.push({ file: selectedFile.value, type: 'pre_approval_letter' })
    }
    if (additionalFile.value) {
      filesToUpload.push({ file: additionalFile.value, type: 'other' })
    }

    const res = await submitOffer(listingId.value, payload, filesToUpload)
    alert(`Your official offer of $${Number(form.offer_amount).toLocaleString()} has been submitted to the seller!`)
    // The sender's "Sent Offers" tab, in their own portal (the old /dashboard/my-offers didn't exist)
    router.push({
      name: authStore.user?.role === 'agent' ? 'agent-offers' : 'my-offers',
      query: { tab: 'sent' },
    })
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Failed to submit official offer. Please check all fields.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

