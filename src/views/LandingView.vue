<template>
  <div class="landing-page">
    <TopNavBar />
    <main>
      <!-- SECTION 2: HERO SECTION -->
      <section
        class="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-outline-variant/20 bg-gradient-to-b from-surface-container-low via-surface-bright to-surface"
        id="hero"
      >
        <div class="max-w-7xl mx-auto px-6 md:px-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <!-- Hero Left Column -->
            <div class="lg:col-span-7 space-y-6 text-left">
              <!-- Tagline Pill -->
              <div
                class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-outline-variant/40 shadow-sm"
              >
                <span class="w-2 h-2 rounded-full bg-secondary"></span>
                <span class="text-secondary font-label-md text-label-md tracking-wider"
                  >THE NEXT GENERATION REAL ESTATE PROTOCOL</span
                >
              </div>
              <!-- Main Headline -->
              <h1
                class="text-display-hero-mobile md:text-display-hero font-display-hero text-primary leading-tight tracking-tight"
              >
                Simplify Your Real Estate Listing Journey
              </h1>
              <!-- Supporting Text -->
              <p
                class="text-body-lg font-body-lg text-on-surface-variant max-w-2xl leading-relaxed"
              >
                Connect Sellers, Listing Agents, Buyers, and Buyer Agents through one streamlined
                real-estate platform. Architectural clarity, transparent workflows, and real-time
                offer negotiations.
              </p>
              <!-- Dual CTA -->
              <div class="flex flex-wrap items-center gap-4 pt-2">
                <button
                  class="px-7 py-3.5 bg-primary-container text-on-primary hover:bg-primary transition-all duration-150 rounded-lg shadow-md font-label-lg text-label-lg flex items-center gap-2"
                  @click="$router.push('/auth/register')"
                >
                  <span>Create an Account</span>
                  <span
                    class="material-symbols-outlined text-secondary-fixed text-lg"
                    data-icon="arrow_forward"
                    >arrow_forward</span
                  >
                </button>
                <a
                  class="px-6 py-3.5 bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container transition-colors rounded-lg font-label-lg text-label-lg flex items-center gap-2"
                  href="#listings"
                >
                  <span>Explore Listings</span>
                  <span
                    class="material-symbols-outlined text-on-surface-variant text-lg"
                    data-icon="travel_explore"
                    >travel_explore</span
                  >
                </a>
              </div>
              <!-- Floating Proof Badges -->
              <div class="pt-6 grid grid-cols-3 gap-4 border-t border-outline-variant/30 max-w-lg">
                <div>
                  <div class="font-headline-sm text-headline-sm text-primary font-bold">
                    48 States
                  </div>
                  <div class="font-body-sm text-body-sm text-on-surface-variant">
                    Active Coverage
                  </div>
                </div>
                <div class="border-l border-outline-variant/30 pl-4">
                  <div class="font-headline-sm text-headline-sm text-secondary font-bold">
                    4.2 Days
                  </div>
                  <div class="font-body-sm text-body-sm text-on-surface-variant">
                    Avg. Offer Time
                  </div>
                </div>
                <div class="border-l border-outline-variant/30 pl-4">
                  <div class="font-headline-sm text-headline-sm text-primary font-bold">100%</div>
                  <div class="font-body-sm text-body-sm text-on-surface-variant">
                    Verified Agents
                  </div>
                </div>
              </div>
            </div>
            <!-- Hero Right Column: Architectural Visual Mockup with Live Floating Cards -->
            <div class="lg:col-span-5 relative">
              <div class="relative mx-auto max-w-md lg:max-w-none">
                <!-- Architectural Luxury Property Media Image -->
                <div
                  class="relative rounded-2xl overflow-hidden border border-outline-variant/50 shadow-xl bg-surface-container-lowest"
                >
                  <img
                    class="w-full h-96 object-cover object-center"
                    data-alt="A striking modern architectural home featuring sleek geometric lines, expansive glass facades, clean concrete panels, and soft warm interior illumination during dusk. The landscaping is minimalist with structured gravel and architectural grass. Rendered in a high-end luxury architectural editorial style with cool slate shadows and teal reflecting waters."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuADKwqLF75qO1Q_BQUBsbSULb8Fn_jwLgSOrOodveOxA5qliQ5nA_0LB3BWBt36TQr0kT3Sov1M5xzWaasCw1aGa-nx4_Yx8qdrjI2CAWoorZrsqqg7Nks0e2jZ3K_vMuS83H858k7Y4C1F5_JuX6MR-i2CXvyx1-U40eJXuCnz5-fTrd8aO9Oc8qdtJsTtA-nIHN3Zfu37y5c1ANoPeUd4e_vJpgzu7nnnyF2Yc4rR1SNR8JGmER4"
                  />
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent"
                  ></div>
                  <div
                    class="absolute bottom-4 left-4 right-4 text-surface-container-lowest flex justify-between items-end"
                  >
                    <div>
                      <span
                        class="px-2.5 py-0.5 rounded-full bg-secondary text-surface-container-lowest text-label-sm font-label-sm font-bold tracking-wider"
                        >DIRECT OFFER READY</span
                      >
                      <h3
                        class="font-headline-sm text-headline-sm text-surface-container-lowest mt-1"
                      >
                        Bellevue Horizon Estate
                      </h3>
                      <p class="font-body-sm text-body-sm text-surface-variant">
                        Seattle Metro Area · $1,850,000
                      </p>
                    </div>
                    <div class="text-right">
                      <span class="font-label-sm text-label-sm text-secondary-fixed"
                        >Verified MLS 2025</span
                      >
                    </div>
                  </div>
                </div>
                <!-- Live Floating Node Card 1 -->
                <div
                  class="absolute -top-6 -left-6 bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3.5 shadow-lg flex items-center gap-3 backdrop-blur-sm"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center"
                  >
                    <span class="material-symbols-outlined" data-icon="verified_user"
                      >verified_user</span
                    >
                  </div>
                  <div>
                    <p class="text-label-sm font-label-sm text-on-surface-variant">
                      ESCROW AUDIT STATUS
                    </p>
                    <p class="text-label-lg font-label-lg text-primary font-bold">
                      Institutional Security
                    </p>
                  </div>
                </div>
                <!-- Live Floating Node Card 2 -->
                <div
                  class="absolute -bottom-6 -right-4 bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-3.5 shadow-lg flex items-center gap-3"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center"
                  >
                    <span class="material-symbols-outlined" data-icon="gavel">gavel</span>
                  </div>
                  <div>
                    <p class="text-label-sm font-label-sm text-on-surface-variant">
                      INSTANT NEGOTIATION
                    </p>
                    <p class="text-label-lg font-label-lg text-secondary font-bold">
                      Offer Countered: $420k
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Ecosystem Flow Banner -->
          <div class="mt-16 pt-8 border-t border-outline-variant/30">
            <div class="text-center mb-6">
              <span
                class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest"
                >Unified Stakeholder Ecosystem</span
              >
            </div>
            <div class="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
              <div
                class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col items-center"
              >
                <span
                  class="material-symbols-outlined text-secondary text-2xl mb-1"
                  data-icon="badge"
                  >badge</span
                >
                <span class="text-label-md font-label-md text-primary font-bold"
                  >1. Listing Agents</span
                >
                <span class="text-body-sm font-body-sm text-on-surface-variant"
                  >Configures plan</span
                >
              </div>
              <div
                class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col items-center"
              >
                <span
                  class="material-symbols-outlined text-secondary text-2xl mb-1"
                  data-icon="account_tree"
                  >account_tree</span
                >
                <span class="text-label-md font-label-md text-primary font-bold"
                  >2. Listing Process</span
                >
                <span class="text-body-sm font-body-sm text-on-surface-variant"
                  >Dynamic builders</span
                >
              </div>
              <div
                class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col items-center"
              >
                <span
                  class="material-symbols-outlined text-secondary text-2xl mb-1"
                  data-icon="home_work"
                  >home_work</span
                >
                <span class="text-label-md font-label-md text-primary font-bold">3. Sellers</span>
                <span class="text-body-sm font-body-sm text-on-surface-variant"
                  >ZIP code match</span
                >
              </div>
              <div
                class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col items-center"
              >
                <span
                  class="material-symbols-outlined text-secondary text-2xl mb-1"
                  data-icon="real_estate_agent"
                  >real_estate_agent</span
                >
                <span class="text-label-md font-label-md text-primary font-bold">4. Listings</span>
                <span class="text-body-sm font-body-sm text-on-surface-variant"
                  >Verified catalog</span
                >
              </div>
              <div
                class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col items-center"
              >
                <span
                  class="material-symbols-outlined text-secondary text-2xl mb-1"
                  data-icon="groups"
                  >groups</span
                >
                <span class="text-label-md font-label-md text-primary font-bold">5. Buyers</span>
                <span class="text-body-sm font-body-sm text-on-surface-variant"
                  >Direct discovery</span
                >
              </div>
              <div
                class="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs flex flex-col items-center"
              >
                <span
                  class="material-symbols-outlined text-secondary text-2xl mb-1"
                  data-icon="handshake"
                  >handshake</span
                >
                <span class="text-label-md font-label-md text-primary font-bold">6. Offers</span>
                <span class="text-body-sm font-body-sm text-on-surface-variant"
                  >Live audit close</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 3: PUBLIC PROPERTY SEARCH BAR -->
      <section class="relative -mt-8 z-20 max-w-6xl mx-auto px-6">
        <div
          class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 shadow-xl p-6 md:p-8"
        >
          <!-- Search Tabs -->
          <div
            class="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6"
          >
            <div class="flex space-x-3">
              <button
                class="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md"
              >
                Buy Properties
              </button>
              <button
                class="px-4 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors"
              >
                Rentals
              </button>
              <button
                class="px-4 py-1.5 rounded-full text-on-surface-variant hover:bg-surface-container font-label-md text-label-md transition-colors"
              >
                New Development
              </button>
            </div>
            <span class="text-body-sm font-body-sm text-on-surface-variant hidden md:inline"
              >Institutional MLS Network</span
            >
          </div>
          <h2 class="text-headline-md font-headline-md text-primary mb-4">
            Find Your Next Property
          </h2>
          <!-- Search Inputs Grid -->
          <form
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
            onsubmit="
              event.preventDefault()
              document.getElementById('listings').scrollIntoView()
            "
          >
            <!-- Location Input -->
            <div class="lg:col-span-2">
              <label
                class="block text-label-sm font-label-sm text-on-surface-variant uppercase mb-1"
                >Location or ZIP Code</label
              >
              <div class="relative flex items-center">
                <span
                  class="material-symbols-outlined absolute left-3 text-outline text-lg"
                  data-icon="location_on"
                  >location_on</span
                >
                <input
                  class="w-full h-11 pl-10 pr-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
                  placeholder="Austin, TX or 78701"
                  type="text"
                />
              </div>
            </div>
            <!-- Property Type Dropdown -->
            <div>
              <label
                class="block text-label-sm font-label-sm text-on-surface-variant uppercase mb-1"
                >Property Type</label
              >
              <select
                class="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option>All Types</option>
                <option>Single Family</option>
                <option>Modern Villa</option>
                <option>Condominium</option>
                <option>Penthouse</option>
                <option>Townhouse</option>
              </select>
            </div>
            <!-- Price Range Dropdown -->
            <div>
              <label
                class="block text-label-sm font-label-sm text-on-surface-variant uppercase mb-1"
                >Price Range</label
              >
              <select
                class="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              >
                <option>Any Price</option>
                <option>$300k - $500k</option>
                <option>$500k - $800k</option>
                <option>$800k - $1.5M</option>
                <option>$1.5M+</option>
              </select>
            </div>
            <!-- Submit Button -->
            <div class="flex items-end">
              <button
                class="w-full h-11 bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                type="submit"
              >
                <span
                  class="material-symbols-outlined text-secondary-fixed text-lg"
                  data-icon="search"
                  >search</span
                >
                Search Listings
              </button>
            </div>
          </form>
        </div>
      </section>
      <!-- SECTION 4: FEATURED LISTINGS -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-10" id="listings">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div
              class="inline-flex items-center gap-1.5 text-secondary font-label-md text-label-md tracking-wider mb-2"
            >
              <span class="material-symbols-outlined text-base" data-icon="verified">verified</span>
              CURATED REAL-TIME FEED
            </div>
            <h2 class="text-headline-lg font-headline-lg text-primary">
              Explore Featured Properties
            </h2>
            <p class="text-body-md font-body-md text-on-surface-variant mt-1">
              Hand-picked verified listings with direct offer submission available.
            </p>
          </div>
          <div class="mt-4 md:mt-0 flex gap-2">
            <button
              class="px-4 py-2 text-label-md font-label-md rounded-lg border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container transition-colors"
            >
              All Listings (1,482)
            </button>
          </div>
        </div>
        <!-- Listing Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card 1 -->
          <div
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
          >
            <div class="relative h-56 overflow-hidden">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-alt="Modern contemporary family home exterior in Austin Texas with clean architectural stone siding, large warm front porch, lush green lawn, warm dusk lighting, and minimalist glass garage doors."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGGeNeyb2QMQqbhSi2TfNXrpTWe3pe_sYj8vd2pW-ird0SFBqsrBgYyZQYpbpAYtXSwXCLGdh8GhOt5XaKg5vFLwiOJW_6_JNeTJm8Kx7Rf_R9CrGpkjdjyWkGi0-E5IjjneDDH_CCysABSrdbhaAiiSDkVymgNk-MpiPVZ432ysBIxL-jtyPjYH6vlcxlafRUva0ZoUXqeulcOIkStyWnNdsNDIQD92HyTqhJkNic4dOz0wImZVk"
              />
              <div class="absolute top-3 left-3 flex gap-2">
                <span
                  class="bg-surface-container-lowest/90 backdrop-blur-xs text-secondary px-2.5 py-1 rounded-full text-label-sm font-label-sm font-bold border border-secondary/20"
                >
                  • Verified Plan
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <button
                  aria-label="Save listing"
                  class="p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xs text-on-surface hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined text-base" data-icon="favorite"
                    >favorite</span
                  >
                </button>
              </div>
              <div class="absolute bottom-3 left-3">
                <span
                  class="bg-primary-container/90 backdrop-blur-xs text-on-primary px-2.5 py-0.5 rounded-md text-label-sm font-label-sm"
                  >Single Family</span
                >
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-1">
                  <span class="font-headline-lg text-headline-lg text-primary">$425,000</span>
                  <span class="text-label-sm font-label-sm text-secondary font-bold"
                    >Direct Offer Ready</span
                  >
                </div>
                <h3 class="font-headline-sm text-headline-sm text-primary">Modern Family Home</h3>
                <p
                  class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1"
                >
                  <span class="material-symbols-outlined text-sm" data-icon="location_on"
                    >location_on</span
                  >
                  Austin, TX · 78701
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-outline-variant/30">
                <div
                  class="grid grid-cols-3 text-center text-on-surface-variant text-body-sm font-body-sm pb-4"
                >
                  <div><strong class="text-primary block font-numeric-data">3</strong> Beds</div>
                  <div class="border-x border-outline-variant/30">
                    <strong class="text-primary block font-numeric-data">2</strong> Baths
                  </div>
                  <div>
                    <strong class="text-primary block font-numeric-data">2,100</strong> sq ft
                  </div>
                </div>
                <button
                  class="w-full py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  View Details &amp; Offer
                </button>
              </div>
            </div>
          </div>
          <!-- Card 2 -->
          <div
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
          >
            <div class="relative h-56 overflow-hidden">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-alt="Luxury architectural waterfront villa in Seattle Washington on Puget Sound with expansive cantilevered cedar decks, floor-to-ceiling glass windows overlooking water, overcast atmospheric PNW lighting, modern zinc metal trims."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0hcetUdoL-od6ZHHzGETkof1ncXj-iXKFjjOdgToCb0vP4Q-OkWLW20I2D3aiGz19NIzHTduxA5iLdpLofviC5RSpaIgkDLmHXp04_qaxfwD-I6SCAF1nyqKf_1myBbUTZgRcNPcBXn_Y6LpG8J1UY3sf-SbSFPEpwB1UrIqip-_URtqPq2U9JaECydmeCyw7Ke1IXsQgMGQQcToi6NnZ8JOrJlTcsYUxVSv9RYlKNw3GviASAq8"
              />
              <div class="absolute top-3 left-3 flex gap-2">
                <span
                  class="bg-surface-container-lowest/90 backdrop-blur-xs text-secondary px-2.5 py-1 rounded-full text-label-sm font-label-sm font-bold border border-secondary/20"
                >
                  • Verified Plan
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <button
                  aria-label="Save listing"
                  class="p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xs text-on-surface hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined text-base" data-icon="favorite"
                    >favorite</span
                  >
                </button>
              </div>
              <div class="absolute bottom-3 left-3">
                <span
                  class="bg-primary-container/90 backdrop-blur-xs text-on-primary px-2.5 py-0.5 rounded-md text-label-sm font-label-sm"
                  >Luxury Estate</span
                >
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-1">
                  <span class="font-headline-lg text-headline-lg text-primary">$895,000</span>
                  <span class="text-label-sm font-label-sm text-secondary font-bold"
                    >Direct Offer Ready</span
                  >
                </div>
                <h3 class="font-headline-sm text-headline-sm text-primary">
                  Architectural Waterfront Villa
                </h3>
                <p
                  class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1"
                >
                  <span class="material-symbols-outlined text-sm" data-icon="location_on"
                    >location_on</span
                  >
                  Seattle, WA · 98101
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-outline-variant/30">
                <div
                  class="grid grid-cols-3 text-center text-on-surface-variant text-body-sm font-body-sm pb-4"
                >
                  <div><strong class="text-primary block font-numeric-data">4</strong> Beds</div>
                  <div class="border-x border-outline-variant/30">
                    <strong class="text-primary block font-numeric-data">3.5</strong> Baths
                  </div>
                  <div>
                    <strong class="text-primary block font-numeric-data">3,450</strong> sq ft
                  </div>
                </div>
                <button
                  class="w-full py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  View Details &amp; Offer
                </button>
              </div>
            </div>
          </div>
          <!-- Card 3 -->
          <div
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
          >
            <div class="relative h-56 overflow-hidden">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-alt="Minimalist urban loft apartment interior in Denver Colorado with exposed polished concrete ceilings, custom matte black steel partitions, warm white oak flooring, morning sunlight beaming through industrial mullioned windows."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSry77r4dyhfS5TWBV3FRuImyVBo5vQowQEacselzsnPrk4WmilkbPGTVYotko-MJj6ptor9bsnt6G4kN2N8GrfNC8colVQry-t0lYZ8kOv0zLXmfXy3coW3fqhf0M_pqoXPZCW5wdVdKIPEifxAyjz_1jm8W04LWtEzfmfK9jvLzqK6dmjWgDpXcovKyzts0YjkeYhlCfGRNqcKVNSCKGcxeG82IfvEFWco5nvJ7gNi5IrgEnk5w"
              />
              <div class="absolute top-3 left-3 flex gap-2">
                <span
                  class="bg-surface-container-lowest/90 backdrop-blur-xs text-secondary px-2.5 py-1 rounded-full text-label-sm font-label-sm font-bold border border-secondary/20"
                >
                  • Verified Plan
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <button
                  aria-label="Save listing"
                  class="p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xs text-on-surface hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined text-base" data-icon="favorite"
                    >favorite</span
                  >
                </button>
              </div>
              <div class="absolute bottom-3 left-3">
                <span
                  class="bg-primary-container/90 backdrop-blur-xs text-on-primary px-2.5 py-0.5 rounded-md text-label-sm font-label-sm"
                  >Condominium</span
                >
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-1">
                  <span class="font-headline-lg text-headline-lg text-primary">$620,000</span>
                  <span class="text-label-sm font-label-sm text-secondary font-bold"
                    >Direct Offer Ready</span
                  >
                </div>
                <h3 class="font-headline-sm text-headline-sm text-primary">
                  Minimalist Urban Loft
                </h3>
                <p
                  class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1"
                >
                  <span class="material-symbols-outlined text-sm" data-icon="location_on"
                    >location_on</span
                  >
                  Denver, CO · 80202
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-outline-variant/30">
                <div
                  class="grid grid-cols-3 text-center text-on-surface-variant text-body-sm font-body-sm pb-4"
                >
                  <div><strong class="text-primary block font-numeric-data">2</strong> Beds</div>
                  <div class="border-x border-outline-variant/30">
                    <strong class="text-primary block font-numeric-data">2</strong> Baths
                  </div>
                  <div>
                    <strong class="text-primary block font-numeric-data">1,650</strong> sq ft
                  </div>
                </div>
                <button
                  class="w-full py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  View Details &amp; Offer
                </button>
              </div>
            </div>
          </div>
          <!-- Card 4 -->
          <div
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
          >
            <div class="relative h-56 overflow-hidden">
              <img
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-alt="Mid-century modern desert home in Scottsdale Arizona with adobe style sand-toned masonry, desert garden with saguaro cacti, clean geometric courtyard, sunset golden hour warm glow, recessed architectural lighting."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoEe88zBV2lhABB3vYQPysh8GYQ4Lc7QpxEFNsyYqq01X1fXS4Ew6IVtaA8OAqPzhyksVaDzzotADBX2axErJfF-zu2SklQaLYCMibl0mP5qf0y0OBlTjuqr_10RPOzK_4_3jBN7DOm9G28df3w6Lhx-q2UiRd0Xa4fXR3RT86wxnXSncX2Wbxq6QXLkvCp8V3oj-YABt6a6mkb42tS4HRuJjnHDLZJFJb2OOpGVQHkYzCX-5-inA"
              />
              <div class="absolute top-3 left-3 flex gap-2">
                <span
                  class="bg-surface-container-lowest/90 backdrop-blur-xs text-secondary px-2.5 py-1 rounded-full text-label-sm font-label-sm font-bold border border-secondary/20"
                >
                  • Verified Plan
                </span>
              </div>
              <div class="absolute top-3 right-3">
                <button
                  aria-label="Save listing"
                  class="p-1.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-xs text-on-surface hover:text-error transition-colors"
                >
                  <span class="material-symbols-outlined text-base" data-icon="favorite"
                    >favorite</span
                  >
                </button>
              </div>
              <div class="absolute bottom-3 left-3">
                <span
                  class="bg-primary-container/90 backdrop-blur-xs text-on-primary px-2.5 py-0.5 rounded-md text-label-sm font-label-sm"
                  >Single Family</span
                >
              </div>
            </div>
            <div class="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-baseline mb-1">
                  <span class="font-headline-lg text-headline-lg text-primary">$740,000</span>
                  <span class="text-label-sm font-label-sm text-secondary font-bold"
                    >Direct Offer Ready</span
                  >
                </div>
                <h3 class="font-headline-sm text-headline-sm text-primary">
                  Mid-Century Desert Sanctuary
                </h3>
                <p
                  class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-1"
                >
                  <span class="material-symbols-outlined text-sm" data-icon="location_on"
                    >location_on</span
                  >
                  Scottsdale, AZ · 85251
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-outline-variant/30">
                <div
                  class="grid grid-cols-3 text-center text-on-surface-variant text-body-sm font-body-sm pb-4"
                >
                  <div><strong class="text-primary block font-numeric-data">3</strong> Beds</div>
                  <div class="border-x border-outline-variant/30">
                    <strong class="text-primary block font-numeric-data">3</strong> Baths
                  </div>
                  <div>
                    <strong class="text-primary block font-numeric-data">2,800</strong> sq ft
                  </div>
                </div>
                <button
                  class="w-full py-2.5 rounded-lg bg-surface-container-low border border-outline-variant text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  View Details &amp; Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 5: HOW REOZOM WORKS (4-Step Visual Process) -->
      <section
        class="py-20 bg-surface-container-low border-y border-outline-variant/30"
        id="how-it-works"
      >
        <div class="max-w-7xl mx-auto px-6 md:px-10">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
              >End-to-End Orchestration</span
            >
            <h2 class="text-headline-lg font-headline-lg text-primary mt-2">
              Real Estate, Simplified
            </h2>
            <p class="text-body-md font-body-md text-on-surface-variant mt-2">
              A synchronized protocol eliminating friction between all transacting parties.
            </p>
          </div>
          <!-- 4 Connected Steps Grid -->
          <div class="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Step 1 -->
            <div
              class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs relative z-10 flex flex-col"
            >
              <div
                class="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-headline-sm mb-4"
              >
                01
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-2">Choose Your Role</h3>
              <p class="text-body-md font-body-md text-on-surface-variant flex-1">
                Join as a Listing Agent, Seller, Buyer, or Buyer Agent. Each identity receives a
                custom workspace configured with precise transaction permissions.
              </p>
              <div
                class="mt-4 pt-4 border-t border-outline-variant/20 flex items-center text-label-sm font-label-sm text-secondary"
              >
                <span class="material-symbols-outlined text-base mr-1" data-icon="lock_open"
                  >lock_open</span
                >
                Role-based security
              </div>
            </div>
            <!-- Step 2 -->
            <div
              class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs relative z-10 flex flex-col"
            >
              <div
                class="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center font-bold text-headline-sm mb-4"
              >
                02
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
                Create or Find Listing
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant flex-1">
                Sellers build comprehensive listings through Agent workflows. Buyers and Buyer
                Agents discover verified properties with complete disclosure packets.
              </p>
              <div
                class="mt-4 pt-4 border-t border-outline-variant/20 flex items-center text-label-sm font-label-sm text-secondary"
              >
                <span class="material-symbols-outlined text-base mr-1" data-icon="pin_drop"
                  >pin_drop</span
                >
                Dynamic ZIP routing
              </div>
            </div>
            <!-- Step 3 -->
            <div
              class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs relative z-10 flex flex-col"
            >
              <div
                class="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center font-bold text-headline-sm mb-4"
              >
                03
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-2">Make an Offer</h3>
              <p class="text-body-md font-body-md text-on-surface-variant flex-1">
                Buyers and Buyer Agents submit binding or preliminary offers directly through
                standardized digital terms, escrow contingencies, and proof of funds.
              </p>
              <div
                class="mt-4 pt-4 border-t border-outline-variant/20 flex items-center text-label-sm font-label-sm text-secondary"
              >
                <span class="material-symbols-outlined text-base mr-1" data-icon="description"
                  >description</span
                >
                Standardized escrow terms
              </div>
            </div>
            <!-- Step 4 -->
            <div
              class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs relative z-10 flex flex-col"
            >
              <div
                class="w-12 h-12 rounded-xl bg-secondary text-surface-container-lowest flex items-center justify-center font-bold text-headline-sm mb-4"
              >
                04
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
                Negotiate &amp; Close
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant flex-1">
                Sellers accept, reject, or counter offers in real-time with automated revision
                histories, binding signature triggers, and streamlined closing.
              </p>
              <div
                class="mt-4 pt-4 border-t border-outline-variant/20 flex items-center text-label-sm font-label-sm text-secondary"
              >
                <span class="material-symbols-outlined text-base mr-1" data-icon="task_alt"
                  >task_alt</span
                >
                Instant counter revisions
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 6: FOR SELLERS & ZIP CODE MATCHING FEATURE -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-10" id="sellers">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Left Column: Seller Workflow Explanation -->
          <div class="lg:col-span-6 space-y-6">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-secondary text-label-sm font-label-sm font-bold"
            >
              FOR PROPERTY OWNERS
            </div>
            <h2 class="text-headline-lg font-headline-lg text-primary">
              Sell Your Property Your Way
            </h2>
            <p class="text-body-lg font-body-lg text-on-surface-variant">
              REOZOM helps Sellers find applicable Listing Agent plans based on their property's ZIP
              code and complete a customized listing process. Never overpay for agent services you
              don't need.
            </p>
            <!-- Sequential Flow Chips -->
            <div class="space-y-3 pt-2">
              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30"
              >
                <div
                  class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold"
                >
                  1
                </div>
                <div class="text-body-md font-body-md text-primary font-medium">
                  Enter Property ZIP Code
                </div>
              </div>
              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30"
              >
                <div
                  class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold"
                >
                  2
                </div>
                <div class="text-body-md font-body-md text-primary font-medium">
                  Find Available Listing Agents &amp; Compare Plans
                </div>
              </div>
              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30"
              >
                <div
                  class="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold"
                >
                  3
                </div>
                <div class="text-body-md font-body-md text-primary font-medium">
                  Select Listing Process &amp; Upload Property Data
                </div>
              </div>
              <div
                class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30"
              >
                <div
                  class="w-7 h-7 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center text-xs font-bold"
                >
                  4
                </div>
                <div class="text-body-md font-body-md text-primary font-medium">
                  Publish Listing &amp; Receive Real-Time Offers
                </div>
              </div>
            </div>
            <div class="pt-2">
              <button
                class="px-6 py-3.5 bg-secondary text-surface-container-lowest hover:bg-on-secondary-container rounded-lg font-label-lg text-label-lg transition-colors shadow-sm flex items-center gap-2"
                @click="$router.push('/auth/register')"
              >
                <span>Start Your Listing</span>
                <span class="material-symbols-outlined text-base" data-icon="arrow_forward"
                  >arrow_forward</span
                >
              </button>
            </div>
          </div>
          <!-- Right Column: Interactive ZIP Code Matching Demonstration -->
          <div class="lg:col-span-6">
            <div
              class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-lg p-6 md:p-8"
            >
              <div
                class="flex items-center justify-between pb-4 border-b border-outline-variant/30"
              >
                <div>
                  <h3 class="text-headline-sm font-headline-sm text-primary">
                    ZIP Code Matching Engine
                  </h3>
                  <p class="text-body-sm font-body-sm text-on-surface-variant">
                    Live simulator for active territorial agent plans
                  </p>
                </div>
                <span class="material-symbols-outlined text-secondary text-2xl" data-icon="explore"
                  >explore</span
                >
              </div>
              <!-- ZIP Input Component -->
              <div class="mt-6 flex flex-col sm:flex-row gap-2">
                <div class="relative flex-1">
                  <input
                    class="w-full h-12 px-4 rounded-lg border border-outline-variant bg-surface font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
                    id="zipInput"
                    placeholder="Enter ZIP Code (e.g. 380001, 78701)"
                    type="text"
                    value="380001"
                  />
                </div>
                <button
                  class="px-5 h-12 bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  id="zipSearchBtn"
                  type="button"
                >
                  <span>Find Available Options</span>
                  <span
                    class="material-symbols-outlined text-secondary-fixed text-base"
                    data-icon="near_me"
                    >near_me</span
                  >
                </button>
              </div>
              <!-- Dynamic Mock Results Container -->
              <div class="mt-6 space-y-4" id="zipResultsContainer">
                <div class="flex items-center justify-between">
                  <span class="text-label-sm font-label-sm text-on-surface-variant uppercase"
                    >Results for ZIP:
                    <strong class="text-primary font-bold" id="currentZipLabel"
                      >380001</strong
                    ></span
                  >
                  <span class="text-label-sm font-label-sm text-secondary font-bold"
                    >2 Licensed Agents Available</span
                  >
                </div>
                <!-- Agent Card A -->
                <div
                  class="p-4 rounded-xl border border-outline-variant/40 bg-surface hover:border-secondary/50 transition-colors"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary"
                      >
                        SJ
                      </div>
                      <div>
                        <h4 class="font-headline-sm text-sm font-bold text-primary">
                          Sarah Jenkins
                        </h4>
                        <p class="text-body-sm font-body-sm text-on-surface-variant">
                          Premier Realty Network · Lic #TX-98442
                        </p>
                      </div>
                    </div>
                    <span
                      class="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-semibold"
                      >Verified</span
                    >
                  </div>
                  <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-outline-variant/20">
                    <div
                      class="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30"
                    >
                      <div class="flex justify-between items-center">
                        <span class="text-label-sm font-label-sm font-bold text-primary"
                          >Standard Plan</span
                        >
                        <span class="text-label-sm font-label-sm text-secondary font-bold"
                          >$1,499 Flat</span
                        >
                      </div>
                      <p class="text-body-sm text-xs text-on-surface-variant mt-1">
                        MLS Syndication, Legal Disclosures
                      </p>
                    </div>
                    <div
                      class="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30"
                    >
                      <div class="flex justify-between items-center">
                        <span class="text-label-sm font-label-sm font-bold text-primary"
                          >Premium Plan</span
                        >
                        <span class="text-label-sm font-label-sm text-secondary font-bold"
                          >1.5% Escrow</span
                        >
                      </div>
                      <p class="text-body-sm text-xs text-on-surface-variant mt-1">
                        Includes 3D Virtual Tour &amp; Drone capture
                      </p>
                    </div>
                  </div>
                </div>
                <!-- Agent Card B -->
                <div
                  class="p-4 rounded-xl border border-outline-variant/40 bg-surface hover:border-secondary/50 transition-colors"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary"
                      >
                        MV
                      </div>
                      <div>
                        <h4 class="font-headline-sm text-sm font-bold text-primary">
                          Marcus Vance
                        </h4>
                        <p class="text-body-sm font-body-sm text-on-surface-variant">
                          Apex Partners Real Estate · Lic #TX-48192
                        </p>
                      </div>
                    </div>
                    <span
                      class="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-surface-container-highest text-primary font-semibold"
                      >Verified</span
                    >
                  </div>
                  <div class="mt-3 pt-3 border-t border-outline-variant/20">
                    <div
                      class="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/30 flex justify-between items-center"
                    >
                      <div>
                        <div class="text-label-sm font-label-sm font-bold text-primary">
                          Professional Concierge Plan
                        </div>
                        <p class="text-body-sm text-xs text-on-surface-variant mt-0.5">
                          Full white-glove staging, dynamic builder intake, negotiation lead
                        </p>
                      </div>
                      <div class="text-right pl-3">
                        <span class="text-label-sm font-label-sm text-secondary font-bold"
                          >2.0% Escrow</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-5 text-center">
                <button
                  class="text-secondary font-label-md text-label-md hover:underline inline-flex items-center gap-1"
                  @click="$router.push('/auth/register')"
                >
                  <span>Configure custom intake criteria</span>
                  <span class="material-symbols-outlined text-sm" data-icon="chevron_right"
                    >chevron_right</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 7: FOR LISTING AGENTS & LISTING PROCESS BUILDER PREVIEW -->
      <section
        class="py-20 bg-surface-container-low border-y border-outline-variant/30"
        id="listing-agents"
      >
        <div class="max-w-7xl mx-auto px-6 md:px-10">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
              >MODULAR ARCHITECTURE FOR AGENTS</span
            >
            <h2 class="text-headline-lg font-headline-lg text-primary mt-2">
              Build Your Own Listing Experience
            </h2>
            <p class="text-body-md font-body-md text-on-surface-variant mt-2">
              Create customized plans and dynamic listing processes designed around the way you
              work. Onboard clients cleanly and systematically.
            </p>
          </div>
          <!-- 4 Feature Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div
              class="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs"
            >
              <div
                class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-3"
              >
                <span class="material-symbols-outlined" data-icon="sell">sell</span>
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">Create Your Plan</h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Create Seller-facing plans with your own pricing, commission rates, and tiered
                marketing services.
              </p>
            </div>
            <div
              class="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs"
            >
              <div
                class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-3"
              >
                <span class="material-symbols-outlined" data-icon="tune">tune</span>
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Build Your Process
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Create customized listing workflows and dynamic intake forms with mandatory
                disclosures.
              </p>
            </div>
            <div
              class="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs"
            >
              <div
                class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-3"
              >
                <span class="material-symbols-outlined" data-icon="map">map</span>
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Define Service Area
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Configure geographic ZIP codes where your plans are active with instant territory
                protection.
              </p>
            </div>
            <div
              class="p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs"
            >
              <div
                class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary mb-3"
              >
                <span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              </div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">Manage Listings</h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Centralized dashboard for workflow milestones, high-resolution media, and seller
                handoffs.
              </p>
            </div>
          </div>
          <!-- Agent Workflow Strip -->
          <div
            class="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 mb-12 flex flex-wrap items-center justify-between gap-3 text-sm"
          >
            <span class="text-label-sm font-label-sm uppercase text-on-surface-variant"
              >Agent Lifecycle:</span
            >
            <span class="font-label-md text-label-md text-primary">Register</span>
            <span class="text-outline-variant">→</span>
            <span class="font-label-md text-label-md text-primary">Verify License</span>
            <span class="text-outline-variant">→</span>
            <span class="font-label-md text-label-md text-primary">Purchase Package</span>
            <span class="text-outline-variant">→</span>
            <span class="font-label-md text-label-md text-primary">Create Plan</span>
            <span class="text-outline-variant">→</span>
            <span class="font-label-md text-label-md text-primary">Build Process</span>
            <span class="text-outline-variant">→</span>
            <span class="font-label-md text-label-md text-secondary font-bold"
              >Manage Listings</span
            >
          </div>
          <!-- Interactive Listing Process Builder Mockup UI -->
          <div
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xl overflow-hidden"
          >
            <!-- Mockup Window Header -->
            <div
              class="bg-primary-container px-6 py-4 flex flex-wrap justify-between items-center text-on-primary"
            >
              <div class="flex items-center gap-3">
                <div class="flex space-x-1.5">
                  <span class="w-3 h-3 rounded-full bg-error"></span>
                  <span class="w-3 h-3 rounded-full bg-secondary-fixed"></span>
                  <span class="w-3 h-3 rounded-full bg-surface-variant"></span>
                </div>
                <span class="font-label-lg text-label-lg font-mono text-inverse-primary ml-2"
                  >Listing_Process_Builder v2.4</span
                >
                <span class="px-2 py-0.5 rounded bg-surface-container-lowest/10 text-xs font-mono"
                  >Status: ACTIVE</span
                >
              </div>
              <div class="flex items-center gap-3 mt-2 sm:mt-0">
                <button
                  class="px-3 py-1.5 rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 text-surface-container-lowest text-label-sm font-label-sm flex items-center gap-1 transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  <span class="material-symbols-outlined text-sm" data-icon="add">add</span> Add
                  Step
                </button>
                <button
                  class="px-3.5 py-1.5 rounded-lg bg-secondary text-surface-container-lowest text-label-sm font-label-sm font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  Save &amp; Deploy Workflow
                </button>
              </div>
            </div>
            <!-- Builder Canvas Area -->
            <div class="p-6 md:p-8 space-y-6">
              <!-- Step 1 Block -->
              <div class="rounded-xl border border-outline-variant/50 p-5 bg-surface">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-symbols-outlined text-outline cursor-move"
                      data-icon="drag_indicator"
                      >drag_indicator</span
                    >
                    <span
                      class="w-6 h-6 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold"
                      >1</span
                    >
                    <h4 class="font-headline-sm text-base text-primary">Property Information</h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded bg-surface-container-low text-secondary text-label-sm font-label-sm font-bold"
                      >REQUIRED</span
                    >
                    <button class="text-on-surface-variant hover:text-primary">
                      <span class="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Field 1</div>
                    <div class="text-primary font-medium mt-0.5">
                      Street Address (Google Auto-fill)
                    </div>
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Field 2</div>
                    <div class="text-primary font-medium mt-0.5">Property ZIP Code (Validated)</div>
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Field 3</div>
                    <div class="text-primary font-medium mt-0.5">Property Architecture Type</div>
                  </div>
                </div>
              </div>
              <!-- Step 2 Block -->
              <div class="rounded-xl border border-outline-variant/50 p-5 bg-surface">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-symbols-outlined text-outline cursor-move"
                      data-icon="drag_indicator"
                      >drag_indicator</span
                    >
                    <span
                      class="w-6 h-6 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold"
                      >2</span
                    >
                    <h4 class="font-headline-sm text-base text-primary">
                      Property Details &amp; Specs
                    </h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded bg-surface-container-low text-secondary text-label-sm font-label-sm font-bold"
                      >REQUIRED</span
                    >
                    <button class="text-on-surface-variant hover:text-primary">
                      <span class="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Integer</div>
                    <div class="text-primary font-medium mt-0.5">Bedrooms Count</div>
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Decimal</div>
                    <div class="text-primary font-medium mt-0.5">Bathrooms Count</div>
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Numeric SqFt</div>
                    <div class="text-primary font-medium mt-0.5">Interior Finished Size</div>
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs"
                  >
                    <div class="text-on-surface-variant uppercase font-mono">Dimensional</div>
                    <div class="text-primary font-medium mt-0.5">Lot Dimensions &amp; Acreage</div>
                  </div>
                </div>
              </div>
              <!-- Step 3 Block -->
              <div class="rounded-xl border border-outline-variant/50 p-5 bg-surface">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-symbols-outlined text-outline cursor-move"
                      data-icon="drag_indicator"
                      >drag_indicator</span
                    >
                    <span
                      class="w-6 h-6 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold"
                      >3</span
                    >
                    <h4 class="font-headline-sm text-base text-primary">
                      Disclosures &amp; Legal Documents
                    </h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded bg-surface-container-low text-secondary text-label-sm font-label-sm font-bold"
                      >LEGAL ATTESTATION</span
                    >
                    <button class="text-on-surface-variant hover:text-primary">
                      <span class="material-symbols-outlined text-sm" data-icon="edit">edit</span>
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs flex items-center justify-between"
                  >
                    <span class="text-primary font-medium">Title Deed PDF</span>
                    <span
                      class="material-symbols-outlined text-secondary text-sm"
                      data-icon="check_circle"
                      >check_circle</span
                    >
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs flex items-center justify-between"
                  >
                    <span class="text-primary font-medium">Seller Disclosures</span>
                    <span
                      class="material-symbols-outlined text-secondary text-sm"
                      data-icon="check_circle"
                      >check_circle</span
                    >
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs flex items-center justify-between"
                  >
                    <span class="text-primary font-medium">HOA Bylaws &amp; Fees</span>
                    <span class="text-outline-variant text-[10px]">OPTIONAL</span>
                  </div>
                  <div
                    class="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/30 text-xs flex items-center justify-between"
                  >
                    <span class="text-primary font-medium">Tax &amp; Assessment</span>
                    <span
                      class="material-symbols-outlined text-secondary text-sm"
                      data-icon="check_circle"
                      >check_circle</span
                    >
                  </div>
                </div>
              </div>
              <!-- Step 4 Block -->
              <div class="rounded-xl border border-secondary/30 p-5 bg-surface-container-low">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-symbols-outlined text-outline cursor-move"
                      data-icon="drag_indicator"
                      >drag_indicator</span
                    >
                    <span
                      class="w-6 h-6 rounded-full bg-secondary text-surface-container-lowest text-xs flex items-center justify-center font-bold"
                      >4</span
                    >
                    <h4 class="font-headline-sm text-base text-primary font-bold">
                      Review, Attest &amp; Publish to Escrow Network
                    </h4>
                  </div>
                  <span class="text-label-sm font-label-sm text-secondary font-bold"
                    >FINAL SUBMISSION GATEWAY</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 8: FOR BUYERS & BUYER AGENTS -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-10" id="buyers">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
            >COLLABORATIVE BUYING</span
          >
          <h2 class="text-headline-lg font-headline-lg text-primary mt-2">
            Empowering Buyers &amp; Buyer Agents
          </h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-2">
            Dedicated portals configured for direct property discovery, offer representation, and
            escrow tracking.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Column A: For Buyers -->
          <div
            class="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div
                class="w-12 h-12 rounded-xl bg-surface-container-low text-secondary flex items-center justify-center mb-6"
              >
                <span class="material-symbols-outlined text-2xl" data-icon="person_search"
                  >person_search</span
                >
              </div>
              <span
                class="text-label-sm font-label-sm text-secondary uppercase tracking-widest font-bold"
                >DIRECT HOMEBUYERS</span
              >
              <h3 class="text-headline-lg font-headline-lg text-primary mt-2 mb-4">
                Find Properties. Make Offers.
              </h3>
              <p class="text-body-lg font-body-lg text-on-surface-variant mb-6 leading-relaxed">
                Explore verified residential assets with complete transparent pricing. Submit
                digital purchase agreements, respond to seller counters, and view title reports
                directly.
              </p>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Instant ZIP-code perimeter search and filter alerts
                </li>
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Legally standardized offer submission templates
                </li>
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Direct upload for mortgage pre-approvals &amp; proof of funds
                </li>
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Real-time counter offer negotiation notifications
                </li>
              </ul>
            </div>
            <button
              class="w-full py-3.5 bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center justify-center gap-2"
              onclick="document.getElementById('listings').scrollIntoView()"
            >
              <span>Explore Listings</span>
              <span
                class="material-symbols-outlined text-secondary-fixed text-base"
                data-icon="arrow_forward"
                >arrow_forward</span
              >
            </button>
          </div>
          <!-- Column B: For Buyer Agents -->
          <div
            class="p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div
                class="w-12 h-12 rounded-xl bg-surface-container-low text-secondary flex items-center justify-center mb-6"
              >
                <span class="material-symbols-outlined text-2xl" data-icon="handshake"
                  >handshake</span
                >
              </div>
              <span
                class="text-label-sm font-label-sm text-secondary uppercase tracking-widest font-bold"
                >LICENSED REPRESENTATION</span
              >
              <h3 class="text-headline-lg font-headline-lg text-primary mt-2 mb-4">
                Manage Offers for Your Buyers.
              </h3>
              <p class="text-body-lg font-body-lg text-on-surface-variant mb-6 leading-relaxed">
                Equip your brokerage with automated offer structuring, client portfolio supervision,
                verifiable contingency tracking, and direct listing agent communications.
              </p>
              <ul class="space-y-3 mb-8">
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Multi-client simultaneous offer &amp; portfolio tracking
                </li>
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Rapid counter-offer generation with auto contingency clauses
                </li>
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Institutional audit logs with certified timestamps
                </li>
                <li class="flex items-center text-body-md font-body-md text-primary">
                  <span
                    class="material-symbols-outlined text-secondary text-lg mr-2.5"
                    data-icon="check_circle"
                    >check_circle</span
                  >
                  Co-broker commission verification and escrow handoff
                </li>
              </ul>
            </div>
            <button
              class="w-full py-3.5 bg-secondary hover:bg-on-secondary-container text-surface-container-lowest font-label-lg text-label-lg rounded-lg transition-colors flex items-center justify-center gap-2"
              @click="$router.push('/auth/register')"
            >
              <span>Register as Buyer Agent</span>
              <span class="material-symbols-outlined text-base" data-icon="how_to_reg"
                >how_to_reg</span
              >
            </button>
          </div>
        </div>
      </section>
      <!-- SECTION 9: OFFER & NEGOTIATION TIMELINE (Specialty Component) -->
      <section class="py-20 bg-surface-container-low border-y border-outline-variant/30">
        <div class="max-w-4xl mx-auto px-6 md:px-10">
          <div class="text-center mb-12">
            <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
              >REAL-TIME ESCROW PROTOCOL</span
            >
            <h2 class="text-headline-lg font-headline-lg text-primary mt-2">
              Negotiation Made Simple
            </h2>
            <p class="text-body-md font-body-md text-on-surface-variant mt-2">
              Transparent, real-time offer tracking with a tamper-proof audit trail.
            </p>
          </div>
          <!-- Specialty Component: Negotiation Activity Stream Timeline -->
          <div
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-lg p-6 md:p-8"
          >
            <div
              class="flex items-center justify-between pb-6 border-b border-outline-variant/30 mb-8"
            >
              <div>
                <span class="text-label-sm font-label-sm text-on-surface-variant uppercase"
                  >TRANSACTION FILE #RZ-78219</span
                >
                <h3 class="text-headline-sm font-headline-sm text-primary">
                  Modern Family Home — Offer History
                </h3>
              </div>
              <div class="text-right">
                <span
                  class="px-3 py-1 rounded-full bg-surface-container text-secondary text-label-sm font-label-sm font-bold border border-secondary/20"
                >
                  ACTIVE NEGOTIATION
                </span>
              </div>
            </div>
            <!-- Vertical Timeline Steps -->
            <div
              class="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40"
            >
              <!-- Step 1: Buyer Initial Offer -->
              <div class="relative group">
                <div
                  class="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold ring-4 ring-surface-container-lowest"
                >
                  1
                </div>
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <span class="text-label-md font-label-md text-primary font-bold"
                      >Buyer Initial Offer: $400,000</span
                    >
                    <span
                      class="ml-2 text-label-sm font-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface-variant"
                      >Submitted</span
                    >
                  </div>
                  <span class="text-body-sm font-body-sm text-on-surface-variant"
                    >Oct 12, 09:30 AM</span
                  >
                </div>
                <p class="text-body-md font-body-md text-on-surface-variant mt-1">
                  Submitted by Elena Rostova (Buyer). Pre-approval letter attached from First
                  Horizon Federal ($450,000 cap). Earnest money deposit: $10,000.
                </p>
              </div>
              <!-- Step 2: Seller Counter -->
              <div class="relative group">
                <div
                  class="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-surface-container text-secondary flex items-center justify-center text-xs font-bold ring-4 ring-surface-container-lowest"
                >
                  2
                </div>
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <span class="text-label-md font-label-md text-primary font-bold"
                      >Seller Counter-Offer: $425,000</span
                    >
                    <span
                      class="ml-2 text-label-sm font-label-sm px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200"
                      >Countered</span
                    >
                  </div>
                  <span class="text-body-sm font-body-sm text-on-surface-variant"
                    >Oct 13, 02:15 PM</span
                  >
                </div>
                <p class="text-body-md font-body-md text-on-surface-variant mt-1">
                  Seller proposed price increase with reduced 21-day closing schedule. Added
                  contingency clause regarding appraisal waiver floor.
                </p>
              </div>
              <!-- Step 3: Buyer Counter -->
              <div class="relative group">
                <div
                  class="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-surface-container text-secondary flex items-center justify-center text-xs font-bold ring-4 ring-surface-container-lowest"
                >
                  3
                </div>
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <span class="text-label-md font-label-md text-primary font-bold"
                      >Buyer Counter-Offer: $415,000</span
                    >
                    <span
                      class="ml-2 text-label-sm font-label-sm px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200"
                      >Countered</span
                    >
                  </div>
                  <span class="text-body-sm font-body-sm text-on-surface-variant"
                    >Oct 14, 11:45 AM</span
                  >
                </div>
                <p class="text-body-md font-body-md text-on-surface-variant mt-1">
                  Buyer agreed to shorten inspection period from 10 days to 5 days, splitting
                  closing costs evenly.
                </p>
              </div>
              <!-- Step 4: Seller Compromise -->
              <div class="relative group">
                <div
                  class="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-surface-container text-secondary flex items-center justify-center text-xs font-bold ring-4 ring-surface-container-lowest"
                >
                  4
                </div>
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <span class="text-label-md font-label-md text-primary font-bold"
                      >Seller Final Compromise: $420,000</span
                    >
                    <span
                      class="ml-2 text-label-sm font-label-sm px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold"
                      >Pending Review</span
                    >
                  </div>
                  <span class="text-body-sm font-body-sm text-on-surface-variant"
                    >Oct 15, 04:20 PM</span
                  >
                </div>
                <p class="text-body-md font-body-md text-on-surface-variant mt-1">
                  Seller accepted 5-day inspection terms and fixed closing cost contribution at
                  $5,000 flat.
                </p>
              </div>
              <!-- Step 5: Accepted -->
              <div class="relative group">
                <div
                  class="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center text-xs font-bold ring-4 ring-surface-container-lowest"
                >
                  <span class="material-symbols-outlined text-xs" data-icon="check">check</span>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div>
                    <span class="text-label-md font-label-md text-secondary font-bold"
                      >Status: ACCEPTED ($420,000)</span
                    >
                    <span
                      class="ml-2 text-label-sm font-label-sm px-2 py-0.5 rounded bg-secondary text-surface-container-lowest font-bold"
                      >Under Contract</span
                    >
                  </div>
                  <span class="text-body-sm font-body-sm text-secondary font-bold"
                    >Oct 16, 10:00 AM</span
                  >
                </div>
                <p class="text-body-md font-body-md text-on-surface-variant mt-1">
                  Both parties executed binding digital signatures. Title company assigned; escrow
                  funds deposited into secure vault.
                </p>
              </div>
            </div>
            <!-- Bottom Action Bar inside Card -->
            <div
              class="mt-8 pt-6 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-4"
            >
              <div
                class="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant"
              >
                <span class="material-symbols-outlined text-secondary text-base" data-icon="shield"
                  >shield</span
                >
                SHA-256 Verified Immutable Transaction Hash
              </div>
              <button
                class="text-label-md font-label-md text-primary hover:text-secondary flex items-center gap-1 font-semibold"
                @click="$router.push('/auth/register')"
              >
                <span>View Escrow Ledger</span>
                <span class="material-symbols-outlined text-sm" data-icon="open_in_new"
                  >open_in_new</span
                >
              </button>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 10: WHY REOZOM (6-Card Value Grid) -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-10">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
            >PLATFORM SUPERIORITY</span
          >
          <h2 class="text-headline-lg font-headline-lg text-primary mt-2">Why REOZOM</h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-2">
            Engineered to modernize traditional real estate inefficiencies with pure architectural
            precision.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Value 1 -->
          <div
            class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined" data-icon="dynamic_form">dynamic_form</span>
            </div>
            <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
              1. Dynamic Listing Processes
            </h3>
            <p class="text-body-md font-body-md text-on-surface-variant">
              Agents build modular, customized listing journeys and intake questionnaires suited to
              distinct real estate categories.
            </p>
          </div>
          <!-- Value 2 -->
          <div
            class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined" data-icon="location_searching"
                >location_searching</span
              >
            </div>
            <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
              2. ZIP-Code Matching
            </h3>
            <p class="text-body-md font-body-md text-on-surface-variant">
              Proprietary geolocation logic aligns property owners with local agents licensed and
              actively operating in their precise municipality.
            </p>
          </div>
          <!-- Value 3 -->
          <div
            class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
            </div>
            <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
              3. Easy Listing Management
            </h3>
            <p class="text-body-md font-body-md text-on-surface-variant">
              Coordinate photography, virtual walkthroughs, MLS syndications, and buyer inquiries
              from a unified command board.
            </p>
          </div>
          <!-- Value 4 -->
          <div
            class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined" data-icon="receipt_long">receipt_long</span>
            </div>
            <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
              4. Standardized Offer Engine
            </h3>
            <p class="text-body-md font-body-md text-on-surface-variant">
              Replace chaotic multi-page email threads with digital offer protocols, clear
              contingency tables, and instant legal notices.
            </p>
          </div>
          <!-- Value 5 -->
          <div
            class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined" data-icon="swap_horiz">swap_horiz</span>
            </div>
            <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
              5. Transparent Negotiation
            </h3>
            <p class="text-body-md font-body-md text-on-surface-variant">
              Tamper-proof counter-offer tracking ensures all parties view exact terms, expiration
              timestamps, and revision deltas.
            </p>
          </div>
          <!-- Value 6 -->
          <div
            class="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-xs hover:border-secondary/40 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center mb-4"
            >
              <span class="material-symbols-outlined" data-icon="admin_panel_settings"
                >admin_panel_settings</span
              >
            </div>
            <h3 class="text-headline-sm font-headline-sm text-primary mb-2">
              6. Role-Based Platform
            </h3>
            <p class="text-body-md font-body-md text-on-surface-variant">
              Dedicated architectural interfaces custom-built for Listing Agents, Sellers, Buyers,
              and Buyer Agents without confusion.
            </p>
          </div>
        </div>
      </section>
      <!-- SECTION 11: LISTING AGENT PRICING (Platform Packages) -->
      <section
        class="py-20 bg-surface-container-low border-y border-outline-variant/30"
        id="pricing"
      >
        <div class="max-w-7xl mx-auto px-6 md:px-10">
          <div class="text-center max-w-3xl mx-auto mb-6">
            <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
              >SUBSCRIPTION TIERS</span
            >
            <h2 class="text-headline-lg font-headline-lg text-primary mt-2">
              Listing Agent Packages
            </h2>
            <p class="text-body-md font-body-md text-on-surface-variant mt-2">
              Platform packages created by Admin and subscribed by Listing Agents to unlock listing
              allowances and custom process builders.
            </p>
          </div>
          <!-- Callout Banner -->
          <div
            class="max-w-2xl mx-auto mb-12 p-3.5 bg-surface-container-lowest rounded-xl border border-secondary/30 text-center text-body-sm font-body-sm text-primary flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-secondary text-base" data-icon="info"
              >info</span
            >
            Sellers and Buyers register for free. Listing Agents subscribe to scale their digital
            territory and workflow builder.
          </div>
          <!-- 3 Pricing Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <!-- Basic Plan -->
            <div
              class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-8 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div
                  class="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                >
                  Basic Tier
                </div>
                <h3 class="text-headline-md font-headline-md text-primary mt-1">
                  Independent Agent
                </h3>
                <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  For new Listing Agents establishing regional presence.
                </p>
                <div class="my-6">
                  <span class="font-headline-lg text-4xl text-primary font-bold">$79</span>
                  <span class="text-on-surface-variant text-body-md">/month</span>
                </div>
                <ul class="space-y-3 pt-4 border-t border-outline-variant/20">
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    5 Active Property Listings
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    2 Custom Listing Processes
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Up to 3 Active ZIP Codes
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Standard Escrow Routing
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-on-surface-variant">
                    <span
                      class="material-symbols-outlined text-outline-variant text-base mr-2"
                      data-icon="close"
                      >close</span
                    >
                    Dynamic Builder Webhooks
                  </li>
                </ul>
              </div>
              <div class="mt-8">
                <button
                  class="w-full py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container font-label-lg text-label-lg transition-colors"
                  onclick="openAuthModal('Subscribe to Basic Plan ($79/mo)')"
                >
                  Get Started
                </button>
              </div>
            </div>
            <!-- Professional Plan (Highlighted) -->
            <div
              class="bg-surface-container-lowest rounded-2xl border-2 border-secondary p-8 flex flex-col justify-between shadow-xl relative scale-105"
            >
              <div
                class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-secondary text-surface-container-lowest rounded-full text-label-sm font-label-sm font-bold tracking-wider uppercase"
              >
                MOST POPULAR
              </div>
              <div>
                <div
                  class="text-label-md font-label-md text-secondary uppercase tracking-wider font-bold"
                >
                  Professional Tier
                </div>
                <h3 class="text-headline-md font-headline-md text-primary mt-1">Growth Broker</h3>
                <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  For active Listing Agents handling steady transaction volume.
                </p>
                <div class="my-6">
                  <span class="font-headline-lg text-4xl text-primary font-bold">$199</span>
                  <span class="text-on-surface-variant text-body-md">/month</span>
                </div>
                <ul class="space-y-3 pt-4 border-t border-outline-variant/20">
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    25 Active Property Listings
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    10 Custom Listing Processes
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Dynamic Intake Form Builder
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Up to 15 Active ZIP Codes
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Priority Escrow &amp; MLS Syndication
                  </li>
                </ul>
              </div>
              <div class="mt-8">
                <button
                  class="w-full py-3.5 rounded-lg bg-secondary hover:bg-on-secondary-container text-surface-container-lowest font-label-lg text-label-lg transition-colors shadow-sm"
                  onclick="openAuthModal('Subscribe to Professional Plan ($199/mo)')"
                >
                  Get Started
                </button>
              </div>
            </div>
            <!-- Enterprise Plan -->
            <div
              class="bg-surface-container-lowest rounded-2xl border border-outline-variant/50 p-8 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div
                  class="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider"
                >
                  Enterprise Tier
                </div>
                <h3 class="text-headline-md font-headline-md text-primary mt-1">
                  Brokerage &amp; Team
                </h3>
                <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  For high-volume teams and regional brokerage operations.
                </p>
                <div class="my-6">
                  <span class="font-headline-lg text-4xl text-primary font-bold">$449</span>
                  <span class="text-on-surface-variant text-body-md">/month</span>
                </div>
                <ul class="space-y-3 pt-4 border-t border-outline-variant/20">
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Unlimited Active Listings
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Unlimited Custom Processes
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Statewide / Nationwide ZIP Coverage
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Custom API &amp; Webhooks Integration
                  </li>
                  <li class="flex items-center text-body-md font-body-md text-primary">
                    <span
                      class="material-symbols-outlined text-secondary text-base mr-2"
                      data-icon="check"
                      >check</span
                    >
                    Dedicated Escrow Officer &amp; Account Manager
                  </li>
                </ul>
              </div>
              <div class="mt-8">
                <button
                  class="w-full py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container font-label-lg text-label-lg transition-colors"
                  @click="$router.push('/auth/register')"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 12: TRUST & SECURITY -->
      <section class="py-20 max-w-7xl mx-auto px-6 md:px-10" id="trust">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-secondary font-label-md text-label-md uppercase tracking-wider"
            >INSTITUTIONAL TRUST</span
          >
          <h2 class="text-headline-lg font-headline-lg text-primary mt-2">
            Built for a Better Real Estate Experience
          </h2>
          <p class="text-body-md font-body-md text-on-surface-variant mt-2">
            Certified encryption, strict regulatory compliance, and verifiable offer integrity.
          </p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined" data-icon="verified_user">verified_user</span>
            </div>
            <div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">Verified Users</h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Every participant undergoes KYC identity verification and automated real estate
                state license checks.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined" data-icon="lock">lock</span>
            </div>
            <div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Secure Authentication
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Multi-factor security, session timeouts, and encrypted cryptographic tokens
                protecting critical data.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined" data-icon="enhanced_encryption"
                >enhanced_encryption</span
              >
            </div>
            <div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Protected Information
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                AES-256 bank-level encryption on all disclosures, proof-of-funds files, and personal
                documentation.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined" data-icon="history_edu">history_edu</span>
            </div>
            <div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Verifiable Offer History
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Immutable chronological logs recording timestamped bids, counters, and acceptance
                terms.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined" data-icon="key">key</span>
            </div>
            <div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Role-Based Access Controls
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                Granular permissions guarantee only authorized representation can view offers and
                confidential terms.
              </p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0"
            >
              <span class="material-symbols-outlined" data-icon="cloud_done">cloud_done</span>
            </div>
            <div>
              <h3 class="text-headline-sm font-headline-sm text-primary mb-1">
                Reliable Listing Management
              </h3>
              <p class="text-body-md font-body-md text-on-surface-variant">
                99.99% system uptime backed by institutional cloud redundancy and continuous MLS
                synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>
      <!-- SECTION 13: FINAL CONVERSION CTA -->
      <section class="py-20 bg-primary-container text-on-primary">
        <div class="max-w-5xl mx-auto px-6 md:px-10 text-center">
          <span class="text-secondary-fixed font-label-md text-label-md uppercase tracking-wider"
            >GET STARTED TODAY</span
          >
          <h2
            class="text-headline-lg font-headline-lg text-surface-container-lowest mt-3 max-w-3xl mx-auto"
          >
            Ready to Simplify Your Real Estate Journey?
          </h2>
          <p
            class="text-body-lg font-body-lg text-surface-variant max-w-2xl mx-auto mt-4 leading-relaxed"
          >
            Whether you're selling a property, building your listing business, or looking for your
            next property, REOZOM brings the process together in one platform.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              class="px-8 py-4 bg-secondary text-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container transition-colors rounded-lg font-label-lg text-label-lg font-bold shadow-lg"
              @click="$router.push('/auth/register')"
            >
              Register Now
            </button>
            <a
              class="px-8 py-4 border border-outline-variant/50 text-surface-container-lowest hover:bg-surface-container-lowest/10 transition-colors rounded-lg font-label-lg text-label-lg"
              href="#listings"
            >
              Explore Listings
            </a>
          </div>
        </div>
      </section>
    </main>
    <!-- SHARED COMPONENT 2: Footer (Web Footer) -->
    <footer
      class="bg-primary dark:bg-surface-container-lowest text-surface dark:text-primary full-width border-t border-outline-variant/20 dark:border-outline-variant/40"
    >
      <div class="max-w-7xl mx-auto px-6 md:px-10 py-16 w-full">
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-outline-variant/20"
        >
          <!-- Col 1: Brand & Logo Anchor -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center gap-3">
              <img
                alt="REOZOM Logo"
                class="h-9 w-9 object-contain rounded-md"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XC5OIcOBhCVaDJep_6PTsv94jiDesgJgD67a1TVcMdBzPOXmrdrTPjevxl8QOhQ-eMz5Yv6xZvQQMEHu6sgPpx22DfFVtGebieL3T5ff6tNGFqgpCNiuZzuG6ey3mMXq7YHUimUA-GwqkroAPShYeL9G2MepHSrgNqRQi-AN_GPMcusYda7Dqrc3SZ8BulhX4TDKA7Py9MEsoXMP0yHcr7IQ5U380SNuaAcISk7f8ozx9l54oznuR6"
              />
              <span
                class="text-headline-md font-headline-md font-bold text-surface dark:text-primary"
                >REOZOM</span
              >
            </div>
            <p
              class="text-body-sm font-body-sm text-surface-variant/80 dark:text-on-surface-variant max-w-sm leading-relaxed"
            >
              Architectural Property Transactions &amp; Institutional Escrow Protocol. Connecting
              sellers, agents, and buyers through transparent, digital workflows.
            </p>
            <div class="flex items-center gap-3 pt-2 text-surface-variant/80">
              <span class="material-symbols-outlined text-lg" data-icon="shield_with_house"
                >shield_with_house</span
              >
              <span class="text-label-sm font-label-sm uppercase tracking-wider"
                >Equal Housing Opportunity</span
              >
            </div>
          </div>
          <!-- Col 2: Platform Links -->
          <div>
            <h4 class="text-label-lg font-label-lg font-bold text-surface dark:text-primary mb-4">
              Platform
            </h4>
            <ul class="space-y-2.5">
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#hero"
                  >Home</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#listings"
                  >Listings Directory</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#how-it-works"
                  >How It Works</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#pricing"
                  >Pricing Tiers</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#trust"
                  >Platform API</a
                >
              </li>
            </ul>
          </div>
          <!-- Col 3: For Users -->
          <div>
            <h4 class="text-label-lg font-label-lg font-bold text-surface dark:text-primary mb-4">
              For Users
            </h4>
            <ul class="space-y-2.5">
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#sellers"
                  >Seller Portal</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#listing-agents"
                  >Agent Solutions</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#buyers"
                  >Buyer Workspace</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#trust"
                  >Escrow Security</a
                >
              </li>
            </ul>
          </div>
          <!-- Col 4: Legal & Support -->
          <div>
            <h4 class="text-label-lg font-label-lg font-bold text-surface dark:text-primary mb-4">
              Support &amp; Legal
            </h4>
            <ul class="space-y-2.5">
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#"
                  >Help Center</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#"
                  >Privacy Policy</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#"
                  >Terms of Service</a
                >
              </li>
              <li>
                <a
                  class="text-surface-variant/80 dark:text-on-surface-variant hover:text-surface dark:hover:text-primary transition-colors text-body-sm font-body-sm"
                  href="#"
                  >Cookie Policy</a
                >
              </li>
            </ul>
          </div>
        </div>
        <!-- Copyright Anchor -->
        <div
          class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-surface-variant/70 text-body-sm font-body-sm"
        >
          <p>
            © 2025 REOZOM Inc. Architectural Property Transactions &amp; Institutional Escrow
            Protocol. All rights reserved. Equal Housing Opportunity.
          </p>
          <div class="flex space-x-6 text-label-sm font-label-sm">
            <span class="text-secondary-fixed">Status: Operational (100%)</span>
          </div>
        </div>
      </div>
    </footer>
    <!-- INTERACTIVE AUTH & ONBOARDING MODAL DIALOG -->
    <div
      class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm transition-opacity duration-200"
      id="authModal"
    >
      <div
        class="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-2xl p-6 sm:p-8 transform transition-all"
      >
        <!-- Close Button -->
        <button
          class="absolute top-5 right-5 text-on-surface-variant hover:text-primary p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          onclick="closeAuthModal()"
        >
          <span class="material-symbols-outlined" data-icon="close">close</span>
        </button>
        <!-- Modal Header -->
        <div class="flex items-center gap-3 mb-6">
          <img
            alt="REOZOM"
            class="h-8 w-8 object-contain rounded-md"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XC5OIcOBhCVaDJep_6PTsv94jiDesgJgD67a1TVcMdBzPOXmrdrTPjevxl8QOhQ-eMz5Yv6xZvQQMEHu6sgPpx22DfFVtGebieL3T5ff6tNGFqgpCNiuZzuG6ey3mMXq7YHUimUA-GwqkroAPShYeL9G2MepHSrgNqRQi-AN_GPMcusYda7Dqrc3SZ8BulhX4TDKA7Py9MEsoXMP0yHcr7IQ5U380SNuaAcISk7f8ozx9l54oznuR6"
          />
          <div>
            <h3 class="text-headline-sm font-headline-sm text-primary" id="authModalTitle">
              Login to REOZOM
            </h3>
            <p class="text-body-sm font-body-sm text-on-surface-variant">
              Select your operational role to access your dedicated workspace
            </p>
          </div>
        </div>
        <!-- Role Selector Chips -->
        <div class="mb-6">
          <label class="block text-label-sm font-label-sm text-on-surface-variant uppercase mb-2"
            >Select Your Platform Role</label
          >
          <div class="grid grid-cols-2 gap-2" id="roleButtonGroup">
            <button
              class="role-btn p-3 rounded-xl border border-secondary bg-surface-container-low text-secondary text-label-sm font-label-sm font-bold text-left flex items-center gap-2"
              onclick="selectRole('Listing Agent')"
              type="button"
            >
              <span class="material-symbols-outlined text-base" data-icon="badge">badge</span>
              <span>Listing Agent</span>
            </button>
            <button
              class="role-btn p-3 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm font-bold text-left flex items-center gap-2"
              onclick="selectRole('Seller')"
              type="button"
            >
              <span class="material-symbols-outlined text-base" data-icon="real_estate_agent"
                >real_estate_agent</span
              >
              <span>Seller</span>
            </button>
            <button
              class="role-btn p-3 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm font-bold text-left flex items-center gap-2"
              onclick="selectRole('Buyer')"
              type="button"
            >
              <span class="material-symbols-outlined text-base" data-icon="person">person</span>
              <span>Buyer</span>
            </button>
            <button
              class="role-btn p-3 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container text-label-sm font-label-sm font-bold text-left flex items-center gap-2"
              onclick="selectRole('Buyer Agent')"
              type="button"
            >
              <span class="material-symbols-outlined text-base" data-icon="handshake"
                >handshake</span
              >
              <span>Buyer Agent</span>
            </button>
          </div>
        </div>
        <!-- Form Inputs -->
        <form class="space-y-4" onsubmit="handleAuthSubmit(event)">
          <div>
            <label class="block text-label-sm font-label-sm text-on-surface-variant uppercase mb-1"
              >Email Address</label
            >
            <input
              class="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              placeholder="agent@realtypartners.com"
              required
              type="email"
            />
          </div>
          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-label-sm font-label-sm text-on-surface-variant uppercase"
                >Password</label
              >
              <a class="text-xs text-secondary hover:underline" href="#">Forgot password?</a>
            </div>
            <input
              class="w-full h-11 px-3.5 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary"
              placeholder="••••••••••••"
              required
              type="password"
            />
          </div>
          <!-- Role Workspace Indicator -->
          <div
            class="p-2.5 rounded-lg bg-surface-container-low border border-secondary/30 text-xs text-secondary flex items-center gap-2"
            id="roleWorkspaceNotice"
          >
            <span class="material-symbols-outlined text-sm" data-icon="directions_walk"
              >directions_walk</span
            >
            Redirecting to:
            <strong id="redirectTargetText">Listing Agent Dashboard &amp; Process Hub</strong>
          </div>
          <button
            class="w-full h-12 mt-2 bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
            type="submit"
          >
            <span id="authSubmitText">Continue to Workspace</span>
            <span
              class="material-symbols-outlined text-secondary-fixed text-base"
              data-icon="arrow_forward"
              >arrow_forward</span
            >
          </button>
        </form>
        <div class="mt-4 pt-4 border-t border-outline-variant/30 text-center">
          <p class="text-body-sm font-body-sm text-on-surface-variant">
            New to the protocol?
            <button
              class="text-secondary font-bold hover:underline"
              id="toggleAuthBtn"
              onclick="toggleAuthMode()"
              type="button"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
    <!-- JAVASCRIPT MICRO-INTERACTIONS -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
import TopNavBar from '@/components/layout/TopNavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
// Landing page component
</script>

<style scoped></style>
