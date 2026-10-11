import type { PublicFieldConfig } from '@/services/publicListingService'

export const formatPublicField = (field: PublicFieldConfig, value: any): string => {
  if (value === null || value === undefined || value === '') return 'Not specified'

  // Special-case price styling as per system setup, but otherwise rely strictly on field type.
  if (field.id === 'listing_price' || field.type === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value))
  }

  switch (field.type) {
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value))
    case 'boolean':
      return value ? 'Yes' : 'No'
    case 'date':
      return new Date(value).toLocaleDateString('en-US')
    default:
      return String(value)
  }
}
