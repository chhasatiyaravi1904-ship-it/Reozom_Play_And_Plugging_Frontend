import { describe, it, expect } from 'vitest'
import { formatPublicField } from '../fieldFormatters'
import type { PublicFieldConfig } from '@/services/publicListingService'

const field = (type: string, id = 'f'): PublicFieldConfig => ({ id, label: 'F', type, value: null })

describe('formatPublicField', () => {
  it('shows "Not specified" for empty values', () => {
    for (const empty of [null, undefined, '']) {
      expect(formatPublicField(field('text'), empty)).toBe('Not specified')
    }
  })

  it('formats prices as whole US dollars (by id or currency type)', () => {
    expect(formatPublicField(field('text', 'listing_price'), 425000)).toBe('$425,000')
    expect(formatPublicField(field('currency'), '1999.6')).toBe('$2,000')
  })

  it('formats numbers with thousands separators', () => {
    expect(formatPublicField(field('number'), 2450)).toBe('2,450')
  })

  it('formats booleans as Yes / No (0 stays a value, not "Not specified")', () => {
    expect(formatPublicField(field('boolean'), true)).toBe('Yes')
    expect(formatPublicField(field('boolean'), false)).toBe('No')
    expect(formatPublicField(field('boolean'), 0)).toBe('No')
  })

  it('formats dates as US dates', () => {
    expect(formatPublicField(field('date'), '2026-03-05T12:00:00')).toBe('3/5/2026')
  })

  it('falls back to the plain text value', () => {
    expect(formatPublicField(field('select'), 'Single Family')).toBe('Single Family')
  })
})
