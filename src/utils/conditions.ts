import type { FieldValue } from '@/types/field'

/**
 * Same rules as the backend (ListingProcess::conditionMatches), used for step/section/field
 * showIf and step skipIf:
 *   {field, equals} {field, in: []} {field, lt: n} {field, empty: true}
 *   {all: [...]} {any: [...]} {not: rule}. An empty rule matches.
 */
export type Condition =
  | { field: string; equals?: string | number; in?: Array<string | number>; lt?: number; empty?: boolean }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }

export function conditionMatches(rule: Condition | null | undefined, values: Record<string, FieldValue | unknown>): boolean {
  if (!rule || Object.keys(rule).length === 0) return true

  if ('all' in rule) return rule.all.every((r) => conditionMatches(r, values))
  if ('any' in rule) return rule.any.some((r) => conditionMatches(r, values))
  if ('not' in rule) return !conditionMatches(rule.not, values)

  const value = values[rule.field]
  const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

  if (rule.empty !== undefined) return isEmpty === rule.empty
  if (rule.equals !== undefined) return !isEmpty && String(value) === String(rule.equals)
  if (rule.in !== undefined) return !isEmpty && rule.in.map(String).includes(String(value))
  if (rule.lt !== undefined) return !isEmpty && !Number.isNaN(Number(value)) && Number(value) < rule.lt
  return true
}

/** A step applies when its showIf matches and its skipIf does not (e.g. Condo disclosure only for condos). */
export function stepIsActive(
  step: { showIf?: unknown; skipIf?: unknown },
  values: Record<string, FieldValue | unknown>,
): boolean {
  if (step.showIf && !conditionMatches(step.showIf as Condition, values)) return false
  return !step.skipIf || !conditionMatches(step.skipIf as Condition, values)
}
