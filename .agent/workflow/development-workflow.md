# Development Workflow

This document defines the repeatable process for the three kinds of
change this project sees: **New Feature / Task**, **Bug Fix**, and
**Improvement to an Existing Feature**. It does not duplicate
`.ai/architecture.md`, `.ai/coding-rules.md`, or `.ai/decisions.md` —
it tells you when to consult them and in what order to act.

It applies to both repos: this frontend (Vue) and the Laravel backend.
Most listing/workflow changes touch both — check which layer(s) are
affected before picking a path below.

------------------------------------------------------------------------

## 0. Before any change, regardless of type

1.  Identify which layer(s) the change touches: frontend only, backend
    only, or both.
2.  Frontend: re-read `.ai/architecture.md` and `.ai/coding-rules.md`
    if it's been a while — do not rely on memory for layering rules
    (View → Component → Composable/Store → Service → Axios → API).
3.  Backend: follow `AGENTS.md` — read `.ai/rules/index.md` and any
    matching rule files before touching PHP (once that directory
    exists; until then, follow Laravel Boost's core/Pint/PHPUnit
    guidance directly from `AGENTS.md`).
4.  Confirm your branch is current with the base branch before
    starting.

------------------------------------------------------------------------

## 1. New Feature / New Task

Use when the requested behavior does not exist yet anywhere in the
app.

1.  **Clarify the requirement.** Restate it in one or two sentences.
    If it traces back to the Plug-and-Play BRD, note which
    Phase/Sprint it belongs to — this keeps scope from drifting past
    what that sprint actually calls for.
2.  **Search before building.** Check for prior art: existing
    composables/services/components on the frontend (coding-rules
    #27), existing models/controllers on the backend. Check
    `.ai/decisions.md` for an ADR that already settled a related
    question.
3.  **Design pass for anything non-trivial** — follow coding-rules
    #31 explicitly: understand requirement → inspect existing code →
    identify affected files → explain the proposed approach → explain
    data flow → explain API requirements → explain risks → *then*
    implement. If the change is architecturally significant, add an
    ADR to `.ai/decisions.md` per architecture.md §20 before writing
    code.
4.  **Backend first when the feature needs new data or endpoints:**
    migration → model → `FormRequest` → controller → API Resource →
    route. Use `search-docs` (Boost) before writing anything
    Laravel-version-specific — don't assume an API from memory.
5.  **Frontend implementation** follows the mandated flow: type
    (`src/types/`) → service (`src/services/`) → store/composable →
    component → view → route. Never call Axios directly from a
    component (coding-rules #9).
6.  **Tests.** Feature test (PHPUnit) for new endpoints; Vitest for
    new composables/stores/critical flows (coding-rules #30). Prefer
    factories over manual fixtures on the backend.
7.  **Self-review** using coding-rules #32 in full: imports, props,
    emits, API calls, state management, error states, responsive UI,
    accessibility, lint, tests, production build.
8.  **Record durable decisions.** If this introduces a settled
    convention future work should follow, add it to
    `.ai/decisions.md` (frontend) or use Boost's `record-rule`
    (backend) — don't let it live only in your head or the PR
    description.
9.  **Commit and PR.** Commit message style per coding-rules #33
    ("Add user management"). PR description states which
    requirement/phase this satisfies.

------------------------------------------------------------------------

## 2. Bug Fix

Use when existing behavior produces a wrong, broken, or crashing
result. This path is reproduce-first, not design-first — resist the
urge to redesign while fixing.

1.  **Reproduce it.** Exact steps, expected vs. actual. Check the
    right signal for the layer: browser console/network tab on the
    frontend, `browser-logs` (Boost) or Laravel logs on the backend.
2.  **Isolate the root cause before changing anything** — coding-rules
    #28: read the file, understand current behavior, identify
    dependencies, identify side effects. Do not patch symptoms you
    can see without understanding why they happen.
3.  **Check blast radius.** Is the broken code shared (a composable,
    a service, a base component, a trait)? A fix there can ripple
    into every consumer — find them before changing the code, not
    after.
4.  **Write a regression test first when practical** — a failing test
    that reproduces the bug, then the fix, then confirm it passes.
    Run only that test while iterating (Boost: `php artisan test
    --compact --filter=testName`; `npx vitest <file>`).
5.  **Smallest appropriate change.** Coding-rules #28 rule 5 — do not
    refactor unrelated code in the same PR. A bug fix PR should be
    easy to review because it does exactly one thing.
6.  **Self-review** (#32), lint, run the full relevant test file, build.
7.  **Commit message**: `Fix <specific bug>` (coding-rules #33 style).
    PR description states root cause and how the new test prevents
    recurrence.
8.  **If the bug reveals a systemic gap** (a missing validation
    pattern, a class of error nothing currently handles), consider
    whether it should become an ADR or a Boost `record-rule` so the
    same bug class doesn't reappear elsewhere in the codebase.

------------------------------------------------------------------------

## 3. Improvement to an Existing Feature

Use when the feature works correctly today but should work
differently or better — performance, UX, code quality, or a scope
addition to something already shipped. Treat this as higher-risk than
a new feature: there are existing consumers depending on current
behavior.

1.  **Confirm current behavior end-to-end** before proposing anything
    — read the full path: view → store → service → backend
    controller → model. Do not assume; verify.
2.  **State the improvement precisely** and check whether it changes
    a contract — API response shape, prop signature, store shape,
    emitted events. If it does, every consumer of that contract needs
    to be found and updated in the same change, not left broken.
3.  **Check `.ai/decisions.md` first.** If the current approach was a
    deliberate ADR, don't silently override it. Follow
    architecture.md §20: inspect current architecture → explain the
    problem → explain the proposed solution → explain alternatives →
    explain impact → update `decisions.md` → implement only after
    approval.
4.  **Map all consumers** of what's being changed (every component
    using the composable, every endpoint touching the model) — this
    is coding-rules #28's "identify side effects," scoped outward to
    "who else calls this."
5.  **Prefer additive/backward-compatible changes** where the feature
    is already in active use. If a breaking change is genuinely
    necessary, call it out explicitly in the PR rather than letting a
    reviewer discover it.
6.  **Regression-test the existing behavior, not just the new
    behavior.** The goal is "provably still works" *and* "now
    better," not just the latter.
7.  **Self-review** (#32), lint, tests, build.
8.  **Commit message**: `Improve <thing>` (coding-rules #33 already
    gives this exact example: "Improve API error handling"). PR
    description states the concrete before/after (e.g. "before: N+1
    query on listing load; after: eager loaded" or "before: no
    debounce on search; after: 300ms debounce").

------------------------------------------------------------------------

## Quick decision tree

```
Does the behavior not exist yet anywhere?
  → New Feature / Task workflow

Does it exist, but produce a wrong or broken result?
  → Bug Fix workflow

Does it exist, work correctly, but should work differently/better?
  → Improvement workflow

Not sure which?
  → Default to Bug Fix rigor (reproduce + isolate before touching
    code) — it's the safest failure mode if you're wrong about which
    category this is.
```

------------------------------------------------------------------------

## Where this fits the project plan

New-feature work should map to a specific Phase/Sprint from the
Plug-and-Play BRD's MVP Project Plan (Phase 0–6). Bug fixes and
improvements can occur in any sprint, but a concentrated pass on both
is explicitly scheduled in **Phase 6 — QA, Fixes & Demo Readiness**
before the Feb 26, 2027 demo milestone — don't let fixable issues pile
up assuming "Phase 6 will catch it," since that phase is only two
weeks.
