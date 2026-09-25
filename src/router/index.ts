import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/auth'

const ADMIN_PORTAL_ROLES: UserRole[] = ['admin', 'agent']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        { path: 'login', name: 'login', component: () => import('@/views/auth/LoginView.vue') },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPasswordView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/views/auth/ResetPasswordView.vue'),
        },
      ],
    },
    {
      // No guestOnly/requiresAuth meta: these two must work regardless of
      // whatever auth state happens to already be in localStorage — a
      // social-login callback replaces the session outright, and a
      // verification-link click may arrive from a browser that was never
      // logged in at all.
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'callback',
          name: 'social-callback',
          component: () => import('@/views/auth/SocialCallbackView.vue'),
        },
        {
          path: 'email-verified',
          name: 'email-verified',
          component: () => import('@/views/auth/EmailVerifiedView.vue'),
        },
        {
          path: 'verify-email',
          name: 'verify-email',
          component: () => import('@/views/auth/VerifyEmailView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminAuthLayout.vue'),
      meta: { guestOnly: true },
      children: [
        {
          path: 'login',
          name: 'admin-login',
          component: () => import('@/views/admin/AdminLoginView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ADMIN_PORTAL_ROLES },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboardView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsersView.vue'),
        },
        {
          path: 'packages',
          name: 'admin-packages',
          component: () => import('@/views/admin/AdminPackagesView.vue'),
        },
        {
          path: 'listings',
          name: 'admin-listings',
          component: () => import('@/views/admin/AdminListingsView.vue'),
        },
        {
          path: 'listing-processes',
          name: 'admin-listing-processes',
          component: () => import('@/views/admin/ListingProcessesList.vue'),
        },
        {
          path: 'processes/:id/builder',
          name: 'admin-listing-process-builder',
          component: () => import('@/views/admin/ListingFormConfig.vue'),
        },
        {
          path: 'disclosures',
          name: 'admin-disclosures',
          component: () => import('@/views/admin/AdminDisclosuresView.vue'),
        },
        {
          path: 'mls',
          name: 'admin-mls',
          component: () => import('@/views/admin/AdminMlsView.vue'),
        },
        {
          path: 'states',
          name: 'admin-states',
          component: () => import('@/views/admin/AdminStatesView.vue'),
        },
        {
          path: 'counties',
          name: 'admin-counties',
          component: () => import('@/views/admin/AdminCountiesView.vue'),
        },
        {
          path: 'cities',
          name: 'admin-cities',
          component: () => import('@/views/admin/AdminCitiesView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/SellerLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'listings',
          name: 'listings',
          component: () => import('@/views/listings/ListingsView.vue'),
        },
        {
          path: 'my-listings',
          name: 'my-listings',
          component: () => import('@/views/listings/MyListingsView.vue'),
        },
        {
          path: 'listings/create',
          name: 'listing-create',
          component: () => import('@/views/listings/CreateListingView.vue'),
        },
        {
          path: 'listings/:listingId',
          name: 'listing-overview',
          component: () => import('@/views/listings/ListingOverviewView.vue'),
        },
        {
          path: 'listings/:listingId/step/:stepId',
          name: 'listing-step',
          component: () => import('@/views/listings/ListingStepView.vue'),
        },
        {
          path: 'listings/:listingId/disclosures',
          name: 'listing-disclosures',
          component: () => import('@/views/listings/DisclosuresView.vue'),
        },
        {
          path: 'listings/:listingId/documents',
          name: 'listing-documents',
          component: () => import('@/views/listings/DocumentsView.vue'),
        },
        {
          path: 'listings/:listingId/review',
          name: 'listing-review',
          component: () => import('@/views/listings/ReviewView.vue'),
        },
        {
          path: 'listings/:listingId/submit',
          name: 'listing-submit',
          component: () => import('@/views/listings/SubmitSuccessView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue'),
        },
        { path: 'help', name: 'help', component: () => import('@/views/HelpView.vue') },
        {
          path: 'select-package',
          name: 'select-package',
          component: () => import('@/views/packages/PackageSelectionView.vue'),
        },
      ],
    },
    {
      path: '/preview/:id',
      name: 'preview-listing-process',
      component: () => import('@/views/preview/FullFormPreview.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/errors/NotFoundView.vue'),
    },
  ],
})

function isAdminPortalUser(role: UserRole | undefined): boolean {
  return !!role && ADMIN_PORTAL_ROLES.includes(role)
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // A page reload only restores the token from localStorage, not the user
  // object — fetch it before making any role-based decision below.
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.loadCurrentUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    const loginRoute = to.path.startsWith('/admin') ? 'admin-login' : 'login'
    return { name: loginRoute, query: { redirect: to.fullPath } }
  }

  const allowedRoles = to.meta.roles as UserRole[] | undefined
  if (allowedRoles && !allowedRoles.includes(authStore.user?.role as UserRole)) {
    return { name: 'dashboard' }
  }

  // A freshly-registered seller/buyer already has a session but hasn't
  // confirmed their email yet (register() logs them in immediately either
  // way) — hold them on the verify-email screen until they do.
  if (
    authStore.isAuthenticated &&
    authStore.user &&
    !authStore.user.emailVerified &&
    to.name !== 'verify-email'
  ) {
    return { name: 'verify-email' }
  }

  // Agents must pick a package before using the rest of the app. Packages
  // recur/expire, so this also re-triggers once a package lapses.
  if (
    authStore.isAuthenticated &&
    authStore.user?.role === 'agent' &&
    !authStore.user?.hasActivePackage &&
    to.name !== 'select-package'
  ) {
    return { name: 'select-package' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: isAdminPortalUser(authStore.user?.role) ? 'admin-dashboard' : 'dashboard' }
  }
})

export default router


// how we will get MLS credicail 
// we will get MLS credicail from the user and then we will store it in the database and then we will use it to get the MLS data from the MLS API