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

export const sampleStates = [
  {
    id: 1,
    name: 'Michigan',
    code: 'MI',
    status: 'active' as const,
    countiesCount: 83,
    mlsCount: 12,
    listingsCount: 142,
    disclosuresCount: 4,
    requiresDisclosure: true,
    description: 'Primary state jurisdiction with full automated county routing and multi-MLS coverage.',
    region: 'Midwest',
    capital: 'Lansing',
    standardDisclosureForm: 'Seller Disclosure Statement (MCL 565.957)',
    counties: [
      { id: 101, name: 'Washtenaw County', fipsCode: '26161', mlsCount: 3, listingsCount: 48 },
      { id: 102, name: 'Wayne County', fipsCode: '26163', mlsCount: 4, listingsCount: 35 },
      { id: 103, name: 'Oakland County', fipsCode: '26125', mlsCount: 4, listingsCount: 29 },
      { id: 104, name: 'Kent County', fipsCode: '26081', mlsCount: 2, listingsCount: 18 },
      { id: 105, name: 'Macomb County', fipsCode: '26099', mlsCount: 2, listingsCount: 12 },
    ],
    mlsFeeds: [
      { id: 201, name: 'Realcomp II Ltd', code: 'REALCOMP', isActive: true },
      { id: 202, name: 'MiRealSource MLS', code: 'MIREAL', isActive: true },
      { id: 203, name: 'MichRIC (SW Michigan)', code: 'MICHRIC', isActive: true },
    ],
  },
  {
    id: 2,
    name: 'Ohio',
    code: 'OH',
    status: 'active' as const,
    countiesCount: 88,
    mlsCount: 8,
    listingsCount: 94,
    disclosuresCount: 3,
    requiresDisclosure: true,
    description: 'Operating in central, northern, and southern metropolitan real estate boards.',
    region: 'Midwest',
    capital: 'Columbus',
    standardDisclosureForm: 'Ohio Residential Property Disclosure Form (R.C. 5302.30)',
    counties: [
      { id: 106, name: 'Franklin County', fipsCode: '39049', mlsCount: 3, listingsCount: 38 },
      { id: 107, name: 'Cuyahoga County', fipsCode: '39035', mlsCount: 2, listingsCount: 27 },
      { id: 108, name: 'Hamilton County', fipsCode: '39061', mlsCount: 2, listingsCount: 19 },
      { id: 109, name: 'Summit County', fipsCode: '39153', mlsCount: 1, listingsCount: 10 },
    ],
    mlsFeeds: [
      { id: 204, name: 'Columbus REALTORS MLS', code: 'CBRMLS', isActive: true },
      { id: 205, name: 'Yes-MLS (NEOHREX)', code: 'YESMLS', isActive: true },
    ],
  },
  {
    id: 3,
    name: 'Florida',
    code: 'FL',
    status: 'active' as const,
    countiesCount: 67,
    mlsCount: 16,
    listingsCount: 168,
    disclosuresCount: 5,
    requiresDisclosure: true,
    description: 'High-volume southeast coastal and central sunbelt property market.',
    region: 'Southeast',
    capital: 'Tallahassee',
    standardDisclosureForm: 'Florida Realtors Seller Property Disclosure (SPDR-3)',
    counties: [
      { id: 110, name: 'Miami-Dade County', fipsCode: '12086', mlsCount: 5, listingsCount: 64 },
      { id: 111, name: 'Broward County', fipsCode: '12011', mlsCount: 4, listingsCount: 42 },
      { id: 112, name: 'Orange County', fipsCode: '12095', mlsCount: 3, listingsCount: 36 },
      { id: 113, name: 'Hillsborough County', fipsCode: '12057', mlsCount: 3, listingsCount: 26 },
    ],
    mlsFeeds: [
      { id: 206, name: 'Stellar MLS', code: 'STELLAR', isActive: true },
      { id: 207, name: 'MIAMI MLS', code: 'MIAMIRE', isActive: true },
    ],
  },
  {
    id: 4,
    name: 'Texas',
    code: 'TX',
    status: 'active' as const,
    countiesCount: 254,
    mlsCount: 18,
    listingsCount: 215,
    disclosuresCount: 4,
    requiresDisclosure: true,
    description: 'Broad jurisdiction covering major metro triangles (Austin, Dallas-Fort Worth, Houston).',
    region: 'Southwest',
    capital: 'Austin',
    standardDisclosureForm: "Texas Property Code Section 5.008 (Seller's Disclosure Notice)",
    counties: [
      { id: 114, name: 'Travis County', fipsCode: '48453', mlsCount: 4, listingsCount: 78 },
      { id: 115, name: 'Harris County', fipsCode: '48201', mlsCount: 5, listingsCount: 62 },
      { id: 116, name: 'Dallas County', fipsCode: '48113', mlsCount: 4, listingsCount: 45 },
      { id: 117, name: 'Bexar County', fipsCode: '48029', mlsCount: 3, listingsCount: 30 },
    ],
    mlsFeeds: [
      { id: 208, name: 'Austin MLS (ACTRIS)', code: 'ACTRIS', isActive: true },
      { id: 209, name: 'Houston Association of REALTORS (HAR)', code: 'HARMLS', isActive: true },
      { id: 210, name: 'North Texas Real Estate Info (NTREIS)', code: 'NTREIS', isActive: true },
    ],
  },
  {
    id: 5,
    name: 'California',
    code: 'CA',
    status: 'active' as const,
    countiesCount: 58,
    mlsCount: 22,
    listingsCount: 184,
    disclosuresCount: 6,
    requiresDisclosure: true,
    description: 'Pacific region active market with comprehensive statutory disclosure standards.',
    region: 'West Coast',
    capital: 'Sacramento',
    standardDisclosureForm: 'California Real Estate Transfer Disclosure Statement (TDS)',
    counties: [
      { id: 118, name: 'Los Angeles County', fipsCode: '06037', mlsCount: 6, listingsCount: 72 },
      { id: 119, name: 'Santa Clara County', fipsCode: '06085', mlsCount: 4, listingsCount: 41 },
      { id: 120, name: 'San Diego County', fipsCode: '06073', mlsCount: 4, listingsCount: 39 },
      { id: 121, name: 'Orange County', fipsCode: '06059', mlsCount: 4, listingsCount: 32 },
    ],
    mlsFeeds: [
      { id: 211, name: 'California Regional MLS (CRMLS)', code: 'CRMLS', isActive: true },
      { id: 212, name: 'San Francisco Association of Realtors', code: 'SFARMLS', isActive: true },
    ],
  },
  {
    id: 6,
    name: 'Illinois',
    code: 'IL',
    status: 'inactive' as const,
    countiesCount: 102,
    mlsCount: 6,
    listingsCount: 0,
    disclosuresCount: 2,
    requiresDisclosure: true,
    description: 'Pending broker licensing and MRED MLS agreement finalization.',
    region: 'Midwest',
    capital: 'Springfield',
    standardDisclosureForm: 'Illinois Residential Real Property Disclosure Act (765 ILCS 77/)',
    counties: [
      { id: 122, name: 'Cook County', fipsCode: '17031', mlsCount: 3, listingsCount: 0 },
      { id: 123, name: 'DuPage County', fipsCode: '17043', mlsCount: 2, listingsCount: 0 },
    ],
    mlsFeeds: [
      { id: 213, name: 'Midwest Real Estate Data (MRED)', code: 'MRED', isActive: false },
    ],
  },
]

