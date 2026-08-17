// Placeholder content used only when the Laravel API is unreachable during local
// frontend development (see DEV fallbacks in the Pinia stores). Safe to delete
// once the backend endpoints documented in the implementation plan are live.
import type { User } from '@/types/auth'
import type { ListingSummary } from '@/types/listing'
import type { WorkflowDefinition, DisclosureQuestion } from '@/types/workflow'
import type { DocumentRequirement } from '@/types/document'

export const sampleUser: User = {
  id: 1,
  fullName: 'Sarah Miller',
  email: 'sarah.miller@example.com',
  phone: '(555) 123-4567',
}

export const sampleListing: ListingSummary = {
  id: 1001,
  referenceCode: 'REO-100245',
  status: 'in_progress',
  address: { address: '123 Maple Street', city: 'Ann Arbor', state: 'Michigan', zip: '48103' },
  progressPercent: 40,
  stepsCompleted: 3,
  stepsTotal: 7,
  updatedAt: 'just now',
}

export const sampleWorkflow: WorkflowDefinition = {
  listingId: sampleListing.id,
  processId: 15,
  steps: [
    {
      id: 'property-information',
      name: 'Property Information',
      description: 'Tell us a little about the property you are listing.',
      sections: [
        {
          id: 'basic-info',
          title: 'Basic Information',
          fields: [
            {
              id: 'property_type',
              fieldType: 'select',
              label: 'Property Type',
              required: true,
              options: [
                { label: 'Single Family', value: 'single_family' },
                { label: 'Condo', value: 'condo' },
                { label: 'Townhouse', value: 'townhouse' },
                { label: 'Land', value: 'land' },
              ],
            },
            {
              id: 'year_built',
              fieldType: 'number',
              label: 'Year Built',
              required: true,
              placeholder: '1998',
            },
            {
              id: 'square_footage',
              fieldType: 'number',
              label: 'Square Footage',
              required: false,
              placeholder: '1800',
            },
            {
              id: 'hoa_name',
              fieldType: 'text',
              label: 'HOA Name',
              required: true,
              showIf: { field: 'property_type', equals: 'condo' },
            },
          ],
        },
      ],
    },
    {
      id: 'seller-information',
      name: 'Seller Information',
      description: 'Confirm the primary seller contact details.',
      sections: [
        {
          id: 'contact',
          title: 'Contact Information',
          fields: [
            { id: 'seller_name', fieldType: 'text', label: 'Full Name', required: true },
            { id: 'seller_phone', fieldType: 'text', label: 'Phone Number', required: true },
            {
              id: 'preferred_contact',
              fieldType: 'radio',
              label: 'Preferred Contact Method',
              required: true,
              options: [
                { label: 'Phone', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'Text', value: 'text' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'property-details',
      name: 'Property Details',
      description: 'A few more details about the condition of the property.',
      sections: [
        {
          id: 'condition',
          title: 'Condition',
          fields: [
            { id: 'bedrooms', fieldType: 'number', label: 'Bedrooms', required: true },
            { id: 'bathrooms', fieldType: 'number', label: 'Bathrooms', required: true },
            {
              id: 'roof_issue',
              fieldType: 'yesno',
              label: 'Are you aware of any issues with the roof?',
              required: true,
            },
            {
              id: 'roof_issue_details',
              fieldType: 'textarea',
              label: 'Roof Issue Details',
              showIf: { field: 'roof_issue', equals: 'yes' },
            },
            {
              id: 'additional_notes',
              fieldType: 'textarea',
              label: 'Additional Notes',
              required: false,
            },
          ],
        },
      ],
    },
  ],
}

export const sampleDisclosures: DisclosureQuestion[] = [
  {
    id: 'roof',
    question: 'Are you aware of any issues with the roof?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not Sure', value: 'not_sure' },
    ],
    followUp: {
      id: 'roof_details',
      fieldType: 'textarea',
      label: 'Please provide additional details.',
    },
    showIf: { field: 'roof', equals: 'yes' },
  },
  {
    id: 'water_damage',
    question: 'Has the property experienced any water damage or flooding?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not Sure', value: 'not_sure' },
    ],
    followUp: {
      id: 'water_damage_details',
      fieldType: 'textarea',
      label: 'Please provide additional details.',
    },
    showIf: { field: 'water_damage', equals: 'yes' },
  },
  {
    id: 'pests',
    question: 'Is there any known history of termites or other pest infestations?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
      { label: 'Not Sure', value: 'not_sure' },
    ],
  },
]

export const sampleDocuments: DocumentRequirement[] = [
  { id: 'ownership', label: 'Proof of Ownership', required: true, status: 'pending' },
  { id: 'photo_id', label: 'Photo ID', required: true, status: 'pending' },
  { id: 'tax_bill', label: 'Property Tax Bill', required: true, status: 'pending' },
  { id: 'hoa_document', label: 'HOA Document', required: false, status: 'pending' },
  { id: 'seller_disclosure', label: 'Seller Disclosure', required: true, status: 'pending' },
]
