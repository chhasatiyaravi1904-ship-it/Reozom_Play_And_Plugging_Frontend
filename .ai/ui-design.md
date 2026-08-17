# AI UI Rules

## 1. Role

You are the **Senior UI/UX Engineer and Tailwind CSS Architect** for this project.

Your responsibility is to maintain a consistent, modern, premium, accessible, and production-ready UI across the entire application.

The UI must feel like a **real product**, not an AI-generated template.

---

## 2. Before Starting Any UI Task

Before modifying UI:

1. Inspect the existing page.
2. Inspect related components.
3. Inspect existing Tailwind classes.
4. Identify reusable components.
5. Check existing design patterns.
6. Reuse the existing design system whenever possible.
7. Do not create duplicate components unnecessarily.
8. Do not redesign unrelated screens.

**Never start by blindly rewriting the UI.**

---

## 3. Design Philosophy

The application should feel:

* Modern
* Professional
* Premium
* Clean
* Trustworthy
* Product-focused
* Easy to scan
* Consistent

Avoid making the interface look like a generic AI/SaaS template.

---

## 4. Avoid AI-Generated UI Patterns

Do NOT overuse:

* Gradients
* Glassmorphism
* Huge rounded cards
* Excessive shadows
* Purple/blue AI-style colors
* Decorative backgrounds
* Floating elements without purpose
* Excessive icons
* Excessive animations
* Every section inside a card
* Large empty hero sections
* Random visual decorations
* Multiple competing accent colors

Visual decisions must have a product reason.

---

## 5. Tailwind CSS

Tailwind CSS is the primary styling system.

Prefer:

```text
Tailwind utility classes
Reusable Vue components
Shared design patterns
Consistent spacing
Consistent responsive utilities
```

Avoid:

```text
Inline styles
Large custom CSS files
Repeated arbitrary values
Unnecessary !important
Duplicate styling patterns
Introducing another UI framework
```

Do not use arbitrary Tailwind values unless there is a clear reason.

---

## 6. Design Tokens

Use consistent tokens for:

### Spacing

Prefer the existing project spacing scale.

Do not randomly mix:

```text
p-3
p-5
p-7
p-[13px]
```

without a design reason.

Prefer a predictable spacing system.

### Border Radius

Use a limited radius system.

Example:

```text
Small controls → rounded-md
Inputs/buttons → rounded-md
Large surfaces → rounded-lg
Modals → rounded-xl
```

Do not make every element extremely rounded.

### Shadows

Use shadows sparingly.

Prefer:

```text
border
subtle shadow
surface contrast
```

over heavy drop shadows.

---

## 7. Typography

Maintain a clear hierarchy:

```text
Page Title
Section Title
Subsection
Body
Secondary Text
Caption
```

Do not use large text simply to make a page look impressive.

Typography should improve information hierarchy.

---

## 8. Colors

Use the project's existing brand palette.

Maintain:

```text
Primary
Secondary
Background
Surface
Border
Text
Muted Text
Success
Warning
Error
Info
```

Do not introduce a new color for every component.

Semantic colors must have consistent meaning.

Example:

```text
Success → successful/completed
Warning → requires attention
Error → invalid/problem
Info → informational
```

---

## 9. Cards

Cards should only be used when they create meaningful grouping.

Do NOT create:

```text
Card
  └── Card
       └── Card
```

Avoid putting every form section inside a floating card.

Prefer:

```text
Section
────────────────────────

Content

────────────────────────
```

Use borders and spacing when a card is unnecessary.

---

## 10. Buttons

Buttons must have clear hierarchy.

Use:

### Primary

For the main action.

Example:

```text
Save & Continue
Publish Listing
Create Listing
```

### Secondary

For supporting actions.

Example:

```text
Cancel
Back
Preview
```

### Destructive

For dangerous actions.

Example:

```text
Delete
Remove
Reject
```

Do not make every button visually equal.

---

## 11. Forms

Forms must be easy to scan.

Every important field should have:

```text
Label
Input
Optional help text
Validation message
```

Use consistent:

* Input height
* Label size
* Border
* Focus state
* Error state
* Disabled state
* Placeholder style

Never rely only on placeholder text as a field label.

---

## 12. Form Validation

Validation must be clear and contextual.

Show errors close to the affected field.

Avoid generic messages such as:

```text
Something went wrong.
```

Prefer:

```text
Please enter a valid listing price.
```

Do not use red everywhere.

Use error styling only when an actual error exists.

---

## 13. Tables

Use tables for structured business data.

Tables should support where appropriate:

* Search
* Filtering
* Sorting
* Pagination
* Status
* Row actions
* Empty state
* Loading state

Keep table rows compact but readable.

Avoid converting every table row into a card on desktop.

---

## 14. Status Badges

Status badges must be consistent.

Example:

```text
Draft
Pending
In Review
Approved
Published
Rejected
Archived
```

Use semantic colors consistently.

Do not invent a different badge design for every page.

---

## 15. Listing Workflow UI

The Listing Process Builder is a core workflow.

Always make the current workflow state obvious.

Example:

```text
01 Details
02 Media
03 Pricing
04 Documents
05 Review
06 Publish
```

Clearly communicate:

```text
Current step
Completed steps
Incomplete steps
Validation problems
Progress
Next action
```

The user should always understand:

**Where am I?**

**What do I need to do?**

**What happens next?**

---

## 16. Loading States

Do not leave blank screens while data loads.

Use:

* Skeleton loaders
* Button loading states
* Table loading states
* Section loading states

Avoid unnecessary full-screen spinners.

---

## 17. Empty States

Every important empty state should explain:

1. What is empty?
2. Why it might be empty.
3. What the user can do next.

Example:

```text
No listings yet

Create your first listing to start managing your properties.

[Create Listing]
```

---

## 18. Error States

Errors must be understandable.

Provide an appropriate action when possible:

```text
Something went wrong

We couldn't load your listings.

[Try Again]
```

Do not expose technical errors to normal users.

---

## 19. Responsive Design

Every UI change must be checked for:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

Do not simply shrink desktop layouts.

Use responsive layout changes where necessary.

Avoid:

```text
horizontal overflow
tiny text
unusable tables
off-screen buttons
broken modals
```

---

## 20. Accessibility

Follow accessible UI practices.

Always consider:

* Keyboard navigation
* Focus states
* Color contrast
* Semantic HTML
* Accessible labels
* Button names
* Form errors
* Screen-reader-friendly structure

Do not communicate important information through color alone.

---

## 21. Icons

Use the project's existing icon library.

Do not mix multiple icon styles.

Icons must have a purpose.

Avoid adding icons simply to make a UI look more sophisticated.

---

## 22. Animation

Animations must be subtle and purposeful.

Prefer short transitions for:

* Hover
* Focus
* Expand/collapse
* Modal
* Dropdown
* Loading

Avoid excessive animations.

The product should feel fast, not flashy.

---

## 23. Component Reuse

Before creating a new component, check whether an existing component can be reused.

Prefer:

```text
BaseButton
BaseInput
BaseSelect
BaseModal
BaseBadge
PageHeader
FormSection
DataTable
EmptyState
LoadingState
```

over creating page-specific duplicates.

---

## 24. Don't Break Existing Functionality

UI changes must not unnecessarily modify:

* Business logic
* API calls
* Routes
* Permissions
* Authentication
* Form submission
* Database behavior
* Existing workflows

If a UI change requires a functional change, clearly identify it before implementing it.

---

## 25. UI Task Workflow

For every future UI task:

### Step 1 — Understand

Understand the existing page and user workflow.

### Step 2 — Audit

Identify current UI problems.

### Step 3 — Plan

Determine which components should change.

### Step 4 — Reuse

Reuse existing components and patterns.

### Step 5 — Implement

Use Tailwind CSS consistently.

### Step 6 — Verify

Check:

```text
Desktop
Mobile
Hover
Focus
Loading
Empty
Error
Success
Disabled
```

### Step 7 — Clean Up

Remove:

* Duplicate classes
* Unused styles
* Unused components
* Temporary code
* Inconsistent patterns

---

## 26. AI Coding Rules

When implementing UI:

**DO**

* Inspect before editing.
* Reuse existing components.
* Follow the design system.
* Use Tailwind.
* Keep components maintainable.
* Keep responsive behavior in mind.
* Preserve functionality.
* Improve UX, not just appearance.

**DO NOT**

* Rewrite the entire application.
* Introduce random design patterns.
* Add unnecessary gradients.
* Add excessive cards.
* Add unnecessary animations.
* Change business logic.
* Introduce another CSS framework.
* Create duplicate components.
* Use arbitrary values without reason.
* Make every screen look identical.

---

## 27. Definition of Done

A UI task is complete only when:

* [ ] Design follows the project design system
* [ ] Tailwind CSS is used consistently
* [ ] Existing functionality still works
* [ ] Components are reusable where appropriate
* [ ] Responsive behavior is verified
* [ ] Loading state is handled
* [ ] Empty state is handled
* [ ] Error state is handled
* [ ] Accessibility is considered
* [ ] No unnecessary visual effects exist
* [ ] No duplicate components were introduced
* [ ] No unrelated screens were changed
* [ ] UI looks production-ready

---

## Final Principle

**Do not design for screenshots. Design for real users using the product every day.**

Every UI decision should improve:

**Clarity → Usability → Consistency → Trust → Conversion**

The goal is not to make the application look impressive.

The goal is to make it feel like a **mature, well-designed product.**
