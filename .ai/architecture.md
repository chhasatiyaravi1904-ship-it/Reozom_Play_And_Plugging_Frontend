# Application Architecture

## 1. Project Overview

This project is a production-ready Vue 3 Single Page Application (SPA).

The frontend communicates with a Laravel REST API.

The application must be modular, scalable, maintainable, secure,
accessible, responsive, and easy for AI coding assistants to understand.

## 2. Technology Stack

### Frontend

-   Vue 3
-   Vite
-   TypeScript
-   Composition API
-   `<script setup>`
-   Vue Router
-   Pinia
-   Axios
-   Tailwind CSS

### Backend

-   Laravel
-   REST API
-   MySQL
-   Laravel Sanctum where authentication is required

### Development

-   Git
-   ESLint
-   Prettier
-   Vitest

## 3. Architectural Principles

1.  Separation of concerns
2.  Single responsibility
3.  Reusability
4.  Maintainability
5.  Minimal complexity
6.  Consistent architecture
7.  Mobile-first UI
8.  API separation
9.  Centralized state management
10. Secure data handling

Prefer simple solutions over complex abstractions.

## 4. Application Architecture

General application flow:

``` text
User
 ↓
View
 ↓
Component
 ↓
Composable / Pinia Store
 ↓
Service
 ↓
Axios
 ↓
Laravel REST API
 ↓
Database
```

Not every feature must use every layer. Use the minimum number of layers
required.

## 5. Project Structure

``` text
project-root/
├── .ai/
│   ├── architecture.md
│   ├── coding-rules.md
│   ├── decisions.md
│   └── ui-design.md
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/
│   │   ├── common/
│   │   ├── form/
│   │   ├── table/
│   │   ├── modal/
│   │   └── layout/
│   ├── composables/
│   ├── constants/
│   ├── layouts/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── utils/
│   ├── views/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── errors/
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── .env
├── .env.example
├── .env.development
├── .env.production
├── .gitignore
├── AI_RULES.md
├── README.md
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

## 6. Views

`views/` contains page-level components.

Example:

``` text
views/
├── auth/
│   ├── Login.vue
│   └── ForgotPassword.vue
├── dashboard/
│   └── Dashboard.vue
└── errors/
    ├── NotFound.vue
    └── ServerError.vue
```

Views should coordinate the page. Business logic should not become
unnecessarily large inside views.

## 7. Components

`components/` contains reusable UI components.

``` text
components/
├── common/
├── form/
├── table/
├── modal/
└── layout/
```

Components should have a single responsibility.

## 8. Composables

`composables/` contains reusable Vue logic.

Examples:

``` text
useAuth.js
usePagination.js
useDebounce.js
useModal.js
```

Create a composable only when logic is reusable or improves separation
of concerns.

## 9. Pinia Stores

Pinia stores contain shared/global application state.

Examples:

``` text
stores/
├── auth.js
├── app.js
└── user.js
```

Create feature-specific stores only when the feature requires shared
state.

## 10. Services

Services are responsible for API communication.

Example:

``` text
services/
├── api.js
├── authService.js
└── userService.js
```

Components must not directly call Axios.

Expected flow:

``` text
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

## 11. Axios

Create one centralized Axios instance.

Responsibilities may include: - base URL - default headers -
authentication handling - request interceptors - response interceptors -
centralized HTTP error handling

Do not create multiple Axios instances unless there is a clear technical
requirement.

## 12. Routing

Use Vue Router.

Routes should be lazy-loaded:

``` javascript
{
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/dashboard/Dashboard.vue'),
}
```

Authentication should be handled through centralized navigation guards.

## 13. Authentication

Authentication uses Laravel Sanctum when required.

Expected flow:

``` text
Login.vue
 ↓
Auth Store
 ↓
authService.js
 ↓
api.js
 ↓
Laravel Sanctum
 ↓
Authenticated User
```

Do not invent authentication behavior without confirming the backend
contract.

## 14. Environment Configuration

Use:

``` text
.env
.env.example
.env.development
.env.production
```

Frontend variables must use `VITE_`.

Example:

``` env
VITE_APP_NAME=My Application
VITE_API_URL=http://localhost:8000/api
```

Never expose private backend secrets in frontend environment variables.

## 15. Feature Architecture

When a new business feature is introduced:

``` text
Requirement
 ↓
View
 ↓
Reusable Components
 ↓
Composable / Store
 ↓
Service
 ↓
API
```

Example:

``` text
User Management

views/users/
components/users/
stores/user.ts
services/userService.ts
composables/useUsers.ts
```

Do not create feature folders until the feature is actually required.

## 16. Error Handling

The application must handle: - validation errors - authentication
errors - authorization errors - not found errors - server errors -
network errors - unexpected errors

Every API-driven page should consider:

``` text
Loading
 ↓
Success
 ↓
Empty
 ↓
Error
```

## 17. Testing Architecture

Testing should cover: - reusable components - composables - Pinia
stores - important business logic - authentication - API-related logic -
critical user flows

Use Vitest where appropriate.

## 18. Performance Architecture

Use: - lazy-loaded routes - pagination - debounced search - efficient
list rendering - appropriate computed properties - reusable components

Avoid: - unnecessary watchers - duplicate API requests - unnecessary
global state - unnecessary re-renders

## 19. Dependency Management

Keep dependencies minimal.

Before installing a new dependency, determine: 1. Why it is needed 2.
What problem it solves 3. Whether existing dependencies can solve it 4.
Whether native Vue/browser functionality is sufficient

## 20. Architecture Change Rules

Before making a significant architectural change: 1. Inspect the current
architecture. 2. Explain the problem. 3. Explain the proposed solution.
4. Explain alternatives. 5. Explain potential impact. 6. Update
`decisions.md`. 7. Implement only after approval when appropriate.

## 21. Final Architecture Principle

Use:

``` text
Simple
 ↓
Clear
 ↓
Reusable
 ↓
Maintainable
 ↓
Scalable
```

Avoid over-engineering.
