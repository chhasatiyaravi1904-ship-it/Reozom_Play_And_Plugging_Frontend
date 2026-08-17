# Architecture Decisions

This document records important architectural and technical decisions.

AI MUST read this file before proposing significant architectural
changes.

When a new significant decision is made, add a new ADR entry.

------------------------------------------------------------------------

# ADR-001 --- Vue 3

## Decision

Use Vue 3 for the frontend application.

## Reason

This is a new project and should use the modern Vue architecture.

## Status

Accepted

------------------------------------------------------------------------

# ADR-002 --- Composition API

## Decision

Use Composition API with `<script setup>`.

## Reason

Provides clear logic organization, better reuse, and follows the modern
Vue development approach.

## Status

Accepted

------------------------------------------------------------------------

# ADR-003 --- Vite

## Decision

Use Vite as the frontend build tool.

## Reason

Vite provides a fast development environment and modern Vue tooling.

## Status

Accepted

------------------------------------------------------------------------

# ADR-004 --- JavaScript

## Decision

Use JavaScript instead of TypeScript.

## Reason

The initial project is being developed using JavaScript to keep the
implementation simple and aligned with the current project requirements.

## Status

Superseded by ADR-018.

------------------------------------------------------------------------

# ADR-018 --- TypeScript

## Context

The project was scaffolded with TypeScript enabled throughout (`.ts`
files, `lang="ts"` in every SFC, typed `defineProps`/`defineEmits`, a
`vue-tsc --build` type-check gate in the `build` script) before ADR-004
was reconciled with the implementation. TypeScript is already the
working standard across the entire codebase.

## Decision

Use TypeScript for all application code. ADR-004 is superseded.

## Reason

Rewriting a working, fully-typed codebase to plain JavaScript would be a
large, high-risk migration with no functional benefit, and would remove
compile-time safety the project already relies on (`vue-tsc --build`).
TypeScript also aligns with the project's stated priority of
Correctness and Maintainability over simplicity for its own sake.

## Alternatives Considered

Migrating to JavaScript to match the original ADR-004 text. Rejected:
high risk, no benefit, contradicts the "avoid unnecessary rewrites"
principle.

## Consequences

All new code must use TypeScript (`lang="ts"`, typed props/emits,
`.ts` files). `AI_RULES.md` and `coding-rules.md` are updated to
reference TypeScript instead of JavaScript.

## Status

Accepted

## Date

2026-08-12

------------------------------------------------------------------------

# ADR-005 --- Vue Router

## Decision

Use Vue Router for application navigation.

## Reason

The application requires SPA routing, lazy-loaded pages, protected
routes, and guest routes.

## Status

Accepted

------------------------------------------------------------------------

# ADR-006 --- Pinia

## Decision

Use Pinia for global/shared application state.

## Reason

Pinia provides a clear and modular state management solution for Vue 3.

## Status

Accepted

------------------------------------------------------------------------

# ADR-007 --- Axios

## Decision

Use Axios for HTTP/API communication.

## Reason

Axios provides centralized configuration, interceptors, request
handling, and consistent API communication.

## Status

Accepted

------------------------------------------------------------------------

# ADR-008 --- API Service Layer

## Decision

All backend API communication must be handled through the service layer.

## Example

``` text
Component
 ↓
Composable / Store
 ↓
Service
 ↓
Axios
 ↓
Laravel API
```

## Reason

Separates API communication from UI logic and improves maintainability
and testing.

## Status

Accepted

------------------------------------------------------------------------

# ADR-009 --- Tailwind CSS

## Decision

Use Tailwind CSS as the primary styling solution.

## Reason

Tailwind provides consistent utility-based styling and responsive design
without requiring a large custom CSS architecture.

## Rules

-   Use Tailwind utilities.
-   Use mobile-first responsive design.
-   Avoid unnecessary custom CSS.
-   Do not introduce another CSS framework.

## Status

Accepted

------------------------------------------------------------------------

# ADR-010 --- Mobile First

## Decision

The application follows a mobile-first responsive design strategy.

## Reason

The application should work consistently across mobile, tablet, and
desktop devices.

## Status

Accepted

------------------------------------------------------------------------

# ADR-011 --- Lazy Loaded Routes

## Decision

Application routes should use lazy loading.

## Example

``` javascript
component: () => import('../views/dashboard/Dashboard.vue')
```

## Reason

Reduce the initial JavaScript bundle and improve application startup
performance.

## Status

Accepted

------------------------------------------------------------------------

# ADR-012 --- Centralized Authentication

## Decision

Authentication and protected route handling should be centralized.

## Reason

Avoid duplicate authentication logic across individual pages.

## Technology

Laravel Sanctum where required.

## Status

Accepted

------------------------------------------------------------------------

# ADR-013 --- Environment Configuration

## Decision

Frontend configuration must use Vite environment variables.

Example:

``` text
VITE_API_URL
VITE_APP_NAME
```

## Reason

Keep environment-specific configuration outside application logic.

## Security Rule

Never place private secrets in frontend environment variables.

## Status

Accepted

------------------------------------------------------------------------

# ADR-014 --- Reusable UI Components

## Decision

Create reusable components for repeated UI patterns.

Examples:

``` text
BaseButton.vue
BaseInput.vue
BaseModal.vue
BaseTable.vue
BaseBadge.vue
```

## Reason

Maintain visual and behavioral consistency.

## Rule

Do not create abstractions unless there is a genuine reuse requirement.

## Status

Accepted

------------------------------------------------------------------------

# ADR-015 --- Error Handling

## Decision

Use a consistent application-wide approach for API and UI errors.

Handle: - validation errors - authentication errors - authorization
errors - not found errors - server errors - network errors

## Reason

Provide predictable behavior and user feedback.

## Status

Accepted

------------------------------------------------------------------------

# ADR-016 --- Loading / Empty / Error States

## Decision

Data-driven UI should explicitly handle:

``` text
Loading
Success
Empty
Error
```

## Reason

Avoid blank or confusing interfaces during asynchronous operations.

## Status

Accepted

------------------------------------------------------------------------

# ADR-017 --- Minimal Dependencies

## Decision

Keep project dependencies minimal.

## Reason

Every dependency increases maintenance, security, and upgrade costs.

## Rule

Before installing a package, verify whether: - Vue can solve the
problem - browser APIs can solve the problem - an existing dependency
can solve the problem

## Status

Accepted

------------------------------------------------------------------------

# ADR Template

Use this template for future architectural decisions.

# ADR-XXX --- Decision Title

## Context

What problem or requirement caused this decision?

## Decision

What was decided?

## Reason

Why was this approach selected?

## Alternatives Considered

What alternatives were considered?

## Consequences

What are the benefits and trade-offs?

## Status

Proposed / Accepted / Deprecated / Rejected

## Date

YYYY-MM-DD
