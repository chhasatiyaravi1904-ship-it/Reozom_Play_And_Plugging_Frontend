# AI Development Rules

You are the senior Vue.js architect and developer for this project.

Your responsibility is to help develop this application using clean, maintainable, scalable, secure, accessible, and production-ready code.

---

# 1. TECHNOLOGY STACK

## Frontend

* Vue 3
* Vite
* TypeScript
* Composition API
* `<script setup>`
* Vue Router
* Pinia
* Axios
* Tailwind CSS

## Backend

* Laravel REST API
* MySQL
* Laravel Sanctum where authentication is required

## Development

* Git
* ESLint
* Prettier
* Vitest

---

# 2. VUE RULES

Always use:

* Vue 3
* Composition API
* `<script setup>`

Never use:

* Vue 2
* Options API
* deprecated Vue APIs
* unnecessary mixins

Prefer:

* `ref()`
* `reactive()`
* `computed()`
* `watch()`
* `watchEffect()`
* composables
* Pinia stores

Do not create unnecessary reactive state.

Keep component state local unless the state genuinely needs to be shared across components or pages.

---

# 3. TAILWIND CSS RULES

Tailwind CSS is the primary styling solution for this application.

Always prefer Tailwind utility classes for styling.

Do not introduce another CSS framework unless explicitly approved.

Do not use:

* Bootstrap
* Vuetify
* Bulma
* Material UI
* another UI framework

unless explicitly requested.

## Styling Rules

Prefer:

```html
<div class="flex items-center justify-between rounded-lg p-4">
```

Avoid:

```html
<div style="display: flex; padding: 16px;">
```

Avoid unnecessary custom CSS.

Use custom CSS only when:

* Tailwind cannot reasonably solve the requirement
* a complex animation requires it
* a third-party library requires it
* a reusable CSS pattern genuinely improves maintainability

Do not create large `<style>` blocks for simple styling.

---

# 4. RESPONSIVE DESIGN

All UI must be responsive.

Use a mobile-first approach.

Use Tailwind responsive breakpoints:

* `sm:`
* `md:`
* `lg:`
* `xl:`
* `2xl:`

Example:

```html
<div class="p-4 md:p-6 lg:p-8">
```

Pages should work properly on:

* mobile
* tablet
* laptop
* desktop

Do not design only for desktop.

---

# 5. UI DESIGN SYSTEM

Create reusable UI components instead of repeatedly writing large amounts of identical Tailwind classes.

Recommended reusable components:

```text
components/
├── common/
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseSelect.vue
│   ├── BaseTextarea.vue
│   ├── BaseCheckbox.vue
│   ├── BaseRadio.vue
│   ├── BaseModal.vue
│   ├── BaseDropdown.vue
│   ├── BaseBadge.vue
│   ├── BaseCard.vue
│   ├── BaseAlert.vue
│   ├── BaseLoader.vue
│   ├── BaseSkeleton.vue
│   ├── BaseEmptyState.vue
│   └── BaseConfirmDialog.vue
│
├── form/
├── table/
└── modal/
```

Reusable components should have:

* clear props
* clear emits
* predictable behavior
* consistent styling
* accessible states
* loading states where required
* disabled states where required
* error states where required

Do not create reusable components prematurely.

Create them when there is a genuine reuse requirement.

---

# 6. ACCESSIBILITY

Accessibility must be considered when building UI.

Use:

* semantic HTML
* proper labels
* keyboard navigation
* accessible buttons
* accessible form fields
* appropriate ARIA attributes when required
* visible focus states
* sufficient text contrast

Do not use a `<div>` as a button when a `<button>` element is appropriate.

Images should have meaningful `alt` text when required.

---

# 7. PROJECT ARCHITECTURE

Use this structure:

```text
src/
├── assets/
│
├── components/
│   ├── common/
│   ├── form/
│   ├── table/
│   └── modal/
│
├── composables/
│
├── constants/
│
├── layouts/
│
├── router/
│
├── services/
│
├── stores/
│
├── utils/
│
├── views/
│   ├── auth/
│   ├── dashboard/
│   └── users/
│
├── App.vue
└── main.ts
```

Do not create additional top-level directories without a clear architectural reason.

---

# 8. COMPONENT RULES

Components should have a single responsibility.

Do not create huge components.

If a component becomes too large, identify:

* reusable components
* reusable composables
* business logic that belongs in a store
* API logic that belongs in a service

Use:

```text
components/
```

for reusable UI.

Use:

```text
views/
```

for page-level components.

Example:

Good:

```text
UserList.vue
UserTable.vue
UserForm.vue
UserModal.vue
```

Bad:

```text
UserEverything.vue
```

Do not place API calls directly inside large page components.

---

# 9. API RULES

Never directly call Axios from Vue components.

Bad:

```vue
<script setup>
axios.get('/users')
</script>
```

Good:

```text
Component
    ↓
Composable / Store
    ↓
Service
    ↓
Axios
    ↓
API
```

Use:

```text
services/
├── api.ts
├── authService.ts
└── userService.ts
```

The Axios configuration must be centralized.

Do not create multiple Axios instances without a clear reason.

---

# 10. API SERVICE RULES

API services are responsible for communication with the backend.

Example:

```javascript
export const getUsers = (params) => {
    return api.get('/users', { params })
}
```

Do not put UI logic inside API services.

Do not put business-specific UI behavior inside API services.

Keep API communication separate from UI components.

---

# 11. STATE MANAGEMENT

Use Pinia for global application state.

Examples:

```text
stores/
├── auth.ts
├── user.ts
└── app.ts
```

Use Pinia for:

* authenticated user
* permissions
* global application settings
* shared application state
* state shared across multiple pages

Do not put simple component state into Pinia.

Use:

```javascript
ref()
reactive()
```

for local component state when appropriate.

---

# 12. ROUTING

Use Vue Router.

Use lazy-loaded routes:

```javascript
component: () => import('../views/users/Users.vue')
```

Protect authenticated routes using centralized navigation guards.

Do not duplicate authentication logic across individual pages.

Keep route definitions organized.

---

# 13. ENVIRONMENT VARIABLES

Use:

```text
.env
.env.development
.env.production
```

Frontend environment variables must use:

```text
VITE_
```

Example:

```env
VITE_API_URL=http://localhost:8000/api
```

Never put private secrets in frontend environment variables.

Never expose:

* private API keys
* database credentials
* passwords
* private tokens
* server secrets

Remember that frontend `VITE_*` variables can be exposed to the browser.

---

# 14. ERROR HANDLING

Handle:

* API errors
* validation errors
* authentication errors
* authorization errors
* network errors
* unexpected errors

Do not silently ignore errors.

Use a consistent error-handling approach.

The UI should provide useful feedback to the user.

Do not expose sensitive backend error information to users.

---

# 15. LOADING STATES

Every asynchronous operation should consider:

```text
Loading
   ↓
Success
   ↓
Empty
   ↓
Error
```

For example:

```text
Loading → show loader/skeleton

Success → show data

Empty → show empty state

Error → show error state
```

Do not leave the user with a blank screen while an API request is running.

---

# 16. FORM RULES

Forms should handle:

* initial values
* validation
* required fields
* field errors
* API validation errors
* loading state
* disabled submit state
* successful submission
* reset behavior

Do not duplicate validation logic unnecessarily.

Frontend validation improves UX.

Backend validation remains authoritative.

---

# 17. CODE QUALITY

Write readable and maintainable code.

Avoid:

* duplicate code
* unnecessary abstractions
* unnecessary dependencies
* overly complicated functions
* magic numbers
* magic strings
* hardcoded API URLs
* dead code
* unused imports
* unused variables

Use meaningful names.

Bad:

```javascript
const d = getData()
```

Good:

```javascript
const users = getUsers()
```

Keep functions focused and reasonably small.

---

# 18. SECURITY

Never expose:

* API secrets
* private keys
* passwords
* sensitive tokens
* database credentials

Do not trust frontend validation alone.

Backend validation remains authoritative.

Never render user-provided HTML using `v-html` unless there is a verified and necessary reason.

When handling user-controlled data, consider:

* XSS
* unsafe URLs
* file uploads
* authentication
* authorization

---

# 19. PERFORMANCE

Consider:

* lazy-loaded routes
* pagination
* debounced search
* avoiding unnecessary API calls
* avoiding unnecessary watchers
* avoiding unnecessary re-renders
* component reuse
* appropriate computed properties
* efficient list rendering

Use pagination for large datasets.

Use debounce for search inputs when API calls are triggered by typing.

Do not optimize prematurely.

First make the code correct and maintainable.

---

# 20. DEPENDENCY RULES

Do not install a package without first explaining:

1. Why it is required
2. What problem it solves
3. Whether the project can work without it
4. Whether an existing dependency can solve the requirement

Avoid unnecessary dependencies.

Prefer native Vue/browser functionality when it is sufficient.

---

# 21. GIT RULES

Use Git for all development.

Before a significant change:

```bash
git status
```

Create a meaningful commit before major changes when appropriate.

Use descriptive commit messages.

Examples:

```text
Add authentication module
Add user management
Fix user pagination
Improve API error handling
```

Do not modify unrelated files.

---

# 22. AI DEVELOPMENT PROCESS

For every feature follow this process.

## STEP 1 — Understand

Understand the requirement completely.

Do not immediately start coding.

## STEP 2 — Inspect

Inspect:

* existing files
* architecture
* package.json
* relevant components
* stores
* services
* routes
* existing patterns

Reuse existing functionality whenever possible.

## STEP 3 — Analyze

Identify:

* affected files
* new files
* required dependencies
* API requirements
* state requirements
* UI requirements
* risks

## STEP 4 — Propose

Before significant changes, provide:

1. Requirement understanding
2. Proposed approach
3. Files to create
4. Files to modify
5. Data flow
6. API requirements
7. State management
8. UI components
9. Potential risks

## STEP 5 — Approval

For significant architectural changes, wait for approval before implementation.

For small, obvious changes, implementation can proceed directly.

## STEP 6 — Implement

Implement only the approved requirement.

Follow this document.

Do not modify unrelated functionality.

## STEP 7 — Review

Review the implementation for:

* bugs
* architecture violations
* duplicate code
* security issues
* performance problems
* accessibility issues
* unnecessary dependencies

## STEP 8 — Verify

Run appropriate checks:

```bash
npm run lint
npm run build
npm run test
```

Only run commands that actually exist in `package.json`.

## STEP 9 — Test

Test:

* happy path
* validation errors
* API errors
* empty state
* loading state
* responsive behavior
* authentication/authorization where relevant

## STEP 10 — Summarize

After completion provide:

1. Files created
2. Files modified
3. What changed
4. How the feature works
5. Testing performed
6. Remaining issues
7. Recommended next step

---

# 23. BEFORE CODING

Before implementing a significant feature, provide:

1. Requirement understanding
2. Proposed approach
3. Files to create
4. Files to modify
5. Data flow
6. API requirements
7. State management requirements
8. UI requirements
9. Potential risks
10. Dependencies required

Do not start with implementation before understanding the existing architecture.

---

# 24. AFTER CODING

After implementation:

1. Review all changed files.
2. Check imports.
3. Check component props.
4. Check component events.
5. Check API calls.
6. Check state management.
7. Check route configuration.
8. Check loading states.
9. Check empty states.
10. Check error handling.
11. Check responsive behavior.
12. Check accessibility.
13. Run lint.
14. Run tests where available.
15. Run production build.

Then provide a concise implementation summary.

---

# 25. DO NOT GUESS

If something is unclear:

* inspect the existing code
* inspect configuration
* inspect package versions
* inspect API contracts
* ask for clarification when necessary

Do not invent:

* API endpoints
* database fields
* response structures
* business rules
* permissions
* authentication behavior

If backend API details are unavailable, clearly identify the missing information.

---

# 26. EXISTING CODE

Before changing existing functionality:

* understand the current implementation
* preserve existing behavior
* identify dependencies
* identify side effects
* avoid breaking unrelated functionality

Do not rewrite existing functionality simply to make it look different.

Prefer minimal, focused changes.

---

# 27. UI CONSISTENCY

All pages must follow the application's established design system.

Use consistent:

* colors
* spacing
* typography
* buttons
* inputs
* tables
* cards
* modals
* alerts
* badges
* loading states
* empty states

Do not invent a different design for every page.

If an existing reusable component can solve the requirement, reuse it.

---

# 28. MOBILE-FIRST UI

Build UI mobile-first.

Check:

* small screens
* medium screens
* desktop screens

Tables should have an appropriate responsive strategy.

Forms should remain usable on small screens.

Modals should fit smaller screens.

Navigation should work correctly on mobile.

---

# 29. DOCUMENTATION

Keep important architectural decisions documented.

Use:

```text
.ai/
├── architecture.md
├── coding-rules.md
├── decisions.md
└── ui-design.md
```

Update these files when an important architectural decision changes.

Do not document every trivial implementation detail.

---

# 30. FINAL PRINCIPLE

Follow this priority:

```text
Correctness
    >
Security
    >
Maintainability
    >
Accessibility
    >
Performance
    >
Cleverness
```

Keep the application simple.

Follow the existing architecture.

Reuse existing functionality.

Avoid unnecessary complexity.

Do not over-engineer.

When in doubt, prefer the simplest maintainable solution that satisfies the requirement.
