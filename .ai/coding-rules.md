# Coding Rules

## 1. General Principles

Write code that is: - readable - maintainable - predictable - reusable -
testable - secure - accessible

Prefer simple code over clever code.

## 2. Vue Version

Use Vue 3 only.

Always use:

``` vue
<script setup>
```

Use Composition API.

Never use: - Options API - Vue 2 syntax - deprecated Vue APIs -
unnecessary mixins

## 3. Vue Reactivity

Use: - `ref()` - `reactive()` - `computed()` - `watch()` -
`watchEffect()`

Use the simplest appropriate reactive API.

## 4. Components

Every component should have a clear responsibility.

Good:

``` text
UserTable.vue
UserForm.vue
UserModal.vue
UserFilters.vue
```

Bad:

``` text
UserEverything.vue
```

## 5. Component Naming

Use PascalCase:

``` text
BaseButton.vue
BaseInput.vue
UserTable.vue
UserForm.vue
DashboardCard.vue
```

## 6. Props

Use explicit and meaningful props.

``` javascript
const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
})
```

Do not mutate props directly.

## 7. Emits

Use explicit emits:

``` javascript
const emit = defineEmits([
    'submit',
    'cancel',
])
```

Use meaningful event names.

## 8. State Management

Use Pinia for shared/global state.

Use local state for: - modal visibility - input values - temporary UI
state - component-specific state

Use Pinia for: - authentication - user/session state - global settings -
shared application state

## 9. API Communication

Never call Axios directly from components.

Bad:

``` javascript
axios.get('/users')
```

Good:

``` text
Component
 ↓
Composable / Store
 ↓
Service
 ↓
Axios
```

API communication belongs in `src/services/`.

## 10. Axios

Use a centralized Axios instance.

Do not create separate Axios instances without a clear reason.

## 11. API Services

Service files should focus on backend communication.

``` javascript
export const getUsers = (params) => {
    return api.get('/users', { params })
}
```

Do not put UI logic inside services.

## 12. Async Operations

Async operations should handle:

``` text
loading
success
empty
error
```

## 13. Error Handling

Handle:

``` text
400
401
403
404
422
500
Network Error
```

Do not silently swallow errors.

## 14. Forms

Forms must consider: - initial values - validation - required fields -
field errors - API validation errors - loading state - disabled submit -
success state - reset behavior

Frontend validation is for user experience. Backend validation remains
authoritative.

## 15. TypeScript

Use TypeScript for all application code (see ADR-018).

Use modern TypeScript/JavaScript: - `const` - `let` - `async/await` -
destructuring - optional chaining - nullish coalescing - modules

Use explicit types for props, emits, and function signatures where they
are not obvious from inference. Avoid `any`.

## 16. Naming

Use meaningful names.

Bad:

``` javascript
const d = getData()
```

Good:

``` javascript
const users = getUsers()
```

Functions should describe actions:

``` text
fetchUsers()
createUser()
updateUser()
deleteUser()
validateForm()
```

## 17. File Naming

Components:

``` text
PascalCase.vue
```

Composables:

``` text
useSomething.ts
```

Services:

``` text
somethingService.ts
```

Stores:

``` text
something.ts
```

Utilities:

``` text
camelCase.ts
```

## 18. Tailwind CSS

Tailwind CSS is the primary styling solution.

Prefer:

``` html
<div class="flex items-center gap-4 rounded-lg p-4">
```

Avoid:

``` html
<div style="display: flex; padding: 16px;">
```

Do not introduce another CSS framework.

Avoid unnecessary custom CSS.

## 19. Tailwind Responsive Design

Use mobile-first responsive classes.

``` html
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

Always consider mobile, tablet, and desktop.

## 20. Tailwind Class Management

Do not create extremely large repeated Tailwind class strings across
many components.

If a UI pattern is genuinely reusable, create a reusable Vue component.

## 21. Accessibility

Use semantic HTML.

Prefer:

``` html
<button>
```

instead of:

``` html
<div @click="">
```

Use: - labels - keyboard navigation - focus states - accessible names -
appropriate ARIA attributes

## 22. Routing

Use lazy-loaded routes:

``` javascript
component: () => import('../views/users/Users.vue')
```

Use centralized authentication guards.

## 23. Environment Variables

Never hardcode API URLs.

Use:

``` javascript
import.meta.env.VITE_API_URL
```

Never expose: - private API keys - passwords - database credentials -
server secrets

## 24. Security

Never trust frontend validation alone.

Avoid unsafe HTML rendering.

Do not use `v-html` unless there is a specific and verified requirement.

Consider: - XSS - unsafe URLs - file uploads - authentication -
authorization

## 25. Performance

Use: - lazy-loaded routes - pagination - debounce for search - computed
properties where appropriate - efficient list rendering

Avoid: - unnecessary watchers - duplicate API requests - unnecessary
global state - unnecessary re-renders

## 26. Dependencies

Do not install a package without explaining: 1. Why it is needed 2. What
problem it solves 3. Whether existing dependencies can solve it 4.
Whether native functionality is sufficient

## 27. Code Duplication

Before creating new functionality, search the existing codebase.

Reuse existing components, composables, services, or utilities whenever
appropriate.

## 28. Existing Code

Before modifying existing code: 1. Read the file. 2. Understand current
behavior. 3. Identify dependencies. 4. Identify side effects. 5. Make
the smallest appropriate change.

## 29. Comments

Write comments only when they explain: - why something exists - a
non-obvious decision - a complex algorithm - an important limitation

Do not write comments that simply repeat code.

## 30. Testing

Write tests for important behavior: - components - composables -
stores - business logic - critical user flows

Avoid tests that only verify implementation details.

## 31. Before Coding

For significant changes: 1. Understand requirement. 2. Inspect existing
code. 3. Identify affected files. 4. Explain proposed approach. 5.
Explain data flow. 6. Explain API requirements. 7. Explain risks. 8.
Implement.

## 32. After Coding

Always: 1. Review changed files. 2. Check imports. 3. Check props. 4.
Check emits. 5. Check API calls. 6. Check state management. 7. Check
errors. 8. Check responsive UI. 9. Check accessibility. 10. Run lint.
11. Run tests when available. 12. Run production build.

## 33. Git

Use meaningful commits:

``` text
Add authentication module
Add user management
Fix user pagination
Improve API error handling
Update dashboard layout
```

## 34. Final Rule

``` text
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

Keep code simple. Do not over-engineer.
