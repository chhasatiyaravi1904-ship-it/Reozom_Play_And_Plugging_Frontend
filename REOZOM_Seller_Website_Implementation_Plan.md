# REOZOM Seller Website --- Implementation Plan

## 1. Purpose

Build a modern, premium, responsive seller-facing web application for
the REOZOM Plug-and-Play Listing Process Builder.

The seller website will allow a seller to:

-   Create an account
-   Start a property listing
-   Enter a property address
-   Be routed to the correct listing workflow
-   Complete dynamically configured listing steps
-   Answer disclosure questions
-   Upload required documents
-   Save progress and continue later
-   Review listing information
-   Submit the listing

The seller experience must be driven by the workflow configured by the
agent/admin rather than by hard-coded forms. This follows the BRD
requirement that the public-facing seller workflow is separate from the
admin-facing configuration system. \[Source: BRD §6.5, §FR-13, §FR-20\]

------------------------------------------------------------------------

## 2. Product Experience Goal

### Design principle

> One step at a time → Clear progress → Auto-save → Easy completion

The seller should always understand:

1.  Where am I?
2.  What have I completed?
3.  What do I need to do next?
4.  Can I save and return later?
5.  What information/documents are required?
6.  Is my information secure?

### Visual direction

Use a modern 2026 SaaS design language:

-   White and very-light lavender backgrounds
-   Violet/indigo primary actions
-   Deep navy typography
-   Emerald success states
-   Large rounded cards
-   Subtle borders and shadows
-   Spacious layouts
-   Premium real-estate imagery
-   Clear step indicators
-   Minimal visual noise
-   Responsive desktop/tablet/mobile layouts

------------------------------------------------------------------------

# 3. Scope

## 3.1 MVP Seller Scope

The MVP seller experience includes:

-   Seller registration
-   Seller login
-   Seller dashboard
-   New listing creation
-   Property address entry
-   State/county detection
-   Workflow routing
-   Dynamic seller form rendering
-   Required/optional field validation
-   Conditional field/section/step visibility
-   Save progress
-   Resume listing
-   Disclosure questions
-   Document upload
-   Listing review
-   Listing submission
-   Agent/admin notification after submission

These capabilities align with the BRD's Public-Facing Seller Website
requirements and recommended MVP scope.

------------------------------------------------------------------------

# 4. Recommended Frontend Architecture

## 4.1 Technology

Recommended:

-   Vue 3
-   Vite
-   TypeScript
-   Pinia
-   Vue Router
-   Axios
-   Tailwind CSS or equivalent design-token-based CSS system
-   Component library/custom reusable components
-   Form validation library
-   File upload component
-   Responsive CSS
-   API-driven dynamic rendering

## 4.2 Backend

The existing project direction is compatible with:

-   Laravel API
-   MySQL
-   REST APIs
-   Laravel authentication/authorization
-   File/object storage
-   Queue-based notifications where required

The BRD requires scalable architecture and explicitly states that the
new system should not be built directly on legacy Reozom code. Existing
business/document logic may be reused where practical.

------------------------------------------------------------------------

# 5. Application Structure

``` text
Seller Application
│
├── Authentication
│   ├── Login
│   ├── Register
│   ├── Forgot Password
│   └── Reset Password
│
├── Seller Dashboard
│   ├── Active Listing
│   ├── Progress
│   ├── Documents
│   ├── Activity
│   └── Help
│
├── Listing
│   ├── Start Listing
│   ├── Property Address
│   ├── Dynamic Workflow
│   ├── Disclosures
│   ├── Documents
│   ├── Review
│   └── Submit
│
└── Account
    ├── Profile
    ├── Notifications
    └── Security
```

------------------------------------------------------------------------

# 6. Route Plan

``` text
/auth/login
/auth/register
/auth/forgot-password
/auth/reset-password

/dashboard

/listings
/listings/create
/listings/:listingId
/listings/:listingId/step/:stepId
/listings/:listingId/disclosures
/listings/:listingId/documents
/listings/:listingId/review
/listings/:listingId/submit

/profile
/help
```

Routes should be protected according to seller authentication state.

------------------------------------------------------------------------

# 7. Authentication Screens

## 7.1 Login

Design:

-   REOZOM logo
-   Welcome message
-   Email
-   Password
-   Show/hide password
-   Forgot password
-   Sign in
-   Optional social authentication if approved
-   Register link

Example:

``` text
Welcome back! 👋

Sign in to continue to your account

Email address
[________________________]

Password
[________________________]  👁

Forgot password?

[ Sign In → ]

Don't have an account? Sign up
```

## 7.2 Register

Fields:

-   Full name
-   Email
-   Phone
-   Password
-   Confirm password
-   Terms/privacy acceptance

The registration experience should remain short and approachable.

------------------------------------------------------------------------

# 8. Seller Dashboard

The dashboard is the seller's primary landing page.

## Header

``` text
REOZOM
Smart Listings. Simple Process.

My Listing | Progress | Documents | Messages | Help Center

Notifications    Sarah Miller ▼
```

## Hero

Use premium real-estate imagery.

Content:

``` text
Welcome, Sarah! 👋

Let's get your property listed,
the smart way.

Complete each step below to submit your listing.
You can save and continue anytime.

[ Continue Your Listing → ]
```

## Progress card

``` text
Your Progress

40%

3 of 7 Steps Completed

✓ Property Information
✓ Seller Information
✓ Property Details
● Disclosures
○ Documents
○ Review & Summary
○ Submit Listing
```

------------------------------------------------------------------------

# 9. Listing Stepper

The seller workflow should use a reusable stepper component.

``` text
Property Info
      ↓
Seller Info
      ↓
Property Details
      ↓
Disclosures
      ↓
Documents
      ↓
Review
      ↓
Submit
```

The actual steps must NOT be hard-coded.

They should be generated from the assigned listing process.

The BRD explicitly requires the seller to see only the steps configured
for the assigned workflow.

------------------------------------------------------------------------

# 10. Dynamic Workflow Renderer

This is the most important frontend component.

The backend returns a workflow definition.

Example:

``` json
{
  "listing_id": 1001,
  "process_id": 15,
  "steps": [
    {
      "id": 1,
      "name": "Property Information",
      "sections": []
    },
    {
      "id": 2,
      "name": "Property Details",
      "sections": []
    }
  ]
}
```

The frontend should render the UI from this configuration.

Do not create separate hard-coded Vue pages for every MLS workflow.

------------------------------------------------------------------------

# 11. Dynamic Field Components

Create reusable components:

``` text
DynamicField
├── TextField
├── NumberField
├── DateField
├── SelectField
├── RadioField
├── CheckboxField
├── TextareaField
├── YesNoField
├── FileUploadField
└── SignatureField
```

The BRD identifies these field types as required configurable field
types.

Example:

``` json
{
  "field_type": "select",
  "label": "Property Type",
  "required": true,
  "options": [
    "Single Family",
    "Condo",
    "Townhouse",
    "Land"
  ]
}
```

------------------------------------------------------------------------

# 12. Conditional Logic Engine

Conditional logic must be handled independently from the UI components.

Example:

``` text
IF property_type == "condo"
THEN show "HOA Information"
```

Another example:

``` text
IF roof_issue == "yes"
THEN show "Roof Issue Details"
```

Supported actions:

-   Show field
-   Hide field
-   Show section
-   Hide section
-   Show step
-   Skip step
-   Show disclosure
-   Hide disclosure
-   Show document requirement

The BRD specifically requires conditional logic to control fields,
sections, steps, disclosures, and document uploads.

------------------------------------------------------------------------

# 13. Property Address Flow

This is the routing trigger.

Seller enters:

``` text
Property Address
[ 123 Maple Street ]

City
[ Ann Arbor ]

State
[ Michigan ]

ZIP Code
[ 48103 ]
```

System determines:

``` text
State → Michigan
County → Washtenaw
MLS → REALCOMP
Listing Process → Assigned Process
```

Then loads the correct workflow.

If no mapping exists:

``` text
We couldn't determine the correct listing process.

Please contact support or select an available process.
```

The BRD states that county should drive workflow routing and that a
fallback/admin alert is required when no county mapping exists.

------------------------------------------------------------------------

# 14. Seller Form UX

Every workflow step should include:

``` text
Step title
Short explanation

Section
├── Field
├── Field
└── Field

[ Back ]                    [ Save & Continue → ]
```

Required fields:

``` text
Property Type *
```

Optional fields:

``` text
Additional Notes
(optional)
```

Show inline validation rather than displaying all errors at submission.

------------------------------------------------------------------------

# 15. Auto-Save

The application should preserve seller progress.

Recommended behavior:

-   Save after successful step completion
-   Save important field changes with debouncing
-   Show "Saved" status
-   Allow seller to leave the page
-   Resume at the last incomplete step

Example:

``` text
✓ Saved just now
```

The BRD explicitly requires sellers to be able to save progress and
return later.

------------------------------------------------------------------------

# 16. Disclosure Experience

Disclosure questions should be rendered dynamically according to:

-   State
-   Property type
-   Listing type
-   Sale type
-   Agent configuration

Example:

``` text
Disclosures

Are you aware of any issues with the roof?

○ Yes
○ No
○ Not Sure
```

Conditional question:

``` text
If Yes:

Please provide additional details.

[________________________________]
[________________________________]
```

Seller answers should be stored as structured data.

------------------------------------------------------------------------

# 17. Document Upload

Create a reusable document upload component.

Features:

-   Drag & drop
-   Browse files
-   Upload progress
-   File validation
-   File size validation
-   File type validation
-   Upload success
-   Replace file
-   Remove file where permitted

Example:

``` text
Documents
0 of 5 Uploaded

┌───────────────────────────────┐
│          ☁                    │
│                               │
│ Upload your documents         │
│ Drag & drop or browse         │
│ PDF, JPG, PNG up to 25MB      │
└───────────────────────────────┘

Required Documents

Proof of Ownership       Pending
Photo ID                 Pending
Property Tax Bill        Pending
HOA Document             Pending
Seller Disclosure        Pending
```

------------------------------------------------------------------------

# 18. Review & Summary

Before submission, show a structured summary.

Sections:

``` text
Property Information
[Edit]

Seller Information
[Edit]

Property Details
[Edit]

Disclosures
[Edit]

Documents
[Edit]
```

Display completion state:

``` text
✓ All required information completed
✓ Required documents uploaded
✓ Disclosure questions completed
```

CTA:

``` text
[ Submit Listing → ]
```

------------------------------------------------------------------------

# 19. Submission State

After successful submission:

``` text
Listing Submitted 🎉

Your listing information has been successfully submitted.

Listing ID: REO-100245

Our team will review your submission.

[ View Listing ]
[ Go to Dashboard ]
```

Do not immediately expose internal processing details unless required.

------------------------------------------------------------------------

# 20. Error & Empty States

Design dedicated states for:

### No listing

``` text
Ready to list your property?

[ Start New Listing → ]
```

### Missing workflow

``` text
We need a little more information
to determine your listing process.

[ Contact Support ]
```

### Upload failed

``` text
Upload failed.

Please try again.

[ Retry ]
```

### Session expired

``` text
Your session has expired.

[ Sign In Again ]
```

### Network failure

``` text
Something went wrong.

Your saved information is safe.

[ Try Again ]
```

------------------------------------------------------------------------

# 21. Reusable UI Components

Create a centralized component system:

``` text
components/
├── AppHeader.vue
├── AppFooter.vue
├── Button.vue
├── Input.vue
├── Select.vue
├── Checkbox.vue
├── Radio.vue
├── Modal.vue
├── Toast.vue
├── ProgressRing.vue
├── Stepper.vue
├── ListingCard.vue
├── ListingOverview.vue
├── DynamicWorkflow.vue
├── DynamicField.vue
├── ConditionalRenderer.vue
├── FileUploader.vue
├── DocumentList.vue
├── ActivityTimeline.vue
├── EmptyState.vue
├── ErrorState.vue
└── LoadingState.vue
```

------------------------------------------------------------------------

# 22. Suggested Vue Structure

``` text
src/
├── assets/
├── components/
├── composables/
│   ├── useAuth.ts
│   ├── useListing.ts
│   ├── useWorkflow.ts
│   ├── useConditionalLogic.ts
│   ├── useAutoSave.ts
│   └── useFileUpload.ts
│
├── layouts/
│   ├── AuthLayout.vue
│   └── SellerLayout.vue
│
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── listings/
│   ├── documents/
│   └── profile/
│
├── stores/
│   ├── auth.ts
│   ├── listing.ts
│   └── workflow.ts
│
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── listing.service.ts
│   ├── workflow.service.ts
│   └── document.service.ts
│
├── types/
│   ├── listing.ts
│   ├── workflow.ts
│   ├── field.ts
│   └── document.ts
│
├── router/
│   └── index.ts
│
└── App.vue
```

------------------------------------------------------------------------

# 23. API Requirements

Minimum API groups:

## Authentication

``` text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

## Seller

``` text
GET  /api/seller/profile
PUT  /api/seller/profile
```

## Listings

``` text
GET  /api/listings
POST /api/listings
GET  /api/listings/{id}
PUT  /api/listings/{id}
POST /api/listings/{id}/submit
```

## Workflow

``` text
GET /api/listings/{id}/workflow
GET /api/listings/{id}/steps
POST /api/listings/{id}/steps/{stepId}
```

## Address Routing

``` text
POST /api/listings/resolve-workflow
```

Input:

``` json
{
  "address": "123 Maple Street",
  "city": "Ann Arbor",
  "state": "Michigan",
  "zip": "48103"
}
```

Response:

``` json
{
  "state": "Michigan",
  "county": "Washtenaw",
  "mls": "REALCOMP",
  "process_id": 15
}
```

## Documents

``` text
GET  /api/listings/{id}/documents
POST /api/listings/{id}/documents
DELETE /api/listings/{id}/documents/{documentId}
```

------------------------------------------------------------------------

# 24. State Management

Use Pinia for:

``` text
authStore
listingStore
workflowStore
documentStore
```

Do not store the entire application state globally.

Only keep reusable/shared state in Pinia.

Form-specific state should remain local where possible.

------------------------------------------------------------------------

# 25. Security

Implement:

-   Authentication
-   Authorization
-   Route guards
-   Secure API calls
-   Server-side validation
-   Client-side validation
-   File type validation
-   File size validation
-   Secure document storage
-   Seller data isolation
-   CSRF protection where applicable
-   XSS-safe rendering
-   No sensitive data in localStorage unless required
-   Audit logging for important actions

The BRD requires authorized access, data isolation, security, and
auditability.

------------------------------------------------------------------------

# 26. Responsive Requirements

## Desktop

Target:

``` text
1440px
1280px
1024px
```

## Tablet

Target:

``` text
768px – 1023px
```

## Mobile

Target:

``` text
390px
375px
```

Mobile changes:

-   Desktop navigation → hamburger
-   Horizontal stepper → vertical/scrollable
-   Two-column cards → one column
-   Hero image → reduced height
-   Floating progress card → stacked
-   CTA → full width
-   Upload area → full width

------------------------------------------------------------------------

# 27. Accessibility

Implement:

-   Keyboard navigation
-   Visible focus states
-   Proper labels
-   Accessible error messages
-   ARIA where necessary
-   Sufficient text contrast
-   Screen-reader-friendly stepper
-   Accessible upload controls
-   No color-only status indicators

------------------------------------------------------------------------

# 28. Loading States

Every API-driven screen needs loading states.

Examples:

``` text
Loading listing...
Loading workflow...
Detecting county...
Loading documents...
Submitting listing...
```

Use skeleton loaders instead of unnecessary full-page spinners.

------------------------------------------------------------------------

# 29. QA Plan

## Authentication

-   Register successfully
-   Invalid email
-   Duplicate email
-   Password validation
-   Login
-   Logout
-   Forgot password

## Listing

-   Create listing
-   Save listing
-   Resume listing
-   Edit listing
-   Submit listing

## Routing

Test:

``` text
State
County
MLS
Property Type
Agent
Listing Process
```

Verify the correct workflow loads.

## Dynamic Fields

Test:

-   Text
-   Number
-   Date
-   Select
-   Radio
-   Checkbox
-   Yes/No
-   Long text
-   File upload

## Conditional Logic

Test:

``` text
IF A → SHOW B
IF A → HIDE B
IF A → SKIP STEP
```

## Documents

Test:

-   Valid file
-   Invalid file
-   Oversized file
-   Upload failure
-   Retry
-   Delete/replace

## Responsive

Test:

-   Desktop
-   Tablet
-   Mobile

------------------------------------------------------------------------

# 30. Implementation Phases

## Phase 1 --- UI Foundation

Deliver:

-   Design tokens
-   Typography
-   Colors
-   Buttons
-   Inputs
-   Cards
-   Header
-   Footer
-   Toasts
-   Modals
-   Responsive grid

## Phase 2 --- Authentication

Deliver:

-   Login
-   Register
-   Forgot password
-   Reset password
-   Authentication state
-   Route protection

## Phase 3 --- Seller Dashboard

Deliver:

-   Header
-   Hero
-   Progress
-   Listing overview
-   Activity
-   Documents
-   Help
-   Tips

## Phase 4 --- Listing Creation

Deliver:

-   Start listing
-   Address form
-   Address validation
-   State detection
-   County detection
-   Workflow resolution

## Phase 5 --- Dynamic Workflow Engine

Deliver:

-   Workflow API integration
-   Dynamic steps
-   Dynamic sections
-   Dynamic fields
-   Required validation
-   Conditional logic
-   Step navigation
-   Save progress

## Phase 6 --- Disclosure

Deliver:

-   Dynamic disclosure questions
-   Conditional disclosure logic
-   Answer storage
-   Disclosure completion state

## Phase 7 --- Documents

Deliver:

-   Required document list
-   Upload
-   Progress
-   Validation
-   Replace/delete
-   Document status

## Phase 8 --- Review & Submit

Deliver:

-   Review summary
-   Edit navigation
-   Completion validation
-   Submit listing
-   Success screen
-   Agent notification trigger

## Phase 9 --- QA & Optimization

Deliver:

-   End-to-end testing
-   Responsive testing
-   Accessibility testing
-   Performance optimization
-   Error-state testing
-   Security review
-   Production bug fixes

------------------------------------------------------------------------

# 31. Definition of Done

The seller website is complete when:

-   [ ] Seller can register
-   [ ] Seller can log in
-   [ ] Seller can create a listing
-   [ ] Seller can enter a property address
-   [ ] System determines state/county
-   [ ] Correct workflow is loaded
-   [ ] Dynamic steps render
-   [ ] Dynamic sections render
-   [ ] Dynamic fields render
-   [ ] Required fields validate
-   [ ] Conditional logic works
-   [ ] Seller can save progress
-   [ ] Seller can resume later
-   [ ] Disclosure questions work
-   [ ] Required documents can be uploaded
-   [ ] Review screen displays correct data
-   [ ] Seller can edit previous sections
-   [ ] Seller can submit listing
-   [ ] Submission notification is triggered
-   [ ] Responsive design works
-   [ ] Error states are implemented
-   [ ] Loading states are implemented
-   [ ] Accessibility checks pass
-   [ ] Security checks pass
-   [ ] End-to-end QA passes

------------------------------------------------------------------------

# 32. Important Architecture Rule

The frontend must **not hard-code state, county, MLS, property-type,
disclosure, or workflow rules**.

Instead:

``` text
Agent/Admin Configuration
          ↓
Listing Process
          ↓
County / MLS Mapping
          ↓
Seller Property Address
          ↓
Workflow Resolution
          ↓
Dynamic Workflow JSON
          ↓
Vue Dynamic Renderer
          ↓
Seller Experience
```

This is the core architectural principle that allows REOZOM to expand to
additional states, MLS systems, counties, property types, and brokers
without rebuilding the seller application.

------------------------------------------------------------------------

# 33. Final UX Flow

``` text
REGISTER
   ↓
LOGIN
   ↓
SELLER DASHBOARD
   ↓
START LISTING
   ↓
PROPERTY ADDRESS
   ↓
STATE / COUNTY DETECTION
   ↓
MLS / WORKFLOW RESOLUTION
   ↓
PROPERTY INFORMATION
   ↓
SELLER INFORMATION
   ↓
PROPERTY DETAILS
   ↓
DISCLOSURES
   ↓
DOCUMENTS
   ↓
REVIEW
   ↓
SUBMIT
   ↓
SUCCESS
   ↓
AGENT / ADMIN NOTIFICATION
```

------------------------------------------------------------------------

# 34. Future-Ready Extension Points

The implementation should leave clean extension points for future BRD
enhancements:

-   Agent-branded seller websites
-   Subscription billing
-   Workflow versioning
-   Template marketplace
-   AI-assisted workflow creation
-   Advanced analytics
-   Direct MLS API integration
-   Automated MLS data entry
-   Advanced PDF template editor
-   Document signing
-   Seller communication tools
-   Multi-state compliance library

These are future enhancements and should not be included in the initial
MVP unless separately approved.

------------------------------------------------------------------------

# 35. Source Alignment

This implementation plan is based primarily on the uploaded **Reozom
Plug-and-Play Listing Process Builder --- Business Requirements
Document, Version 2.0, August 2026**.

The BRD defines the seller experience as a public-facing website
separate from the admin configuration system, with address-based
routing, dynamic listing workflows, disclosures, document upload,
save/resume, and submission. It also identifies advanced MLS automation,
billing, AI, analytics, mobile apps, white-labeling, and other
capabilities as future/out-of-scope items for the initial version.
